"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detail = void 0;
const detail = async (req, res) => {
    return res.json({
        code: 200,
        message: "Lấy thông tin người dùng thành công",
        info: req.user,
    });
};
exports.detail = detail;
