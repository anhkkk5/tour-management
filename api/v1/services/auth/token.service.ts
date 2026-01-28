import { deleteRefreshToken } from "../../repositories/auth/redis.repository";

export const getRefreshTtlSeconds = () => {
  const raw = process.env.REFRESH_TOKEN_TTL_SECONDS;
  if (!raw) return 7 * 24 * 60 * 60;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 7 * 24 * 60 * 60;
  return n;
};

export const cleanupRefreshToken = async (token: string) => {
  await deleteRefreshToken(token);
};
