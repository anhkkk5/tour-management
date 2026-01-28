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
exports.verifyAccessToken = exports.signAccessToken = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const getAccessTokenSecret = () => {
    const secret = process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("Missing JWT_ACCESS_SECRET (or JWT_SECRET)");
    }
    return secret;
};
const signAccessToken = (payload) => {
    const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN ??
        "15m");
    return jwt.sign(payload, getAccessTokenSecret(), { expiresIn });
};
exports.signAccessToken = signAccessToken;
const verifyAccessToken = (token) => {
    const decoded = jwt.verify(token, getAccessTokenSecret());
    if (typeof decoded !== "object" || decoded === null) {
        throw new Error("Invalid token payload");
    }
    const payload = decoded;
    if (!payload.userId || !payload.role) {
        throw new Error("Invalid token payload");
    }
    return { userId: String(payload.userId), role: payload.role };
};
exports.verifyAccessToken = verifyAccessToken;
