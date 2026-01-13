import express, { Request, Response, Router } from "express";
import { index } from "../controller/location.controller";
const router = express.Router();

router.get("/", index);

const locationRouter: Router = router;
export { locationRouter };
