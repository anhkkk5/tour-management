import express, { Router } from "express";
import * as usersController from "../../controller/users/users.controller";
import { requireAuth } from "../../../../middlewares/auth.middleware";

const router = express.Router();

router.get("/detail", requireAuth, usersController.detail);

const usersRouter: Router = router;
export { usersRouter };
