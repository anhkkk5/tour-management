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
exports.tourCategoryRouter = void 0;
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const tourCategoriesController = __importStar(require("../../controller/tourCategory/tourCategory.controller"));
const multer_1 = __importDefault(require("multer"));
const uploadCloud_middleware_1 = require("../../../../middlewares/uploadCloud.middleware");
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
//root
router.get("/", tourCategoriesController.index);
router.get("/deleted", tourCategoriesController.listDeletedTourCategories);
router.post("/create", tourCategoriesController.createTourCategory);
router.patch("/edit/:id", tourCategoriesController.updateTourCategory);
router.patch("/delete/:id", tourCategoriesController.deleteTourCategory);
router.patch("/restore/bulk", tourCategoriesController.bulkRestoreTourCategories);
router.patch("/restore/:id", tourCategoriesController.restoreTourCategory);
router.patch("/bulk", tourCategoriesController.bulkUpdateTourCategories);
//end root
//topic
router.get("/:slugTopicTour/deleted", tourCategoriesController.listDeletedTopicTours);
router.patch("/:slugTopicTour/restore/bulk", tourCategoriesController.bulkRestoreTopicTours);
router.patch("/:slugTopicTour/restore/:id", tourCategoriesController.restoreTopicTour);
router.get("/:slugTopicTour", tourCategoriesController.listTourTopic);
router.post("/:slugTopicTour/create", ifMultipart(upload.single("thumbnail")), ifMultipart(uploadCloud_middleware_1.uploadSingle), tourCategoriesController.createTopicTour);
router.patch("/:slugTopicTour/edit/:id", ifMultipart(upload.single("thumbnail")), ifMultipart(uploadCloud_middleware_1.uploadSingle), tourCategoriesController.updateTopicTour);
router.patch("/:slugTopicTour/bulk", tourCategoriesController.bulkUpdateTopicTours);
router.patch("/:slugTopicTour/delete/:id", tourCategoriesController.deleteTopicTour);
//end topic
//tour
router.get("/:slugTopicTour/:slugTour/deleted", tourCategoriesController.listDeletedTours);
router.patch("/:slugTopicTour/:slugTour/restore/bulk", tourCategoriesController.bulkRestoreTours);
router.patch("/:slugTopicTour/:slugTour/restore/:id", tourCategoriesController.restoreTour);
router.post("/:slugTopicTour/:slugTour/create", ifMultipart(upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 20 },
])), ifMultipart(uploadCloud_middleware_1.uploadFields), tourCategoriesController.createTour);
router.patch("/:slugTopicTour/:slugTour/edit/:id", ifMultipart(upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 20 },
])), ifMultipart(uploadCloud_middleware_1.uploadFields), tourCategoriesController.updateTour);
router.patch("/:slugTopicTour/:slugTour/bulk", tourCategoriesController.bulkUpdateTours);
router.patch("/:slugTopicTour/:slugTour/delete/:id", tourCategoriesController.deleteTour);
router.get("/:slugTopicTour/:slugTour", tourCategoriesController.listTour);
//end tour
const tourCategoryRouter = router;
exports.tourCategoryRouter = tourCategoryRouter;
