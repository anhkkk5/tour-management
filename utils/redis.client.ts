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

export const setRefreshToken = async (
  token: string,
  value: RefreshTokenValue,
  ttlSeconds: number,
) => {
  await redis.set(refreshKey(token), JSON.stringify(value), "EX", ttlSeconds);
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
  await redis.del(refreshKey(token));
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

export default redis;
