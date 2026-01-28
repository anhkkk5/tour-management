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
exports.tourRouter = void 0;
const express_1 = __importDefault(require("express"));
const tourController = __importStar(require("../../controller/tours/tour.controller"));
const tourPolicyController = __importStar(require("../../controller/tours/tour.policy.controller"));
const tourScheduleController = __importStar(require("../../controller/tours/tour.schedule.controller"));
const multer_1 = __importDefault(require("multer"));
const uploadCloud_middleware_1 = require("../../../../middlewares/uploadCloud.middleware");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype || !file.mimetype.startsWith("image/")) {
            return cb(new Error("Only image files are allowed"));
        }
        return cb(null, true);
    },
});
const ifMultipart = (mw) => (req, res, next) => req.is("multipart/form-data") ? mw(req, res, next) : next();
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
router.patch("/edit/:id", ifMultipart(upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 20 },
])), ifMultipart(uploadCloud_middleware_1.uploadFields), tourController.update);
router.get("/:slugTour", tourController.detail);
const tourRouter = router;
exports.tourRouter = tourRouter;
