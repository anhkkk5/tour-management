"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.getParamString = void 0;
const getParamString = (req, key) => {
    const raw = req.params?.[key];
    if (Array.isArray(raw))
        return raw[0];
    return raw ?? null;
};
exports.getParamString = getParamString;
const sendError = (res, status, message) => {
    return res.status(status).json({ message });
};
exports.sendError = sendError;
