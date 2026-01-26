import express, { Request, Response, Router } from "express";
import * as tourController from "../../controller/tours/tour.controller";
import * as tourPolicyController from "../../controller/tours/tour.policy.controller";
import * as tourScheduleController from "../../controller/tours/tour.schedule.controller";
import multer from "multer";
import { uploadFields } from "../../../../middlewares/uploadCloud.middleware";
const router = express.Router();

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
router.get("/policies", tourPolicyController.listPolicies);
router.get("/policies/:id", tourPolicyController.getPolicy);
router.post("/policies", tourPolicyController.createPolicy);
router.patch("/policies/:id", tourPolicyController.updatePolicy);
router.delete("/policies/:id", tourPolicyController.deletePolicy);

router.get("/:tourId/schedules", tourScheduleController.listSchedulesByTour);
router.post("/:tourId/schedules", tourScheduleController.createSchedule);
router.get("/schedules/:id", tourScheduleController.getSchedule);
router.patch("/schedules/:id", tourScheduleController.updateSchedule);
router.patch("/schedules/delete/:id", tourScheduleController.deleteSchedule);
router.patch("/schedules/restore/:id", tourScheduleController.restoreSchedule);

router.patch(
  "/edit/:id",
  ifMultipart(
    upload.fields([
      { name: "thumbnail", maxCount: 1 },
      { name: "images", maxCount: 20 },
    ]),
  ),
  ifMultipart(uploadFields),
  tourController.update,
);

router.get("/:slugTour", tourController.detail);

const tourRouter: Router = router;
export { tourRouter };
