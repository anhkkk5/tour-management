import express, { Express } from "express";
import { tripRouter } from "./trip.route";

import { tourRouter } from "./tour.route";
import { tourCategoryRouter } from "./tourCategory.route";

const router = express.Router();

const mainV1Routes = (app: Express): void => {
  const version = "/api/v1";
  app.use(version + "/trips", tripRouter);

  app.use(version + "/tours", tourRouter);
  app.use(version + "/tour_category", tourCategoryRouter);
};

export default mainV1Routes;
