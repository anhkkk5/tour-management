"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientIp = exports.getRefreshCookieOptions = exports.getRefreshTtlSeconds = void 0;
const getRefreshTtlSeconds = () => {
    const raw = process.env.REFRESH_TOKEN_TTL_SECONDS;
    if (!raw)
        return 7 * 24 * 60 * 60;
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0)
        return 7 * 24 * 60 * 60;
    return n;
};
exports.getRefreshTtlSeconds = getRefreshTtlSeconds;
const getRefreshCookieOptions = () => {
    const isProd = process.env.NODE_ENV === "production";
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: (0, exports.getRefreshTtlSeconds)() * 1000,
    };
};
exports.getRefreshCookieOptions = getRefreshCookieOptions;
const getClientIp = (req) => {
    const xf = req.headers["x-forwarded-for"];
    if (typeof xf === "string")
        return xf.split(",")[0].trim();
    return req.ip;
};
exports.getClientIp = getClientIp;
