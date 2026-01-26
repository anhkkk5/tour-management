import type { NextFunction, Request, Response } from "express";

export const createPost = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body?.fullName) {
    (req as any).flash?.("error", "Vui lòng nhập tên");
    res.redirect(`/accounts/create`);
    return;
  }
  if (!req.body?.email) {
    (req as any).flash?.("error", "Vui lòng nhập email");
    res.redirect(`/accounts/create`);
    return;
  }
  if (!req.body?.password) {
    (req as any).flash?.("error", "Vui lòng nhập mk");
    res.redirect(`/accounts/create`);
    return;
  }

  next();
};
