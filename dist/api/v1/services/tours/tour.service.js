"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTourById = exports.getTourDetailBySlug = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const tour_model_1 = __importDefault(require("../../models/tour/tour.model"));
const tour_relation_service_1 = require("./tour.relation.service");
const tour_schedule_service_1 = require("./tour.schedule.service");
const tour_policy_service_1 = require("./tour.policy.service");
const mongo_util_1 = require("../../../../utils/mongo.util");
const uploadToCloudinary_1 = require("../../../../helpers/uploadToCloudinary");
// [Get] api/v1/tours/:slugTour
const getTourDetailBySlug = async (slug) => {
    const tour = await tour_model_1.default.findOne({ deleted: false, slug });
    if (!tour) {
        return { kind: "not_found" };
    }
    const tourObj = tour.toObject();
    const [relations, schedules, policy] = await Promise.all([
        (0, tour_relation_service_1.loadTourRelations)(tourObj),
        (0, tour_schedule_service_1.getTourSchedules)(tourObj),
        (0, tour_policy_service_1.getTourPolicy)(tourObj),
    ]);
    return {
        kind: "ok",
        tour: tourObj,
        ...relations,
        schedules,
        policy,
    };
};
exports.getTourDetailBySlug = getTourDetailBySlug;
// [Patch] api/v1/tours/edit/:id
const updateTourById = async (id, payload) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        return { kind: "invalid_id" };
    }
    const tour = await tour_model_1.default.findOne({ _id: id, deleted: false });
    if (!tour) {
        return { kind: "not_found" };
    }
    // Validate title if provided but empty
    if (payload.title !== undefined && !payload.title) {
        return { kind: "validation_error", message: "Missing title" };
    }
    if (payload.thumbnailPublicId !== undefined &&
        payload.thumbnailPublicId &&
        tour.thumbnailPublicId &&
        payload.thumbnailPublicId !== tour.thumbnailPublicId) {
        await (0, uploadToCloudinary_1.deleteFromCloudinary)(tour.thumbnailPublicId);
    }
    // Simple fields mapping
    const simpleFields = [
        "title",
        "thumbnail",
        "thumbnailPublicId",
        "images",
        "imagesPublicIds",
        "description",
        "durationDays",
        "startSchedule",
        "price",
        "availableSeats",
        "transportation",
        "itinerary",
        "notes",
        "status",
    ];
    simpleFields.forEach((field) => {
        if (payload[field] !== undefined) {
            tour[field] = payload[field];
        }
    });
    // Handle specific fields
    if (payload.departureId !== undefined) {
        if (payload.departureId === null) {
            tour.departureId = null;
        }
        else {
            const depId = (0, mongo_util_1.toObjectIdMaybe)(payload.departureId);
            if (!depId) {
                return {
                    kind: "validation_error",
                    message: "Invalid departureId",
                };
            }
            tour.departureId = depId;
        }
    }
    if (payload.destinationIds !== undefined) {
        if (Array.isArray(payload.destinationIds)) {
            const mapped = payload.destinationIds.map(mongo_util_1.toObjectIdMaybe);
            const hasInvalid = mapped.some((id) => id === null);
            if (hasInvalid) {
                return {
                    kind: "validation_error",
                    message: "Invalid destinationIds",
                };
            }
            tour.destinationIds = mapped;
        }
        else if (payload.destinationIds === null) {
            tour.destinationIds = [];
        }
        else {
            return {
                kind: "validation_error",
                message: "destinationIds must be an array",
            };
        }
    }
    if (payload.policyId !== undefined) {
        if (payload.policyId === null) {
            tour.policyId = null;
        }
        else {
            const pId = (0, mongo_util_1.toObjectIdMaybe)(payload.policyId);
            if (!pId) {
                return {
                    kind: "validation_error",
                    message: "Invalid policyId",
                };
            }
            tour.policyId = pId;
        }
    }
    try {
        const data = await tour.save();
        return { kind: "ok", tour: data };
    }
    catch (error) {
        if (error?.code === 11000) {
            return { kind: "duplicate_slug" };
        }
        throw error;
    }
};
exports.updateTourById = updateTourById;
