"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toObjectIdMaybe = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const toObjectIdMaybe = (value) => {
    if (!value)
        return null;
    if (value instanceof mongoose_1.default.Types.ObjectId)
        return value;
    if (typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value)) {
        return new mongoose_1.default.Types.ObjectId(value);
    }
    return null;
};
exports.toObjectIdMaybe = toObjectIdMaybe;
