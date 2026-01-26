import express, { Router } from "express";
import * as locationController from "../../controller/locations/location.controller";
const router = express.Router();

router.get("/deleted", locationController.listDeleted);
router.post("/create", locationController.create);
router.patch("/edit/:id", locationController.update);
router.patch("/delete/:id", locationController.remove);
router.patch("/restore/:id", locationController.restore);
router.get("/:id", locationController.detail);

router.get("/", locationController.index);

const locationRouter: Router = router;
export { locationRouter };
