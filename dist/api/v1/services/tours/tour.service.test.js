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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const tourService = __importStar(require("./tour.service"));
const tour_model_1 = __importDefault(require("../../models/tour/tour.model"));
const tour_relation_service_1 = require("./tour.relation.service");
const tour_schedule_service_1 = require("./tour.schedule.service");
const tour_policy_service_1 = require("./tour.policy.service");
// Mock dependencies
jest.mock("../../models/tour.model");
jest.mock("./tour.relation.service");
jest.mock("./tour.schedule.service");
jest.mock("./tour.policy.service");
describe("Tour Service", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe("getTourDetailBySlug", () => {
        it("should return ok with tour data when found", async () => {
            const mockTour = {
                toObject: jest
                    .fn()
                    .mockReturnValue({ _id: "tour1", slug: "test-tour" }),
            };
            tour_model_1.default.findOne.mockResolvedValue(mockTour);
            tour_relation_service_1.loadTourRelations.mockResolvedValue({
                someRelation: true,
            });
            tour_schedule_service_1.getTourSchedules.mockResolvedValue([]);
            tour_policy_service_1.getTourPolicy.mockResolvedValue({});
            const result = await tourService.getTourDetailBySlug("test-tour");
            expect(result).toEqual({
                kind: "ok",
                tour: { _id: "tour1", slug: "test-tour" },
                someRelation: true,
                schedules: [],
                policy: {},
            });
            expect(tour_model_1.default.findOne).toHaveBeenCalledWith({
                deleted: false,
                slug: "test-tour",
            });
        });
        it("should return not_found when tour does not exist", async () => {
            tour_model_1.default.findOne.mockResolvedValue(null);
            const result = await tourService.getTourDetailBySlug("non-existent");
            expect(result).toEqual({ kind: "not_found" });
        });
    });
    describe("updateTourById", () => {
        const validId = new mongoose_1.default.Types.ObjectId().toString();
        it("should return invalid_id if id is not valid ObjectId", async () => {
            const result = await tourService.updateTourById("invalid", {});
            expect(result).toEqual({ kind: "invalid_id" });
        });
        it("should return not_found if tour does not exist", async () => {
            tour_model_1.default.findOne.mockResolvedValue(null);
            const result = await tourService.updateTourById(validId, {});
            expect(result).toEqual({ kind: "not_found" });
        });
        it("should return validation_error if title is empty string", async () => {
            tour_model_1.default.findOne.mockResolvedValue({ _id: validId });
            const result = await tourService.updateTourById(validId, { title: "" });
            expect(result).toEqual({
                kind: "validation_error",
                message: "Missing title",
            });
        });
        it("should update simple fields correctly", async () => {
            const mockSave = jest
                .fn()
                .mockResolvedValue({ _id: validId, title: "New Title" });
            const mockTour = {
                _id: validId,
                title: "Old Title",
                save: mockSave,
            };
            tour_model_1.default.findOne.mockResolvedValue(mockTour);
            const result = await tourService.updateTourById(validId, {
                title: "New Title",
            });
            expect(mockTour.title).toBe("New Title");
            expect(mockSave).toHaveBeenCalled();
            expect(result).toEqual({
                kind: "ok",
                tour: { _id: validId, title: "New Title" },
            });
        });
        it("should return validation_error for invalid departureId", async () => {
            const mockTour = { _id: validId };
            tour_model_1.default.findOne.mockResolvedValue(mockTour);
            const result = await tourService.updateTourById(validId, {
                departureId: "invalid",
            });
            expect(result).toEqual({
                kind: "validation_error",
                message: "Invalid departureId",
            });
        });
        it("should handle duplicate slug error", async () => {
            const mockSave = jest.fn().mockRejectedValue({ code: 11000 });
            const mockTour = {
                _id: validId,
                save: mockSave,
            };
            tour_model_1.default.findOne.mockResolvedValue(mockTour);
            const result = await tourService.updateTourById(validId, {
                title: "Duplicate",
            });
            expect(result).toEqual({ kind: "duplicate_slug" });
        });
    });
});
