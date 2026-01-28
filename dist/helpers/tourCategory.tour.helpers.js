"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyTourUpdatePayload = exports.findTourByIdInTopic = exports.listToursByTopicCandidates = exports.mergeById = exports.resolveTopicTourDocBySlugs = exports.resolveTopicTourBySlugs = exports.buildIdCandidates = exports.findTourCategoryBySlug = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const tourCategory_model_1 = __importDefault(require("../api/v1/models/tourCategory/tourCategory.model"));
const topicTour_model_1 = __importDefault(require("../api/v1/models/topicTour/topicTour.model"));
const tour_model_1 = __importDefault(require("../api/v1/models/tour/tour.model"));
const findTourCategoryBySlug = async (categorySlug) => {
    return tourCategory_model_1.default.findOne({
        deleted: false,
        slug: categorySlug,
    });
};
exports.findTourCategoryBySlug = findTourCategoryBySlug;
const uniqueByTypeAndString = (values) => {
    const map = new Map();
    for (const v of values) {
        if (v === undefined || v === null)
            continue;
        const key = `${typeof v}:${String(v)}`;
        if (!map.has(key))
            map.set(key, v);
    }
    return Array.from(map.values());
};
const buildIdCandidates = (id) => {
    return uniqueByTypeAndString([id, String(id)]);
};
exports.buildIdCandidates = buildIdCandidates;
const resolveTopicTourBySlugs = async (tourCategory, topicSlug) => {
    const topicTour = await topicTour_model_1.default.findOne({
        deleted: false,
        slug: topicSlug,
        tourCategoryId: tourCategory._id,
    });
    if (topicTour?._id) {
        return {
            kind: "ok",
            topicTour,
            topicTourIdCandidates: (0, exports.buildIdCandidates)(topicTour._id),
        };
    }
    const topicTourFromString = await topicTour_model_1.default.collection.findOne({
        deleted: false,
        slug: topicSlug,
        tourCategoryId: tourCategory._id.toString(),
    });
    if (!topicTourFromString?._id) {
        return { kind: "topic_not_found" };
    }
    return {
        kind: "ok",
        topicTourFromString,
        topicTourIdCandidates: (0, exports.buildIdCandidates)(topicTourFromString._id),
    };
};
exports.resolveTopicTourBySlugs = resolveTopicTourBySlugs;
const resolveTopicTourDocBySlugs = async (tourCategory, topicSlug) => {
    const resolved = await (0, exports.resolveTopicTourBySlugs)(tourCategory, topicSlug);
    if (resolved.kind !== "ok") {
        return resolved;
    }
    if (resolved.topicTour?._id) {
        return { kind: "ok", topicTour: resolved.topicTour };
    }
    const id = resolved.topicTourFromString?._id;
    if (!id) {
        return { kind: "topic_not_found" };
    }
    const topicTour = await topicTour_model_1.default.findById(id);
    if (!topicTour) {
        return { kind: "topic_not_found" };
    }
    return { kind: "ok", topicTour };
};
exports.resolveTopicTourDocBySlugs = resolveTopicTourDocBySlugs;
const mergeById = (items) => {
    const map = new Map();
    for (const item of items) {
        if (!item?._id)
            continue;
        map.set(String(item._id), item);
    }
    return Array.from(map.values());
};
exports.mergeById = mergeById;
const listToursByTopicCandidates = async (topicTourIdCandidates, deleted) => {
    const objectIdCandidates = topicTourIdCandidates.filter((v) => typeof v !== "string");
    const tours = await tour_model_1.default.find({
        deleted,
        topicTourId: {
            $in: objectIdCandidates.length > 0 ? objectIdCandidates : [],
        },
    });
    const toursFromString = await tour_model_1.default.collection
        .find({
        deleted,
        topicTourId: { $in: topicTourIdCandidates },
    })
        .toArray();
    return (0, exports.mergeById)([...tours, ...toursFromString]);
};
exports.listToursByTopicCandidates = listToursByTopicCandidates;
const findTourByIdInTopic = async (tourId, topicTourIdCandidates, deleted) => {
    const tourFromStringTopic = await tour_model_1.default.collection.findOne({
        _id: new mongoose_1.default.Types.ObjectId(tourId),
        deleted,
        topicTourId: { $in: topicTourIdCandidates },
    });
    if (tourFromStringTopic?._id) {
        return tour_model_1.default.findById(tourFromStringTopic._id);
    }
    return tour_model_1.default.findOne({
        _id: tourId,
        deleted,
        topicTourId: { $in: topicTourIdCandidates },
    });
};
exports.findTourByIdInTopic = findTourByIdInTopic;
const applyTourUpdatePayload = (tour, payload) => {
    if (payload?.title !== undefined)
        tour.title = payload.title;
    if (payload?.thumbnail !== undefined)
        tour.thumbnail = payload.thumbnail;
    if (payload?.thumbnailPublicId !== undefined)
        tour.thumbnailPublicId = payload.thumbnailPublicId;
    if (payload?.images !== undefined)
        tour.images = payload.images;
    if (payload?.imagesPublicIds !== undefined)
        tour.imagesPublicIds = payload.imagesPublicIds;
    if (payload?.description !== undefined)
        tour.description = payload.description;
    if (payload?.departureId !== undefined)
        tour.departureId = payload.departureId;
    if (payload?.destinationIds !== undefined)
        tour.destinationIds = payload.destinationIds;
    if (payload?.durationDays !== undefined)
        tour.durationDays = payload.durationDays;
    if (payload?.startSchedule !== undefined)
        tour.startSchedule = payload.startSchedule;
    if (payload?.price !== undefined)
        tour.price = payload.price;
    if (payload?.availableSeats !== undefined)
        tour.availableSeats = payload.availableSeats;
    if (payload?.transportation !== undefined)
        tour.transportation = payload.transportation;
    if (payload?.itinerary !== undefined)
        tour.itinerary = payload.itinerary;
    if (payload?.policyId !== undefined)
        tour.policyId = payload.policyId;
    if (payload?.includedServices !== undefined)
        tour.includedServices = payload.includedServices;
    if (payload?.excludedServices !== undefined)
        tour.excludedServices = payload.excludedServices;
    if (payload?.childPolicy !== undefined)
        tour.childPolicy = payload.childPolicy;
    if (payload?.cancellationPolicy !== undefined)
        tour.cancellationPolicy = payload.cancellationPolicy;
    if (payload?.notes !== undefined)
        tour.notes = payload.notes;
    if (payload?.status !== undefined)
        tour.status = payload.status;
};
exports.applyTourUpdatePayload = applyTourUpdatePayload;
