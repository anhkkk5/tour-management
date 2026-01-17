import { Request, Response } from "express";
import * as tourCategoryService from "../../services/tourCategory/tourCategory.service";
import {
  getParamString,
  sendError,
} from "../../../../helpers/utility_functions";
// [Get] api/v1/tourCategories
export const index = async (req: Request, res: Response) => {
  const tourCategories = await tourCategoryService.listTourCategories();
  return res.json({
    code: 200,
    data: tourCategories,
  });
};

// [Post] api/v1/tour_category/create
export const createTourCategory = async (req: Request, res: Response) => {
  try {
    const result = await tourCategoryService.createTourCategory({
      title: req.body?.title,
      thumbnail: req.body?.thumbnail,
      description: req.body?.description,
    });

    if (result.kind === "validation_error") {
      return sendError(res, 400, result.message);
    }

    if (result.kind === "duplicate_slug") {
      return sendError(res, 409, "Tour category slug already exists");
    }

    return res.json({
      code: 200,
      message: "Tạo tour category thành công",
      data: result.tourCategory,
    });
  } catch (error) {
    return sendError(res, 500, "Lỗi khi tạo tour category!");
  }
};

// [Patch] api/v1/tour_category/edit/:id
export const updateTourCategory = async (req: Request, res: Response) => {
  try {
    const id = getParamString(req, "id");

    if (!id) {
      return sendError(res, 400, "Missing id param");
    }

    const result = await tourCategoryService.updateTourCategoryById(id, {
      title: req.body?.title,
      thumbnail: req.body?.thumbnail,
      description: req.body?.description,
    });

    if (result.kind === "invalid_id") {
      return sendError(res, 400, "Invalid id");
    }

    if (result.kind === "not_found") {
      return sendError(res, 404, "Tour category not found");
    }

    if (result.kind === "validation_error") {
      return sendError(res, 400, result.message);
    }

    if (result.kind === "duplicate_slug") {
      return sendError(res, 409, "Tour category slug already exists");
    }

    return res.json({
      code: 200,
      message: "Cập nhật tour category thành công",
      data: result.tourCategory,
    });
  } catch (error) {
    return sendError(res, 500, "Lỗi khi cập nhật tour category!");
  }
};

// [Patch] api/v1/tour_category/bulk
export const bulkUpdateTourCategories = async (req: Request, res: Response) => {
  try {
    const result = await tourCategoryService.bulkUpdateTourCategoriesById({
      updates: req.body?.updates,
    });

    if (result.kind === "validation_error") {
      return sendError(res, 400, result.message);
    }

    return res.json({
      code: 200,
      message: "Cập nhật tour category hàng loạt thành công",
      data: result.results,
    });
  } catch (error) {
    return sendError(res, 500, "Lỗi khi cập nhật tour category hàng loạt!");
  }
};

// [Patch] api/v1/tour_category/delete/:id
export const deleteTourCategory = async (req: Request, res: Response) => {
  try {
    const id = getParamString(req, "id");

    if (!id) {
      return sendError(res, 400, "Missing id param");
    }

    const result = await tourCategoryService.softDeleteTourCategoryById(id);

    if (result.kind === "invalid_id") {
      return sendError(res, 400, "Invalid id");
    }

    if (result.kind === "not_found") {
      return sendError(res, 404, "Tour category not found");
    }

    return res.json({
      code: 200,
      message: "Xóa tour category thành công",
      data: result.tourCategory,
    });
  } catch (error) {
    return sendError(res, 500, "Lỗi khi xóa tour category!");
  }
};

export const listDeletedTourCategories = async (
  req: Request,
  res: Response
) => {
  const tourCategories = await tourCategoryService.getDeletedTourCategories();
  return res.json({
    code: 200,
    data: tourCategories,
  });
};

export const restoreTourCategory = async (req: Request, res: Response) => {
  try {
    const id = getParamString(req, "id");

    if (!id) {
      return sendError(res, 400, "Missing id param");
    }

    const result = await tourCategoryService.restoreTourCategoryById(id);

    if (result.kind === "invalid_id") {
      return sendError(res, 400, "Invalid id");
    }

    if (result.kind === "not_found") {
      return sendError(res, 404, "Tour category not found");
    }

    return res.json({
      code: 200,
      message: "Khôi phục tour category thành công",
      data: result.tourCategory,
    });
  } catch (error) {
    return sendError(res, 500, "Lỗi khi khôi phục tour category!");
  }
};

export const bulkRestoreTourCategories = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await tourCategoryService.bulkRestoreTourCategoriesById({
      ids: req.body?.ids,
    });

    if (result.kind === "validation_error") {
      return sendError(res, 400, result.message);
    }

    return res.json({
      code: 200,
      message: "Khôi phục tour category hàng loạt thành công",
      data: result.results,
    });
  } catch (error) {
    return sendError(res, 500, "Lỗi khi khôi phục tour category hàng loạt!");
  }
};
