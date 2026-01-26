import mongoose from "mongoose";
import tourCategoryModel from "../../models/tourCategory/tourCategory.model";
import TopicTour from "../../models/topicTour/topicTour.model";
import { deleteFromCloudinary } from "../../../../helpers/uploadToCloudinary";

// [Get] api/v1/tourCategories/:slugTopicTour
export const getTopicToursByCategorySlug = async (categorySlug: string) => {
  const tourCategory = await tourCategoryModel.findOne({
    deleted: false,
    slug: categorySlug,
  });

  if (!tourCategory) {
    return { kind: "category_not_found" as const };
  }

  const topicTours = await TopicTour.find({
    deleted: false,
    tourCategoryId: tourCategory._id,
  });

  if (topicTours.length > 0) {
    return {
      kind: "ok" as const,
      topicTours,
    };
  }

  const topicToursFromString = await TopicTour.collection
    .find({
      deleted: false,
      tourCategoryId: tourCategory._id.toString(),
    })
    .toArray();

  return {
    kind: "ok" as const,
    topicTours: topicToursFromString,
  };
};

// [Get] api/v1/tourCategories/:slugTopicTour/deleted
export const getDeletedTopicToursByCategorySlug = async (
  categorySlug: string,
) => {
  const tourCategory = await tourCategoryModel.findOne({
    deleted: false,
    slug: categorySlug,
  });

  if (!tourCategory) {
    return { kind: "category_not_found" as const };
  }

  const topicTours = await TopicTour.find({
    deleted: true,
    tourCategoryId: tourCategory._id,
  });

  if (topicTours.length > 0) {
    return {
      kind: "ok" as const,
      topicTours,
    };
  }

  const topicToursFromString = await TopicTour.collection
    .find({
      deleted: true,
      tourCategoryId: tourCategory._id.toString(),
    })
    .toArray();

  return {
    kind: "ok" as const,
    topicTours: topicToursFromString,
  };
};

//[Post] api/v1/tourCategories/:slugTopicTour/create
export const createTopicTour = async (
  categorySlug: string,
  payload: {
    title?: string;
    thumbnail?: string;
    thumbnailPublicId?: string;
    description?: string;
  },
) => {
  const tourCategory = await tourCategoryModel.findOne({
    deleted: false,
    slug: categorySlug,
  });

  if (!tourCategory) {
    return { kind: "category_not_found" as const };
  }

  if (!payload?.title) {
    return { kind: "validation_error" as const, message: "Missing title" };
  }

  const topicTour = new TopicTour({
    title: payload.title,
    thumbnail: payload.thumbnail,
    thumbnailPublicId: payload.thumbnailPublicId,
    description: payload.description,
    tourCategoryId: tourCategory._id,
  });

  const data = await topicTour.save();

  return {
    kind: "ok" as const,
    topicTour: data,
  };
};
// [Patch] api/v1/tourCategories/:slugTopicTour/:id
export const updateTopicTourById = async (
  categorySlug: string,
  topicId: string,
  payload: {
    title?: string;
    thumbnail?: string;
    thumbnailPublicId?: string;
    description?: string;
  },
) => {
  if (!mongoose.Types.ObjectId.isValid(topicId)) {
    return { kind: "invalid_id" as const };
  }

  const tourCategory = await tourCategoryModel.findOne({
    deleted: false,
    slug: categorySlug,
  });

  if (!tourCategory) {
    return { kind: "category_not_found" as const };
  }

  let topicTour = await TopicTour.findOne({
    _id: topicId,
    deleted: false,
    tourCategoryId: tourCategory._id,
  });

  if (!topicTour) {
    const topicTourFromStringCategory = await TopicTour.collection.findOne({
      _id: new mongoose.Types.ObjectId(topicId) as any,
      deleted: false,
      tourCategoryId: tourCategory._id.toString(),
    });

    if (topicTourFromStringCategory?._id) {
      topicTour = await TopicTour.findById(topicTourFromStringCategory._id);
    }
  }

  if (!topicTour) {
    return { kind: "topic_not_found" as const };
  }

  if (payload?.title !== undefined && !payload.title) {
    return { kind: "validation_error" as const, message: "Missing title" };
  }

  if (
    payload.thumbnailPublicId !== undefined &&
    payload.thumbnailPublicId &&
    topicTour.thumbnailPublicId &&
    payload.thumbnailPublicId !== topicTour.thumbnailPublicId
  ) {
    await deleteFromCloudinary(topicTour.thumbnailPublicId);
  }

  if (payload?.title !== undefined) topicTour.title = payload.title;
  if (payload?.thumbnail !== undefined) topicTour.thumbnail = payload.thumbnail;
  if (payload?.thumbnailPublicId !== undefined)
    topicTour.thumbnailPublicId = payload.thumbnailPublicId;
  if (payload?.description !== undefined)
    topicTour.description = payload.description;

  try {
    const data = await topicTour.save();
    return {
      kind: "ok" as const,
      topicTour: data,
    };
  } catch (error: any) {
    if (error?.code === 11000) {
      return { kind: "duplicate_slug" as const };
    }
    throw error;
  }
};
// [Patch] api/v1/tourCategories/:slugTopicTour/:id
export const softDeleteTopicTourById = async (
  categorySlug: string,
  topicId: string,
) => {
  if (!mongoose.Types.ObjectId.isValid(topicId)) {
    return { kind: "invalid_id" as const };
  }

  const tourCategory = await tourCategoryModel.findOne({
    deleted: false,
    slug: categorySlug,
  });

  if (!tourCategory) {
    return { kind: "category_not_found" as const };
  }

  let topicTour = await TopicTour.findOne({
    _id: topicId,
    deleted: false,
    tourCategoryId: tourCategory._id,
  });

  if (!topicTour) {
    const topicTourFromStringCategory = await TopicTour.collection.findOne({
      _id: new mongoose.Types.ObjectId(topicId) as any,
      deleted: false,
      tourCategoryId: tourCategory._id.toString(),
    });

    if (topicTourFromStringCategory?._id) {
      topicTour = await TopicTour.findById(topicTourFromStringCategory._id);
    }
  }

  if (!topicTour) {
    return { kind: "topic_not_found" as const };
  }

  topicTour.deleted = true;
  topicTour.deleteAt = new Date();

  const data = await topicTour.save();

  return {
    kind: "ok" as const,
    topicTour: data,
  };
};

// [Patch] api/v1/tourCategories/:slugTopicTour/:id
export const restoreTopicTourById = async (
  categorySlug: string,
  topicId: string,
) => {
  if (!mongoose.Types.ObjectId.isValid(topicId)) {
    return { kind: "invalid_id" as const };
  }

  const tourCategory = await tourCategoryModel.findOne({
    deleted: false,
    slug: categorySlug,
  });

  if (!tourCategory) {
    return { kind: "category_not_found" as const };
  }

  let topicTour = await TopicTour.findOne({
    _id: topicId,
    deleted: true,
    tourCategoryId: tourCategory._id,
  });

  if (!topicTour) {
    const topicTourFromStringCategory = await TopicTour.collection.findOne({
      _id: new mongoose.Types.ObjectId(topicId) as any,
      deleted: true,
      tourCategoryId: tourCategory._id.toString(),
    });

    if (topicTourFromStringCategory?._id) {
      topicTour = await TopicTour.findById(topicTourFromStringCategory._id);
    }
  }

  if (!topicTour || topicTour.deleted !== true) {
    return { kind: "topic_not_found" as const };
  }

  topicTour.deleted = false;
  topicTour.deleteAt = undefined;

  const data = await topicTour.save();

  return {
    kind: "ok" as const,
    topicTour: data,
  };
};

// [Patch] api/v1/tourCategories/:slugTopicTour/bulk
export const bulkRestoreTopicToursById = async (
  categorySlug: string,
  payload: {
    ids?: string[];
  },
) => {
  if (!Array.isArray(payload?.ids) || payload.ids.length === 0) {
    return {
      kind: "validation_error" as const,
      message: "Missing ids",
    };
  }

  const tourCategory = await tourCategoryModel.findOne({
    deleted: false,
    slug: categorySlug,
  });

  if (!tourCategory) {
    return { kind: "category_not_found" as const };
  }

  const results = await Promise.all(
    payload.ids.map(async (id) => {
      const result = await restoreTopicTourById(categorySlug, id);
      return { id, ...result };
    }),
  );

  return {
    kind: "ok" as const,
    results,
  };
};

// [Patch] api/v1/tourCategories/:slugTopicTour/bulk
export const bulkUpdateTopicToursById = async (
  categorySlug: string,
  payload: {
    updates?: Array<{
      id?: string;
      title?: string;
      thumbnail?: string;
      description?: string;
    }>;
  },
) => {
  if (!Array.isArray(payload?.updates) || payload.updates.length === 0) {
    return {
      kind: "validation_error" as const,
      message: "Missing updates",
    };
  }

  const tourCategory = await tourCategoryModel.findOne({
    deleted: false,
    slug: categorySlug,
  });

  if (!tourCategory) {
    return { kind: "category_not_found" as const };
  }

  const results = await Promise.all(
    payload.updates.map(async (u) => {
      if (!u?.id) {
        return { id: u?.id ?? null, kind: "validation_error" as const };
      }

      const result = await updateTopicTourById(categorySlug, u.id, {
        title: u.title,
        thumbnail: u.thumbnail,
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

// [Patch] api/v1/tourCategories/:slugTopicTour/:slugTour
export const updateTopicTour = async (
  categorySlug: string,
  topicSlug: string,
  payload: {
    title?: string;
    thumbnail?: string;
    description?: string;
  },
) => {
  const tourCategory = await tourCategoryModel.findOne({
    deleted: false,
    slug: categorySlug,
  });

  if (!tourCategory) {
    return { kind: "category_not_found" as const };
  }

  let topicTour = await TopicTour.findOne({
    deleted: false,
    slug: topicSlug,
    tourCategoryId: tourCategory._id,
  });

  if (!topicTour) {
    const topicTourFromString = await TopicTour.collection.findOne({
      deleted: false,
      slug: topicSlug,
      tourCategoryId: tourCategory._id.toString(),
    });

    if (!topicTourFromString?._id) {
      return { kind: "topic_not_found" as const };
    }

    topicTour = await TopicTour.findById(topicTourFromString._id);
  }

  if (!topicTour) {
    return { kind: "topic_not_found" as const };
  }

  if (payload?.title !== undefined && !payload.title) {
    return { kind: "validation_error" as const, message: "Missing title" };
  }

  if (payload?.title !== undefined) topicTour.title = payload.title;
  if (payload?.thumbnail !== undefined) topicTour.thumbnail = payload.thumbnail;
  if (payload?.description !== undefined)
    topicTour.description = payload.description;

  try {
    const data = await topicTour.save();
    return {
      kind: "ok" as const,
      topicTour: data,
    };
  } catch (error: any) {
    if (error?.code === 11000) {
      return { kind: "duplicate_slug" as const };
    }
    throw error;
  }
};
