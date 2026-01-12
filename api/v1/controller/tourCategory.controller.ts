import { Request, Response } from "express";
import tourCategoryModel from "../models/tourCategory.model";
import TopicTour from "../models/topicTour.model";
// [Get] api/v1/tourCategories
export const index = async (req: Request, res: Response) => {
  const tourCategories = await tourCategoryModel.find({
    deleted: false,
  });
  res.json(tourCategories);
};
// [Get] api/v1/tourCategories/:slugTourCategory
export const listTourCategory = async (req: Request, res: Response) => {
  const tourCategory = await tourCategoryModel.findOne({
    deleted: false,
    slug: req.params.slugTourCategory,
  });

  if (!tourCategory) {
    return res.status(404).json({
      message: "Tour category not found",
    });
  }

  const categoryIdStr = tourCategory._id.toString();

  const listTopicTour = await TopicTour.find({
    deleted: false,
    tourCategoryId: categoryIdStr,
  });

  if (listTopicTour.length > 0) {
    return res.json(listTopicTour);
  }

  // Fallback for legacy data where topicTours.tourCategoryId was stored as an ObjectId
  const listTopicTourFromObjectId = await TopicTour.collection
    .find({
      deleted: false,
      tourCategoryId: tourCategory._id,
    })
    .toArray();

  return res.json(listTopicTourFromObjectId);
};
