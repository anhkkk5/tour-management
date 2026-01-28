"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendRegisterOtp = exports.verifyRegisterOtp = exports.registerRequestOtp = void 0;
const user_model_1 = __importDefault(require("../../models/user/user.model"));
const generate_1 = require("../../../../helpers/generate");
const jwt_util_1 = require("../../../../utils/jwt.util");
const email_client_1 = require("../../../../utils/email.client");
const redis_repository_1 = require("../../repositories/auth/redis.repository");
const user_repository_1 = require("../../repositories/auth/user.repository");
const registration_validator_1 = require("../../validators/auth/registration.validator");
const token_service_1 = require("./token.service");
const bcrypt = require("bcrypt");
const getOtpConfig = () => {
    const ttlSecondsRaw = process.env.OTP_TTL_SECONDS;
    const ttlSeconds = ttlSecondsRaw ? Number(ttlSecondsRaw) : 300;
    const otpTtlSeconds = Number.isFinite(ttlSeconds) && ttlSeconds > 0 ? ttlSeconds : 300;
    const otpLengthRaw = process.env.OTP_LENGTH;
    const otpLength = otpLengthRaw ? Number(otpLengthRaw) : 6;
    const otpDigits = Number.isFinite(otpLength) && otpLength > 0 ? otpLength : 6;
    return { otpTtlSeconds, otpDigits };
};
const registerRequestOtp = async (payload) => {
    const validated = (0, registration_validator_1.validateRegisterRequestOtpInput)(payload);
    if (validated.kind === "validation_error")
        return validated;
    const existing = await (0, user_repository_1.findUserByEmail)(validated.email);
    if (existing) {
        return { kind: "conflict", message: "Email already exists" };
    }
    const saltRounds = process.env.BCRYPT_SALT_ROUNDS
        ? Number(process.env.BCRYPT_SALT_ROUNDS)
        : 10;
    const passwordHash = await bcrypt.hash(validated.password, saltRounds);
    const { otpTtlSeconds, otpDigits } = getOtpConfig();
    const otp = (0, generate_1.generateRandomNumber)(otpDigits);
    try {
        await (0, redis_repository_1.setPendingRegistration)(validated.email, {
            email: validated.email,
            passwordHash,
            fullName: validated.fullName,
            phone: validated.phone,
        }, otpTtlSeconds);
        await (0, redis_repository_1.setRegisterOtp)(validated.email, otp, otpTtlSeconds);
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
            to: validated.email,
            otp,
            expiresInSeconds: otpTtlSeconds,
        });
    }
    catch (e) {
        await (0, redis_repository_1.deleteRegisterOtp)(validated.email);
        await (0, redis_repository_1.deletePendingRegistration)(validated.email);
        const m = typeof e?.message === "string" ? e.message : String(e);
        return {
            kind: "email_failed",
            message: "Failed to send OTP email",
            details: m,
        };
    }
    return {
        kind: "ok",
        email: validated.email,
        ...(payload.isProd ? {} : { otp }),
        expiresInSeconds: otpTtlSeconds,
    };
};
exports.registerRequestOtp = registerRequestOtp;
const verifyRegisterOtp = async (payload) => {
    const validated = (0, registration_validator_1.validateVerifyRegisterOtpInput)(payload);
    if (validated.kind === "validation_error")
        return validated;
    const existing = await (0, user_repository_1.findUserByEmail)(validated.email);
    if (existing) {
        return { kind: "conflict", message: "Email already exists" };
    }
    let storedOtp;
    let pending;
    try {
        storedOtp = await (0, redis_repository_1.getRegisterOtp)(validated.email);
        pending = await (0, redis_repository_1.getPendingRegistration)(validated.email);
    }
    catch (e) {
        const m = typeof e?.message === "string" ? e.message : String(e);
        return {
            kind: "redis_error",
            message: "Redis unavailable",
            details: m,
        };
    }
    if (!storedOtp || storedOtp !== validated.otp) {
        return { kind: "invalid_otp", message: "Invalid or expired otp" };
    }
    if (!pending?.passwordHash) {
        return {
            kind: "expired_registration",
            message: "Expired registration",
        };
    }
    const user = new user_model_1.default({
        email: validated.email,
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
        await (0, redis_repository_1.setRefreshToken)(refreshToken, {
            userId: String(user._id),
            userAgent: payload.userAgent,
            ip: payload.ip,
        }, (0, token_service_1.getRefreshTtlSeconds)());
    }
    catch (e) {
        const m = typeof e?.message === "string" ? e.message : String(e);
        return {
            kind: "redis_error",
            message: (0, redis_repository_1.isRedisErrorMessage)(m)
                ? "Redis unavailable"
                : "Internal Server Error",
            details: m,
        };
    }
    try {
        await (0, user_repository_1.saveUser)(user);
    }
    catch (e) {
        await (0, redis_repository_1.deleteRegisterOtp)(validated.email);
        const m = typeof e?.message === "string" ? e.message : String(e);
        return {
            kind: "internal_error",
            message: "Internal Server Error",
            details: m,
        };
    }
    try {
        await (0, redis_repository_1.deleteRegisterOtp)(validated.email);
        await (0, redis_repository_1.deletePendingRegistration)(validated.email);
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
const resendRegisterOtp = async (payload) => {
    if (!payload.email) {
        return { kind: "validation_error", message: "Missing email" };
    }
    const email = payload.email.toLowerCase().trim();
    const existing = await (0, user_repository_1.findUserByEmail)(email);
    if (existing) {
        return { kind: "conflict", message: "Email already exists" };
    }
    let pending;
    try {
        pending = await (0, redis_repository_1.getPendingRegistration)(email);
    }
    catch (e) {
        const m = typeof e?.message === "string" ? e.message : String(e);
        return {
            kind: "redis_error",
            message: "Redis unavailable",
            details: m,
        };
    }
    if (!pending?.passwordHash) {
        return {
            kind: "expired_registration",
            message: "Expired registration",
        };
    }
    const { otpTtlSeconds, otpDigits } = getOtpConfig();
    const otp = (0, generate_1.generateRandomNumber)(otpDigits);
    try {
        await (0, redis_repository_1.setPendingRegistration)(email, {
            email,
            passwordHash: pending.passwordHash,
            fullName: pending.fullName,
            phone: pending.phone,
        }, otpTtlSeconds);
        await (0, redis_repository_1.setRegisterOtp)(email, otp, otpTtlSeconds);
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
            to: email,
            otp,
            expiresInSeconds: otpTtlSeconds,
        });
    }
    catch (e) {
        await (0, redis_repository_1.deleteRegisterOtp)(email);
        const m = typeof e?.message === "string" ? e.message : String(e);
        return {
            kind: "email_failed",
            message: "Failed to send OTP email",
            details: m,
        };
    }
    return {
        kind: "ok",
        email,
        ...(payload.isProd ? {} : { otp }),
        expiresInSeconds: otpTtlSeconds,
    };
};
exports.resendRegisterOtp = resendRegisterOtp;
