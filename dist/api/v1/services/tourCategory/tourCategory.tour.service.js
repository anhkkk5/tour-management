"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkRestoreToursById = exports.bulkUpdateToursById = exports.restoreTourById = exports.softDeleteTourById = exports.updateTourById = exports.createTour = exports.getDeletedToursByCategorySlugAndTopicSlug = exports.getToursByCategorySlugAndTopicSlug = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const tour_model_1 = __importDefault(require("../../models/tour/tour.model"));
const tour_policy_crud_service_1 = require("../tours/tour.policy.crud.service");
const mongo_util_1 = require("../../../../utils/mongo.util");
const uploadToCloudinary_1 = require("../../../../helpers/uploadToCloudinary");
const tourCategory_tour_helpers_1 = require("../../../../helpers/tourCategory.tour.helpers");
// [Get] api/v1/tourCategories/:slugTopicTour/:slugTour
const getToursByCategorySlugAndTopicSlug = async (categorySlug, topicSlug) => {
    const tourCategory = await (0, tourCategory_tour_helpers_1.findTourCategoryBySlug)(categorySlug);
    if (!tourCategory) {
        return { kind: "category_not_found" };
    }
    const resolved = await (0, tourCategory_tour_helpers_1.resolveTopicTourBySlugs)(tourCategory, topicSlug);
    if (resolved.kind !== "ok") {
        return { kind: "topic_not_found" };
    }
    const tours = await (0, tourCategory_tour_helpers_1.listToursByTopicCandidates)(resolved.topicTourIdCandidates, false);
    return {
        kind: "ok",
        tours,
    };
};
exports.getToursByCategorySlugAndTopicSlug = getToursByCategorySlugAndTopicSlug;
// [Get] api/v1/tourCategories/:slugTopicTour/:slugTour/deleted
const getDeletedToursByCategorySlugAndTopicSlug = async (categorySlug, topicSlug) => {
    const tourCategory = await (0, tourCategory_tour_helpers_1.findTourCategoryBySlug)(categorySlug);
    if (!tourCategory) {
        return { kind: "category_not_found" };
    }
    const resolved = await (0, tourCategory_tour_helpers_1.resolveTopicTourBySlugs)(tourCategory, topicSlug);
    if (resolved.kind !== "ok") {
        return { kind: "topic_not_found" };
    }
    const tours = await (0, tourCategory_tour_helpers_1.listToursByTopicCandidates)(resolved.topicTourIdCandidates, true);
    return {
        kind: "ok",
        tours,
    };
};
exports.getDeletedToursByCategorySlugAndTopicSlug = getDeletedToursByCategorySlugAndTopicSlug;
// [Post] api/v1/tourCategories/:slugTopicTour/:slugTour/create
const createTour = async (categorySlug, topicSlug, payload) => {
    if (!payload?.title) {
        return { kind: "validation_error", message: "Missing title" };
    }
    if (!payload?.thumbnail) {
        return { kind: "validation_error", message: "Missing thumbnail" };
    }
    if (!payload?.description) {
        return {
            kind: "validation_error",
            message: "Missing description",
        };
    }
    const durationDays = typeof payload?.durationDays === "number" ? payload.durationDays : null;
    if (durationDays === null) {
        return {
            kind: "validation_error",
            message: "Missing durationDays",
        };
    }
    const startSchedule = typeof payload?.startSchedule === "string" ? payload.startSchedule : null;
    if (!startSchedule) {
        return {
            kind: "validation_error",
            message: "Missing startSchedule",
        };
    }
    const price = typeof payload?.price === "number" ? payload.price : null;
    if (price === null) {
        return { kind: "validation_error", message: "Missing price" };
    }
    const availableSeats = typeof payload?.availableSeats === "number" ? payload.availableSeats : null;
    if (availableSeats === null) {
        return {
            kind: "validation_error",
            message: "Missing availableSeats",
        };
    }
    const transportation = typeof payload?.transportation === "string" ? payload.transportation : null;
    if (!transportation) {
        return {
            kind: "validation_error",
            message: "Missing transportation",
        };
    }
    const images = payload?.images === undefined
        ? []
        : Array.isArray(payload.images) &&
            payload.images.every((x) => typeof x === "string")
            ? payload.images
            : null;
    if (images === null) {
        return {
            kind: "validation_error",
            message: "images must be an array of strings",
        };
    }
    const imagesPublicIds = payload?.imagesPublicIds === undefined
        ? []
        : Array.isArray(payload.imagesPublicIds) &&
            payload.imagesPublicIds.every((x) => typeof x === "string")
            ? payload.imagesPublicIds
            : null;
    if (imagesPublicIds === null) {
        return {
            kind: "validation_error",
            message: "imagesPublicIds must be an array of strings",
        };
    }
    const itinerary = Array.isArray(payload?.itinerary)
        ? payload.itinerary
        : null;
    if (!itinerary || itinerary.length === 0) {
        return {
            kind: "validation_error",
            message: "Missing itinerary",
        };
    }
    const departureId = (0, mongo_util_1.toObjectIdMaybe)(payload?.departureId);
    if (!departureId) {
        return {
            kind: "validation_error",
            message: "Invalid departureId",
        };
    }
    const destinationIdsRaw = payload?.destinationIds;
    if (!Array.isArray(destinationIdsRaw) || destinationIdsRaw.length === 0) {
        return {
            kind: "validation_error",
            message: "destinationIds must be a non-empty array",
        };
    }
    const destinationIdsMapped = destinationIdsRaw.map(mongo_util_1.toObjectIdMaybe);
    if (destinationIdsMapped.some((id) => id === null)) {
        return {
            kind: "validation_error",
            message: "Invalid destinationIds",
        };
    }
    const policyIdRaw = payload?.policyId;
    const policyObj = payload?.policy;
    if (policyIdRaw !== undefined && policyObj !== undefined) {
        return {
            kind: "validation_error",
            message: "Provide either policyId or policy (not both)",
        };
    }
    let policyId = policyIdRaw === undefined ? undefined : (0, mongo_util_1.toObjectIdMaybe)(policyIdRaw);
    if (policyIdRaw !== undefined && !policyId) {
        return { kind: "validation_error", message: "Invalid policyId" };
    }
    if (policyObj !== undefined) {
        const created = await (0, tour_policy_crud_service_1.createTourPolicy)({
            includedServices: policyObj?.includedServices,
            excludedServices: policyObj?.excludedServices,
            childPolicy: policyObj?.childPolicy,
            cancellationPolicy: policyObj?.cancellationPolicy,
        });
        if (created.kind === "validation_error") {
            return { kind: "validation_error", message: created.message };
        }
        policyId = created.policy._id;
    }
    const tourCategory = await (0, tourCategory_tour_helpers_1.findTourCategoryBySlug)(categorySlug);
    if (!tourCategory) {
        return { kind: "category_not_found" };
    }
    const topicResolved = await (0, tourCategory_tour_helpers_1.resolveTopicTourDocBySlugs)(tourCategory, topicSlug);
    if (topicResolved.kind !== "ok") {
        return { kind: "topic_not_found" };
    }
    const tour = new tour_model_1.default({
        title: payload.title,
        thumbnail: payload.thumbnail,
        thumbnailPublicId: payload.thumbnailPublicId,
        images,
        imagesPublicIds,
        description: payload.description,
        topicTourId: topicResolved.topicTour._id,
        departureId,
        destinationIds: destinationIdsMapped,
        durationDays,
        startSchedule,
        price,
        availableSeats,
        transportation,
        itinerary,
        policyId,
        notes: payload.notes,
        status: "draft",
    });
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
exports.createTour = createTour;
// [Patch] api/v1/tourCategories/:slugTopicTour/:slugTour/edit/{id}
const updateTourById = async (categorySlug, topicSlug, tourId, payload) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(tourId)) {
        return { kind: "invalid_id" };
    }
    const tourCategory = await (0, tourCategory_tour_helpers_1.findTourCategoryBySlug)(categorySlug);
    if (!tourCategory) {
        return { kind: "category_not_found" };
    }
    const topicResolved = await (0, tourCategory_tour_helpers_1.resolveTopicTourBySlugs)(tourCategory, topicSlug);
    if (topicResolved.kind !== "ok") {
        return { kind: "topic_not_found" };
    }
    const tour = await (0, tourCategory_tour_helpers_1.findTourByIdInTopic)(tourId, topicResolved.topicTourIdCandidates, false);
    if (!tour) {
        return { kind: "tour_not_found" };
    }
    if (payload.thumbnailPublicId !== undefined &&
        payload.thumbnailPublicId &&
        tour.thumbnailPublicId &&
        payload.thumbnailPublicId !== tour.thumbnailPublicId) {
        await (0, uploadToCloudinary_1.deleteFromCloudinary)(tour.thumbnailPublicId);
    }
    if (payload?.title !== undefined && !payload.title) {
        return { kind: "validation_error", message: "Missing title" };
    }
    (0, tourCategory_tour_helpers_1.applyTourUpdatePayload)(tour, payload);
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
// [Patch] api/v1/tourCategories/:slugTopicTour/:slugTour/delete/{id}
const softDeleteTourById = async (categorySlug, topicSlug, tourId) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(tourId)) {
        return { kind: "invalid_id" };
    }
    const tourCategory = await (0, tourCategory_tour_helpers_1.findTourCategoryBySlug)(categorySlug);
    if (!tourCategory) {
        return { kind: "category_not_found" };
    }
    const topicResolved = await (0, tourCategory_tour_helpers_1.resolveTopicTourBySlugs)(tourCategory, topicSlug);
    if (topicResolved.kind !== "ok") {
        return { kind: "topic_not_found" };
    }
    const tour = await (0, tourCategory_tour_helpers_1.findTourByIdInTopic)(tourId, topicResolved.topicTourIdCandidates, false);
    if (!tour) {
        return { kind: "tour_not_found" };
    }
    tour.deleted = true;
    tour.deleteAt = new Date();
    const data = await tour.save();
    return { kind: "ok", tour: data };
};
exports.softDeleteTourById = softDeleteTourById;
// [Patch] api/v1/tourCategories/:slugTopicTour/:slugTour/restore/{id}
const restoreTourById = async (categorySlug, topicSlug, tourId) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(tourId)) {
        return { kind: "invalid_id" };
    }
    const tourCategory = await (0, tourCategory_tour_helpers_1.findTourCategoryBySlug)(categorySlug);
    if (!tourCategory) {
        return { kind: "category_not_found" };
    }
    const topicResolved = await (0, tourCategory_tour_helpers_1.resolveTopicTourBySlugs)(tourCategory, topicSlug);
    if (topicResolved.kind !== "ok") {
        return { kind: "topic_not_found" };
    }
    const tour = await (0, tourCategory_tour_helpers_1.findTourByIdInTopic)(tourId, topicResolved.topicTourIdCandidates, true);
    if (!tour || tour.deleted !== true) {
        return { kind: "tour_not_found" };
    }
    tour.deleted = false;
    tour.deleteAt = undefined;
    const data = await tour.save();
    return { kind: "ok", tour: data };
};
exports.restoreTourById = restoreTourById;
// [Patch] api/v1/tourCategories/:slugTopicTour/:slugTour/bulk
const bulkUpdateToursById = async (categorySlug, topicSlug, payload) => {
    if (!Array.isArray(payload?.updates) || payload.updates.length === 0) {
        return {
            kind: "validation_error",
            message: "Missing updates",
        };
    }
    const tourCategory = await (0, tourCategory_tour_helpers_1.findTourCategoryBySlug)(categorySlug);
    if (!tourCategory) {
        return { kind: "category_not_found" };
    }
    const topicResolved = await (0, tourCategory_tour_helpers_1.resolveTopicTourBySlugs)(tourCategory, topicSlug);
    if (topicResolved.kind !== "ok") {
        return { kind: "topic_not_found" };
    }
    const results = await Promise.all(payload.updates.map(async (u) => {
        if (!u?.id) {
            return { id: u?.id ?? null, kind: "validation_error" };
        }
        const result = await (0, exports.updateTourById)(categorySlug, topicSlug, u.id, {
            title: u.title,
            thumbnail: u.thumbnail,
            images: u.images,
            description: u.description,
            departureId: u.departureId,
            destinationIds: u.destinationIds,
            durationDays: u.durationDays,
            startSchedule: u.startSchedule,
            price: u.price,
            availableSeats: u.availableSeats,
            transportation: u.transportation,
            itinerary: u.itinerary,
            policyId: u.policyId,
            includedServices: u.includedServices,
            excludedServices: u.excludedServices,
            childPolicy: u.childPolicy,
            cancellationPolicy: u.cancellationPolicy,
            notes: u.notes,
            status: u.status,
        });
        return { id: u.id, ...result };
    }));
    return { kind: "ok", results };
};
exports.bulkUpdateToursById = bulkUpdateToursById;
// [Patch] api/v1/tourCategories/:slugTopicTour/:slugTour/restore/bulk
const bulkRestoreToursById = async (categorySlug, topicSlug, payload) => {
    if (!Array.isArray(payload?.ids) || payload.ids.length === 0) {
        return {
            kind: "validation_error",
            message: "Missing ids",
        };
    }
    const tourCategory = await (0, tourCategory_tour_helpers_1.findTourCategoryBySlug)(categorySlug);
    if (!tourCategory) {
        return { kind: "category_not_found" };
    }
    const topicResolved = await (0, tourCategory_tour_helpers_1.resolveTopicTourBySlugs)(tourCategory, topicSlug);
    if (topicResolved.kind !== "ok") {
        return { kind: "topic_not_found" };
    }
    const results = await Promise.all(payload.ids.map(async (id) => {
        const result = await (0, exports.restoreTourById)(categorySlug, topicSlug, id);
        return { id, ...result };
    }));
    return { kind: "ok", results };
};
exports.bulkRestoreToursById = bulkRestoreToursById;
