import { NextFunction, Request, Response } from "express";
import User from "../api/v1/models/user/user.model";
import { verifyAccessToken } from "../utils/jwt.util";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing Authorization header" });
    }

    const token = header.slice("Bearer ".length).trim();
    const payload = verifyAccessToken(token);

    const user = await User.findOne({ _id: payload.userId, deleted: false });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if ((user as any).status === "blocked") {
      return res.status(403).json({ message: "User is blocked" });
    }

    (req as any).user = user;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid access token" });
  }
};
