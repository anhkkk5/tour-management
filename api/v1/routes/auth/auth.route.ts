import express, { Router } from "express";
import * as authController from "../../controller/auth/auth.controller";
import { requireAuth } from "../../../../middlewares/auth.middleware";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

router.post("/otp/request", requireAuth, authController.requestOtp);
router.post("/otp/verify", requireAuth, authController.verifyOtp);

const authRouter: Router = router;
export { authRouter };
