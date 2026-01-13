import express, { Request, Response, Router } from "express";
import * as tourController from "../controller/tour.controller";
const router = express.Router();

router.get("/:slugTour", tourController.detail);

const tourRouter: Router = router;
export { tourRouter };
