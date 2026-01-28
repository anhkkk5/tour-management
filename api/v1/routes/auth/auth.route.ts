import express, { Router } from "express";
import * as authenticationController from "../../controller/auth/authentication.controller";
import * as otpController from "../../controller/auth/otp.controller";
import * as passwordController from "../../controller/auth/password.controller";
import * as registrationController from "../../controller/auth/registration.controller";
import { requireAuth } from "../../../../middlewares/auth.middleware";

const router = express.Router();

router.post("/register", registrationController.register);
router.post("/register/verify-otp", registrationController.verifyRegisterOtp);
router.post("/register/resend-otp", registrationController.resendRegisterOtp);
router.post(
  "/reset-password/request-otp",
  passwordController.requestResetPasswordOtp,
);
router.post(
  "/reset-password/verify-otp",
  passwordController.verifyResetPasswordOtp,
);
router.post("/reset-password", passwordController.resetPassword);
router.post("/login", authenticationController.login);
router.post("/refresh", authenticationController.refresh);
router.post("/logout", authenticationController.logout);

router.post("/otp/request", requireAuth, otpController.requestOtp);
router.post("/otp/verify", requireAuth, otpController.verifyOtp);

const authRouter: Router = router;
export { authRouter };
