"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTourSchedules = void 0;
const tourSchedule_model_1 = require("../../models/tourSchedule/tourSchedule.model");
const mongo_util_1 = require("../../../../utils/mongo.util");
const getTourSchedules = async (tourObj) => {
    const tourId = (0, mongo_util_1.toObjectIdMaybe)(tourObj._id);
    const tourIdStr = tourObj._id?.toString();
    let schedules = [];
    if (tourId) {
        schedules = await tourSchedule_model_1.TourSchedule.find({ tourId, deleted: false }).lean();
    }
    if (!schedules.length && tourIdStr) {
        schedules = await tourSchedule_model_1.TourSchedule.collection
            .find({ tourId: tourIdStr, deleted: false })
            .toArray();
    }
    if (!schedules.length &&
        (tourObj.price != null || tourObj.availableSeats != null)) {
        schedules = [
            {
                tourId: tourObj._id,
                startDate: null,
                endDate: null,
                prices: tourObj.price != null ? { adult: tourObj.price } : null,
                capacity: null,
                bookedSeats: null,
                availableSeats: tourObj.availableSeats ?? null,
                status: "open",
            },
        ];
    }
    return schedules;
};
exports.getTourSchedules = getTourSchedules;
