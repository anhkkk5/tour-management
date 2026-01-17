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

export const listDeletedTours = async (req: Request, res: Response) => {
  const slugTopicTour = getParamString(req, "slugTopicTour");
  const slugTour = getParamString(req, "slugTour");

  if (!slugTopicTour) {
    return sendError(res, 400, "Missing slugTopicTour param");
  }

  if (!slugTour) {
    return sendError(res, 400, "Missing slugTour param");
  }

  const result =
    await tourCategoryService.getDeletedToursByCategorySlugAndTopicSlug(
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

export const createTour = async (req: Request, res: Response) => {
  try {
    const slugTopicTour = getParamString(req, "slugTopicTour");
    const slugTour = getParamString(req, "slugTour");

    if (!slugTopicTour) {
      return sendError(res, 400, "Missing slugTopicTour param");
    }

    if (!slugTour) {
      return sendError(res, 400, "Missing slugTour param");
    }

    const result = await tourCategoryService.createTour(
      slugTopicTour,
      slugTour,
      {
        title: req.body?.title,
        thumbnail: req.body?.thumbnail,
        images: req.body?.images,
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
      return sendError(res, 409, "Tour slug already exists");
    }

    return res.json({
      code: 200,
      message: "Tạo tour thành công",
      data: result.tour,
    });
  } catch (error) {
    return sendError(res, 500, "Lỗi khi tạo tour!");
  }
};

export const updateTour = async (req: Request, res: Response) => {
  try {
    const slugTopicTour = getParamString(req, "slugTopicTour");
    const slugTour = getParamString(req, "slugTour");
    const id = getParamString(req, "id");

    if (!slugTopicTour) {
      return sendError(res, 400, "Missing slugTopicTour param");
    }

    if (!slugTour) {
      return sendError(res, 400, "Missing slugTour param");
    }

    if (!id) {
      return sendError(res, 400, "Missing id param");
    }

    const result = await tourCategoryService.updateTourById(
      slugTopicTour,
      slugTour,
      id,
      {
        title: req.body?.title,
        thumbnail: req.body?.thumbnail,
        images: req.body?.images,
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

    if (result.kind === "tour_not_found") {
      return sendError(res, 404, "Tour not found");
    }

    if (result.kind === "validation_error") {
      return sendError(res, 400, result.message);
    }

    if (result.kind === "duplicate_slug") {
      return sendError(res, 409, "Tour slug already exists");
    }

    return res.json({
      code: 200,
      message: "Cập nhật tour thành công",
      data: result.tour,
    });
  } catch (error) {
    return sendError(res, 500, "Lỗi khi cập nhật tour!");
  }
};

export const deleteTour = async (req: Request, res: Response) => {
  try {
    const slugTopicTour = getParamString(req, "slugTopicTour");
    const slugTour = getParamString(req, "slugTour");
    const id = getParamString(req, "id");

    if (!slugTopicTour) {
      return sendError(res, 400, "Missing slugTopicTour param");
    }

    if (!slugTour) {
      return sendError(res, 400, "Missing slugTour param");
    }

    if (!id) {
      return sendError(res, 400, "Missing id param");
    }

    const result = await tourCategoryService.softDeleteTourById(
      slugTopicTour,
      slugTour,
      id
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

    if (result.kind === "tour_not_found") {
      return sendError(res, 404, "Tour not found");
    }

    return res.json({
      code: 200,
      message: "Xóa tour thành công",
      data: result.tour,
    });
  } catch (error) {
    return sendError(res, 500, "Lỗi khi xóa tour!");
  }
};

export const restoreTour = async (req: Request, res: Response) => {
  try {
    const slugTopicTour = getParamString(req, "slugTopicTour");
    const slugTour = getParamString(req, "slugTour");
    const id = getParamString(req, "id");

    if (!slugTopicTour) {
      return sendError(res, 400, "Missing slugTopicTour param");
    }

    if (!slugTour) {
      return sendError(res, 400, "Missing slugTour param");
    }

    if (!id) {
      return sendError(res, 400, "Missing id param");
    }

    const result = await tourCategoryService.restoreTourById(
      slugTopicTour,
      slugTour,
      id
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

    if (result.kind === "tour_not_found") {
      return sendError(res, 404, "Tour not found");
    }

    return res.json({
      code: 200,
      message: "Khôi phục tour thành công",
      data: result.tour,
    });
  } catch (error) {
    return sendError(res, 500, "Lỗi khi khôi phục tour!");
  }
};

export const bulkUpdateTours = async (req: Request, res: Response) => {
  try {
    const slugTopicTour = getParamString(req, "slugTopicTour");
    const slugTour = getParamString(req, "slugTour");

    if (!slugTopicTour) {
      return sendError(res, 400, "Missing slugTopicTour param");
    }

    if (!slugTour) {
      return sendError(res, 400, "Missing slugTour param");
    }

    const result = await tourCategoryService.bulkUpdateToursById(
      slugTopicTour,
      slugTour,
      {
        updates: req.body?.updates,
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

    return res.json({
      code: 200,
      message: "Cập nhật tour hàng loạt thành công",
      data: result.results,
    });
  } catch (error) {
    return sendError(res, 500, "Lỗi khi cập nhật tour hàng loạt!");
  }
};

export const bulkRestoreTours = async (req: Request, res: Response) => {
  try {
    const slugTopicTour = getParamString(req, "slugTopicTour");
    const slugTour = getParamString(req, "slugTour");

    if (!slugTopicTour) {
      return sendError(res, 400, "Missing slugTopicTour param");
    }

    if (!slugTour) {
      return sendError(res, 400, "Missing slugTour param");
    }

    const result = await tourCategoryService.bulkRestoreToursById(
      slugTopicTour,
      slugTour,
      {
        ids: req.body?.ids,
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

    return res.json({
      code: 200,
      message: "Khôi phục tour hàng loạt thành công",
      data: result.results,
    });
  } catch (error) {
    return sendError(res, 500, "Lỗi khi khôi phục tour hàng loạt!");
  }
};
