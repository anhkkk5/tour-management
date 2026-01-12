import express, { Router } from "express";
const router = express.Router();
import * as tourCategoriesController from "../controller/tourCategory.controller";
router.get("/", tourCategoriesController.index);
router.get("/:slugTourCategory", tourCategoriesController.listTourCategory);

const tourCategoryRouter: Router = router;
export { tourCategoryRouter };
