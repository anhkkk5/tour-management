import { Request, Response } from "express";
import * as otpService from "../../services/auth/otp.service";

export const requestOtp = async (req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === "production";
  const user = (req as any).user as { _id: unknown } | undefined;
  const result = await otpService.requestOtp({
    userId: user?._id ? String(user._id) : undefined,
  });

  if (result.kind === "unauthorized") {
    return res.status(401).json({ message: result.message });
  }

  if (result.kind === "redis_error") {
    return res.status(503).json({
      message: result.message,
      ...(isProd ? {} : { details: (result as any).details }),
    });
  }

  return res.json({
    code: 200,
    message: "OTP generated",
    otp: (result as any).otp,
    expiresInSeconds: (result as any).expiresInSeconds,
  });
};

export const verifyOtp = async (req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === "production";
  const user = (req as any).user as { _id: unknown } | undefined;
  const result = await otpService.verifyOtp({
    userId: user?._id ? String(user._id) : undefined,
    otp: req.body?.otp,
  });

  if (result.kind === "unauthorized") {
    return res.status(401).json({ message: result.message });
  }

  if (result.kind === "validation_error") {
    return res.status(400).json({ message: result.message });
  }

  if (result.kind === "redis_error") {
    return res.status(503).json({
      message: result.message,
      ...(isProd ? {} : { details: (result as any).details }),
    });
  }

  return res.json({
    code: 200,
    message: "Verify OTP success",
  });
};
