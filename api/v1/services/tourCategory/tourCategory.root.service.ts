import mongoose from "mongoose";
import tourCategoryModel from "../../models/tourCategory/tourCategory.model";

// [Get] api/v1/tourCategories
export const listTourCategories = async () => {
  return tourCategoryModel.find({
    deleted: false,
  });
};

// [Post] api/v1/tour_category/create
export const createTourCategory = async (payload: {
  title?: string;
  description?: string;
}) => {
  if (!payload?.title) {
    return { kind: "validation_error" as const, message: "Missing title" };
  }

  const tourCategory = new tourCategoryModel({
    title: payload.title,
    description: payload.description,
  });

  try {
    const data = await tourCategory.save();
    return {
      kind: "ok" as const,
      tourCategory: data,
    };
  } catch (error: any) {
    if (error?.code === 11000) {
      return { kind: "duplicate_slug" as const };
    }
    throw error;
  }
};

// [Patch] api/v1/tour_category/edit/{id}
export const updateTourCategoryById = async (
  id: string,
  payload: {
    title?: string;
    description?: string;
  },
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { kind: "invalid_id" as const };
  }

  const tourCategory = await tourCategoryModel.findOne({
    _id: id,
    deleted: false,
  });

  if (!tourCategory) {
    return { kind: "not_found" as const };
  }

  if (payload?.title !== undefined && !payload.title) {
    return { kind: "validation_error" as const, message: "Missing title" };
  }

  if (payload?.title !== undefined) tourCategory.title = payload.title;
  if (payload?.description !== undefined)
    tourCategory.description = payload.description;

  try {
    const data = await tourCategory.save();
    return {
      kind: "ok" as const,
      tourCategory: data,
    };
  } catch (error: any) {
    if (error?.code === 11000) {
      return { kind: "duplicate_slug" as const };
    }
    throw error;
  }
};

// [Patch] api/v1/tour_category/bulk
export const bulkUpdateTourCategoriesById = async (payload: {
  updates?: Array<{
    id?: string;
    title?: string;
    description?: string;
  }>;
}) => {
  if (!Array.isArray(payload?.updates) || payload.updates.length === 0) {
    return {
      kind: "validation_error" as const,
      message: "Missing updates",
    };
  }

  const results = await Promise.all(
    payload.updates.map(async (u) => {
      if (!u?.id) {
        return { id: u?.id ?? null, kind: "validation_error" as const };
      }

      const result = await updateTourCategoryById(u.id, {
        title: u.title,
        description: u.description,
      });

      return { id: u.id, ...result };
    }),
  );

  return {
    kind: "ok" as const,
    results,
  };
};

// [Patch] api/v1/tour_category/delete/{id}
export const softDeleteTourCategoryById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { kind: "invalid_id" as const };
  }

  const tourCategory = await tourCategoryModel.findOne({
    _id: id,
    deleted: false,
  });

  if (!tourCategory) {
    return { kind: "not_found" as const };
  }

  tourCategory.deleted = true;
  tourCategory.deleteAt = new Date();

  const data = await tourCategory.save();

  return {
    kind: "ok" as const,
    tourCategory: data,
  };
};

// [Get] api/v1/tour_category/deleted
export const getDeletedTourCategories = async () => {
  return tourCategoryModel.find({
    deleted: true,
  });
};

// [Patch] api/v1/tour_category/restore/{id}
export const restoreTourCategoryById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { kind: "invalid_id" as const };
  }

  const tourCategory = await tourCategoryModel.findOne({
    _id: id,
    deleted: true,
  });

  if (!tourCategory) {
    return { kind: "not_found" as const };
  }

  tourCategory.deleted = false;
  tourCategory.deleteAt = undefined;

  const data = await tourCategory.save();

  return {
    kind: "ok" as const,
    tourCategory: data,
  };
};

// [Patch] api/v1/tour_category/restore/bulk
export const bulkRestoreTourCategoriesById = async (payload: {
  ids?: string[];
}) => {
  if (!Array.isArray(payload?.ids) || payload.ids.length === 0) {
    return {
      kind: "validation_error" as const,
      message: "Missing ids",
    };
  }

  const results = await Promise.all(
    payload.ids.map(async (id) => {
      const result = await restoreTourCategoryById(id);
      return { id, ...result };
    }),
  );

  return {
    kind: "ok" as const,
    results,
  };
};
