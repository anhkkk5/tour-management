import { Request, Response } from "express";
import * as tourCategoryService from "../../services/tourCategory/tourCategory.service";
import {
  getParamString,
  sendError,
} from "../../../../helpers/utility_functions";

export const listTourCategory = async (req: Request, res: Response) => {
  const slugTopicTour = getParamString(req, "slugTopicTour");

  if (!slugTopicTour) {
    return sendError(res, 400, "Missing slugTopicTour param");
  }

  const result = await tourCategoryService.getTopicToursByCategorySlug(
    slugTopicTour
  );

  if (result.kind === "category_not_found") {
    return sendError(res, 404, "Tour category not found");
  }

  return res.json({
    code: 200,
    data: result.topicTours,
  });
};

export const createTopicTour = async (req: Request, res: Response) => {
  try {
    const slugTopicTour = getParamString(req, "slugTopicTour");

    if (!slugTopicTour) {
      return sendError(res, 400, "Missing slugTopicTour param");
    }

    const result = await tourCategoryService.createTopicTour(slugTopicTour, {
      title: req.body?.title,
      thumbnail: req.body?.thumbnail,
      description: req.body?.description,
    });

    if (result.kind === "category_not_found") {
      return sendError(res, 404, "Tour category not found");
    }

    if (result.kind === "validation_error") {
      return sendError(res, 400, result.message);
    }

    return res.json({
      code: 200,
      message: "Tạo topic tour thành công",
      data: result.topicTour,
    });
  } catch (error) {
    return sendError(res, 500, "Lỗi khi tạo topic tour!");
  }
};
