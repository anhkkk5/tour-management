import { Request, Response } from "express";
import * as tourCategoryService from "../../services/tourCategory/tourCategory.service";
import { sendError } from "../../../../helpers/utility_functions";

export const index = async (req: Request, res: Response) => {
  const tourCategories = await tourCategoryService.listTourCategories();
  return res.json({
    code: 200,
    data: tourCategories,
  });
};

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
