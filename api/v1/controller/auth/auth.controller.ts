import { Request, Response } from "express";
import User from "../../models/user/user.model";
import {
  generateRandomNumber,
  generateRandomString,
} from "../../../../helpers/generate";
import {
  deleteRefreshToken,
  deleteOtp,
  getRefreshToken,
  getOtp,
  setRefreshToken,
  setOtp,
} from "../../../../utils/redis.client";
import { signAccessToken } from "../../../../utils/jwt.util";

const bcrypt = require("bcrypt");

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

const isRedisErrorMessage = (message: string) =>
  /redis|ioredis|ECONN|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|ECONNRESET|WRONGPASS|NOAUTH|TLS|CERT/i.test(
    message,
  );

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, phone } = (req.body ?? {}) as {
      email?: string;
      password?: string;
      fullName?: string;
      phone?: string;
    };

    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const saltRounds = process.env.BCRYPT_SALT_ROUNDS
      ? Number(process.env.BCRYPT_SALT_ROUNDS)
      : 10;

    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
      email,
      passwordHash,
      fullName,
      phone,
      role: "user",
      emailVerified: false,
      status: "active",
      deleted: false,
    });

    const accessToken = signAccessToken({
      userId: String(user._id),
      role: (user as any).role,
    });

    const refreshToken = generateRandomString(64);
    try {
      await setRefreshToken(
        refreshToken,
        {
          userId: String(user._id),
          userAgent: req.headers["user-agent"],
          ip: getClientIp(req),
        },
        getRefreshTtlSeconds(),
      );
    } catch (e: any) {
      const m = typeof e?.message === "string" ? e.message : String(e);
      throw new Error(`setRefreshToken failed: ${m}`);
    }

    try {
      res.cookie("refreshToken", refreshToken, getCookieOptions());
    } catch (e: any) {
      await deleteRefreshToken(refreshToken);
      const m = typeof e?.message === "string" ? e.message : String(e);
      throw new Error(`set cookie failed: ${m}`);
    }

    try {
      await user.save();
    } catch (e: any) {
      await deleteRefreshToken(refreshToken);
      res.clearCookie("refreshToken", { path: "/" });
      const m = typeof e?.message === "string" ? e.message : String(e);
      throw new Error(`save user failed: ${m}`);
    }

    return res.json({
      code: 200,
      message: "Register success",
      accessToken,
      user: {
        _id: user._id,
        email: (user as any).email,
        role: (user as any).role,
        fullName: (user as any).fullName,
        phone: (user as any).phone,
        avatar: (user as any).avatar,
      },
    });
  } catch (err: any) {
    const message =
      typeof err?.message === "string" ? err.message : "Internal Server Error";
    const isRedisError = isRedisErrorMessage(message);
    const isProd = process.env.NODE_ENV === "production";
    return res.status(isRedisError ? 503 : 500).json({
      message: isRedisError ? "Redis unavailable" : "Internal Server Error",
      ...(isProd ? {} : { details: message }),
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = (req.body ?? {}) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      deleted: false,
    }).select("+passwordHash");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if ((user as any).status === "blocked") {
      return res.status(403).json({ message: "User is blocked" });
    }

    const ok = await bcrypt.compare(password, (user as any).passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = signAccessToken({
      userId: String(user._id),
      role: (user as any).role,
    });

    const refreshToken = generateRandomString(64);
    try {
      await setRefreshToken(
        refreshToken,
        {
          userId: String(user._id),
          userAgent: req.headers["user-agent"],
          ip: getClientIp(req),
        },
        getRefreshTtlSeconds(),
      );
    } catch (e: any) {
      const m = typeof e?.message === "string" ? e.message : String(e);
      throw new Error(`setRefreshToken failed: ${m}`);
    }

    try {
      res.cookie("refreshToken", refreshToken, getCookieOptions());
    } catch (e: any) {
      await deleteRefreshToken(refreshToken);
      const m = typeof e?.message === "string" ? e.message : String(e);
      throw new Error(`set cookie failed: ${m}`);
    }

    (user as any).lastLoginAt = new Date();
    try {
      await user.save();
    } catch (e: any) {
      await deleteRefreshToken(refreshToken);
      res.clearCookie("refreshToken", { path: "/" });
      const m = typeof e?.message === "string" ? e.message : String(e);
      throw new Error(`save user failed: ${m}`);
    }

    return res.json({
      code: 200,
      message: "Login success",
      accessToken,
      user: {
        _id: user._id,
        email: (user as any).email,
        role: (user as any).role,
        fullName: (user as any).fullName,
        phone: (user as any).phone,
        avatar: (user as any).avatar,
      },
    });
  } catch (err: any) {
    const message =
      typeof err?.message === "string" ? err.message : "Internal Server Error";
    const isRedisError = isRedisErrorMessage(message);
    const isProd = process.env.NODE_ENV === "production";
    return res.status(isRedisError ? 503 : 500).json({
      message: isRedisError ? "Redis unavailable" : "Internal Server Error",
      ...(isProd ? {} : { details: message }),
    });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const token = (req as any).cookies?.refreshToken as string | undefined;
  if (!token) {
    return res.status(401).json({ message: "Missing refresh token" });
  }

  const data = await getRefreshToken(token);
  if (!data?.userId) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const user = await User.findOne({ _id: data.userId, deleted: false });
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  if ((user as any).status === "blocked") {
    return res.status(403).json({ message: "User is blocked" });
  }

  // rotate refresh token
  await deleteRefreshToken(token);
  const newRefreshToken = generateRandomString(64);
  await setRefreshToken(
    newRefreshToken,
    {
      userId: String(user._id),
      userAgent: req.headers["user-agent"],
      ip: getClientIp(req),
    },
    getRefreshTtlSeconds(),
  );
  res.cookie("refreshToken", newRefreshToken, getCookieOptions());

  const accessToken = signAccessToken({
    userId: String(user._id),
    role: (user as any).role,
  });

  return res.json({
    code: 200,
    message: "Refresh success",
    accessToken,
  });
};

export const logout = async (req: Request, res: Response) => {
  const token = (req as any).cookies?.refreshToken as string | undefined;
  if (token) {
    await deleteRefreshToken(token);
  }

  res.clearCookie("refreshToken", { path: "/" });
  return res.json({ code: 200, message: "Logout success" });
};

export const requestOtp = async (req: Request, res: Response) => {
  const user = (req as any).user as { _id: unknown } | undefined;
  if (!user?._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const ttlSecondsRaw = process.env.OTP_TTL_SECONDS;
  const ttlSeconds = ttlSecondsRaw ? Number(ttlSecondsRaw) : 300;
  const otpTtlSeconds =
    Number.isFinite(ttlSeconds) && ttlSeconds > 0 ? ttlSeconds : 300;

  const otpLengthRaw = process.env.OTP_LENGTH;
  const otpLength = otpLengthRaw ? Number(otpLengthRaw) : 6;
  const otpDigits = Number.isFinite(otpLength) && otpLength > 0 ? otpLength : 6;

  const otp = generateRandomNumber(otpDigits);
  await setOtp(String(user._id), otp, otpTtlSeconds);

  return res.json({
    code: 200,
    message: "OTP generated",
    otp,
    expiresInSeconds: otpTtlSeconds,
  });
};

export const verifyOtp = async (req: Request, res: Response) => {
  const user = (req as any).user as { _id: unknown } | undefined;
  if (!user?._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { otp } = (req.body ?? {}) as { otp?: string };
  if (!otp) {
    return res.status(400).json({ message: "Missing otp" });
  }

  const storedOtp = await getOtp(String(user._id));
  if (!storedOtp || storedOtp !== otp) {
    return res.status(400).json({ message: "Invalid or expired otp" });
  }

  await deleteOtp(String(user._id));

  const dbUser = await User.findOne({ _id: String(user._id), deleted: false });
  if (!dbUser) {
    return res.status(401).json({ message: "User not found" });
  }

  (dbUser as any).emailVerified = true;
  await dbUser.save();

  return res.json({
    code: 200,
    message: "Verify OTP success",
  });
};
