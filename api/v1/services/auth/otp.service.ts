import {
  deleteOtp,
  getOtp,
  isRedisErrorMessage,
  setOtp,
} from "../../repositories/auth/redis.repository";
import {
  saveUser,
  findActiveUserById,
} from "../../repositories/auth/user.repository";
import {
  validateRequestOtpInput,
  validateVerifyOtpInput,
} from "../../validators/auth/otp.validator";
import { generateRandomNumber } from "../../../../helpers/generate";

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

export const requestOtp = async (payload: { userId?: string }) => {
  const validated = validateRequestOtpInput(payload);
  if (validated.kind === "unauthorized") return validated;

  const { otpTtlSeconds, otpDigits } = getOtpConfig();
  const otp = generateRandomNumber(otpDigits);

  try {
    await setOtp(String(validated.userId), otp, otpTtlSeconds);
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

  return { kind: "ok" as const, otp, expiresInSeconds: otpTtlSeconds };
};

export const verifyOtp = async (payload: { userId?: string; otp?: string }) => {
  const validated = validateVerifyOtpInput(payload);
  if (validated.kind !== "ok") return validated;

  let storedOtp: string | null;

  try {
    storedOtp = await getOtp(String(validated.userId));
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
    return {
      kind: "validation_error" as const,
      message: "Invalid or expired otp",
    };
  }

  try {
    await deleteOtp(String(validated.userId));
  } catch {
    // ignore
  }

  const user = await findActiveUserById(String(validated.userId));
  if (!user) {
    return { kind: "unauthorized" as const, message: "User not found" };
  }

  (user as any).emailVerified = true;
  await saveUser(user);

  return { kind: "ok" as const };
};
