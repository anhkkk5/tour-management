import tourCategoryModel from "../../models/tourCategory.model";
import TopicTour from "../../models/topicTour.model";

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

//[Post] api/v1/tourCategories/:slugTopicTour/create
export const createTopicTour = async (
  categorySlug: string,
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

  if (!payload?.title) {
    return { kind: "validation_error" as const, message: "Missing title" };
  }

  const topicTour = new TopicTour({
    title: payload.title,
    thumbnail: payload.thumbnail,
    description: payload.description,
    tourCategoryId: tourCategory._id,
  });

  const data = await topicTour.save();

  return {
    kind: "ok" as const,
    topicTour: data,
  };
};
