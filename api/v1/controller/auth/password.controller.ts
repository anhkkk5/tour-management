import { Request, Response } from "express";
import * as passwordService from "../../services/auth/password.service";

export const requestResetPasswordOtp = async (req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === "production";
  const result = await passwordService.requestResetPasswordOtp({
    email: req.body?.email,
    isProd,
  });

  if (result.kind === "validation_error") {
    return res.status(400).json({ message: result.message });
  }

  if (result.kind === "not_found") {
    return res.status(404).json({ message: result.message });
  }

  if (result.kind === "redis_error") {
    return res.status(503).json({
      message: result.message,
      ...(isProd ? {} : { details: (result as any).details }),
    });
  }

  if (result.kind === "email_failed") {
    return res.status(502).json({
      message: result.message,
      ...(isProd ? {} : { details: (result as any).details }),
    });
  }

  return res.json({
    code: 200,
    message: "OTP sent",
    email: (result as any).email,
    ...(isProd ? {} : { otp: (result as any).otp }),
    expiresInSeconds: (result as any).expiresInSeconds,
  });
};

export const verifyResetPasswordOtp = async (req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === "production";
  const result = await passwordService.verifyResetPasswordOtp({
    email: req.body?.email,
    otp: req.body?.otp,
  });

  if (result.kind === "validation_error") {
    return res.status(400).json({ message: result.message });
  }

  if (result.kind === "invalid_otp") {
    return res.status(400).json({ message: result.message });
  }

  if (result.kind === "not_found") {
    return res.status(404).json({ message: result.message });
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
    resetToken: (result as any).resetToken,
    expiresInSeconds: (result as any).expiresInSeconds,
  });
};

export const resetPassword = async (req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === "production";
  const result = await passwordService.resetPassword({
    resetToken: req.body?.resetToken,
    newPassword: req.body?.newPassword,
  });

  if (result.kind === "validation_error") {
    return res.status(400).json({ message: result.message });
  }

  if (result.kind === "invalid_token") {
    return res.status(400).json({ message: result.message });
  }

  if (result.kind === "not_found") {
    return res.status(404).json({ message: result.message });
  }

  if (result.kind === "redis_error") {
    return res.status(503).json({
      message: result.message,
      ...(isProd ? {} : { details: (result as any).details }),
    });
  }

  if (result.kind === "internal_error") {
    return res.status(500).json({
      message: result.message,
      ...(isProd ? {} : { details: (result as any).details }),
    });
  }

  return res.json({ code: 200, message: "Reset password success" });
};
