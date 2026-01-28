"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const user_model_1 = __importDefault(require("../api/v1/models/user/user.model"));
const jwt_util_1 = require("../utils/jwt.util");
const requireAuth = async (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Missing Authorization header" });
        }
        const token = header.slice("Bearer ".length).trim();
        const payload = (0, jwt_util_1.verifyAccessToken)(token);
        const user = await user_model_1.default.findOne({ _id: payload.userId, deleted: false });
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        if (user.status === "blocked") {
            return res.status(403).json({ message: "User is blocked" });
        }
        req.user = user;
        return next();
    }
    catch {
        return res.status(401).json({ message: "Invalid access token" });
    }
};
exports.requireAuth = requireAuth;
