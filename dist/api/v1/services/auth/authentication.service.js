"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refresh = exports.login = void 0;
const generate_1 = require("../../../../helpers/generate");
const jwt_util_1 = require("../../../../utils/jwt.util");
const redis_repository_1 = require("../../repositories/auth/redis.repository");
const user_repository_1 = require("../../repositories/auth/user.repository");
const authentication_validator_1 = require("../../validators/auth/authentication.validator");
const token_service_1 = require("./token.service");
const bcrypt = require("bcrypt");
const login = async (payload) => {
    const validated = (0, authentication_validator_1.validateLoginInput)(payload);
    if (validated.kind === "validation_error")
        return validated;
    const user = await (0, user_repository_1.findActiveUserByEmailWithPasswordHash)(validated.email);
    if (!user) {
        return { kind: "unauthorized", message: "Invalid credentials" };
    }
    if (user.status === "blocked") {
        return { kind: "forbidden", message: "User is blocked" };
    }
    const ok = await bcrypt.compare(validated.password, user.passwordHash);
    if (!ok) {
        return { kind: "unauthorized", message: "Invalid credentials" };
    }
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
            message: "Redis unavailable",
            details: m,
        };
    }
    user.lastLoginAt = new Date();
    try {
        await (0, user_repository_1.saveUser)(user);
    }
    catch (e) {
        await (0, redis_repository_1.deleteRefreshToken)(refreshToken);
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
    const validated = (0, authentication_validator_1.validateRefreshInput)({
        refreshToken: payload.refreshToken,
    });
    if (validated.kind === "missing_refresh")
        return validated;
    let data;
    try {
        data = await (0, redis_repository_1.getRefreshToken)(validated.refreshToken);
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
    const user = await (0, user_repository_1.findActiveUserById)(data.userId);
    if (!user) {
        return { kind: "invalid_refresh", message: "User not found" };
    }
    if (user.status === "blocked") {
        return { kind: "forbidden", message: "User is blocked" };
    }
    const newRefreshToken = (0, generate_1.generateRandomString)(64);
    try {
        await (0, redis_repository_1.setRefreshToken)(newRefreshToken, {
            userId: String(user._id),
            userAgent: payload.userAgent,
            ip: payload.ip,
        }, (0, token_service_1.getRefreshTtlSeconds)());
        await (0, redis_repository_1.deleteRefreshToken)(validated.refreshToken);
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
            await (0, redis_repository_1.deleteRefreshToken)(token);
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
