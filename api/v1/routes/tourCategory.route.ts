import express, { Router } from "express";
const router = express.Router();
import * as tourCategoriesController from "../controller/tourCategory/tourCategory.controller";

router.get("/", tourCategoriesController.index);
router.post("/create", tourCategoriesController.createTourCategory);
router.get("/:slugTopicTour", tourCategoriesController.listTourCategory);
router.get("/:slugTopicTour/:slugTour", tourCategoriesController.listTourTopic);
router.post("/:slugTopicTour/create", tourCategoriesController.createTopicTour);
router.patch(
  "/:slugTopicTour/:slugTour",
  tourCategoriesController.updateTopicTour
);

const tourCategoryRouter: Router = router;
export { tourCategoryRouter };
