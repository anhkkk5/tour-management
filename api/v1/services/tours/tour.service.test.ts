import mongoose from "mongoose";
import * as tourService from "./tour.service";
import Tour from "../../models/tour/tour.model";
import { loadTourRelations } from "./tour.relation.service";
import { getTourSchedules } from "./tour.schedule.service";
import { getTourPolicy } from "./tour.policy.service";

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
      (Tour.findOne as jest.Mock).mockResolvedValue(mockTour);
      (loadTourRelations as jest.Mock).mockResolvedValue({
        someRelation: true,
      });
      (getTourSchedules as jest.Mock).mockResolvedValue([]);
      (getTourPolicy as jest.Mock).mockResolvedValue({});

      const result = await tourService.getTourDetailBySlug("test-tour");

      expect(result).toEqual({
        kind: "ok",
        tour: { _id: "tour1", slug: "test-tour" },
        someRelation: true,
        schedules: [],
        policy: {},
      });
      expect(Tour.findOne).toHaveBeenCalledWith({
        deleted: false,
        slug: "test-tour",
      });
    });

    it("should return not_found when tour does not exist", async () => {
      (Tour.findOne as jest.Mock).mockResolvedValue(null);

      const result = await tourService.getTourDetailBySlug("non-existent");

      expect(result).toEqual({ kind: "not_found" });
    });
  });

  describe("updateTourById", () => {
    const validId = new mongoose.Types.ObjectId().toString();

    it("should return invalid_id if id is not valid ObjectId", async () => {
      const result = await tourService.updateTourById("invalid", {});
      expect(result).toEqual({ kind: "invalid_id" });
    });

    it("should return not_found if tour does not exist", async () => {
      (Tour.findOne as jest.Mock).mockResolvedValue(null);
      const result = await tourService.updateTourById(validId, {});
      expect(result).toEqual({ kind: "not_found" });
    });

    it("should return validation_error if title is empty string", async () => {
      (Tour.findOne as jest.Mock).mockResolvedValue({ _id: validId });
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
      (Tour.findOne as jest.Mock).mockResolvedValue(mockTour);

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
      (Tour.findOne as jest.Mock).mockResolvedValue(mockTour);

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
      (Tour.findOne as jest.Mock).mockResolvedValue(mockTour);

      const result = await tourService.updateTourById(validId, {
        title: "Duplicate",
      });

      expect(result).toEqual({ kind: "duplicate_slug" });
    });
  });
});
