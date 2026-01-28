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
exports.restoreSchedule = exports.deleteSchedule = exports.updateSchedule = exports.createSchedule = exports.getSchedule = exports.listSchedulesByTour = void 0;
const utility_functions_1 = require("../../../../helpers/utility_functions");
const scheduleService = __importStar(require("../../services/tours/tour.schedule.crud.service"));
const listSchedulesByTour = async (req, res) => {
    try {
        const tourId = (0, utility_functions_1.getParamString)(req, "tourId");
        if (!tourId) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing tourId param");
        }
        const result = await scheduleService.listTourSchedulesByTourId(tourId);
        if (result.kind === "invalid_id") {
            return (0, utility_functions_1.sendError)(res, 400, "Invalid tourId");
        }
        return res.json({
            code: 200,
            data: result.schedules,
        });
    }
    catch (error) {
        console.error("List Schedules Error:", error);
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi lấy danh sách tour schedule!");
    }
};
exports.listSchedulesByTour = listSchedulesByTour;
const getSchedule = async (req, res) => {
    try {
        const id = (0, utility_functions_1.getParamString)(req, "id");
        if (!id) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing id param");
        }
        const result = await scheduleService.getTourScheduleById(id);
        if (result.kind === "invalid_id") {
            return (0, utility_functions_1.sendError)(res, 400, "Invalid id");
        }
        if (result.kind === "not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Tour schedule not found");
        }
        return res.json({
            code: 200,
            data: result.schedule,
        });
    }
    catch (error) {
        console.error("Get Schedule Error:", error);
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi lấy thông tin tour schedule!");
    }
};
exports.getSchedule = getSchedule;
const createSchedule = async (req, res) => {
    try {
        const tourId = (0, utility_functions_1.getParamString)(req, "tourId");
        if (!tourId) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing tourId param");
        }
        const result = await scheduleService.createTourSchedule(tourId, {
            startDate: req.body?.startDate,
            endDate: req.body?.endDate,
            capacity: req.body?.capacity,
            bookedSeats: req.body?.bookedSeats,
            prices: req.body?.prices,
            bookingDeadline: req.body?.bookingDeadline,
            notes: req.body?.notes,
            status: req.body?.status,
        });
        if (result.kind === "invalid_id") {
            return (0, utility_functions_1.sendError)(res, 400, "Invalid tourId");
        }
        if (result.kind === "validation_error") {
            return (0, utility_functions_1.sendError)(res, 400, result.message);
        }
        return res.json({
            code: 200,
            message: "Tạo tour schedule thành công",
            data: result.schedule,
        });
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi tạo tour schedule!");
    }
    catch (error) {
        console.error("Create Schedule Error:", error);
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi tạo tour schedule!");
    }
};
exports.createSchedule = createSchedule;
const updateSchedule = async (req, res) => {
    try {
        const id = (0, utility_functions_1.getParamString)(req, "id");
        if (!id) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing id param");
        }
        const result = await scheduleService.updateTourScheduleById(id, {
            startDate: req.body?.startDate,
            endDate: req.body?.endDate,
            capacity: req.body?.capacity,
            bookedSeats: req.body?.bookedSeats,
            prices: req.body?.prices,
            bookingDeadline: req.body?.bookingDeadline,
            notes: req.body?.notes,
            status: req.body?.status,
        });
        if (result.kind === "invalid_id") {
            return (0, utility_functions_1.sendError)(res, 400, "Invalid id");
        }
        if (result.kind === "not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Tour schedule not found");
        }
        if (result.kind === "validation_error") {
            return (0, utility_functions_1.sendError)(res, 400, result.message);
        }
        return res.json({
            code: 200,
            message: "Cập nhật tour schedule thành công",
            data: result.schedule,
        });
    }
    catch (error) {
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi cập nhật tour schedule!");
    }
};
exports.updateSchedule = updateSchedule;
const deleteSchedule = async (req, res) => {
    try {
        const id = (0, utility_functions_1.getParamString)(req, "id");
        if (!id) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing id param");
        }
        const result = await scheduleService.softDeleteTourScheduleById(id);
        if (result.kind === "invalid_id") {
            return (0, utility_functions_1.sendError)(res, 400, "Invalid id");
        }
        if (result.kind === "not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Tour schedule not found");
        }
        return res.json({
            code: 200,
            message: "Xóa tour schedule thành công",
            data: result.schedule,
        });
    }
    catch (error) {
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi xóa tour schedule!");
    }
};
exports.deleteSchedule = deleteSchedule;
const restoreSchedule = async (req, res) => {
    try {
        const id = (0, utility_functions_1.getParamString)(req, "id");
        if (!id) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing id param");
        }
        const result = await scheduleService.restoreTourScheduleById(id);
        if (result.kind === "invalid_id") {
            return (0, utility_functions_1.sendError)(res, 400, "Invalid id");
        }
        if (result.kind === "not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Tour schedule not found");
        }
        return res.json({
            code: 200,
            message: "Khôi phục tour schedule thành công",
            data: result.schedule,
        });
    }
    catch (error) {
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi khôi phục tour schedule!");
    }
};
exports.restoreSchedule = restoreSchedule;
