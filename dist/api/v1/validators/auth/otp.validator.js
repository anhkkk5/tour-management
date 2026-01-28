"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateVerifyOtpInput = exports.validateRequestOtpInput = void 0;
const validateRequestOtpInput = (payload) => {
    if (!payload.userId) {
        return { kind: "unauthorized", message: "Unauthorized" };
    }
    return { kind: "ok", userId: payload.userId };
};
exports.validateRequestOtpInput = validateRequestOtpInput;
const validateVerifyOtpInput = (payload) => {
    if (!payload.userId) {
        return { kind: "unauthorized", message: "Unauthorized" };
    }
    if (!payload.otp) {
        return { kind: "validation_error", message: "Missing otp" };
    }
    return { kind: "ok", userId: payload.userId, otp: payload.otp };
};
exports.validateVerifyOtpInput = validateVerifyOtpInput;
