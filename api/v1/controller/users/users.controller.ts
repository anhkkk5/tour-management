import { Request, Response } from "express";

export const detail = async (req: Request, res: Response) => {
  return res.json({
    code: 200,
    message: "Lấy thông tin người dùng thành công",
    info: (req as any).user,
  });
};
