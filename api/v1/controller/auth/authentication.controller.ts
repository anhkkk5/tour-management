import { Request, Response } from "express";
import * as authenticationService from "../../services/auth/authentication.service";

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

export const login = async (req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === "production";
  const result = await authenticationService.login({
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
    message: "Login success",
    accessToken: (result as any).accessToken,
    user: (result as any).user,
  });
};

export const refresh = async (req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === "production";
  const token = (req as any).cookies?.refreshToken as string | undefined;
  const result = await authenticationService.refresh({
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
      ...(isProd ? {} : { details: (result as any).details }),
    });
  }

  res.cookie("refreshToken", (result as any).refreshToken, getCookieOptions());

  return res.json({
    code: 200,
    message: "Refresh success",
    accessToken: (result as any).accessToken,
  });
};

export const logout = async (req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === "production";
  const token = (req as any).cookies?.refreshToken as string | undefined;
  const result = await authenticationService.logout({ refreshToken: token });

  res.clearCookie("refreshToken", { path: "/" });

  if (result.kind === "redis_error") {
    return res.status(503).json({
      message: result.message,
      ...(isProd ? {} : { details: (result as any).details }),
    });
  }

  return res.json({ code: 200, message: "Logout success" });
};
