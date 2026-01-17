import express, { Router } from "express";
const router = express.Router();
import * as tourCategoriesController from "../controller/tourCategory/tourCategory.controller";

//root
router.get("/", tourCategoriesController.index);
router.get("/deleted", tourCategoriesController.listDeletedTourCategories);
router.post("/create", tourCategoriesController.createTourCategory);
router.patch("/edit/:id", tourCategoriesController.updateTourCategory);
router.patch("/delete/:id", tourCategoriesController.deleteTourCategory);
router.patch(
  "/restore/bulk",
  tourCategoriesController.bulkRestoreTourCategories
);
router.patch("/restore/:id", tourCategoriesController.restoreTourCategory);
router.patch("/bulk", tourCategoriesController.bulkUpdateTourCategories);
//end root

//topic
router.get(
  "/:slugTopicTour/deleted",
  tourCategoriesController.listDeletedTopicTours
);
router.patch(
  "/:slugTopicTour/restore/bulk",
  tourCategoriesController.bulkRestoreTopicTours
);
router.patch(
  "/:slugTopicTour/restore/:id",
  tourCategoriesController.restoreTopicTour
);
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
router.patch(
  "/:slugTopicTour/delete/:id",
  tourCategoriesController.deleteTopicTour
);
//end topic

//tour
router.get(
  "/:slugTopicTour/:slugTour/deleted",
  tourCategoriesController.listDeletedTours
);
router.patch(
  "/:slugTopicTour/:slugTour/restore/bulk",
  tourCategoriesController.bulkRestoreTours
);
router.patch(
  "/:slugTopicTour/:slugTour/restore/:id",
  tourCategoriesController.restoreTour
);
router.post(
  "/:slugTopicTour/:slugTour/create",
  tourCategoriesController.createTour
);
router.patch(
  "/:slugTopicTour/:slugTour/edit/:id",
  tourCategoriesController.updateTour
);
router.patch(
  "/:slugTopicTour/:slugTour/bulk",
  tourCategoriesController.bulkUpdateTours
);
router.patch(
  "/:slugTopicTour/:slugTour/delete/:id",
  tourCategoriesController.deleteTour
);
router.get("/:slugTopicTour/:slugTour", tourCategoriesController.listTour);
//end tour

const tourCategoryRouter: Router = router;
export { tourCategoryRouter };
