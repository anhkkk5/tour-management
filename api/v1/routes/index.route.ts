import express, { Express } from "express";
import { tripRouter } from "./trip.route";

import { tourRouter } from "./tour/tour.route";
import { tourCategoryRouter } from "./tourCategory/tourCategory.route";

import { locationRouter } from "./location/location.route";

import { authRouter } from "./auth/auth.route";
import { usersRouter } from "./users/users.route";

const router = express.Router();

const mainV1Routes = (app: Express): void => {
  const version = "/api/v1";
  app.use(version + "/trips", tripRouter);

  app.use(version + "/tours", tourRouter);
  app.use(version + "/tour_category", tourCategoryRouter);

  app.use(version + "/locations", locationRouter);

  app.use(version + "/auth", authRouter);
  app.use(version + "/users", usersRouter);
};

export default mainV1Routes;
