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
exports.bulkRestoreTours = exports.bulkUpdateTours = exports.restoreTour = exports.deleteTour = exports.updateTour = exports.createTour = exports.listDeletedTours = exports.listTour = void 0;
const tourCategoryService = __importStar(require("../../services/tourCategory/tourCategory.service"));
const utility_functions_1 = require("../../../../helpers/utility_functions");
// [Get] api/v1/tour_category/:slugTopicTour/:slugTour
const listTour = async (req, res) => {
    const slugTopicTour = (0, utility_functions_1.getParamString)(req, "slugTopicTour");
    const slugTour = (0, utility_functions_1.getParamString)(req, "slugTour");
    if (!slugTopicTour) {
        return (0, utility_functions_1.sendError)(res, 400, "Missing slugTopicTour param");
    }
    if (!slugTour) {
        return (0, utility_functions_1.sendError)(res, 400, "Missing slugTour param");
    }
    const result = await tourCategoryService.getToursByCategorySlugAndTopicSlug(slugTopicTour, slugTour);
    if (result.kind === "category_not_found") {
        return (0, utility_functions_1.sendError)(res, 404, "Tour category not found");
    }
    if (result.kind === "topic_not_found") {
        return (0, utility_functions_1.sendError)(res, 404, "Topic tour not found");
    }
    return res.json({
        code: 200,
        data: result.tours,
    });
};
exports.listTour = listTour;
const listDeletedTours = async (req, res) => {
    const slugTopicTour = (0, utility_functions_1.getParamString)(req, "slugTopicTour");
    const slugTour = (0, utility_functions_1.getParamString)(req, "slugTour");
    if (!slugTopicTour) {
        return (0, utility_functions_1.sendError)(res, 400, "Missing slugTopicTour param");
    }
    if (!slugTour) {
        return (0, utility_functions_1.sendError)(res, 400, "Missing slugTour param");
    }
    const result = await tourCategoryService.getDeletedToursByCategorySlugAndTopicSlug(slugTopicTour, slugTour);
    if (result.kind === "category_not_found") {
        return (0, utility_functions_1.sendError)(res, 404, "Tour category not found");
    }
    if (result.kind === "topic_not_found") {
        return (0, utility_functions_1.sendError)(res, 404, "Topic tour not found");
    }
    return res.json({
        code: 200,
        data: result.tours,
    });
};
exports.listDeletedTours = listDeletedTours;
const createTour = async (req, res) => {
    try {
        const slugTopicTour = (0, utility_functions_1.getParamString)(req, "slugTopicTour");
        const slugTour = (0, utility_functions_1.getParamString)(req, "slugTour");
        if (!slugTopicTour) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing slugTopicTour param");
        }
        if (!slugTour) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing slugTour param");
        }
        const result = await tourCategoryService.createTour(slugTopicTour, slugTour, {
            title: req.body?.title,
            thumbnail: req.body?.thumbnail,
            thumbnailPublicId: req.body?.thumbnailPublicId,
            images: req.body?.images,
            imagesPublicIds: req.body?.imagesPublicIds,
            description: req.body?.description,
            departureId: req.body?.departureId,
            destinationIds: req.body?.destinationIds,
            durationDays: req.body?.durationDays,
            startSchedule: req.body?.startSchedule,
            price: req.body?.price,
            availableSeats: req.body?.availableSeats,
            transportation: req.body?.transportation,
            itinerary: req.body?.itinerary,
            policyId: req.body?.policyId,
            policy: req.body?.policy,
            notes: req.body?.notes,
            status: req.body?.status,
        });
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
            return (0, utility_functions_1.sendError)(res, 409, "Tour slug already exists");
        }
        return res.json({
            code: 200,
            message: "Tạo tour thành công",
            data: result.tour,
        });
    }
    catch (error) {
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi tạo tour!");
    }
};
exports.createTour = createTour;
const updateTour = async (req, res) => {
    try {
        const slugTopicTour = (0, utility_functions_1.getParamString)(req, "slugTopicTour");
        const slugTour = (0, utility_functions_1.getParamString)(req, "slugTour");
        const id = (0, utility_functions_1.getParamString)(req, "id");
        if (!slugTopicTour) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing slugTopicTour param");
        }
        if (!slugTour) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing slugTour param");
        }
        if (!id) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing id param");
        }
        const result = await tourCategoryService.updateTourById(slugTopicTour, slugTour, id, {
            title: req.body?.title,
            thumbnail: req.body?.thumbnail,
            thumbnailPublicId: req.body?.thumbnailPublicId,
            images: req.body?.images,
            imagesPublicIds: req.body?.imagesPublicIds,
            description: req.body?.description,
            departureId: req.body?.departureId,
            destinationIds: req.body?.destinationIds,
            durationDays: req.body?.durationDays,
            startSchedule: req.body?.startSchedule,
            price: req.body?.price,
            availableSeats: req.body?.availableSeats,
            transportation: req.body?.transportation,
            itinerary: req.body?.itinerary,
            policyId: req.body?.policyId,
            includedServices: req.body?.includedServices,
            excludedServices: req.body?.excludedServices,
            childPolicy: req.body?.childPolicy,
            cancellationPolicy: req.body?.cancellationPolicy,
            notes: req.body?.notes,
            status: req.body?.status,
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
        if (result.kind === "tour_not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Tour not found");
        }
        if (result.kind === "validation_error") {
            return (0, utility_functions_1.sendError)(res, 400, result.message);
        }
        if (result.kind === "duplicate_slug") {
            return (0, utility_functions_1.sendError)(res, 409, "Tour slug already exists");
        }
        return res.json({
            code: 200,
            message: "Cập nhật tour thành công",
            data: result.tour,
        });
    }
    catch (error) {
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi cập nhật tour!");
    }
};
exports.updateTour = updateTour;
const deleteTour = async (req, res) => {
    try {
        const slugTopicTour = (0, utility_functions_1.getParamString)(req, "slugTopicTour");
        const slugTour = (0, utility_functions_1.getParamString)(req, "slugTour");
        const id = (0, utility_functions_1.getParamString)(req, "id");
        if (!slugTopicTour) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing slugTopicTour param");
        }
        if (!slugTour) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing slugTour param");
        }
        if (!id) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing id param");
        }
        const result = await tourCategoryService.softDeleteTourById(slugTopicTour, slugTour, id);
        if (result.kind === "invalid_id") {
            return (0, utility_functions_1.sendError)(res, 400, "Invalid id");
        }
        if (result.kind === "category_not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Tour category not found");
        }
        if (result.kind === "topic_not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Topic tour not found");
        }
        if (result.kind === "tour_not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Tour not found");
        }
        return res.json({
            code: 200,
            message: "Xóa tour thành công",
            data: result.tour,
        });
    }
    catch (error) {
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi xóa tour!");
    }
};
exports.deleteTour = deleteTour;
const restoreTour = async (req, res) => {
    try {
        const slugTopicTour = (0, utility_functions_1.getParamString)(req, "slugTopicTour");
        const slugTour = (0, utility_functions_1.getParamString)(req, "slugTour");
        const id = (0, utility_functions_1.getParamString)(req, "id");
        if (!slugTopicTour) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing slugTopicTour param");
        }
        if (!slugTour) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing slugTour param");
        }
        if (!id) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing id param");
        }
        const result = await tourCategoryService.restoreTourById(slugTopicTour, slugTour, id);
        if (result.kind === "invalid_id") {
            return (0, utility_functions_1.sendError)(res, 400, "Invalid id");
        }
        if (result.kind === "category_not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Tour category not found");
        }
        if (result.kind === "topic_not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Topic tour not found");
        }
        if (result.kind === "tour_not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Tour not found");
        }
        return res.json({
            code: 200,
            message: "Khôi phục tour thành công",
            data: result.tour,
        });
    }
    catch (error) {
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi khôi phục tour!");
    }
};
exports.restoreTour = restoreTour;
const bulkUpdateTours = async (req, res) => {
    try {
        const slugTopicTour = (0, utility_functions_1.getParamString)(req, "slugTopicTour");
        const slugTour = (0, utility_functions_1.getParamString)(req, "slugTour");
        if (!slugTopicTour) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing slugTopicTour param");
        }
        if (!slugTour) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing slugTour param");
        }
        const result = await tourCategoryService.bulkUpdateToursById(slugTopicTour, slugTour, {
            updates: req.body?.updates,
        });
        if (result.kind === "category_not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Tour category not found");
        }
        if (result.kind === "topic_not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Topic tour not found");
        }
        if (result.kind === "validation_error") {
            return (0, utility_functions_1.sendError)(res, 400, result.message);
        }
        return res.json({
            code: 200,
            message: "Cập nhật tour hàng loạt thành công",
            data: result.results,
        });
    }
    catch (error) {
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi cập nhật tour hàng loạt!");
    }
};
exports.bulkUpdateTours = bulkUpdateTours;
const bulkRestoreTours = async (req, res) => {
    try {
        const slugTopicTour = (0, utility_functions_1.getParamString)(req, "slugTopicTour");
        const slugTour = (0, utility_functions_1.getParamString)(req, "slugTour");
        if (!slugTopicTour) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing slugTopicTour param");
        }
        if (!slugTour) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing slugTour param");
        }
        const result = await tourCategoryService.bulkRestoreToursById(slugTopicTour, slugTour, {
            ids: req.body?.ids,
        });
        if (result.kind === "category_not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Tour category not found");
        }
        if (result.kind === "topic_not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Topic tour not found");
        }
        if (result.kind === "validation_error") {
            return (0, utility_functions_1.sendError)(res, 400, result.message);
        }
        return res.json({
            code: 200,
            message: "Khôi phục tour hàng loạt thành công",
            data: result.results,
        });
    }
    catch (error) {
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi khôi phục tour hàng loạt!");
    }
};
exports.bulkRestoreTours = bulkRestoreTours;
