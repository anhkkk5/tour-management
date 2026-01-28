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
exports.verifyOtp = exports.requestOtp = exports.logout = exports.refresh = exports.login = exports.verifyRegisterOtp = exports.register = void 0;
const authService = __importStar(require("../../services/auth/auth.service.deprecated"));
const auth_http_1 = require("../../../../utils/auth.http");
const register = async (req, res) => {
    const isProd = process.env.NODE_ENV === "production";
    const result = await authService.registerRequestOtp({
        email: req.body?.email,
        password: req.body?.password,
        fullName: req.body?.fullName,
        phone: req.body?.phone,
        isProd,
    });
    if (result.kind === "validation_error") {
        return res.status(400).json({ message: result.message });
    }
    if (result.kind === "conflict") {
        return res.status(409).json({ message: result.message });
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
exports.register = register;
const verifyRegisterOtp = async (req, res) => {
    const isProd = process.env.NODE_ENV === "production";
    const result = await authService.verifyRegisterOtp({
        email: req.body?.email,
        otp: req.body?.otp,
        userAgent: req.headers["user-agent"],
        ip: (0, auth_http_1.getClientIp)(req),
    });
    if (result.kind === "validation_error") {
        return res.status(400).json({ message: result.message });
    }
    if (result.kind === "conflict") {
        return res.status(409).json({ message: result.message });
    }
    if (result.kind === "invalid_otp") {
        return res.status(400).json({ message: result.message });
    }
    if (result.kind === "expired_registration") {
        return res.status(400).json({ message: result.message });
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
    res.cookie("refreshToken", result.refreshToken, (0, auth_http_1.getRefreshCookieOptions)());
    return res.json({
        code: 200,
        message: "Register success",
        accessToken: result.accessToken,
        user: result.user,
    });
};
exports.verifyRegisterOtp = verifyRegisterOtp;
const login = async (req, res) => {
    const isProd = process.env.NODE_ENV === "production";
    const result = await authService.login({
        email: req.body?.email,
        password: req.body?.password,
        userAgent: req.headers["user-agent"],
        ip: (0, auth_http_1.getClientIp)(req),
    });
    if (result.kind === "validation_error") {
        return res.status(400).json({ message: result.message });
    }
    if (result.kind === "unauthorized") {
        return res.status(401).json({ message: result.message });
    }
    if (result.kind === "forbidden") {
        return res.status(403).json({ message: result.message });
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
    res.cookie("refreshToken", result.refreshToken, (0, auth_http_1.getRefreshCookieOptions)());
    return res.json({
        code: 200,
        message: "Login success",
        accessToken: result.accessToken,
        user: result.user,
    });
};
exports.login = login;
const refresh = async (req, res) => {
    const isProd = process.env.NODE_ENV === "production";
    const token = req.cookies?.refreshToken;
    const result = await authService.refresh({
        refreshToken: token,
        userAgent: req.headers["user-agent"],
        ip: (0, auth_http_1.getClientIp)(req),
    });
    if (result.kind === "missing_refresh") {
        return res.status(401).json({ message: result.message });
    }
    if (result.kind === "invalid_refresh") {
        return res.status(401).json({ message: result.message });
    }
    if (result.kind === "forbidden") {
        return res.status(403).json({ message: result.message });
    }
    if (result.kind === "redis_error") {
        return res.status(503).json({
            message: result.message,
            ...(isProd ? {} : { details: result.details }),
        });
    }
    res.cookie("refreshToken", result.refreshToken, (0, auth_http_1.getRefreshCookieOptions)());
    return res.json({
        code: 200,
        message: "Refresh success",
        accessToken: result.accessToken,
    });
};
exports.refresh = refresh;
const logout = async (req, res) => {
    const isProd = process.env.NODE_ENV === "production";
    const token = req.cookies?.refreshToken;
    const result = await authService.logout({ refreshToken: token });
    res.clearCookie("refreshToken", { path: "/" });
    if (result.kind === "redis_error") {
        return res.status(503).json({
            message: result.message,
            ...(isProd ? {} : { details: result.details }),
        });
    }
    return res.json({ code: 200, message: "Logout success" });
};
exports.logout = logout;
const requestOtp = async (req, res) => {
    const isProd = process.env.NODE_ENV === "production";
    const user = req.user;
    const result = await authService.requestOtp({
        userId: user?._id ? String(user._id) : undefined,
    });
    if (result.kind === "unauthorized") {
        return res.status(401).json({ message: result.message });
    }
    if (result.kind === "redis_error") {
        return res.status(503).json({
            message: result.message,
            ...(isProd ? {} : { details: result.details }),
        });
    }
    return res.json({
        code: 200,
        message: "OTP generated",
        otp: result.otp,
        expiresInSeconds: result.expiresInSeconds,
    });
};
exports.requestOtp = requestOtp;
const verifyOtp = async (req, res) => {
    const isProd = process.env.NODE_ENV === "production";
    const user = req.user;
    const result = await authService.verifyOtp({
        userId: user?._id ? String(user._id) : undefined,
        otp: req.body?.otp,
    });
    if (result.kind === "unauthorized") {
        return res.status(401).json({ message: result.message });
    }
    if (result.kind === "validation_error") {
        return res.status(400).json({ message: result.message });
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
    });
};
exports.verifyOtp = verifyOtp;
