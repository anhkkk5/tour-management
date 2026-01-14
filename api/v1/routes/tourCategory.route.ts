import express, { Router } from "express";
const router = express.Router();
import * as tourCategoriesController from "../controller/tourCategory/tourCategory.controller";

//root
router.get("/", tourCategoriesController.index);
router.post("/create", tourCategoriesController.createTourCategory);
router.patch("/edit/:id", tourCategoriesController.updateTourCategory);
router.patch("/delete/:id", tourCategoriesController.deleteTourCategory);
router.patch("/bulk", tourCategoriesController.bulkUpdateTourCategories);
//end root

//topic
router.get("/:slugTopicTour", tourCategoriesController.listTourTopic);

router.post("/:slugTopicTour/create", tourCategoriesController.createTopicTour);
router.patch(
  "/:slugTopicTour/edit/:id",
  tourCategoriesController.updateTopicTour
);
router.patch(
  "/:slugTopicTour/bulk",
  tourCategoriesController.bulkUpdateTopicTours
);
//end topic

//tour
router.get("/:slugTopicTour/:slugTour", tourCategoriesController.listTour);
//end tour

const tourCategoryRouter: Router = router;
export { tourCategoryRouter };
