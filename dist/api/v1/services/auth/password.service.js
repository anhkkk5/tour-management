"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyResetPasswordOtp = exports.resetPassword = exports.requestResetPasswordOtp = void 0;
const generate_1 = require("../../../../helpers/generate");
const email_client_1 = require("../../../../utils/email.client");
const redis_repository_1 = require("../../repositories/auth/redis.repository");
const user_repository_1 = require("../../repositories/auth/user.repository");
const password_validator_1 = require("../../validators/auth/password.validator");
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
const requestResetPasswordOtp = async (payload) => {
    const validated = (0, password_validator_1.validateForgotPasswordRequestOtpInput)(payload);
    if (validated.kind === "validation_error")
        return validated;
    const user = await (0, user_repository_1.findActiveUserByEmail)(validated.email);
    if (!user) {
        return { kind: "not_found", message: "Email not found" };
    }
    const { otpTtlSeconds, otpDigits } = getOtpConfig();
    const otp = (0, generate_1.generateRandomNumber)(otpDigits);
    try {
        await (0, redis_repository_1.setResetPasswordOtp)(validated.email, otp, otpTtlSeconds);
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
        await (0, email_client_1.sendResetPasswordOtpEmail)({
            to: validated.email,
            otp,
            expiresInSeconds: otpTtlSeconds,
        });
    }
    catch (e) {
        await (0, redis_repository_1.deleteResetPasswordOtp)(validated.email);
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
exports.requestResetPasswordOtp = requestResetPasswordOtp;
const resetPassword = async (payload) => {
    const validated = (0, password_validator_1.validateResetPasswordInput)(payload);
    if (validated.kind === "validation_error")
        return validated;
    let email;
    try {
        email = await (0, redis_repository_1.getResetPasswordEmailByToken)(validated.resetToken);
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
    if (!email) {
        return {
            kind: "invalid_token",
            message: "Invalid or expired reset token",
        };
    }
    const user = await (0, user_repository_1.findActiveUserByEmail)(email);
    if (!user) {
        return { kind: "not_found", message: "Email not found" };
    }
    const saltRounds = process.env.BCRYPT_SALT_ROUNDS
        ? Number(process.env.BCRYPT_SALT_ROUNDS)
        : 10;
    const passwordHash = await bcrypt.hash(validated.newPassword, saltRounds);
    user.passwordHash = passwordHash;
    try {
        await (0, user_repository_1.saveUser)(user);
    }
    catch (e) {
        const m = typeof e?.message === "string" ? e.message : String(e);
        return {
            kind: "internal_error",
            message: "Internal Server Error",
            details: m,
        };
    }
    try {
        await (0, redis_repository_1.deleteResetPasswordOtp)(email);
    }
    catch {
        // ignore
    }
    try {
        await (0, redis_repository_1.deleteResetPasswordToken)(validated.resetToken);
    }
    catch {
        // ignore
    }
    try {
        await (0, redis_repository_1.deleteUserRefreshToken)(String(user._id));
    }
    catch {
        // ignore
    }
    return { kind: "ok" };
};
exports.resetPassword = resetPassword;
const verifyResetPasswordOtp = async (payload) => {
    const validated = (0, password_validator_1.validateVerifyResetPasswordOtpInput)(payload);
    if (validated.kind === "validation_error")
        return validated;
    let storedOtp;
    try {
        storedOtp = await (0, redis_repository_1.getResetPasswordOtp)(validated.email);
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
    if (!storedOtp || storedOtp !== validated.otp) {
        return { kind: "invalid_otp", message: "Invalid or expired otp" };
    }
    const user = await (0, user_repository_1.findActiveUserByEmail)(validated.email);
    if (!user) {
        return { kind: "not_found", message: "Email not found" };
    }
    const resetToken = (0, generate_1.generateRandomString)(64);
    const ttlSecondsRaw = process.env.RESET_PASSWORD_TOKEN_TTL_SECONDS;
    const ttlSeconds = ttlSecondsRaw ? Number(ttlSecondsRaw) : 300;
    const tokenTtlSeconds = Number.isFinite(ttlSeconds) && ttlSeconds > 0 ? ttlSeconds : 300;
    try {
        await (0, redis_repository_1.setResetPasswordToken)(validated.email, resetToken, tokenTtlSeconds);
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
    return {
        kind: "ok",
        resetToken,
        expiresInSeconds: tokenTtlSeconds,
    };
};
exports.verifyResetPasswordOtp = verifyResetPasswordOtp;
