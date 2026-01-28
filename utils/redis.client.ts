import Redis from "ioredis";
import { URL } from "url";

const redisUrl = process.env.REDIS_URL;
const redisHost = process.env.REDIS_HOST ?? "127.0.0.1";
const redisPort = process.env.REDIS_PORT
  ? Number(process.env.REDIS_PORT)
  : 6379;
const redisUsername = process.env.REDIS_USERNAME ?? undefined;
const redisPassword = process.env.REDIS_PASSWORD ?? undefined;

const getTlsConfig = () => {
  if (process.env.REDIS_TLS !== undefined) {
    return process.env.REDIS_TLS === "true";
  }

  if (redisUrl) {
    try {
      const u = new URL(redisUrl);
      if (u.protocol === "rediss:") return true;
      if (u.protocol === "redis:") return false;
    } catch {
      // ignore
    }
  }

  // Common TLS port for managed Redis
  return redisPort === 6380;
};

const shouldUseTls = getTlsConfig();

const getServerName = () => {
  if (redisUrl) {
    try {
      return new URL(redisUrl).hostname;
    } catch {
      return redisHost;
    }
  }
  return redisHost;
};

const servername = getServerName();

const redis = redisUrl
  ? new Redis(redisUrl, {
      username: redisUsername,
      password: redisPassword,
      tls: shouldUseTls ? { servername } : undefined,
    })
  : new Redis({
      host: redisHost,
      port: redisPort,
      username: redisUsername,
      password: redisPassword,
      tls: shouldUseTls ? { servername } : undefined,
    });

redis.on("error", (err) => {
  console.error("Redis error:", err?.message ?? err);
});

export type RefreshTokenValue = {
  userId: string;
  userAgent?: string;
  ip?: string;
};

const refreshKey = (token: string) => `refresh:${token}`;
const refreshUserKey = (userId: string) => `refresh_user:${userId}`;

export const deleteUserRefreshToken = async (userId: string) => {
  const token = await redis.get(refreshUserKey(userId));
  if (!token) return;
  const multi = redis.multi();
  multi.del(refreshKey(token));
  multi.del(refreshUserKey(userId));
  await multi.exec();
};

export const setRefreshToken = async (
  token: string,
  value: RefreshTokenValue,
  ttlSeconds: number,
) => {
  const userId = value.userId;
  if (!userId) {
    await redis.set(refreshKey(token), JSON.stringify(value), "EX", ttlSeconds);
    return;
  }

  // Single-session: revoke previous refresh token for this user (if any)
  const oldToken = await redis.get(refreshUserKey(userId));
  const multi = redis.multi();
  if (oldToken && oldToken !== token) {
    multi.del(refreshKey(oldToken));
  }

  multi.set(refreshUserKey(userId), token, "EX", ttlSeconds);
  multi.set(refreshKey(token), JSON.stringify(value), "EX", ttlSeconds);
  await multi.exec();
};

export const getRefreshToken = async (token: string) => {
  const raw = await redis.get(refreshKey(token));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RefreshTokenValue;
  } catch {
    return null;
  }
};

export const deleteRefreshToken = async (token: string) => {
  const raw = await redis.get(refreshKey(token));
  let userId: string | undefined;
  if (raw) {
    try {
      userId = (JSON.parse(raw) as RefreshTokenValue)?.userId;
    } catch {
      // ignore
    }
  }

  const multi = redis.multi();
  multi.del(refreshKey(token));
  if (userId) {
    // Only delete mapping if it points to this token
    multi.get(refreshUserKey(userId));
    const res = await multi.exec();
    const mappedToken = res?.[1]?.[1] as string | null | undefined;
    if (mappedToken === token) {
      await redis.del(refreshUserKey(userId));
    }
    return;
  }

  await multi.exec();
};

const otpKey = (userId: string) => `otp:${userId}`;

export const setOtp = async (
  userId: string,
  otp: string,
  ttlSeconds: number,
) => {
  await redis.set(otpKey(userId), otp, "EX", ttlSeconds);
};

export const getOtp = async (userId: string) => {
  return await redis.get(otpKey(userId));
};

export const deleteOtp = async (userId: string) => {
  await redis.del(otpKey(userId));
};

export type PendingRegistrationValue = {
  email: string;
  passwordHash: string;
  fullName?: string;
  phone?: string;
};

const registerOtpKey = (email: string) => `register_otp:${email}`;
const pendingRegistrationKey = (email: string) => `register_pending:${email}`;

export const setRegisterOtp = async (
  email: string,
  otp: string,
  ttlSeconds: number,
) => {
  // Overwrites old OTP automatically
  await redis.set(registerOtpKey(email), otp, "EX", ttlSeconds);
};

export const getRegisterOtp = async (email: string) => {
  return await redis.get(registerOtpKey(email));
};

export const deleteRegisterOtp = async (email: string) => {
  await redis.del(registerOtpKey(email));
};

export const setPendingRegistration = async (
  email: string,
  value: PendingRegistrationValue,
  ttlSeconds: number,
) => {
  // Overwrites old pending registration automatically
  await redis.set(
    pendingRegistrationKey(email),
    JSON.stringify(value),
    "EX",
    ttlSeconds,
  );
};

export const getPendingRegistration = async (email: string) => {
  const raw = await redis.get(pendingRegistrationKey(email));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingRegistrationValue;
  } catch {
    return null;
  }
};

export const deletePendingRegistration = async (email: string) => {
  await redis.del(pendingRegistrationKey(email));
};

const resetPasswordOtpKey = (email: string) => `reset_password_otp:${email}`;

const resetPasswordTokenKey = (token: string) =>
  `reset_password_token:${token}`;
const resetPasswordEmailKey = (email: string) =>
  `reset_password_email:${email}`;

export const setResetPasswordOtp = async (
  email: string,
  otp: string,
  ttlSeconds: number,
) => {
  await redis.set(resetPasswordOtpKey(email), otp, "EX", ttlSeconds);
};

export const getResetPasswordOtp = async (email: string) => {
  return await redis.get(resetPasswordOtpKey(email));
};

export const deleteResetPasswordOtp = async (email: string) => {
  await redis.del(resetPasswordOtpKey(email));
};

export const setResetPasswordToken = async (
  email: string,
  token: string,
  ttlSeconds: number,
) => {
  const oldToken = await redis.get(resetPasswordEmailKey(email));
  const multi = redis.multi();
  if (oldToken && oldToken !== token) {
    multi.del(resetPasswordTokenKey(oldToken));
  }

  multi.set(resetPasswordEmailKey(email), token, "EX", ttlSeconds);
  multi.set(resetPasswordTokenKey(token), email, "EX", ttlSeconds);
  await multi.exec();
};

export const getResetPasswordEmailByToken = async (token: string) => {
  return await redis.get(resetPasswordTokenKey(token));
};

export const deleteResetPasswordToken = async (token: string) => {
  const email = await redis.get(resetPasswordTokenKey(token));
  const multi = redis.multi();
  multi.del(resetPasswordTokenKey(token));
  if (email) {
    multi.get(resetPasswordEmailKey(email));
    const res = await multi.exec();
    const mappedToken = res?.[1]?.[1] as string | null | undefined;
    if (mappedToken === token) {
      await redis.del(resetPasswordEmailKey(email));
    }
    return;
  }
  await multi.exec();
};

export default redis;
