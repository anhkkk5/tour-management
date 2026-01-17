import { Request, Response } from "express";
import {
  getParamString,
  sendError,
} from "../../../../helpers/utility_functions";
import * as scheduleService from "../../services/tours/tour.schedule.crud.service";

export const listSchedulesByTour = async (req: Request, res: Response) => {
  try {
    const tourId = getParamString(req, "tourId");

    if (!tourId) {
      return sendError(res, 400, "Missing tourId param");
    }

    const result = await scheduleService.listTourSchedulesByTourId(tourId);

    if (result.kind === "invalid_id") {
      return sendError(res, 400, "Invalid tourId");
    }

    return res.json({
      code: 200,
      data: result.schedules,
    });
  } catch (error) {
    console.error("List Schedules Error:", error);
    return sendError(res, 500, "Lỗi khi lấy danh sách tour schedule!");
  }
};

export const getSchedule = async (req: Request, res: Response) => {
  try {
    const id = getParamString(req, "id");

    if (!id) {
      return sendError(res, 400, "Missing id param");
    }

    const result = await scheduleService.getTourScheduleById(id);

    if (result.kind === "invalid_id") {
      return sendError(res, 400, "Invalid id");
    }

    if (result.kind === "not_found") {
      return sendError(res, 404, "Tour schedule not found");
    }

    return res.json({
      code: 200,
      data: result.schedule,
    });
  } catch (error) {
    console.error("Get Schedule Error:", error);
    return sendError(res, 500, "Lỗi khi lấy thông tin tour schedule!");
  }
};

export const createSchedule = async (req: Request, res: Response) => {
  try {
    const tourId = getParamString(req, "tourId");

    if (!tourId) {
      return sendError(res, 400, "Missing tourId param");
    }

    const result = await scheduleService.createTourSchedule(tourId, {
      startDate: req.body?.startDate,
      endDate: req.body?.endDate,
      capacity: req.body?.capacity,
      bookedSeats: req.body?.bookedSeats,
      prices: req.body?.prices,
      bookingDeadline: req.body?.bookingDeadline,
      notes: req.body?.notes,
      status: req.body?.status,
    });

    if (result.kind === "invalid_id") {
      return sendError(res, 400, "Invalid tourId");
    }

    if (result.kind === "validation_error") {
      return sendError(res, 400, result.message);
    }

    return res.json({
      code: 200,
      message: "Tạo tour schedule thành công",
      data: result.schedule,
    });
    return sendError(res, 500, "Lỗi khi tạo tour schedule!");
  } catch (error) {
    console.error("Create Schedule Error:", error);
    return sendError(res, 500, "Lỗi khi tạo tour schedule!");
  }
};

export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const id = getParamString(req, "id");

    if (!id) {
      return sendError(res, 400, "Missing id param");
    }

    const result = await scheduleService.updateTourScheduleById(id, {
      startDate: req.body?.startDate,
      endDate: req.body?.endDate,
      capacity: req.body?.capacity,
      bookedSeats: req.body?.bookedSeats,
      prices: req.body?.prices,
      bookingDeadline: req.body?.bookingDeadline,
      notes: req.body?.notes,
      status: req.body?.status,
    });

    if (result.kind === "invalid_id") {
      return sendError(res, 400, "Invalid id");
    }

    if (result.kind === "not_found") {
      return sendError(res, 404, "Tour schedule not found");
    }

    if (result.kind === "validation_error") {
      return sendError(res, 400, result.message);
    }

    return res.json({
      code: 200,
      message: "Cập nhật tour schedule thành công",
      data: result.schedule,
    });
  } catch (error) {
    return sendError(res, 500, "Lỗi khi cập nhật tour schedule!");
  }
};

export const deleteSchedule = async (req: Request, res: Response) => {
  try {
    const id = getParamString(req, "id");

    if (!id) {
      return sendError(res, 400, "Missing id param");
    }

    const result = await scheduleService.softDeleteTourScheduleById(id);

    if (result.kind === "invalid_id") {
      return sendError(res, 400, "Invalid id");
    }

    if (result.kind === "not_found") {
      return sendError(res, 404, "Tour schedule not found");
    }

    return res.json({
      code: 200,
      message: "Xóa tour schedule thành công",
      data: result.schedule,
    });
  } catch (error) {
    return sendError(res, 500, "Lỗi khi xóa tour schedule!");
  }
};

export const restoreSchedule = async (req: Request, res: Response) => {
  try {
    const id = getParamString(req, "id");

    if (!id) {
      return sendError(res, 400, "Missing id param");
    }

    const result = await scheduleService.restoreTourScheduleById(id);

    if (result.kind === "invalid_id") {
      return sendError(res, 400, "Invalid id");
    }

    if (result.kind === "not_found") {
      return sendError(res, 404, "Tour schedule not found");
    }

    return res.json({
      code: 200,
      message: "Khôi phục tour schedule thành công",
      data: result.schedule,
    });
  } catch (error) {
    return sendError(res, 500, "Lỗi khi khôi phục tour schedule!");
  }
};
