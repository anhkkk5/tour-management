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
exports.logout = exports.refresh = exports.login = void 0;
const authenticationService = __importStar(require("../../services/auth/authentication.service"));
const auth_http_1 = require("../../../../utils/auth.http");
const login = async (req, res) => {
    const isProd = process.env.NODE_ENV === "production";
    const result = await authenticationService.login({
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
    const result = await authenticationService.refresh({
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
    const result = await authenticationService.logout({ refreshToken: token });
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
