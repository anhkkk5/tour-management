import { Request, Response } from "express";
import * as tourCategoryService from "../../services/tourCategory/tourCategory.service";
import {
  getParamString,
  sendError,
} from "../../../../helpers/utility_functions";

// [Get] api/v1/tour_category/:slugTopicTour
export const listTourTopic = async (req: Request, res: Response) => {
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

// [Post] api/v1/tour_category/:slugTopicTour/create
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

// [Patch] api/v1/tour_category/:slugTopicTour/edit/:id
export const updateTopicTour = async (req: Request, res: Response) => {
  try {
    const slugTopicTour = getParamString(req, "slugTopicTour");
    const id = getParamString(req, "id");

    if (!slugTopicTour) {
      return sendError(res, 400, "Missing slugTopicTour param");
    }

    if (!id) {
      return sendError(res, 400, "Missing id param");
    }

    const result = await tourCategoryService.updateTopicTourById(
      slugTopicTour,
      id,
      {
        title: req.body?.title,
        thumbnail: req.body?.thumbnail,
        description: req.body?.description,
      }
    );

    if (result.kind === "invalid_id") {
      return sendError(res, 400, "Invalid id");
    }

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

// [Patch] api/v1/tour_category/:slugTopicTour/bulk
export const bulkUpdateTopicTours = async (req: Request, res: Response) => {
  try {
    const slugTopicTour = getParamString(req, "slugTopicTour");

    if (!slugTopicTour) {
      return sendError(res, 400, "Missing slugTopicTour param");
    }

    const result = await tourCategoryService.bulkUpdateTopicToursById(
      slugTopicTour,
      {
        updates: req.body?.updates,
      }
    );

    if (result.kind === "category_not_found") {
      return sendError(res, 404, "Tour category not found");
    }

    if (result.kind === "validation_error") {
      return sendError(res, 400, result.message);
    }

    return res.json({
      code: 200,
      message: "Cập nhật topic tour hàng loạt thành công",
      data: result.results,
    });
  } catch (error) {
    return sendError(res, 500, "Lỗi khi cập nhật topic tour hàng loạt!");
  }
};
