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
exports.deleteTopicTour = exports.bulkUpdateTopicTours = exports.updateTopicTour = exports.bulkRestoreTopicTours = exports.restoreTopicTour = exports.createTopicTour = exports.listDeletedTopicTours = exports.listTourTopic = void 0;
const tourCategoryService = __importStar(require("../../services/tourCategory/tourCategory.service"));
const utility_functions_1 = require("../../../../helpers/utility_functions");
// [Get] api/v1/tour_category/:slugTopicTour
const listTourTopic = async (req, res) => {
    const slugTopicTour = (0, utility_functions_1.getParamString)(req, "slugTopicTour");
    if (!slugTopicTour) {
        return (0, utility_functions_1.sendError)(res, 400, "Missing slugTopicTour param");
    }
    const result = await tourCategoryService.getTopicToursByCategorySlug(slugTopicTour);
    if (result.kind === "category_not_found") {
        return (0, utility_functions_1.sendError)(res, 404, "Tour category not found");
    }
    return res.json({
        code: 200,
        data: result.topicTours,
    });
};
exports.listTourTopic = listTourTopic;
// [Get] api/v1/tour_category/:slugTopicTour/deleted
const listDeletedTopicTours = async (req, res) => {
    const slugTopicTour = (0, utility_functions_1.getParamString)(req, "slugTopicTour");
    if (!slugTopicTour) {
        return (0, utility_functions_1.sendError)(res, 400, "Missing slugTopicTour param");
    }
    const result = await tourCategoryService.getDeletedTopicToursByCategorySlug(slugTopicTour);
    if (result.kind === "category_not_found") {
        return (0, utility_functions_1.sendError)(res, 404, "Tour category not found");
    }
    return res.json({
        code: 200,
        data: result.topicTours,
    });
};
exports.listDeletedTopicTours = listDeletedTopicTours;
// [Post] api/v1/tour_category/:slugTopicTour/create
const createTopicTour = async (req, res) => {
    try {
        const slugTopicTour = (0, utility_functions_1.getParamString)(req, "slugTopicTour");
        if (!slugTopicTour) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing slugTopicTour param");
        }
        const result = await tourCategoryService.createTopicTour(slugTopicTour, {
            title: req.body?.title,
            thumbnail: req.body?.thumbnail,
            thumbnailPublicId: req.body?.thumbnailPublicId,
            description: req.body?.description,
        });
        if (result.kind === "category_not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Tour category not found");
        }
        if (result.kind === "validation_error") {
            return (0, utility_functions_1.sendError)(res, 400, result.message);
        }
        return res.json({
            code: 200,
            message: "Tạo topic tour thành công",
            data: result.topicTour,
        });
    }
    catch (error) {
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi tạo topic tour!");
    }
};
exports.createTopicTour = createTopicTour;
// [Patch] api/v1/tour_category/:slugTopicTour/restore/:id
const restoreTopicTour = async (req, res) => {
    try {
        const slugTopicTour = (0, utility_functions_1.getParamString)(req, "slugTopicTour");
        const id = (0, utility_functions_1.getParamString)(req, "id");
        if (!slugTopicTour) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing slugTopicTour param");
        }
        if (!id) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing id param");
        }
        const result = await tourCategoryService.restoreTopicTourById(slugTopicTour, id);
        if (result.kind === "invalid_id") {
            return (0, utility_functions_1.sendError)(res, 400, "Invalid id");
        }
        if (result.kind === "category_not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Tour category not found");
        }
        if (result.kind === "topic_not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Topic tour not found");
        }
        return res.json({
            code: 200,
            message: "Khôi phục topic tour thành công",
            data: result.topicTour,
        });
    }
    catch (error) {
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi khôi phục topic tour!");
    }
};
exports.restoreTopicTour = restoreTopicTour;
// [Patch] api/v1/tour_category/:slugTopicTour/restore/bulk
const bulkRestoreTopicTours = async (req, res) => {
    try {
        const slugTopicTour = (0, utility_functions_1.getParamString)(req, "slugTopicTour");
        if (!slugTopicTour) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing slugTopicTour param");
        }
        const result = await tourCategoryService.bulkRestoreTopicToursById(slugTopicTour, {
            ids: req.body?.ids,
        });
        if (result.kind === "category_not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Tour category not found");
        }
        if (result.kind === "validation_error") {
            return (0, utility_functions_1.sendError)(res, 400, result.message);
        }
        return res.json({
            code: 200,
            message: "Khôi phục topic tour hàng loạt thành công",
            data: result.results,
        });
    }
    catch (error) {
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi khôi phục topic tour hàng loạt!");
    }
};
exports.bulkRestoreTopicTours = bulkRestoreTopicTours;
// [Patch] api/v1/tour_category/:slugTopicTour/edit/:id
const updateTopicTour = async (req, res) => {
    try {
        const slugTopicTour = (0, utility_functions_1.getParamString)(req, "slugTopicTour");
        const id = (0, utility_functions_1.getParamString)(req, "id");
        if (!slugTopicTour) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing slugTopicTour param");
        }
        if (!id) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing id param");
        }
        const result = await tourCategoryService.updateTopicTourById(slugTopicTour, id, {
            title: req.body?.title,
            thumbnail: req.body?.thumbnail,
            thumbnailPublicId: req.body?.thumbnailPublicId,
            description: req.body?.description,
        });
        if (result.kind === "invalid_id") {
            return (0, utility_functions_1.sendError)(res, 400, "Invalid id");
        }
        if (result.kind === "category_not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Tour category not found");
        }
        if (result.kind === "topic_not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Topic tour not found");
        }
        if (result.kind === "validation_error") {
            return (0, utility_functions_1.sendError)(res, 400, result.message);
        }
        if (result.kind === "duplicate_slug") {
            return (0, utility_functions_1.sendError)(res, 409, "Topic tour slug already exists");
        }
        return res.json({
            code: 200,
            message: "Cập nhật topic tour thành công",
            data: result.topicTour,
        });
    }
    catch (error) {
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi cập nhật topic tour!");
    }
};
exports.updateTopicTour = updateTopicTour;
// [Patch] api/v1/tour_category/:slugTopicTour/bulk
const bulkUpdateTopicTours = async (req, res) => {
    try {
        const slugTopicTour = (0, utility_functions_1.getParamString)(req, "slugTopicTour");
        if (!slugTopicTour) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing slugTopicTour param");
        }
        const result = await tourCategoryService.bulkUpdateTopicToursById(slugTopicTour, {
            updates: req.body?.updates,
        });
        if (result.kind === "category_not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Tour category not found");
        }
        if (result.kind === "validation_error") {
            return (0, utility_functions_1.sendError)(res, 400, result.message);
        }
        return res.json({
            code: 200,
            message: "Cập nhật topic tour hàng loạt thành công",
            data: result.results,
        });
    }
    catch (error) {
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi cập nhật topic tour hàng loạt!");
    }
};
exports.bulkUpdateTopicTours = bulkUpdateTopicTours;
// [Patch] api/v1/tour_category/:slugTopicTour/delete/:id
const deleteTopicTour = async (req, res) => {
    try {
        const slugTopicTour = (0, utility_functions_1.getParamString)(req, "slugTopicTour");
        const id = (0, utility_functions_1.getParamString)(req, "id");
        if (!slugTopicTour) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing slugTopicTour param");
        }
        if (!id) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing id param");
        }
        const result = await tourCategoryService.softDeleteTopicTourById(slugTopicTour, id);
        if (result.kind === "invalid_id") {
            return (0, utility_functions_1.sendError)(res, 400, "Invalid id");
        }
        if (result.kind === "category_not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Tour category not found");
        }
        if (result.kind === "topic_not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Topic tour not found");
        }
        return res.json({
            code: 200,
            message: "Xóa topic tour thành công",
            data: result.topicTour,
        });
    }
    catch (error) {
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi xóa topic tour!");
    }
};
exports.deleteTopicTour = deleteTopicTour;
