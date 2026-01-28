"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomString = void 0;
const crypto_1 = __importDefault(require("crypto"));
const generateRandomString = (length = 64) => {
    const bytes = crypto_1.default.randomBytes(Math.ceil(length / 2));
    return bytes.toString("hex").slice(0, length);
};
exports.generateRandomString = generateRandomString;
