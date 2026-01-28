import User from "../../models/user/user.model";
import {
  deleteOtp,
  deletePendingRegistration,
  deleteRefreshToken,
  deleteRegisterOtp,
  getOtp,
  getPendingRegistration,
  getRefreshToken,
  getRegisterOtp,
  setOtp,
  setPendingRegistration,
  setRefreshToken,
  setRegisterOtp,
} from "../../../../utils/redis.client";
import { signAccessToken } from "../../../../utils/jwt.util";
import {
  generateRandomNumber,
  generateRandomString,
} from "../../../../helpers/generate";
import { sendRegisterOtpEmail } from "../../../../utils/email.client";

const bcrypt = require("bcrypt");

const getRefreshTtlSeconds = () => {
  const raw = process.env.REFRESH_TOKEN_TTL_SECONDS;
  if (!raw) return 7 * 24 * 60 * 60;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 7 * 24 * 60 * 60;
  return n;
};

const isRedisErrorMessage = (message: string) =>
  /redis|ioredis|ECONN|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|ECONNRESET|WRONGPASS|NOAUTH|TLS|CERT/i.test(
    message,
  );

export const cleanupRefreshToken = async (token: string) => {
  await deleteRefreshToken(token);
};

export const registerRequestOtp = async (payload: {
  email?: string;
  password?: string;
  fullName?: string;
  phone?: string;
  isProd: boolean;
}) => {
  const { email, password, fullName, phone, isProd } = payload;

  if (!email || !password) {
    return {
      kind: "validation_error" as const,
      message: "Missing email or password",
    };
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return { kind: "conflict" as const, message: "Email already exists" };
  }

  const saltRounds = process.env.BCRYPT_SALT_ROUNDS
    ? Number(process.env.BCRYPT_SALT_ROUNDS)
    : 10;

  const passwordHash = await bcrypt.hash(password, saltRounds);

  const ttlSecondsRaw = process.env.OTP_TTL_SECONDS;
  const ttlSeconds = ttlSecondsRaw ? Number(ttlSecondsRaw) : 300;
  const otpTtlSeconds =
    Number.isFinite(ttlSeconds) && ttlSeconds > 0 ? ttlSeconds : 300;

  const otpLengthRaw = process.env.OTP_LENGTH;
  const otpLength = otpLengthRaw ? Number(otpLengthRaw) : 6;
  const otpDigits = Number.isFinite(otpLength) && otpLength > 0 ? otpLength : 6;

  const otp = generateRandomNumber(otpDigits);

  try {
    await setPendingRegistration(
      normalizedEmail,
      {
        email: normalizedEmail,
        passwordHash,
        fullName,
        phone,
      },
      otpTtlSeconds,
    );
    await setRegisterOtp(normalizedEmail, otp, otpTtlSeconds);
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
      to: normalizedEmail,
      otp,
      expiresInSeconds: otpTtlSeconds,
    });
  } catch (e: any) {
    await deleteRegisterOtp(normalizedEmail);
    await deletePendingRegistration(normalizedEmail);
    const m = typeof e?.message === "string" ? e.message : String(e);
    return {
      kind: "email_failed" as const,
      message: "Failed to send OTP email",
      details: m,
    };
  }

  return {
    kind: "ok" as const,
    email: normalizedEmail,
    ...(isProd ? {} : { otp }),
    expiresInSeconds: otpTtlSeconds,
  };
};

export const verifyRegisterOtp = async (payload: {
  email?: string;
  otp?: string;
  userAgent?: string;
  ip?: string;
}) => {
  const { email, otp, userAgent, ip } = payload;

  if (!email || !otp) {
    return {
      kind: "validation_error" as const,
      message: "Missing email or otp",
    };
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existing = await User.findOne({ email: normalizedEmail });
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
    storedOtp = await getRegisterOtp(normalizedEmail);
    pending = await getPendingRegistration(normalizedEmail);
  } catch (e: any) {
    const m = typeof e?.message === "string" ? e.message : String(e);
    return {
      kind: "redis_error" as const,
      message: "Redis unavailable",
      details: m,
    };
  }

  if (!storedOtp || storedOtp !== otp) {
    return { kind: "invalid_otp" as const, message: "Invalid or expired otp" };
  }

  if (!pending?.passwordHash) {
    return {
      kind: "expired_registration" as const,
      message: "Expired registration",
    };
  }

  const user = new User({
    email: normalizedEmail,
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
        userAgent,
        ip,
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
    await user.save();
  } catch (e: any) {
    await deleteRefreshToken(refreshToken);
    const m = typeof e?.message === "string" ? e.message : String(e);
    return {
      kind: "internal_error" as const,
      message: "Internal Server Error",
      details: m,
    };
  }

  try {
    await deleteRegisterOtp(normalizedEmail);
    await deletePendingRegistration(normalizedEmail);
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

export const login = async (payload: {
  email?: string;
  password?: string;
  userAgent?: string;
  ip?: string;
}) => {
  const { email, password, userAgent, ip } = payload;

  if (!email || !password) {
    return {
      kind: "validation_error" as const,
      message: "Missing email or password",
    };
  }

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
    deleted: false,
  }).select("+passwordHash");

  if (!user) {
    return { kind: "unauthorized" as const, message: "Invalid credentials" };
  }

  if ((user as any).status === "blocked") {
    return { kind: "forbidden" as const, message: "User is blocked" };
  }

  const ok = await bcrypt.compare(password, (user as any).passwordHash);
  if (!ok) {
    return { kind: "unauthorized" as const, message: "Invalid credentials" };
  }

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
        userAgent,
        ip,
      },
      getRefreshTtlSeconds(),
    );
  } catch (e: any) {
    const m = typeof e?.message === "string" ? e.message : String(e);
    return {
      kind: "redis_error" as const,
      message: "Redis unavailable",
      details: m,
    };
  }

  (user as any).lastLoginAt = new Date();
  try {
    await user.save();
  } catch (e: any) {
    await deleteRefreshToken(refreshToken);
    const m = typeof e?.message === "string" ? e.message : String(e);
    return {
      kind: "internal_error" as const,
      message: "Internal Server Error",
      details: m,
    };
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

export const refresh = async (payload: {
  refreshToken?: string;
  userAgent?: string;
  ip?: string;
}) => {
  const { refreshToken, userAgent, ip } = payload;

  if (!refreshToken) {
    return {
      kind: "missing_refresh" as const,
      message: "Missing refresh token",
    };
  }

  let data: { userId?: string } | null;
  try {
    data = await getRefreshToken(refreshToken);
  } catch (e: any) {
    const m = typeof e?.message === "string" ? e.message : String(e);
    return {
      kind: "redis_error" as const,
      message: "Redis unavailable",
      details: m,
    };
  }

  if (!data?.userId) {
    return {
      kind: "invalid_refresh" as const,
      message: "Invalid refresh token",
    };
  }

  const user = await User.findOne({ _id: data.userId, deleted: false });
  if (!user) {
    return { kind: "invalid_refresh" as const, message: "User not found" };
  }

  if ((user as any).status === "blocked") {
    return { kind: "forbidden" as const, message: "User is blocked" };
  }

  const newRefreshToken = generateRandomString(64);

  try {
    await setRefreshToken(
      newRefreshToken,
      {
        userId: String(user._id),
        userAgent,
        ip,
      },
      getRefreshTtlSeconds(),
    );
    await deleteRefreshToken(refreshToken);
  } catch (e: any) {
    const m = typeof e?.message === "string" ? e.message : String(e);
    return {
      kind: "redis_error" as const,
      message: "Redis unavailable",
      details: m,
    };
  }

  const accessToken = signAccessToken({
    userId: String(user._id),
    role: (user as any).role,
  });

  return {
    kind: "ok" as const,
    accessToken,
    refreshToken: newRefreshToken,
  };
};

export const logout = async (payload: { refreshToken?: string }) => {
  const token = payload.refreshToken;
  if (token) {
    try {
      await deleteRefreshToken(token);
    } catch (e: any) {
      const m = typeof e?.message === "string" ? e.message : String(e);
      return {
        kind: "redis_error" as const,
        message: "Redis unavailable",
        details: m,
      };
    }
  }

  return { kind: "ok" as const };
};

export const requestOtp = async (payload: { userId?: string }) => {
  const { userId } = payload;
  if (!userId) {
    return { kind: "unauthorized" as const, message: "Unauthorized" };
  }

  const ttlSecondsRaw = process.env.OTP_TTL_SECONDS;
  const ttlSeconds = ttlSecondsRaw ? Number(ttlSecondsRaw) : 300;
  const otpTtlSeconds =
    Number.isFinite(ttlSeconds) && ttlSeconds > 0 ? ttlSeconds : 300;

  const otpLengthRaw = process.env.OTP_LENGTH;
  const otpLength = otpLengthRaw ? Number(otpLengthRaw) : 6;
  const otpDigits = Number.isFinite(otpLength) && otpLength > 0 ? otpLength : 6;

  const otp = generateRandomNumber(otpDigits);

  try {
    await setOtp(String(userId), otp, otpTtlSeconds);
  } catch (e: any) {
    const m = typeof e?.message === "string" ? e.message : String(e);
    return {
      kind: "redis_error" as const,
      message: "Redis unavailable",
      details: m,
    };
  }

  return {
    kind: "ok" as const,
    otp,
    expiresInSeconds: otpTtlSeconds,
  };
};

export const verifyOtp = async (payload: { userId?: string; otp?: string }) => {
  const { userId, otp } = payload;

  if (!userId) {
    return { kind: "unauthorized" as const, message: "Unauthorized" };
  }

  if (!otp) {
    return { kind: "validation_error" as const, message: "Missing otp" };
  }

  let storedOtp: string | null;

  try {
    storedOtp = await getOtp(String(userId));
  } catch (e: any) {
    const m = typeof e?.message === "string" ? e.message : String(e);
    return {
      kind: "redis_error" as const,
      message: "Redis unavailable",
      details: m,
    };
  }

  if (!storedOtp || storedOtp !== otp) {
    return {
      kind: "validation_error" as const,
      message: "Invalid or expired otp",
    };
  }

  try {
    await deleteOtp(String(userId));
  } catch {
    // ignore
  }

  const user = await User.findOne({ _id: String(userId), deleted: false });
  if (!user) {
    return { kind: "unauthorized" as const, message: "User not found" };
  }

  (user as any).emailVerified = true;
  await user.save();

  return { kind: "ok" as const };
};
