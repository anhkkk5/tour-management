import { Request, Response } from "express";

export const getParamString = (req: Request, key: string) => {
  const raw = (req.params as any)?.[key];
  if (Array.isArray(raw)) return raw[0];
  return raw ?? null;
};

export const sendError = (res: Response, status: number, message: string) => {
  return res.status(status).json({ message });
};
