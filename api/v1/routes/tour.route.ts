import express, { Request, Response, Router } from "express";
const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.json({ message: "Danh sách tour du lịch" });
});

const tourRouter: Router = router;
export { tourRouter };
