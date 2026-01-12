import express, { Request, Response, Router } from "express";
const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.json({ message: "Danh sách chuyến đi" });
});

const tripRouter: Router = router;
export { tripRouter };
