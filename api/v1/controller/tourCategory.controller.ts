import { Request, Response } from "express";
import * as tourCategoryService from "../services/tourCategory/tourCategory.service";
// [Get] api/v1/tourCategories
export const index = async (req: Request, res: Response) => {
  const tourCategories = await tourCategoryService.listTourCategories();
  return res.json({
    code: 200,
    data: tourCategories,
  });
};
// [Get] api/v1/tourCategories/:slugTopicTour
export const listTourCategory = async (req: Request, res: Response) => {
  const slugTopicTourRaw = req.params.slugTopicTour;
  const slugTopicTour = Array.isArray(slugTopicTourRaw)
    ? slugTopicTourRaw[0]
    : slugTopicTourRaw;

  if (!slugTopicTour) {
    return res.status(400).json({
      message: "Missing slugTopicTour param",
    });
  }

  const result = await tourCategoryService.getTopicToursByCategorySlug(
    slugTopicTour
  );

  if (result.kind === "category_not_found") {
    return res.status(404).json({
      message: "Tour category not found",
    });
  }

  return res.json({
    code: 200,
    data: result.topicTours,
  });
};

// [Get] api/v1/tourCategories/:slugTopicTour/:slugTour
export const listTourTopic = async (req: Request, res: Response) => {
  const slugTopicTourRaw = req.params.slugTopicTour;
  const slugTourRaw = req.params.slugTour;

  const slugTopicTour = Array.isArray(slugTopicTourRaw)
    ? slugTopicTourRaw[0]
    : slugTopicTourRaw;
  const slugTour = Array.isArray(slugTourRaw) ? slugTourRaw[0] : slugTourRaw;

  if (!slugTopicTour) {
    return res.status(400).json({
      message: "Missing slugTopicTour param",
    });
  }

  if (!slugTour) {
    return res.status(400).json({
      message: "Missing slugTour param",
    });
  }

  const result = await tourCategoryService.getToursByCategorySlugAndTopicSlug(
    slugTopicTour,
    slugTour
  );

  if (result.kind === "category_not_found") {
    return res.status(404).json({
      message: "Tour category not found",
    });
  }

  if (result.kind === "topic_not_found") {
    return res.status(404).json({
      message: "Topic tour not found",
    });
  }

  return res.json({
    code: 200,
    data: result.tours,
  });
};
