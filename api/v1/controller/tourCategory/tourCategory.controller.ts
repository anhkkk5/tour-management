import {
  bulkUpdateTourCategories,
  createTourCategory,
  deleteTourCategory,
  index,
  updateTourCategory,
} from "./tourCategory.root.controller";
import {
  bulkUpdateTopicTours,
  createTopicTour,
  listTourTopic,
  updateTopicTour,
} from "./tourCategory.topic.controller";
import { listTour } from "./tourCategory.tour.controller";

export {
  index,
  createTourCategory,
  updateTourCategory,
  bulkUpdateTourCategories,
  deleteTourCategory,
  listTourTopic,
  createTopicTour,
  bulkUpdateTopicTours,
  listTour,
  updateTopicTour,
};
