"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupRefreshToken = exports.getRefreshTtlSeconds = void 0;
const redis_repository_1 = require("../../repositories/auth/redis.repository");
const getRefreshTtlSeconds = () => {
    const raw = process.env.REFRESH_TOKEN_TTL_SECONDS;
    if (!raw)
        return 7 * 24 * 60 * 60;
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0)
        return 7 * 24 * 60 * 60;
    return n;
};
exports.getRefreshTtlSeconds = getRefreshTtlSeconds;
const cleanupRefreshToken = async (token) => {
    await (0, redis_repository_1.deleteRefreshToken)(token);
};
exports.cleanupRefreshToken = cleanupRefreshToken;
