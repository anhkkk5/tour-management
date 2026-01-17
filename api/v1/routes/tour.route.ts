import express, { Request, Response, Router } from "express";
import * as tourController from "../controller/tours/tour.controller";
import * as tourPolicyController from "../controller/tours/tour.policy.controller";
import * as tourScheduleController from "../controller/tours/tour.schedule.controller";
const router = express.Router();

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

router.patch("/edit/:id", tourController.update);

router.get("/:slugTour", tourController.detail);

const tourRouter: Router = router;
export { tourRouter };
