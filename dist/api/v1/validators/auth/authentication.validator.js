"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRefreshInput = exports.validateLoginInput = void 0;
const validateLoginInput = (payload) => {
    if (!payload.email || !payload.password) {
        return {
            kind: "validation_error",
            message: "Missing email or password",
        };
    }
    return {
        kind: "ok",
        email: payload.email.toLowerCase().trim(),
        password: payload.password,
    };
};
exports.validateLoginInput = validateLoginInput;
const validateRefreshInput = (payload) => {
    if (!payload.refreshToken) {
        return {
            kind: "missing_refresh",
            message: "Missing refresh token",
        };
    }
    return { kind: "ok", refreshToken: payload.refreshToken };
};
exports.validateRefreshInput = validateRefreshInput;
