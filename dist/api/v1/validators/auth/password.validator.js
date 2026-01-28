"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateResetPasswordInput = exports.validateVerifyResetPasswordOtpInput = exports.validateForgotPasswordRequestOtpInput = void 0;
const validateForgotPasswordRequestOtpInput = (payload) => {
    if (!payload.email) {
        return { kind: "validation_error", message: "Missing email" };
    }
    return { kind: "ok", email: payload.email.toLowerCase().trim() };
};
exports.validateForgotPasswordRequestOtpInput = validateForgotPasswordRequestOtpInput;
const validateVerifyResetPasswordOtpInput = (payload) => {
    if (!payload.email || !payload.otp) {
        return {
            kind: "validation_error",
            message: "Missing email or otp",
        };
    }
    return {
        kind: "ok",
        email: payload.email.toLowerCase().trim(),
        otp: payload.otp,
    };
};
exports.validateVerifyResetPasswordOtpInput = validateVerifyResetPasswordOtpInput;
const validateResetPasswordInput = (payload) => {
    if (!payload.resetToken || !payload.newPassword) {
        return {
            kind: "validation_error",
            message: "Missing resetToken or newPassword",
        };
    }
    return {
        kind: "ok",
        resetToken: payload.resetToken,
        newPassword: payload.newPassword,
    };
};
exports.validateResetPasswordInput = validateResetPasswordInput;
