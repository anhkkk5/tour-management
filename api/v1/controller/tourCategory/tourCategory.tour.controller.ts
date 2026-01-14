import { Request, Response } from "express";
import * as tourCategoryService from "../../services/tourCategory/tourCategory.service";
import {
  getParamString,
  sendError,
} from "../../../../helpers/utility_functions";

export const listTourTopic = async (req: Request, res: Response) => {
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

export const updateTopicTour = async (req: Request, res: Response) => {
  try {
    const slugTopicTour = getParamString(req, "slugTopicTour");
    const slugTour = getParamString(req, "slugTour");

    if (!slugTopicTour) {
      return sendError(res, 400, "Missing slugTopicTour param");
    }

    if (!slugTour) {
      return sendError(res, 400, "Missing slugTour param");
    }

    const result = await tourCategoryService.updateTopicTour(
      slugTopicTour,
      slugTour,
      {
        title: req.body?.title,
        thumbnail: req.body?.thumbnail,
        description: req.body?.description,
      }
    );

    if (result.kind === "category_not_found") {
      return sendError(res, 404, "Tour category not found");
    }

    if (result.kind === "topic_not_found") {
      return sendError(res, 404, "Topic tour not found");
    }

    if (result.kind === "validation_error") {
      return sendError(res, 400, result.message);
    }

    if (result.kind === "duplicate_slug") {
      return sendError(res, 409, "Topic tour slug already exists");
    }

    return res.json({
      code: 200,
      message: "Cập nhật topic tour thành công",
      data: result.topicTour,
    });
  } catch (error) {
    return sendError(res, 500, "Lỗi khi cập nhật topic tour!");
  }
};
