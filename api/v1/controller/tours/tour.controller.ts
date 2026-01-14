import { Request, Response } from "express";
import * as tourService from "../../services/tour/tour.service";
import { toTourDetailDTO } from "../../dtos/tour.dto";
import { sendError } from "../../../../helpers/utility_functions";

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
