"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtp = exports.requestOtp = void 0;
const redis_repository_1 = require("../../repositories/auth/redis.repository");
const user_repository_1 = require("../../repositories/auth/user.repository");
const otp_validator_1 = require("../../validators/auth/otp.validator");
const generate_1 = require("../../../../helpers/generate");
const getOtpConfig = () => {
    const ttlSecondsRaw = process.env.OTP_TTL_SECONDS;
    const ttlSeconds = ttlSecondsRaw ? Number(ttlSecondsRaw) : 300;
    const otpTtlSeconds = Number.isFinite(ttlSeconds) && ttlSeconds > 0 ? ttlSeconds : 300;
    const otpLengthRaw = process.env.OTP_LENGTH;
    const otpLength = otpLengthRaw ? Number(otpLengthRaw) : 6;
    const otpDigits = Number.isFinite(otpLength) && otpLength > 0 ? otpLength : 6;
    return { otpTtlSeconds, otpDigits };
};
const requestOtp = async (payload) => {
    const validated = (0, otp_validator_1.validateRequestOtpInput)(payload);
    if (validated.kind === "unauthorized")
        return validated;
    const { otpTtlSeconds, otpDigits } = getOtpConfig();
    const otp = (0, generate_1.generateRandomNumber)(otpDigits);
    try {
        await (0, redis_repository_1.setOtp)(String(validated.userId), otp, otpTtlSeconds);
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
    return { kind: "ok", otp, expiresInSeconds: otpTtlSeconds };
};
exports.requestOtp = requestOtp;
const verifyOtp = async (payload) => {
    const validated = (0, otp_validator_1.validateVerifyOtpInput)(payload);
    if (validated.kind !== "ok")
        return validated;
    let storedOtp;
    try {
        storedOtp = await (0, redis_repository_1.getOtp)(String(validated.userId));
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
        return {
            kind: "validation_error",
            message: "Invalid or expired otp",
        };
    }
    try {
        await (0, redis_repository_1.deleteOtp)(String(validated.userId));
    }
    catch {
        // ignore
    }
    const user = await (0, user_repository_1.findActiveUserById)(String(validated.userId));
    if (!user) {
        return { kind: "unauthorized", message: "User not found" };
    }
    user.emailVerified = true;
    await (0, user_repository_1.saveUser)(user);
    return { kind: "ok" };
};
exports.verifyOtp = verifyOtp;
