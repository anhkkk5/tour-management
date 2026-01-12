import express, { Router } from "express";
const router = express.Router();
import * as tourCategoriesController from "../controller/tourCategory.controller";
router.get("/", tourCategoriesController.index);
router.get("/:slugTopicTour", tourCategoriesController.listTourCategory);
router.get("/:slugTopicTour/:slugTour", tourCategoriesController.listTourTopic);

const tourCategoryRouter: Router = router;
export { tourCategoryRouter };
