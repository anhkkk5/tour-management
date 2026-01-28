"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtp = exports.requestOtp = exports.logout = exports.refresh = exports.login = exports.verifyRegisterOtp = exports.registerRequestOtp = exports.cleanupRefreshToken = void 0;
const user_model_1 = __importDefault(require("../../models/user/user.model"));
const redis_client_1 = require("../../../../utils/redis.client");
const jwt_util_1 = require("../../../../utils/jwt.util");
const generate_1 = require("../../../../helpers/generate");
const email_client_1 = require("../../../../utils/email.client");
const bcrypt = require("bcrypt");
const getRefreshTtlSeconds = () => {
    const raw = process.env.REFRESH_TOKEN_TTL_SECONDS;
    if (!raw)
        return 7 * 24 * 60 * 60;
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0)
        return 7 * 24 * 60 * 60;
    return n;
};
const isRedisErrorMessage = (message) => /redis|ioredis|ECONN|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|ECONNRESET|WRONGPASS|NOAUTH|TLS|CERT/i.test(message);
const cleanupRefreshToken = async (token) => {
    await (0, redis_client_1.deleteRefreshToken)(token);
};
exports.cleanupRefreshToken = cleanupRefreshToken;
const registerRequestOtp = async (payload) => {
    const { email, password, fullName, phone, isProd } = payload;
    if (!email || !password) {
        return {
            kind: "validation_error",
            message: "Missing email or password",
        };
    }
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await user_model_1.default.findOne({ email: normalizedEmail });
    if (existing) {
        return { kind: "conflict", message: "Email already exists" };
    }
    const saltRounds = process.env.BCRYPT_SALT_ROUNDS
        ? Number(process.env.BCRYPT_SALT_ROUNDS)
        : 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const ttlSecondsRaw = process.env.OTP_TTL_SECONDS;
    const ttlSeconds = ttlSecondsRaw ? Number(ttlSecondsRaw) : 300;
    const otpTtlSeconds = Number.isFinite(ttlSeconds) && ttlSeconds > 0 ? ttlSeconds : 300;
    const otpLengthRaw = process.env.OTP_LENGTH;
    const otpLength = otpLengthRaw ? Number(otpLengthRaw) : 6;
    const otpDigits = Number.isFinite(otpLength) && otpLength > 0 ? otpLength : 6;
    const otp = (0, generate_1.generateRandomNumber)(otpDigits);
    try {
        await (0, redis_client_1.setPendingRegistration)(normalizedEmail, {
            email: normalizedEmail,
            passwordHash,
            fullName,
            phone,
        }, otpTtlSeconds);
        await (0, redis_client_1.setRegisterOtp)(normalizedEmail, otp, otpTtlSeconds);
    }
    catch (e) {
        const m = typeof e?.message === "string" ? e.message : String(e);
        return {
            kind: "redis_error",
            message: "Redis unavailable",
            details: m,
        };
    }
    try {
        await (0, email_client_1.sendRegisterOtpEmail)({
            to: normalizedEmail,
            otp,
            expiresInSeconds: otpTtlSeconds,
        });
    }
    catch (e) {
        await (0, redis_client_1.deleteRegisterOtp)(normalizedEmail);
        await (0, redis_client_1.deletePendingRegistration)(normalizedEmail);
        const m = typeof e?.message === "string" ? e.message : String(e);
        return {
            kind: "email_failed",
            message: "Failed to send OTP email",
            details: m,
        };
    }
    return {
        kind: "ok",
        email: normalizedEmail,
        ...(isProd ? {} : { otp }),
        expiresInSeconds: otpTtlSeconds,
    };
};
exports.registerRequestOtp = registerRequestOtp;
const verifyRegisterOtp = async (payload) => {
    const { email, otp, userAgent, ip } = payload;
    if (!email || !otp) {
        return {
            kind: "validation_error",
            message: "Missing email or otp",
        };
    }
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await user_model_1.default.findOne({ email: normalizedEmail });
    if (existing) {
        return { kind: "conflict", message: "Email already exists" };
    }
    let storedOtp;
    let pending;
    try {
        storedOtp = await (0, redis_client_1.getRegisterOtp)(normalizedEmail);
        pending = await (0, redis_client_1.getPendingRegistration)(normalizedEmail);
    }
    catch (e) {
        const m = typeof e?.message === "string" ? e.message : String(e);
        return {
            kind: "redis_error",
            message: "Redis unavailable",
            details: m,
        };
    }
    if (!storedOtp || storedOtp !== otp) {
        return { kind: "invalid_otp", message: "Invalid or expired otp" };
    }
    if (!pending?.passwordHash) {
        return {
            kind: "expired_registration",
            message: "Expired registration",
        };
    }
    const user = new user_model_1.default({
        email: normalizedEmail,
        passwordHash: pending.passwordHash,
        fullName: pending.fullName,
        phone: pending.phone,
        role: "user",
        emailVerified: true,
        status: "active",
        deleted: false,
    });
    const accessToken = (0, jwt_util_1.signAccessToken)({
        userId: String(user._id),
        role: user.role,
    });
    const refreshToken = (0, generate_1.generateRandomString)(64);
    try {
        await (0, redis_client_1.setRefreshToken)(refreshToken, {
            userId: String(user._id),
            userAgent,
            ip,
        }, getRefreshTtlSeconds());
    }
    catch (e) {
        const m = typeof e?.message === "string" ? e.message : String(e);
        return {
            kind: "redis_error",
            message: isRedisErrorMessage(m)
                ? "Redis unavailable"
                : "Internal Server Error",
            details: m,
        };
    }
    try {
        await user.save();
    }
    catch (e) {
        await (0, redis_client_1.deleteRefreshToken)(refreshToken);
        const m = typeof e?.message === "string" ? e.message : String(e);
        return {
            kind: "internal_error",
            message: "Internal Server Error",
            details: m,
        };
    }
    try {
        await (0, redis_client_1.deleteRegisterOtp)(normalizedEmail);
        await (0, redis_client_1.deletePendingRegistration)(normalizedEmail);
    }
    catch {
        // ignore
    }
    return {
        kind: "ok",
        accessToken,
        refreshToken,
        user: {
            _id: user._id,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            phone: user.phone,
            avatar: user.avatar,
        },
    };
};
exports.verifyRegisterOtp = verifyRegisterOtp;
const login = async (payload) => {
    const { email, password, userAgent, ip } = payload;
    if (!email || !password) {
        return {
            kind: "validation_error",
            message: "Missing email or password",
        };
    }
    const user = await user_model_1.default.findOne({
        email: email.toLowerCase().trim(),
        deleted: false,
    }).select("+passwordHash");
    if (!user) {
        return { kind: "unauthorized", message: "Invalid credentials" };
    }
    if (user.status === "blocked") {
        return { kind: "forbidden", message: "User is blocked" };
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
        return { kind: "unauthorized", message: "Invalid credentials" };
    }
    const accessToken = (0, jwt_util_1.signAccessToken)({
        userId: String(user._id),
        role: user.role,
    });
    const refreshToken = (0, generate_1.generateRandomString)(64);
    try {
        await (0, redis_client_1.setRefreshToken)(refreshToken, {
            userId: String(user._id),
            userAgent,
            ip,
        }, getRefreshTtlSeconds());
    }
    catch (e) {
        const m = typeof e?.message === "string" ? e.message : String(e);
        return {
            kind: "redis_error",
            message: "Redis unavailable",
            details: m,
        };
    }
    user.lastLoginAt = new Date();
    try {
        await user.save();
    }
    catch (e) {
        await (0, redis_client_1.deleteRefreshToken)(refreshToken);
        const m = typeof e?.message === "string" ? e.message : String(e);
        return {
            kind: "internal_error",
            message: "Internal Server Error",
            details: m,
        };
    }
    return {
        kind: "ok",
        accessToken,
        refreshToken,
        user: {
            _id: user._id,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            phone: user.phone,
            avatar: user.avatar,
        },
    };
};
exports.login = login;
const refresh = async (payload) => {
    const { refreshToken, userAgent, ip } = payload;
    if (!refreshToken) {
        return {
            kind: "missing_refresh",
            message: "Missing refresh token",
        };
    }
    let data;
    try {
        data = await (0, redis_client_1.getRefreshToken)(refreshToken);
    }
    catch (e) {
        const m = typeof e?.message === "string" ? e.message : String(e);
        return {
            kind: "redis_error",
            message: "Redis unavailable",
            details: m,
        };
    }
    if (!data?.userId) {
        return {
            kind: "invalid_refresh",
            message: "Invalid refresh token",
        };
    }
    const user = await user_model_1.default.findOne({ _id: data.userId, deleted: false });
    if (!user) {
        return { kind: "invalid_refresh", message: "User not found" };
    }
    if (user.status === "blocked") {
        return { kind: "forbidden", message: "User is blocked" };
    }
    const newRefreshToken = (0, generate_1.generateRandomString)(64);
    try {
        await (0, redis_client_1.setRefreshToken)(newRefreshToken, {
            userId: String(user._id),
            userAgent,
            ip,
        }, getRefreshTtlSeconds());
        await (0, redis_client_1.deleteRefreshToken)(refreshToken);
    }
    catch (e) {
        const m = typeof e?.message === "string" ? e.message : String(e);
        return {
            kind: "redis_error",
            message: "Redis unavailable",
            details: m,
        };
    }
    const accessToken = (0, jwt_util_1.signAccessToken)({
        userId: String(user._id),
        role: user.role,
    });
    return {
        kind: "ok",
        accessToken,
        refreshToken: newRefreshToken,
    };
};
exports.refresh = refresh;
const logout = async (payload) => {
    const token = payload.refreshToken;
    if (token) {
        try {
            await (0, redis_client_1.deleteRefreshToken)(token);
        }
        catch (e) {
            const m = typeof e?.message === "string" ? e.message : String(e);
            return {
                kind: "redis_error",
                message: "Redis unavailable",
                details: m,
            };
        }
    }
    return { kind: "ok" };
};
exports.logout = logout;
const requestOtp = async (payload) => {
    const { userId } = payload;
    if (!userId) {
        return { kind: "unauthorized", message: "Unauthorized" };
    }
    const ttlSecondsRaw = process.env.OTP_TTL_SECONDS;
    const ttlSeconds = ttlSecondsRaw ? Number(ttlSecondsRaw) : 300;
    const otpTtlSeconds = Number.isFinite(ttlSeconds) && ttlSeconds > 0 ? ttlSeconds : 300;
    const otpLengthRaw = process.env.OTP_LENGTH;
    const otpLength = otpLengthRaw ? Number(otpLengthRaw) : 6;
    const otpDigits = Number.isFinite(otpLength) && otpLength > 0 ? otpLength : 6;
    const otp = (0, generate_1.generateRandomNumber)(otpDigits);
    try {
        await (0, redis_client_1.setOtp)(String(userId), otp, otpTtlSeconds);
    }
    catch (e) {
        const m = typeof e?.message === "string" ? e.message : String(e);
        return {
            kind: "redis_error",
            message: "Redis unavailable",
            details: m,
        };
    }
    return {
        kind: "ok",
        otp,
        expiresInSeconds: otpTtlSeconds,
    };
};
exports.requestOtp = requestOtp;
const verifyOtp = async (payload) => {
    const { userId, otp } = payload;
    if (!userId) {
        return { kind: "unauthorized", message: "Unauthorized" };
    }
    if (!otp) {
        return { kind: "validation_error", message: "Missing otp" };
    }
    let storedOtp;
    try {
        storedOtp = await (0, redis_client_1.getOtp)(String(userId));
    }
    catch (e) {
        const m = typeof e?.message === "string" ? e.message : String(e);
        return {
            kind: "redis_error",
            message: "Redis unavailable",
            details: m,
        };
    }
    if (!storedOtp || storedOtp !== otp) {
        return {
            kind: "validation_error",
            message: "Invalid or expired otp",
        };
    }
    try {
        await (0, redis_client_1.deleteOtp)(String(userId));
    }
    catch {
        // ignore
    }
    const user = await user_model_1.default.findOne({ _id: String(userId), deleted: false });
    if (!user) {
        return { kind: "unauthorized", message: "User not found" };
    }
    user.emailVerified = true;
    await user.save();
    return { kind: "ok" };
};
exports.verifyOtp = verifyOtp;
