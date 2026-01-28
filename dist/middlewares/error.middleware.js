"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    const isProd = process.env.NODE_ENV === "production";
    const statusCode = typeof err?.statusCode === "number"
        ? err.statusCode
        : typeof err?.status === "number"
            ? err.status
            : 500;
    const message = typeof err?.message === "string" && err.message
        ? err.message
        : "Internal Server Error";
    return res.status(statusCode).json({
        message,
        ...(isProd
            ? {}
            : {
                details: typeof err?.stack === "string"
                    ? err.stack
                    : typeof err === "string"
                        ? err
                        : JSON.stringify(err),
            }),
    });
};
exports.errorHandler = errorHandler;
