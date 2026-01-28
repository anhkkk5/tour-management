"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkRestoreTourCategoriesById = exports.restoreTourCategoryById = exports.getDeletedTourCategories = exports.softDeleteTourCategoryById = exports.bulkUpdateTourCategoriesById = exports.updateTourCategoryById = exports.createTourCategory = exports.listTourCategories = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const tourCategory_model_1 = __importDefault(require("../../models/tourCategory/tourCategory.model"));
// [Get] api/v1/tourCategories
const listTourCategories = async () => {
    return tourCategory_model_1.default.find({
        deleted: false,
    });
};
exports.listTourCategories = listTourCategories;
// [Post] api/v1/tour_category/create
const createTourCategory = async (payload) => {
    if (!payload?.title) {
        return { kind: "validation_error", message: "Missing title" };
    }
    const tourCategory = new tourCategory_model_1.default({
        title: payload.title,
        description: payload.description,
    });
    try {
        const data = await tourCategory.save();
        return {
            kind: "ok",
            tourCategory: data,
        };
    }
    catch (error) {
        if (error?.code === 11000) {
            return { kind: "duplicate_slug" };
        }
        throw error;
    }
};
exports.createTourCategory = createTourCategory;
// [Patch] api/v1/tour_category/edit/{id}
const updateTourCategoryById = async (id, payload) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        return { kind: "invalid_id" };
    }
    const tourCategory = await tourCategory_model_1.default.findOne({
        _id: id,
        deleted: false,
    });
    if (!tourCategory) {
        return { kind: "not_found" };
    }
    if (payload?.title !== undefined && !payload.title) {
        return { kind: "validation_error", message: "Missing title" };
    }
    if (payload?.title !== undefined)
        tourCategory.title = payload.title;
    if (payload?.description !== undefined)
        tourCategory.description = payload.description;
    try {
        const data = await tourCategory.save();
        return {
            kind: "ok",
            tourCategory: data,
        };
    }
    catch (error) {
        if (error?.code === 11000) {
            return { kind: "duplicate_slug" };
        }
        throw error;
    }
};
exports.updateTourCategoryById = updateTourCategoryById;
// [Patch] api/v1/tour_category/bulk
const bulkUpdateTourCategoriesById = async (payload) => {
    if (!Array.isArray(payload?.updates) || payload.updates.length === 0) {
        return {
            kind: "validation_error",
            message: "Missing updates",
        };
    }
    const results = await Promise.all(payload.updates.map(async (u) => {
        if (!u?.id) {
            return { id: u?.id ?? null, kind: "validation_error" };
        }
        const result = await (0, exports.updateTourCategoryById)(u.id, {
            title: u.title,
            description: u.description,
        });
        return { id: u.id, ...result };
    }));
    return {
        kind: "ok",
        results,
    };
};
exports.bulkUpdateTourCategoriesById = bulkUpdateTourCategoriesById;
// [Patch] api/v1/tour_category/delete/{id}
const softDeleteTourCategoryById = async (id) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        return { kind: "invalid_id" };
    }
    const tourCategory = await tourCategory_model_1.default.findOne({
        _id: id,
        deleted: false,
    });
    if (!tourCategory) {
        return { kind: "not_found" };
    }
    tourCategory.deleted = true;
    tourCategory.deleteAt = new Date();
    const data = await tourCategory.save();
    return {
        kind: "ok",
        tourCategory: data,
    };
};
exports.softDeleteTourCategoryById = softDeleteTourCategoryById;
// [Get] api/v1/tour_category/deleted
const getDeletedTourCategories = async () => {
    return tourCategory_model_1.default.find({
        deleted: true,
    });
};
exports.getDeletedTourCategories = getDeletedTourCategories;
// [Patch] api/v1/tour_category/restore/{id}
const restoreTourCategoryById = async (id) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        return { kind: "invalid_id" };
    }
    const tourCategory = await tourCategory_model_1.default.findOne({
        _id: id,
        deleted: true,
    });
    if (!tourCategory) {
        return { kind: "not_found" };
    }
    tourCategory.deleted = false;
    tourCategory.deleteAt = undefined;
    const data = await tourCategory.save();
    return {
        kind: "ok",
        tourCategory: data,
    };
};
exports.restoreTourCategoryById = restoreTourCategoryById;
// [Patch] api/v1/tour_category/restore/bulk
const bulkRestoreTourCategoriesById = async (payload) => {
    if (!Array.isArray(payload?.ids) || payload.ids.length === 0) {
        return {
            kind: "validation_error",
            message: "Missing ids",
        };
    }
    const results = await Promise.all(payload.ids.map(async (id) => {
        const result = await (0, exports.restoreTourCategoryById)(id);
        return { id, ...result };
    }));
    return {
        kind: "ok",
        results,
    };
};
exports.bulkRestoreTourCategoriesById = bulkRestoreTourCategoriesById;
