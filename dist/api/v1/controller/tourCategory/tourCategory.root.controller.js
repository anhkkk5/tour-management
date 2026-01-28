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
exports.bulkRestoreTourCategories = exports.restoreTourCategory = exports.listDeletedTourCategories = exports.deleteTourCategory = exports.bulkUpdateTourCategories = exports.updateTourCategory = exports.createTourCategory = exports.index = void 0;
const tourCategoryService = __importStar(require("../../services/tourCategory/tourCategory.service"));
const utility_functions_1 = require("../../../../helpers/utility_functions");
// [Get] api/v1/tourCategories
const index = async (req, res) => {
    const tourCategories = await tourCategoryService.listTourCategories();
    return res.json({
        code: 200,
        data: tourCategories,
    });
};
exports.index = index;
// [Post] api/v1/tour_category/create
const createTourCategory = async (req, res) => {
    try {
        const result = await tourCategoryService.createTourCategory({
            title: req.body?.title,
            description: req.body?.description,
        });
        if (result.kind === "validation_error") {
            return (0, utility_functions_1.sendError)(res, 400, result.message);
        }
        if (result.kind === "duplicate_slug") {
            return (0, utility_functions_1.sendError)(res, 409, "Tour category slug already exists");
        }
        return res.json({
            code: 200,
            message: "Tạo tour category thành công",
            data: result.tourCategory,
        });
    }
    catch (error) {
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi tạo tour category!");
    }
};
exports.createTourCategory = createTourCategory;
// [Patch] api/v1/tour_category/edit/:id
const updateTourCategory = async (req, res) => {
    try {
        const id = (0, utility_functions_1.getParamString)(req, "id");
        if (!id) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing id param");
        }
        const result = await tourCategoryService.updateTourCategoryById(id, {
            title: req.body?.title,
            description: req.body?.description,
        });
        if (result.kind === "invalid_id") {
            return (0, utility_functions_1.sendError)(res, 400, "Invalid id");
        }
        if (result.kind === "not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Tour category not found");
        }
        if (result.kind === "validation_error") {
            return (0, utility_functions_1.sendError)(res, 400, result.message);
        }
        if (result.kind === "duplicate_slug") {
            return (0, utility_functions_1.sendError)(res, 409, "Tour category slug already exists");
        }
        return res.json({
            code: 200,
            message: "Cập nhật tour category thành công",
            data: result.tourCategory,
        });
    }
    catch (error) {
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi cập nhật tour category!");
    }
};
exports.updateTourCategory = updateTourCategory;
// [Patch] api/v1/tour_category/bulk
const bulkUpdateTourCategories = async (req, res) => {
    try {
        const result = await tourCategoryService.bulkUpdateTourCategoriesById({
            updates: req.body?.updates,
        });
        if (result.kind === "validation_error") {
            return (0, utility_functions_1.sendError)(res, 400, result.message);
        }
        return res.json({
            code: 200,
            message: "Cập nhật tour category hàng loạt thành công",
            data: result.results,
        });
    }
    catch (error) {
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi cập nhật tour category hàng loạt!");
    }
};
exports.bulkUpdateTourCategories = bulkUpdateTourCategories;
// [Patch] api/v1/tour_category/delete/:id
const deleteTourCategory = async (req, res) => {
    try {
        const id = (0, utility_functions_1.getParamString)(req, "id");
        if (!id) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing id param");
        }
        const result = await tourCategoryService.softDeleteTourCategoryById(id);
        if (result.kind === "invalid_id") {
            return (0, utility_functions_1.sendError)(res, 400, "Invalid id");
        }
        if (result.kind === "not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Tour category not found");
        }
        return res.json({
            code: 200,
            message: "Xóa tour category thành công",
            data: result.tourCategory,
        });
    }
    catch (error) {
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi xóa tour category!");
    }
};
exports.deleteTourCategory = deleteTourCategory;
const listDeletedTourCategories = async (req, res) => {
    const tourCategories = await tourCategoryService.getDeletedTourCategories();
    return res.json({
        code: 200,
        data: tourCategories,
    });
};
exports.listDeletedTourCategories = listDeletedTourCategories;
const restoreTourCategory = async (req, res) => {
    try {
        const id = (0, utility_functions_1.getParamString)(req, "id");
        if (!id) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing id param");
        }
        const result = await tourCategoryService.restoreTourCategoryById(id);
        if (result.kind === "invalid_id") {
            return (0, utility_functions_1.sendError)(res, 400, "Invalid id");
        }
        if (result.kind === "not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Tour category not found");
        }
        return res.json({
            code: 200,
            message: "Khôi phục tour category thành công",
            data: result.tourCategory,
        });
    }
    catch (error) {
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi khôi phục tour category!");
    }
};
exports.restoreTourCategory = restoreTourCategory;
const bulkRestoreTourCategories = async (req, res) => {
    try {
        const result = await tourCategoryService.bulkRestoreTourCategoriesById({
            ids: req.body?.ids,
        });
        if (result.kind === "validation_error") {
            return (0, utility_functions_1.sendError)(res, 400, result.message);
        }
        return res.json({
            code: 200,
            message: "Khôi phục tour category hàng loạt thành công",
            data: result.results,
        });
    }
    catch (error) {
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi khôi phục tour category hàng loạt!");
    }
};
exports.bulkRestoreTourCategories = bulkRestoreTourCategories;
