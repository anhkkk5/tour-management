import { Request, Response } from "express";
import * as tourService from "../../services/tours/tour.service";
import { toTourDetailDTO } from "../../dtos/tour.dto";
import {
  getParamString,
  sendError,
} from "../../../../helpers/utility_functions";

// [Get] api/v1/tour/:slugTour
export const detail = async (req: Request, res: Response) => {
  const slugTourRaw = req.params.slugTour;
  const slugTour = Array.isArray(slugTourRaw) ? slugTourRaw[0] : slugTourRaw;

  if (!slugTour) {
    return sendError(res, 400, "Missing slugTour param");
  }

  const result = await tourService.getTourDetailBySlug(slugTour);

  if (result.kind === "not_found") {
    return sendError(res, 404, "Tour not found");
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

  return res.json(toTourDetailDTO(result));
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = getParamString(req, "id");

    if (!id) {
      return sendError(res, 400, "Missing id param");
    }

    const result = await tourService.updateTourById(id, {
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
      notes: req.body?.notes,
      status: req.body?.status,
    });

    if (result.kind === "invalid_id") {
      return sendError(res, 400, "Invalid id");
    }

    if (result.kind === "not_found") {
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
