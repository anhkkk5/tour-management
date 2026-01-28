"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTopicTour = exports.bulkUpdateTopicToursById = exports.bulkRestoreTopicToursById = exports.restoreTopicTourById = exports.softDeleteTopicTourById = exports.updateTopicTourById = exports.createTopicTour = exports.getDeletedTopicToursByCategorySlug = exports.getTopicToursByCategorySlug = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const tourCategory_model_1 = __importDefault(require("../../models/tourCategory/tourCategory.model"));
const topicTour_model_1 = __importDefault(require("../../models/topicTour/topicTour.model"));
const uploadToCloudinary_1 = require("../../../../helpers/uploadToCloudinary");
// [Get] api/v1/tourCategories/:slugTopicTour
const getTopicToursByCategorySlug = async (categorySlug) => {
    const tourCategory = await tourCategory_model_1.default.findOne({
        deleted: false,
        slug: categorySlug,
    });
    if (!tourCategory) {
        return { kind: "category_not_found" };
    }
    const topicTours = await topicTour_model_1.default.find({
        deleted: false,
        tourCategoryId: tourCategory._id,
    });
    if (topicTours.length > 0) {
        return {
            kind: "ok",
            topicTours,
        };
    }
    const topicToursFromString = await topicTour_model_1.default.collection
        .find({
        deleted: false,
        tourCategoryId: tourCategory._id.toString(),
    })
        .toArray();
    return {
        kind: "ok",
        topicTours: topicToursFromString,
    };
};
exports.getTopicToursByCategorySlug = getTopicToursByCategorySlug;
// [Get] api/v1/tourCategories/:slugTopicTour/deleted
const getDeletedTopicToursByCategorySlug = async (categorySlug) => {
    const tourCategory = await tourCategory_model_1.default.findOne({
        deleted: false,
        slug: categorySlug,
    });
    if (!tourCategory) {
        return { kind: "category_not_found" };
    }
    const topicTours = await topicTour_model_1.default.find({
        deleted: true,
        tourCategoryId: tourCategory._id,
    });
    if (topicTours.length > 0) {
        return {
            kind: "ok",
            topicTours,
        };
    }
    const topicToursFromString = await topicTour_model_1.default.collection
        .find({
        deleted: true,
        tourCategoryId: tourCategory._id.toString(),
    })
        .toArray();
    return {
        kind: "ok",
        topicTours: topicToursFromString,
    };
};
exports.getDeletedTopicToursByCategorySlug = getDeletedTopicToursByCategorySlug;
//[Post] api/v1/tourCategories/:slugTopicTour/create
const createTopicTour = async (categorySlug, payload) => {
    const tourCategory = await tourCategory_model_1.default.findOne({
        deleted: false,
        slug: categorySlug,
    });
    if (!tourCategory) {
        return { kind: "category_not_found" };
    }
    if (!payload?.title) {
        return { kind: "validation_error", message: "Missing title" };
    }
    const topicTour = new topicTour_model_1.default({
        title: payload.title,
        thumbnail: payload.thumbnail,
        thumbnailPublicId: payload.thumbnailPublicId,
        description: payload.description,
        tourCategoryId: tourCategory._id,
    });
    const data = await topicTour.save();
    return {
        kind: "ok",
        topicTour: data,
    };
};
exports.createTopicTour = createTopicTour;
// [Patch] api/v1/tourCategories/:slugTopicTour/:id
const updateTopicTourById = async (categorySlug, topicId, payload) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(topicId)) {
        return { kind: "invalid_id" };
    }
    const tourCategory = await tourCategory_model_1.default.findOne({
        deleted: false,
        slug: categorySlug,
    });
    if (!tourCategory) {
        return { kind: "category_not_found" };
    }
    let topicTour = await topicTour_model_1.default.findOne({
        _id: topicId,
        deleted: false,
        tourCategoryId: tourCategory._id,
    });
    if (!topicTour) {
        const topicTourFromStringCategory = await topicTour_model_1.default.collection.findOne({
            _id: new mongoose_1.default.Types.ObjectId(topicId),
            deleted: false,
            tourCategoryId: tourCategory._id.toString(),
        });
        if (topicTourFromStringCategory?._id) {
            topicTour = await topicTour_model_1.default.findById(topicTourFromStringCategory._id);
        }
    }
    if (!topicTour) {
        return { kind: "topic_not_found" };
    }
    if (payload?.title !== undefined && !payload.title) {
        return { kind: "validation_error", message: "Missing title" };
    }
    if (payload.thumbnailPublicId !== undefined &&
        payload.thumbnailPublicId &&
        topicTour.thumbnailPublicId &&
        payload.thumbnailPublicId !== topicTour.thumbnailPublicId) {
        await (0, uploadToCloudinary_1.deleteFromCloudinary)(topicTour.thumbnailPublicId);
    }
    if (payload?.title !== undefined)
        topicTour.title = payload.title;
    if (payload?.thumbnail !== undefined)
        topicTour.thumbnail = payload.thumbnail;
    if (payload?.thumbnailPublicId !== undefined)
        topicTour.thumbnailPublicId = payload.thumbnailPublicId;
    if (payload?.description !== undefined)
        topicTour.description = payload.description;
    try {
        const data = await topicTour.save();
        return {
            kind: "ok",
            topicTour: data,
        };
    }
    catch (error) {
        if (error?.code === 11000) {
            return { kind: "duplicate_slug" };
        }
        throw error;
    }
};
exports.updateTopicTourById = updateTopicTourById;
// [Patch] api/v1/tourCategories/:slugTopicTour/:id
const softDeleteTopicTourById = async (categorySlug, topicId) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(topicId)) {
        return { kind: "invalid_id" };
    }
    const tourCategory = await tourCategory_model_1.default.findOne({
        deleted: false,
        slug: categorySlug,
    });
    if (!tourCategory) {
        return { kind: "category_not_found" };
    }
    let topicTour = await topicTour_model_1.default.findOne({
        _id: topicId,
        deleted: false,
        tourCategoryId: tourCategory._id,
    });
    if (!topicTour) {
        const topicTourFromStringCategory = await topicTour_model_1.default.collection.findOne({
            _id: new mongoose_1.default.Types.ObjectId(topicId),
            deleted: false,
            tourCategoryId: tourCategory._id.toString(),
        });
        if (topicTourFromStringCategory?._id) {
            topicTour = await topicTour_model_1.default.findById(topicTourFromStringCategory._id);
        }
    }
    if (!topicTour) {
        return { kind: "topic_not_found" };
    }
    topicTour.deleted = true;
    topicTour.deleteAt = new Date();
    const data = await topicTour.save();
    return {
        kind: "ok",
        topicTour: data,
    };
};
exports.softDeleteTopicTourById = softDeleteTopicTourById;
// [Patch] api/v1/tourCategories/:slugTopicTour/:id
const restoreTopicTourById = async (categorySlug, topicId) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(topicId)) {
        return { kind: "invalid_id" };
    }
    const tourCategory = await tourCategory_model_1.default.findOne({
        deleted: false,
        slug: categorySlug,
    });
    if (!tourCategory) {
        return { kind: "category_not_found" };
    }
    let topicTour = await topicTour_model_1.default.findOne({
        _id: topicId,
        deleted: true,
        tourCategoryId: tourCategory._id,
    });
    if (!topicTour) {
        const topicTourFromStringCategory = await topicTour_model_1.default.collection.findOne({
            _id: new mongoose_1.default.Types.ObjectId(topicId),
            deleted: true,
            tourCategoryId: tourCategory._id.toString(),
        });
        if (topicTourFromStringCategory?._id) {
            topicTour = await topicTour_model_1.default.findById(topicTourFromStringCategory._id);
        }
    }
    if (!topicTour || topicTour.deleted !== true) {
        return { kind: "topic_not_found" };
    }
    topicTour.deleted = false;
    topicTour.deleteAt = undefined;
    const data = await topicTour.save();
    return {
        kind: "ok",
        topicTour: data,
    };
};
exports.restoreTopicTourById = restoreTopicTourById;
// [Patch] api/v1/tourCategories/:slugTopicTour/bulk
const bulkRestoreTopicToursById = async (categorySlug, payload) => {
    if (!Array.isArray(payload?.ids) || payload.ids.length === 0) {
        return {
            kind: "validation_error",
            message: "Missing ids",
        };
    }
    const tourCategory = await tourCategory_model_1.default.findOne({
        deleted: false,
        slug: categorySlug,
    });
    if (!tourCategory) {
        return { kind: "category_not_found" };
    }
    const results = await Promise.all(payload.ids.map(async (id) => {
        const result = await (0, exports.restoreTopicTourById)(categorySlug, id);
        return { id, ...result };
    }));
    return {
        kind: "ok",
        results,
    };
};
exports.bulkRestoreTopicToursById = bulkRestoreTopicToursById;
// [Patch] api/v1/tourCategories/:slugTopicTour/bulk
const bulkUpdateTopicToursById = async (categorySlug, payload) => {
    if (!Array.isArray(payload?.updates) || payload.updates.length === 0) {
        return {
            kind: "validation_error",
            message: "Missing updates",
        };
    }
    const tourCategory = await tourCategory_model_1.default.findOne({
        deleted: false,
        slug: categorySlug,
    });
    if (!tourCategory) {
        return { kind: "category_not_found" };
    }
    const results = await Promise.all(payload.updates.map(async (u) => {
        if (!u?.id) {
            return { id: u?.id ?? null, kind: "validation_error" };
        }
        const result = await (0, exports.updateTopicTourById)(categorySlug, u.id, {
            title: u.title,
            thumbnail: u.thumbnail,
            description: u.description,
        });
        return { id: u.id, ...result };
    }));
    return {
        kind: "ok",
        results,
    };
};
exports.bulkUpdateTopicToursById = bulkUpdateTopicToursById;
// [Patch] api/v1/tourCategories/:slugTopicTour/:slugTour
const updateTopicTour = async (categorySlug, topicSlug, payload) => {
    const tourCategory = await tourCategory_model_1.default.findOne({
        deleted: false,
        slug: categorySlug,
    });
    if (!tourCategory) {
        return { kind: "category_not_found" };
    }
    let topicTour = await topicTour_model_1.default.findOne({
        deleted: false,
        slug: topicSlug,
        tourCategoryId: tourCategory._id,
    });
    if (!topicTour) {
        const topicTourFromString = await topicTour_model_1.default.collection.findOne({
            deleted: false,
            slug: topicSlug,
            tourCategoryId: tourCategory._id.toString(),
        });
        if (!topicTourFromString?._id) {
            return { kind: "topic_not_found" };
        }
        topicTour = await topicTour_model_1.default.findById(topicTourFromString._id);
    }
    if (!topicTour) {
        return { kind: "topic_not_found" };
    }
    if (payload?.title !== undefined && !payload.title) {
        return { kind: "validation_error", message: "Missing title" };
    }
    if (payload?.title !== undefined)
        topicTour.title = payload.title;
    if (payload?.thumbnail !== undefined)
        topicTour.thumbnail = payload.thumbnail;
    if (payload?.description !== undefined)
        topicTour.description = payload.description;
    try {
        const data = await topicTour.save();
        return {
            kind: "ok",
            topicTour: data,
        };
    }
    catch (error) {
        if (error?.code === 11000) {
            return { kind: "duplicate_slug" };
        }
        throw error;
    }
};
exports.updateTopicTour = updateTopicTour;
