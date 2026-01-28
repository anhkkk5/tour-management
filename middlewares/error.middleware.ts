import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.headersSent) {
    return next(err);
  }

  const isProd = process.env.NODE_ENV === "production";

  const statusCode =
    typeof err?.statusCode === "number"
      ? err.statusCode
      : typeof err?.status === "number"
        ? err.status
        : 500;

  const message =
    typeof err?.message === "string" && err.message
      ? err.message
      : "Internal Server Error";

  return res.status(statusCode).json({
    message,
    ...(isProd
      ? {}
      : {
          details:
            typeof err?.stack === "string"
              ? err.stack
              : typeof err === "string"
                ? err
                : JSON.stringify(err),
        }),
  });
};
