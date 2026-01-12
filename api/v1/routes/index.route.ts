import express, { Express } from "express";
import { tripRouter } from "./trip.route";

const router = express.Router();

const mainV1Routes = (app: Express): void => {
  const version = "/api/v1";
  app.use(version + "/trips", tripRouter);
};

export default mainV1Routes;
