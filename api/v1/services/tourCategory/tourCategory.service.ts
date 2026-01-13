import tourCategoryModel from "../../models/tourCategory.model";
import TopicTour from "../../models/topicTour.model";
import Tour from "../../models/tour.model";
// [Get] api/v1/tourCategories
export const listTourCategories = async () => {
  return tourCategoryModel.find({
    deleted: false,
  });
};
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
