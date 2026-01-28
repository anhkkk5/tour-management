import { Request, Response } from "express";
import * as authService from "../../services/auth/auth.service.deprecated";

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

export const register = async (req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === "production";
  const result = await authService.registerRequestOtp({
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
      ...(isProd ? {} : { details: result.details }),
    });
  }

  if (result.kind === "email_failed") {
    return res.status(502).json({
      message: result.message,
      ...(isProd ? {} : { details: result.details }),
    });
  }

  return res.json({
    code: 200,
    message: "OTP sent",
    email: result.email,
    ...(isProd ? {} : { otp: (result as any).otp }),
    expiresInSeconds: result.expiresInSeconds,
  });
};

export const verifyRegisterOtp = async (req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === "production";
  const result = await authService.verifyRegisterOtp({
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
      ...(isProd ? {} : { details: result.details }),
    });
  }

  if (result.kind === "internal_error") {
    return res.status(500).json({
      message: result.message,
      ...(isProd ? {} : { details: result.details }),
    });
  }

  res.cookie("refreshToken", result.refreshToken, getCookieOptions());

  return res.json({
    code: 200,
    message: "Register success",
    accessToken: result.accessToken,
    user: result.user,
  });
};

export const login = async (req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === "production";
  const result = await authService.login({
    email: req.body?.email,
    password: req.body?.password,
    userAgent: req.headers["user-agent"],
    ip: getClientIp(req),
  });

  if (result.kind === "validation_error") {
    return res.status(400).json({ message: result.message });
  }

  if (result.kind === "unauthorized") {
    return res.status(401).json({ message: result.message });
  }

  if (result.kind === "forbidden") {
    return res.status(403).json({ message: result.message });
  }

  if (result.kind === "redis_error") {
    return res.status(503).json({
      message: result.message,
      ...(isProd ? {} : { details: result.details }),
    });
  }

  if (result.kind === "internal_error") {
    return res.status(500).json({
      message: result.message,
      ...(isProd ? {} : { details: result.details }),
    });
  }

  res.cookie("refreshToken", result.refreshToken, getCookieOptions());

  return res.json({
    code: 200,
    message: "Login success",
    accessToken: result.accessToken,
    user: result.user,
  });
};

export const refresh = async (req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === "production";
  const token = (req as any).cookies?.refreshToken as string | undefined;
  const result = await authService.refresh({
    refreshToken: token,
    userAgent: req.headers["user-agent"],
    ip: getClientIp(req),
  });

  if (result.kind === "missing_refresh") {
    return res.status(401).json({ message: result.message });
  }

  if (result.kind === "invalid_refresh") {
    return res.status(401).json({ message: result.message });
  }

  if (result.kind === "forbidden") {
    return res.status(403).json({ message: result.message });
  }

  if (result.kind === "redis_error") {
    return res.status(503).json({
      message: result.message,
      ...(isProd ? {} : { details: result.details }),
    });
  }

  res.cookie("refreshToken", result.refreshToken, getCookieOptions());

  return res.json({
    code: 200,
    message: "Refresh success",
    accessToken: result.accessToken,
  });
};

export const logout = async (req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === "production";
  const token = (req as any).cookies?.refreshToken as string | undefined;
  const result = await authService.logout({ refreshToken: token });

  res.clearCookie("refreshToken", { path: "/" });

  if (result.kind === "redis_error") {
    return res.status(503).json({
      message: result.message,
      ...(isProd ? {} : { details: result.details }),
    });
  }

  return res.json({ code: 200, message: "Logout success" });
};

export const requestOtp = async (req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === "production";
  const user = (req as any).user as { _id: unknown } | undefined;
  const result = await authService.requestOtp({
    userId: user?._id ? String(user._id) : undefined,
  });

  if (result.kind === "unauthorized") {
    return res.status(401).json({ message: result.message });
  }

  if (result.kind === "redis_error") {
    return res.status(503).json({
      message: result.message,
      ...(isProd ? {} : { details: result.details }),
    });
  }

  return res.json({
    code: 200,
    message: "OTP generated",
    otp: result.otp,
    expiresInSeconds: result.expiresInSeconds,
  });
};

export const verifyOtp = async (req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === "production";
  const user = (req as any).user as { _id: unknown } | undefined;
  const result = await authService.verifyOtp({
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
      ...(isProd ? {} : { details: result.details }),
    });
  }

  return res.json({
    code: 200,
    message: "Verify OTP success",
  });
};
