"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateVerifyRegisterOtpInput = exports.validateRegisterRequestOtpInput = void 0;
const validateRegisterRequestOtpInput = (payload) => {
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
        fullName: payload.fullName,
        phone: payload.phone,
    };
};
exports.validateRegisterRequestOtpInput = validateRegisterRequestOtpInput;
const validateVerifyRegisterOtpInput = (payload) => {
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
exports.validateVerifyRegisterOtpInput = validateVerifyRegisterOtpInput;
