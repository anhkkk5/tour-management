import tourCategoryModel from "../../models/tourCategory.model";

// [Get] api/v1/tourCategories
export const listTourCategories = async () => {
  return tourCategoryModel.find({
    deleted: false,
  });
};

// [Post] api/v1/tour_category/create
export const createTourCategory = async (payload: {
  title?: string;
  thumbnail?: string;
  description?: string;
}) => {
  if (!payload?.title) {
    return { kind: "validation_error" as const, message: "Missing title" };
  }

  const tourCategory = new tourCategoryModel({
    title: payload.title,
    thumbnail: payload.thumbnail,
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
