import mongoose from "mongoose";
import tourCategoryModel from "../../models/tourCategory.model";
import TopicTour from "../../models/topicTour.model";
import Tour from "../../models/tour.model";

// [Get] api/v1/tourCategories/:slugTopicTour/:slugTour
export const getToursByCategorySlugAndTopicSlug = async (
  categorySlug: string,
  topicSlug: string
) => {
  // 1. Tìm category
  const tourCategory = await tourCategoryModel.findOne({
    deleted: false,
    slug: categorySlug,
  });

  if (!tourCategory) {
    return { kind: "category_not_found" as const };
  }

  // 2. Tìm topic
  const topicTour = await TopicTour.findOne({
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

    if (!topicTourFromString) {
      return { kind: "topic_not_found" as const };
    }

    const toursFromStringTopic = await Tour.collection
      .find({
        deleted: false,
        topicTourId: topicTourFromString._id.toString(),
      })
      .toArray();

    return {
      kind: "ok" as const,
      tours: toursFromStringTopic,
    };
  }

  // 3. Lấy tours
  const tours = await Tour.find({
    deleted: false,
    topicTourId: topicTour._id,
  });

  if (tours.length > 0) {
    return {
      kind: "ok" as const,
      tours,
    };
  }

  const toursFromString = await Tour.collection
    .find({
      deleted: false,
      topicTourId: topicTour._id.toString(),
    })
    .toArray();

  return {
    kind: "ok" as const,
    tours: toursFromString,
  };
};

export const updateTopicTourById = async (
  categorySlug: string,
  topicId: string,
  payload: {
    title?: string;
    thumbnail?: string;
    description?: string;
  }
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

export const bulkUpdateTopicToursById = async (
  categorySlug: string,
  payload: {
    updates?: Array<{
      id?: string;
      title?: string;
      thumbnail?: string;
      description?: string;
    }>;
  }
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
    })
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
  }
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
