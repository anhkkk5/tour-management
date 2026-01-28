import { Request, Response } from "express";
import * as registrationService from "../../services/auth/registration.service";

export const register = async (req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === "production";
  const result = await registrationService.registerRequestOtp({
    email: req.body?.email,
    password: req.body?.password,
    fullName: req.body?.fullName,
    phone: req.body?.phone,
    isProd,
  });

  if (result.kind === "validation_error") {
    return res.status(400).json({ message: result.message });
  }

  if (result.kind === "conflict") {
    return res.status(409).json({ message: result.message });
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

const getRefreshTtlSeconds = () => {
  const raw = process.env.REFRESH_TOKEN_TTL_SECONDS;
  if (!raw) return 7 * 24 * 60 * 60;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 7 * 24 * 60 * 60;
  return n;
};

const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: getRefreshTtlSeconds() * 1000,
  };
};

const getClientIp = (req: Request) => {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string") return xf.split(",")[0].trim();
  return req.ip;
};

export const verifyRegisterOtp = async (req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === "production";
  const result = await registrationService.verifyRegisterOtp({
    email: req.body?.email,
    otp: req.body?.otp,
    userAgent: req.headers["user-agent"],
    ip: getClientIp(req),
  });

  if (result.kind === "validation_error") {
    return res.status(400).json({ message: result.message });
  }

  if (result.kind === "conflict") {
    return res.status(409).json({ message: result.message });
  }

  if (result.kind === "invalid_otp") {
    return res.status(400).json({ message: result.message });
  }

  if (result.kind === "expired_registration") {
    return res.status(400).json({ message: result.message });
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

  res.cookie("refreshToken", (result as any).refreshToken, getCookieOptions());

  return res.json({
    code: 200,
    message: "Register success",
    accessToken: (result as any).accessToken,
    user: (result as any).user,
  });
};

export const resendRegisterOtp = async (req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === "production";
  const result = await registrationService.resendRegisterOtp({
    email: req.body?.email,
    isProd,
  });

  if (result.kind === "validation_error") {
    return res.status(400).json({ message: result.message });
  }

  if (result.kind === "conflict") {
    return res.status(409).json({ message: result.message });
  }

  if (result.kind === "expired_registration") {
    return res.status(400).json({ message: result.message });
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
    message: "OTP resent",
    email: (result as any).email,
    ...(isProd ? {} : { otp: (result as any).otp }),
    expiresInSeconds: (result as any).expiresInSeconds,
  });
};
