import express, { Router } from "express";
const router = express.Router();
import * as tourCategoriesController from "../../controller/tourCategory/tourCategory.controller";
import multer from "multer";
import {
  uploadFields,
  uploadSingle,
} from "../../../../middlewares/uploadCloud.middleware";

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    return cb(null, true);
  },
});

const ifMultipart = (mw: any) => (req: any, res: any, next: any) =>
  req.is("multipart/form-data") ? mw(req, res, next) : next();

//root
router.get("/", tourCategoriesController.index);
router.get("/deleted", tourCategoriesController.listDeletedTourCategories);
router.post("/create", tourCategoriesController.createTourCategory);
router.patch("/edit/:id", tourCategoriesController.updateTourCategory);
router.patch("/delete/:id", tourCategoriesController.deleteTourCategory);
router.patch(
  "/restore/bulk",
  tourCategoriesController.bulkRestoreTourCategories,
);
router.patch("/restore/:id", tourCategoriesController.restoreTourCategory);
router.patch("/bulk", tourCategoriesController.bulkUpdateTourCategories);
//end root

//topic
router.get(
  "/:slugTopicTour/deleted",
  tourCategoriesController.listDeletedTopicTours,
);
router.patch(
  "/:slugTopicTour/restore/bulk",
  tourCategoriesController.bulkRestoreTopicTours,
);
router.patch(
  "/:slugTopicTour/restore/:id",
  tourCategoriesController.restoreTopicTour,
);
router.get("/:slugTopicTour", tourCategoriesController.listTourTopic);

router.post(
  "/:slugTopicTour/create",
  ifMultipart(upload.single("thumbnail")),
  ifMultipart(uploadSingle),
  tourCategoriesController.createTopicTour,
);
router.patch(
  "/:slugTopicTour/edit/:id",
  ifMultipart(upload.single("thumbnail")),
  ifMultipart(uploadSingle),
  tourCategoriesController.updateTopicTour,
);
router.patch(
  "/:slugTopicTour/bulk",
  tourCategoriesController.bulkUpdateTopicTours,
);
router.patch(
  "/:slugTopicTour/delete/:id",
  tourCategoriesController.deleteTopicTour,
);
//end topic

//tour
router.get(
  "/:slugTopicTour/:slugTour/deleted",
  tourCategoriesController.listDeletedTours,
);
router.patch(
  "/:slugTopicTour/:slugTour/restore/bulk",
  tourCategoriesController.bulkRestoreTours,
);
router.patch(
  "/:slugTopicTour/:slugTour/restore/:id",
  tourCategoriesController.restoreTour,
);
router.post(
  "/:slugTopicTour/:slugTour/create",
  ifMultipart(
    upload.fields([
      { name: "thumbnail", maxCount: 1 },
      { name: "images", maxCount: 20 },
    ]),
  ),
  ifMultipart(uploadFields),
  tourCategoriesController.createTour,
);
router.patch(
  "/:slugTopicTour/:slugTour/edit/:id",
  ifMultipart(
    upload.fields([
      { name: "thumbnail", maxCount: 1 },
      { name: "images", maxCount: 20 },
    ]),
  ),
  ifMultipart(uploadFields),
  tourCategoriesController.updateTour,
);
router.patch(
  "/:slugTopicTour/:slugTour/bulk",
  tourCategoriesController.bulkUpdateTours,
);
router.patch(
  "/:slugTopicTour/:slugTour/delete/:id",
  tourCategoriesController.deleteTour,
);
router.get("/:slugTopicTour/:slugTour", tourCategoriesController.listTour);
//end tour

const tourCategoryRouter: Router = router;
export { tourCategoryRouter };
