import { Request, Response } from "express";
import * as tourCategoryService from "../../services/tourCategory/tourCategory.service";
import {
  getParamString,
  sendError,
} from "../../../../helpers/utility_functions";

// [Get] api/v1/tour_category/:slugTopicTour/:slugTour
export const listTour = async (req: Request, res: Response) => {
  const slugTopicTour = getParamString(req, "slugTopicTour");
  const slugTour = getParamString(req, "slugTour");

  if (!slugTopicTour) {
    return sendError(res, 400, "Missing slugTopicTour param");
  }

  if (!slugTour) {
    return sendError(res, 400, "Missing slugTour param");
  }

  const result = await tourCategoryService.getToursByCategorySlugAndTopicSlug(
    slugTopicTour,
    slugTour
  );

  if (result.kind === "category_not_found") {
    return sendError(res, 404, "Tour category not found");
  }

  if (result.kind === "topic_not_found") {
    return sendError(res, 404, "Topic tour not found");
  }

  return res.json({
    code: 200,
    data: result.tours,
  });
};
