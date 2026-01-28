"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveUser = exports.findActiveUserById = exports.findActiveUserByEmailWithPasswordHash = exports.findActiveUserByEmail = exports.findUserByEmail = void 0;
const user_model_1 = __importDefault(require("../../models/user/user.model"));
const findUserByEmail = async (email) => {
    return await user_model_1.default.findOne({ email: email.toLowerCase().trim() });
};
exports.findUserByEmail = findUserByEmail;
const findActiveUserByEmail = async (email) => {
    return await user_model_1.default.findOne({
        email: email.toLowerCase().trim(),
        deleted: false,
    });
};
exports.findActiveUserByEmail = findActiveUserByEmail;
const findActiveUserByEmailWithPasswordHash = async (email) => {
    return await user_model_1.default.findOne({
        email: email.toLowerCase().trim(),
        deleted: false,
    }).select("+passwordHash");
};
exports.findActiveUserByEmailWithPasswordHash = findActiveUserByEmailWithPasswordHash;
const findActiveUserById = async (userId) => {
    return await user_model_1.default.findOne({ _id: userId, deleted: false });
};
exports.findActiveUserById = findActiveUserById;
const saveUser = async (user) => {
    return await user.save();
};
exports.saveUser = saveUser;
