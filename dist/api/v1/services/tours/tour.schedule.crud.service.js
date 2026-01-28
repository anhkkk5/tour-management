"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreTourScheduleById = exports.softDeleteTourScheduleById = exports.updateTourScheduleById = exports.createTourSchedule = exports.getTourScheduleById = exports.listTourSchedulesByTourId = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const tourSchedule_model_1 = require("../../models/tourSchedule/tourSchedule.model");
const mongo_util_1 = require("../../../../utils/mongo.util");
const toDateMaybe = (v) => {
    if (v === undefined || v === null)
        return null;
    if (v instanceof Date)
        return isNaN(v.getTime()) ? null : v;
    if (typeof v === "string" || typeof v === "number") {
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d;
    }
    return null;
};
const toNumberMaybe = (v) => {
    if (v === undefined || v === null)
        return null;
    if (typeof v === "number" && Number.isFinite(v))
        return v;
    if (typeof v === "string" && v.trim() !== "") {
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
    }
    return null;
};
const listTourSchedulesByTourId = async (tourId) => {
    const tourObjectId = (0, mongo_util_1.toObjectIdMaybe)(tourId);
    if (!tourObjectId) {
        return { kind: "invalid_id" };
    }
    const schedules = await tourSchedule_model_1.TourSchedule.find({
        tourId: tourObjectId,
        deleted: false,
    }).lean();
    return { kind: "ok", schedules };
};
exports.listTourSchedulesByTourId = listTourSchedulesByTourId;
const getTourScheduleById = async (id) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        return { kind: "invalid_id" };
    }
    const schedule = await tourSchedule_model_1.TourSchedule.findById(id).lean();
    if (!schedule) {
        return { kind: "not_found" };
    }
    return { kind: "ok", schedule };
};
exports.getTourScheduleById = getTourScheduleById;
const createTourSchedule = async (tourId, payload) => {
    const tourObjectId = (0, mongo_util_1.toObjectIdMaybe)(tourId);
    if (!tourObjectId) {
        return { kind: "invalid_id" };
    }
    const startDate = toDateMaybe(payload?.startDate);
    if (!startDate) {
        return { kind: "validation_error", message: "Missing startDate" };
    }
    const endDate = toDateMaybe(payload?.endDate);
    if (!endDate) {
        return { kind: "validation_error", message: "Missing endDate" };
    }
    const capacity = toNumberMaybe(payload?.capacity);
    if (capacity === null) {
        return { kind: "validation_error", message: "Missing capacity" };
    }
    const prices = payload?.prices;
    const adultPrice = toNumberMaybe(prices?.adult);
    if (adultPrice === null) {
        return {
            kind: "validation_error",
            message: "Missing prices.adult",
        };
    }
    const schedule = new tourSchedule_model_1.TourSchedule({
        tourId: tourObjectId,
        startDate,
        endDate,
        capacity,
        bookedSeats: toNumberMaybe(payload?.bookedSeats) ?? 0,
        prices: {
            adult: adultPrice,
            child: toNumberMaybe(prices?.child) ?? undefined,
            infant: toNumberMaybe(prices?.infant) ?? undefined,
        },
        bookingDeadline: toDateMaybe(payload?.bookingDeadline) ?? undefined,
        notes: typeof payload?.notes === "string" ? payload.notes : undefined,
        status: payload?.status === "open" ||
            payload?.status === "closed" ||
            payload?.status === "full" ||
            payload?.status === "cancelled"
            ? payload.status
            : "open",
        deleted: false,
    });
    try {
        const data = await schedule.save();
        return { kind: "ok", schedule: data };
    }
    catch (error) {
        return { kind: "validation_error", message: error.message };
    }
};
exports.createTourSchedule = createTourSchedule;
const updateTourScheduleById = async (id, payload) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        return { kind: "invalid_id" };
    }
    const schedule = await tourSchedule_model_1.TourSchedule.findById(id);
    if (!schedule) {
        return { kind: "not_found" };
    }
    // Helper to validate and assign date
    const updateDate = (field, value, targetField) => {
        if (value !== undefined) {
            const d = toDateMaybe(value);
            if (!d)
                return `Invalid ${field}`;
            schedule[targetField] = d;
        }
        return null;
    };
    // Helper to validate and assign number
    const updateNumber = (field, value, targetField) => {
        if (value !== undefined) {
            const n = toNumberMaybe(value);
            if (n === null)
                return `Invalid ${field}`;
            schedule[targetField] = n;
        }
        return null;
    };
    const errors = [
        updateDate("startDate", payload.startDate, "startDate"),
        updateDate("endDate", payload.endDate, "endDate"),
        updateNumber("capacity", payload.capacity, "capacity"),
        updateNumber("bookedSeats", payload.bookedSeats, "bookedSeats"),
    ].filter(Boolean);
    if (errors.length > 0) {
        return { kind: "validation_error", message: errors[0] };
    }
    if (payload.prices !== undefined) {
        const prices = payload.prices;
        if (prices === null || typeof prices !== "object") {
            return { kind: "validation_error", message: "Invalid prices" };
        }
        const adultPrice = toNumberMaybe(prices?.adult);
        if (adultPrice === null) {
            return {
                kind: "validation_error",
                message: "Missing prices.adult",
            };
        }
        schedule.prices = {
            adult: adultPrice,
            child: toNumberMaybe(prices?.child) ?? undefined,
            infant: toNumberMaybe(prices?.infant) ?? undefined,
        };
    }
    if (payload.bookingDeadline !== undefined) {
        const d = toDateMaybe(payload.bookingDeadline);
        if (payload.bookingDeadline !== null && !d) {
            return {
                kind: "validation_error",
                message: "Invalid bookingDeadline",
            };
        }
        schedule.bookingDeadline = d ?? undefined;
    }
    if (payload.notes !== undefined) {
        schedule.notes =
            typeof payload.notes === "string" ? payload.notes : undefined;
    }
    if (payload.status !== undefined) {
        const validStatuses = ["open", "closed", "full", "cancelled"];
        if (typeof payload.status !== "string" ||
            !validStatuses.includes(payload.status)) {
            return { kind: "validation_error", message: "Invalid status" };
        }
        schedule.status = payload.status;
    }
    const data = await schedule.save();
    return { kind: "ok", schedule: data };
};
exports.updateTourScheduleById = updateTourScheduleById;
const softDeleteTourScheduleById = async (id) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        return { kind: "invalid_id" };
    }
    const schedule = await tourSchedule_model_1.TourSchedule.findById(id);
    if (!schedule) {
        return { kind: "not_found" };
    }
    schedule.deleted = true;
    const data = await schedule.save();
    return { kind: "ok", schedule: data };
};
exports.softDeleteTourScheduleById = softDeleteTourScheduleById;
const restoreTourScheduleById = async (id) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        return { kind: "invalid_id" };
    }
    const schedule = await tourSchedule_model_1.TourSchedule.findById(id);
    if (!schedule) {
        return { kind: "not_found" };
    }
    schedule.deleted = false;
    const data = await schedule.save();
    return { kind: "ok", schedule: data };
};
exports.restoreTourScheduleById = restoreTourScheduleById;
