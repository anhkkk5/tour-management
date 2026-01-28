"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteResetPasswordToken = exports.getResetPasswordEmailByToken = exports.setResetPasswordToken = exports.deleteResetPasswordOtp = exports.getResetPasswordOtp = exports.setResetPasswordOtp = exports.deletePendingRegistration = exports.getPendingRegistration = exports.setPendingRegistration = exports.deleteRegisterOtp = exports.getRegisterOtp = exports.setRegisterOtp = exports.deleteOtp = exports.getOtp = exports.setOtp = exports.deleteRefreshToken = exports.getRefreshToken = exports.setRefreshToken = exports.deleteUserRefreshToken = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const url_1 = require("url");
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
            const u = new url_1.URL(redisUrl);
            if (u.protocol === "rediss:")
                return true;
            if (u.protocol === "redis:")
                return false;
        }
        catch {
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
            return new url_1.URL(redisUrl).hostname;
        }
        catch {
            return redisHost;
        }
    }
    return redisHost;
};
const servername = getServerName();
const redis = redisUrl
    ? new ioredis_1.default(redisUrl, {
        username: redisUsername,
        password: redisPassword,
        tls: shouldUseTls ? { servername } : undefined,
    })
    : new ioredis_1.default({
        host: redisHost,
        port: redisPort,
        username: redisUsername,
        password: redisPassword,
        tls: shouldUseTls ? { servername } : undefined,
    });
redis.on("error", (err) => {
    console.error("Redis error:", err?.message ?? err);
});
const refreshKey = (token) => `refresh:${token}`;
const refreshUserKey = (userId) => `refresh_user:${userId}`;
const deleteUserRefreshToken = async (userId) => {
    const token = await redis.get(refreshUserKey(userId));
    if (!token)
        return;
    const multi = redis.multi();
    multi.del(refreshKey(token));
    multi.del(refreshUserKey(userId));
    await multi.exec();
};
exports.deleteUserRefreshToken = deleteUserRefreshToken;
const setRefreshToken = async (token, value, ttlSeconds) => {
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
exports.setRefreshToken = setRefreshToken;
const getRefreshToken = async (token) => {
    const raw = await redis.get(refreshKey(token));
    if (!raw)
        return null;
    try {
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
};
exports.getRefreshToken = getRefreshToken;
const deleteRefreshToken = async (token) => {
    const raw = await redis.get(refreshKey(token));
    let userId;
    if (raw) {
        try {
            userId = JSON.parse(raw)?.userId;
        }
        catch {
            // ignore
        }
    }
    const multi = redis.multi();
    multi.del(refreshKey(token));
    if (userId) {
        // Only delete mapping if it points to this token
        multi.get(refreshUserKey(userId));
        const res = await multi.exec();
        const mappedToken = res?.[1]?.[1];
        if (mappedToken === token) {
            await redis.del(refreshUserKey(userId));
        }
        return;
    }
    await multi.exec();
};
exports.deleteRefreshToken = deleteRefreshToken;
const otpKey = (userId) => `otp:${userId}`;
const setOtp = async (userId, otp, ttlSeconds) => {
    await redis.set(otpKey(userId), otp, "EX", ttlSeconds);
};
exports.setOtp = setOtp;
const getOtp = async (userId) => {
    return await redis.get(otpKey(userId));
};
exports.getOtp = getOtp;
const deleteOtp = async (userId) => {
    await redis.del(otpKey(userId));
};
exports.deleteOtp = deleteOtp;
const registerOtpKey = (email) => `register_otp:${email}`;
const pendingRegistrationKey = (email) => `register_pending:${email}`;
const setRegisterOtp = async (email, otp, ttlSeconds) => {
    // Overwrites old OTP automatically
    await redis.set(registerOtpKey(email), otp, "EX", ttlSeconds);
};
exports.setRegisterOtp = setRegisterOtp;
const getRegisterOtp = async (email) => {
    return await redis.get(registerOtpKey(email));
};
exports.getRegisterOtp = getRegisterOtp;
const deleteRegisterOtp = async (email) => {
    await redis.del(registerOtpKey(email));
};
exports.deleteRegisterOtp = deleteRegisterOtp;
const setPendingRegistration = async (email, value, ttlSeconds) => {
    // Overwrites old pending registration automatically
    await redis.set(pendingRegistrationKey(email), JSON.stringify(value), "EX", ttlSeconds);
};
exports.setPendingRegistration = setPendingRegistration;
const getPendingRegistration = async (email) => {
    const raw = await redis.get(pendingRegistrationKey(email));
    if (!raw)
        return null;
    try {
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
};
exports.getPendingRegistration = getPendingRegistration;
const deletePendingRegistration = async (email) => {
    await redis.del(pendingRegistrationKey(email));
};
exports.deletePendingRegistration = deletePendingRegistration;
const resetPasswordOtpKey = (email) => `reset_password_otp:${email}`;
const resetPasswordTokenKey = (token) => `reset_password_token:${token}`;
const resetPasswordEmailKey = (email) => `reset_password_email:${email}`;
const setResetPasswordOtp = async (email, otp, ttlSeconds) => {
    await redis.set(resetPasswordOtpKey(email), otp, "EX", ttlSeconds);
};
exports.setResetPasswordOtp = setResetPasswordOtp;
const getResetPasswordOtp = async (email) => {
    return await redis.get(resetPasswordOtpKey(email));
};
exports.getResetPasswordOtp = getResetPasswordOtp;
const deleteResetPasswordOtp = async (email) => {
    await redis.del(resetPasswordOtpKey(email));
};
exports.deleteResetPasswordOtp = deleteResetPasswordOtp;
const setResetPasswordToken = async (email, token, ttlSeconds) => {
    const oldToken = await redis.get(resetPasswordEmailKey(email));
    const multi = redis.multi();
    if (oldToken && oldToken !== token) {
        multi.del(resetPasswordTokenKey(oldToken));
    }
    multi.set(resetPasswordEmailKey(email), token, "EX", ttlSeconds);
    multi.set(resetPasswordTokenKey(token), email, "EX", ttlSeconds);
    await multi.exec();
};
exports.setResetPasswordToken = setResetPasswordToken;
const getResetPasswordEmailByToken = async (token) => {
    return await redis.get(resetPasswordTokenKey(token));
};
exports.getResetPasswordEmailByToken = getResetPasswordEmailByToken;
const deleteResetPasswordToken = async (token) => {
    const email = await redis.get(resetPasswordTokenKey(token));
    const multi = redis.multi();
    multi.del(resetPasswordTokenKey(token));
    if (email) {
        multi.get(resetPasswordEmailKey(email));
        const res = await multi.exec();
        const mappedToken = res?.[1]?.[1];
        if (mappedToken === token) {
            await redis.del(resetPasswordEmailKey(email));
        }
        return;
    }
    await multi.exec();
};
exports.deleteResetPasswordToken = deleteResetPasswordToken;
exports.default = redis;
