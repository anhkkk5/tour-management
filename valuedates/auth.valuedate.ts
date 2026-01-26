import type { NextFunction, Request, Response } from "express";

export const loginPost = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = (req.body ?? {}) as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    (req as any).flash?.("error", "Vui lòng nhập email và mật khẩu");
    res.redirect(`/auth/login`);
    return;
  }
  next();
};
