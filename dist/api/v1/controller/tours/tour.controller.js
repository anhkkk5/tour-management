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
exports.update = exports.detail = void 0;
const tourService = __importStar(require("../../services/tours/tour.service"));
const tour_dto_1 = require("../../dtos/tour.dto");
const utility_functions_1 = require("../../../../helpers/utility_functions");
// [Get] api/v1/tour/:slugTour
const detail = async (req, res) => {
    const slugTourRaw = req.params.slugTour;
    const slugTour = Array.isArray(slugTourRaw) ? slugTourRaw[0] : slugTourRaw;
    if (!slugTour) {
        return (0, utility_functions_1.sendError)(res, 400, "Missing slugTour param");
    }
    const result = await tourService.getTourDetailBySlug(slugTour);
    if (result.kind === "not_found") {
        return (0, utility_functions_1.sendError)(res, 404, "Tour not found");
    }
    const raw = req.query.raw === "1" || req.query.raw === "true";
    if (raw) {
        return res.json({
            code: 200,
            data: {
                tour: result.tour,
                topicTour: result.topicTour,
                departure: result.departure,
                destinations: result.destinations,
                schedules: result.schedules,
                policy: result.policy,
            },
        });
    }
    return res.json((0, tour_dto_1.toTourDetailDTO)(result));
};
exports.detail = detail;
const update = async (req, res) => {
    try {
        const id = (0, utility_functions_1.getParamString)(req, "id");
        if (!id) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing id param");
        }
        const result = await tourService.updateTourById(id, {
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
            notes: req.body?.notes,
            status: req.body?.status,
        });
        if (result.kind === "invalid_id") {
            return (0, utility_functions_1.sendError)(res, 400, "Invalid id");
        }
        if (result.kind === "not_found") {
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
exports.update = update;
