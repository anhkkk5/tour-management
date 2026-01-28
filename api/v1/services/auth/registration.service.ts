import User from "../../models/user/user.model";
import {
  generateRandomNumber,
  generateRandomString,
} from "../../../../helpers/generate";
import { signAccessToken } from "../../../../utils/jwt.util";
import { sendRegisterOtpEmail } from "../../../../utils/email.client";
import {
  deletePendingRegistration,
  deleteRegisterOtp,
  getPendingRegistration,
  getRegisterOtp,
  isRedisErrorMessage,
  setPendingRegistration,
  setRefreshToken,
  setRegisterOtp,
} from "../../repositories/auth/redis.repository";
import {
  findUserByEmail,
  saveUser,
} from "../../repositories/auth/user.repository";
import {
  validateRegisterRequestOtpInput,
  validateVerifyRegisterOtpInput,
} from "../../validators/auth/registration.validator";
import { getRefreshTtlSeconds } from "./token.service";

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

export const registerRequestOtp = async (payload: {
  email?: string;
  password?: string;
  fullName?: string;
  phone?: string;
  isProd: boolean;
}) => {
  const validated = validateRegisterRequestOtpInput(payload);
  if (validated.kind === "validation_error") return validated;

  const existing = await findUserByEmail(validated.email);
  if (existing) {
    return { kind: "conflict" as const, message: "Email already exists" };
  }

  const saltRounds = process.env.BCRYPT_SALT_ROUNDS
    ? Number(process.env.BCRYPT_SALT_ROUNDS)
    : 10;

  const passwordHash = await bcrypt.hash(validated.password, saltRounds);

  const { otpTtlSeconds, otpDigits } = getOtpConfig();
  const otp = generateRandomNumber(otpDigits);

  try {
    await setPendingRegistration(
      validated.email,
      {
        email: validated.email,
        passwordHash,
        fullName: validated.fullName,
        phone: validated.phone,
      },
      otpTtlSeconds,
    );
    await setRegisterOtp(validated.email, otp, otpTtlSeconds);
  } catch (e: any) {
    const m = typeof e?.message === "string" ? e.message : String(e);
    return {
      kind: "redis_error" as const,
      message: "Redis unavailable",
      details: m,
    };
  }

  try {
    await sendRegisterOtpEmail({
      to: validated.email,
      otp,
      expiresInSeconds: otpTtlSeconds,
    });
  } catch (e: any) {
    await deleteRegisterOtp(validated.email);
    await deletePendingRegistration(validated.email);
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

export const verifyRegisterOtp = async (payload: {
  email?: string;
  otp?: string;
  userAgent?: string;
  ip?: string;
}) => {
  const validated = validateVerifyRegisterOtpInput(payload);
  if (validated.kind === "validation_error") return validated;

  const existing = await findUserByEmail(validated.email);
  if (existing) {
    return { kind: "conflict" as const, message: "Email already exists" };
  }

  let storedOtp: string | null;
  let pending: {
    passwordHash?: string;
    fullName?: string;
    phone?: string;
  } | null;

  try {
    storedOtp = await getRegisterOtp(validated.email);
    pending = await getPendingRegistration(validated.email);
  } catch (e: any) {
    const m = typeof e?.message === "string" ? e.message : String(e);
    return {
      kind: "redis_error" as const,
      message: "Redis unavailable",
      details: m,
    };
  }

  if (!storedOtp || storedOtp !== validated.otp) {
    return { kind: "invalid_otp" as const, message: "Invalid or expired otp" };
  }

  if (!pending?.passwordHash) {
    return {
      kind: "expired_registration" as const,
      message: "Expired registration",
    };
  }

  const user = new User({
    email: validated.email,
    passwordHash: pending.passwordHash,
    fullName: pending.fullName,
    phone: pending.phone,
    role: "user",
    emailVerified: true,
    status: "active",
    deleted: false,
  });

  const accessToken = signAccessToken({
    userId: String(user._id),
    role: (user as any).role,
  });

  const refreshToken = generateRandomString(64);

  try {
    await setRefreshToken(
      refreshToken,
      {
        userId: String(user._id),
        userAgent: payload.userAgent,
        ip: payload.ip,
      },
      getRefreshTtlSeconds(),
    );
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
    await saveUser(user);
  } catch (e: any) {
    await deleteRegisterOtp(validated.email);
    const m = typeof e?.message === "string" ? e.message : String(e);
    return {
      kind: "internal_error" as const,
      message: "Internal Server Error",
      details: m,
    };
  }

  try {
    await deleteRegisterOtp(validated.email);
    await deletePendingRegistration(validated.email);
  } catch {
    // ignore
  }

  return {
    kind: "ok" as const,
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      email: (user as any).email,
      role: (user as any).role,
      fullName: (user as any).fullName,
      phone: (user as any).phone,
      avatar: (user as any).avatar,
    },
  };
};

export const resendRegisterOtp = async (payload: {
  email?: string;
  isProd: boolean;
}) => {
  if (!payload.email) {
    return { kind: "validation_error" as const, message: "Missing email" };
  }

  const email = payload.email.toLowerCase().trim();

  const existing = await findUserByEmail(email);
  if (existing) {
    return { kind: "conflict" as const, message: "Email already exists" };
  }

  let pending: {
    passwordHash?: string;
    fullName?: string;
    phone?: string;
  } | null;

  try {
    pending = await getPendingRegistration(email);
  } catch (e: any) {
    const m = typeof e?.message === "string" ? e.message : String(e);
    return {
      kind: "redis_error" as const,
      message: "Redis unavailable",
      details: m,
    };
  }

  if (!pending?.passwordHash) {
    return {
      kind: "expired_registration" as const,
      message: "Expired registration",
    };
  }

  const { otpTtlSeconds, otpDigits } = getOtpConfig();
  const otp = generateRandomNumber(otpDigits);

  try {
    await setPendingRegistration(
      email,
      {
        email,
        passwordHash: pending.passwordHash,
        fullName: pending.fullName,
        phone: pending.phone,
      },
      otpTtlSeconds,
    );
    await setRegisterOtp(email, otp, otpTtlSeconds);
  } catch (e: any) {
    const m = typeof e?.message === "string" ? e.message : String(e);
    return {
      kind: "redis_error" as const,
      message: "Redis unavailable",
      details: m,
    };
  }

  try {
    await sendRegisterOtpEmail({
      to: email,
      otp,
      expiresInSeconds: otpTtlSeconds,
    });
  } catch (e: any) {
    await deleteRegisterOtp(email);
    const m = typeof e?.message === "string" ? e.message : String(e);
    return {
      kind: "email_failed" as const,
      message: "Failed to send OTP email",
      details: m,
    };
  }

  return {
    kind: "ok" as const,
    email,
    ...(payload.isProd ? {} : { otp }),
    expiresInSeconds: otpTtlSeconds,
  };
};
