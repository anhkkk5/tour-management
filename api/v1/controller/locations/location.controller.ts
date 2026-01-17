import { Request, Response } from "express";
import * as locationService from "../../services/locations/location.service";
import {
  getParamString,
  sendError,
} from "../../../../helpers/utility_functions";

export const index = async (req: Request, res: Response) => {
  const locations = await locationService.listLocations();
  return res.json({
    code: 200,
    data: locations,
  });
};

export const listDeleted = async (req: Request, res: Response) => {
  const locations = await locationService.getDeletedLocations();
  return res.json({
    code: 200,
    data: locations,
  });
};

export const detail = async (req: Request, res: Response) => {
  const id = getParamString(req, "id");

  if (!id) {
    return sendError(res, 400, "Missing id param");
  }

  const result = await locationService.getLocationById(id);

  if (result.kind === "invalid_id") {
    return sendError(res, 400, "Invalid id");
  }

  if (result.kind === "not_found") {
    return sendError(res, 404, "Location not found");
  }

  return res.json({
    code: 200,
    data: result.location,
  });
};

export const create = async (req: Request, res: Response) => {
  try {
    const result = await locationService.createLocation({
      name: req.body?.name,
      type: req.body?.type,
    });

    if (result.kind === "validation_error") {
      return sendError(res, 400, result.message);
    }

    if (result.kind === "duplicate_slug") {
      return sendError(res, 409, "Location slug already exists");
    }

    return res.json({
      code: 200,
      message: "Tạo location thành công",
      data: result.location,
    });
  } catch (error) {
    return sendError(res, 500, "Lỗi khi tạo location!");
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = getParamString(req, "id");

    if (!id) {
      return sendError(res, 400, "Missing id param");
    }

    const result = await locationService.updateLocationById(id, {
      name: req.body?.name,
      type: req.body?.type,
    });

    if (result.kind === "invalid_id") {
      return sendError(res, 400, "Invalid id");
    }

    if (result.kind === "not_found") {
      return sendError(res, 404, "Location not found");
    }

    if (result.kind === "validation_error") {
      return sendError(res, 400, result.message);
    }

    if (result.kind === "duplicate_slug") {
      return sendError(res, 409, "Location slug already exists");
    }

    return res.json({
      code: 200,
      message: "Cập nhật location thành công",
      data: result.location,
    });
  } catch (error) {
    return sendError(res, 500, "Lỗi khi cập nhật location!");
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = getParamString(req, "id");

    if (!id) {
      return sendError(res, 400, "Missing id param");
    }

    const result = await locationService.softDeleteLocationById(id);

    if (result.kind === "invalid_id") {
      return sendError(res, 400, "Invalid id");
    }

    if (result.kind === "not_found") {
      return sendError(res, 404, "Location not found");
    }

    return res.json({
      code: 200,
      message: "Xóa location thành công",
      data: result.location,
    });
  } catch (error) {
    return sendError(res, 500, "Lỗi khi xóa location!");
  }
};

export const restore = async (req: Request, res: Response) => {
  try {
    const id = getParamString(req, "id");

    if (!id) {
      return sendError(res, 400, "Missing id param");
    }

    const result = await locationService.restoreLocationById(id);

    if (result.kind === "invalid_id") {
      return sendError(res, 400, "Invalid id");
    }

    if (result.kind === "not_found") {
      return sendError(res, 404, "Location not found");
    }

    return res.json({
      code: 200,
      message: "Khôi phục location thành công",
      data: result.location,
    });
  } catch (error) {
    return sendError(res, 500, "Lỗi khi khôi phục location!");
  }
};
