"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.verifyResetPasswordOtp = exports.requestResetPasswordOtp = void 0;
const passwordService = __importStar(require("../../services/auth/password.service"));
const requestResetPasswordOtp = async (req, res) => {
    const isProd = process.env.NODE_ENV === "production";
    const result = await passwordService.requestResetPasswordOtp({
        email: req.body?.email,
        isProd,
    });
    if (result.kind === "validation_error") {
        return res.status(400).json({ message: result.message });
    }
    if (result.kind === "not_found") {
        return res.status(404).json({ message: result.message });
    }
    if (result.kind === "redis_error") {
        return res.status(503).json({
            message: result.message,
            ...(isProd ? {} : { details: result.details }),
        });
    }
    if (result.kind === "email_failed") {
        return res.status(502).json({
            message: result.message,
            ...(isProd ? {} : { details: result.details }),
        });
    }
    return res.json({
        code: 200,
        message: "OTP sent",
        email: result.email,
        ...(isProd ? {} : { otp: result.otp }),
        expiresInSeconds: result.expiresInSeconds,
    });
};
exports.requestResetPasswordOtp = requestResetPasswordOtp;
const verifyResetPasswordOtp = async (req, res) => {
    const isProd = process.env.NODE_ENV === "production";
    const result = await passwordService.verifyResetPasswordOtp({
        email: req.body?.email,
        otp: req.body?.otp,
    });
    if (result.kind === "validation_error") {
        return res.status(400).json({ message: result.message });
    }
    if (result.kind === "invalid_otp") {
        return res.status(400).json({ message: result.message });
    }
    if (result.kind === "not_found") {
        return res.status(404).json({ message: result.message });
    }
    if (result.kind === "redis_error") {
        return res.status(503).json({
            message: result.message,
            ...(isProd ? {} : { details: result.details }),
        });
    }
    return res.json({
        code: 200,
        message: "Verify OTP success",
        resetToken: result.resetToken,
        expiresInSeconds: result.expiresInSeconds,
    });
};
exports.verifyResetPasswordOtp = verifyResetPasswordOtp;
const resetPassword = async (req, res) => {
    const isProd = process.env.NODE_ENV === "production";
    const result = await passwordService.resetPassword({
        resetToken: req.body?.resetToken,
        newPassword: req.body?.newPassword,
    });
    if (result.kind === "validation_error") {
        return res.status(400).json({ message: result.message });
    }
    if (result.kind === "invalid_token") {
        return res.status(400).json({ message: result.message });
    }
    if (result.kind === "not_found") {
        return res.status(404).json({ message: result.message });
    }
    if (result.kind === "redis_error") {
        return res.status(503).json({
            message: result.message,
            ...(isProd ? {} : { details: result.details }),
        });
    }
    if (result.kind === "internal_error") {
        return res.status(500).json({
            message: result.message,
            ...(isProd ? {} : { details: result.details }),
        });
    }
    return res.json({ code: 200, message: "Reset password success" });
};
exports.resetPassword = resetPassword;
