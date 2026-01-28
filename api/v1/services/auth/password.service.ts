import {
  generateRandomNumber,
  generateRandomString,
} from "../../../../helpers/generate";
import { sendResetPasswordOtpEmail } from "../../../../utils/email.client";
import {
  deleteResetPasswordOtp,
  deleteResetPasswordToken,
  deleteUserRefreshToken,
  getResetPasswordEmailByToken,
  getResetPasswordOtp,
  isRedisErrorMessage,
  setResetPasswordOtp,
  setResetPasswordToken,
} from "../../repositories/auth/redis.repository";
import {
  findActiveUserByEmail,
  saveUser,
} from "../../repositories/auth/user.repository";
import {
  validateForgotPasswordRequestOtpInput,
  validateResetPasswordInput,
  validateVerifyResetPasswordOtpInput,
} from "../../validators/auth/password.validator";

const bcrypt = require("bcrypt");

const getOtpConfig = () => {
  const ttlSecondsRaw = process.env.OTP_TTL_SECONDS;
  const ttlSeconds = ttlSecondsRaw ? Number(ttlSecondsRaw) : 300;
  const otpTtlSeconds =
    Number.isFinite(ttlSeconds) && ttlSeconds > 0 ? ttlSeconds : 300;

  const otpLengthRaw = process.env.OTP_LENGTH;
  const otpLength = otpLengthRaw ? Number(otpLengthRaw) : 6;
  const otpDigits = Number.isFinite(otpLength) && otpLength > 0 ? otpLength : 6;

  return { otpTtlSeconds, otpDigits };
};

export const requestResetPasswordOtp = async (payload: {
  email?: string;
  isProd: boolean;
}) => {
  const validated = validateForgotPasswordRequestOtpInput(payload);
  if (validated.kind === "validation_error") return validated;

  const user = await findActiveUserByEmail(validated.email);
  if (!user) {
    return { kind: "not_found" as const, message: "Email not found" };
  }

  const { otpTtlSeconds, otpDigits } = getOtpConfig();
  const otp = generateRandomNumber(otpDigits);

  try {
    await setResetPasswordOtp(validated.email, otp, otpTtlSeconds);
  } catch (e: any) {
    const m = typeof e?.message === "string" ? e.message : String(e);
    return {
      kind: "redis_error" as const,
      message: isRedisErrorMessage(m)
        ? "Redis unavailable"
        : "Internal Server Error",
      details: m,
    };
  }

  try {
    await sendResetPasswordOtpEmail({
      to: validated.email,
      otp,
      expiresInSeconds: otpTtlSeconds,
    });
  } catch (e: any) {
    await deleteResetPasswordOtp(validated.email);
    const m = typeof e?.message === "string" ? e.message : String(e);
    return {
      kind: "email_failed" as const,
      message: "Failed to send OTP email",
      details: m,
    };
  }

  return {
    kind: "ok" as const,
    email: validated.email,
    ...(payload.isProd ? {} : { otp }),
    expiresInSeconds: otpTtlSeconds,
  };
};

export const resetPassword = async (payload: {
  resetToken?: string;
  newPassword?: string;
}) => {
  const validated = validateResetPasswordInput(payload);
  if (validated.kind === "validation_error") return validated;

  let email: string | null;
  try {
    email = await getResetPasswordEmailByToken(validated.resetToken);
  } catch (e: any) {
    const m = typeof e?.message === "string" ? e.message : String(e);
    return {
      kind: "redis_error" as const,
      message: isRedisErrorMessage(m)
        ? "Redis unavailable"
        : "Internal Server Error",
      details: m,
    };
  }

  if (!email) {
    return {
      kind: "invalid_token" as const,
      message: "Invalid or expired reset token",
    };
  }

  const user = await findActiveUserByEmail(email);
  if (!user) {
    return { kind: "not_found" as const, message: "Email not found" };
  }

  const saltRounds = process.env.BCRYPT_SALT_ROUNDS
    ? Number(process.env.BCRYPT_SALT_ROUNDS)
    : 10;

  const passwordHash = await bcrypt.hash(validated.newPassword, saltRounds);
  (user as any).passwordHash = passwordHash;

  try {
    await saveUser(user);
  } catch (e: any) {
    const m = typeof e?.message === "string" ? e.message : String(e);
    return {
      kind: "internal_error" as const,
      message: "Internal Server Error",
      details: m,
    };
  }

  try {
    await deleteResetPasswordOtp(email);
  } catch {
    // ignore
  }

  try {
    await deleteResetPasswordToken(validated.resetToken);
  } catch {
    // ignore
  }

  try {
    await deleteUserRefreshToken(String((user as any)._id));
  } catch {
    // ignore
  }

  return { kind: "ok" as const };
};

export const verifyResetPasswordOtp = async (payload: {
  email?: string;
  otp?: string;
}) => {
  const validated = validateVerifyResetPasswordOtpInput(payload);
  if (validated.kind === "validation_error") return validated;

  let storedOtp: string | null;
  try {
    storedOtp = await getResetPasswordOtp(validated.email);
  } catch (e: any) {
    const m = typeof e?.message === "string" ? e.message : String(e);
    return {
      kind: "redis_error" as const,
      message: isRedisErrorMessage(m)
        ? "Redis unavailable"
        : "Internal Server Error",
      details: m,
    };
  }

  if (!storedOtp || storedOtp !== validated.otp) {
    return { kind: "invalid_otp" as const, message: "Invalid or expired otp" };
  }

  const user = await findActiveUserByEmail(validated.email);
  if (!user) {
    return { kind: "not_found" as const, message: "Email not found" };
  }

  const resetToken = generateRandomString(64);
  const ttlSecondsRaw = process.env.RESET_PASSWORD_TOKEN_TTL_SECONDS;
  const ttlSeconds = ttlSecondsRaw ? Number(ttlSecondsRaw) : 300;
  const tokenTtlSeconds =
    Number.isFinite(ttlSeconds) && ttlSeconds > 0 ? ttlSeconds : 300;

  try {
    await setResetPasswordToken(validated.email, resetToken, tokenTtlSeconds);
  } catch (e: any) {
    const m = typeof e?.message === "string" ? e.message : String(e);
    return {
      kind: "redis_error" as const,
      message: isRedisErrorMessage(m)
        ? "Redis unavailable"
        : "Internal Server Error",
      details: m,
    };
  }

  return {
    kind: "ok" as const,
    resetToken,
    expiresInSeconds: tokenTtlSeconds,
  };
};
