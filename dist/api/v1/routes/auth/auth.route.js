"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = __importDefault(require("express"));
const authenticationController = __importStar(require("../../controller/auth/authentication.controller"));
const otpController = __importStar(require("../../controller/auth/otp.controller"));
const passwordController = __importStar(require("../../controller/auth/password.controller"));
const registrationController = __importStar(require("../../controller/auth/registration.controller"));
const auth_middleware_1 = require("../../../../middlewares/auth.middleware");
const router = express_1.default.Router();
router.post("/register", registrationController.register);
router.post("/register/verify-otp", registrationController.verifyRegisterOtp);
router.post("/register/resend-otp", registrationController.resendRegisterOtp);
router.post("/reset-password/request-otp", passwordController.requestResetPasswordOtp);
router.post("/reset-password/verify-otp", passwordController.verifyResetPasswordOtp);
router.post("/reset-password", passwordController.resetPassword);
router.post("/login", authenticationController.login);
router.post("/refresh", authenticationController.refresh);
router.post("/logout", authenticationController.logout);
router.post("/otp/request", auth_middleware_1.requireAuth, otpController.requestOtp);
router.post("/otp/verify", auth_middleware_1.requireAuth, otpController.verifyOtp);
const authRouter = router;
exports.authRouter = authRouter;
