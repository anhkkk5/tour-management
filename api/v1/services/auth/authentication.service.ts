import { generateRandomString } from "../../../../helpers/generate";
import { signAccessToken } from "../../../../utils/jwt.util";
import {
  deleteRefreshToken,
  getRefreshToken,
  isRedisErrorMessage,
  setRefreshToken,
} from "../../repositories/auth/redis.repository";
import {
  findActiveUserByEmailWithPasswordHash,
  findActiveUserById,
  saveUser,
} from "../../repositories/auth/user.repository";
import {
  validateLoginInput,
  validateRefreshInput,
} from "../../validators/auth/authentication.validator";
import { getRefreshTtlSeconds } from "./token.service";

const bcrypt = require("bcrypt");

export const login = async (payload: {
  email?: string;
  password?: string;
  userAgent?: string;
  ip?: string;
}) => {
  const validated = validateLoginInput(payload);
  if (validated.kind === "validation_error") return validated;

  const user = await findActiveUserByEmailWithPasswordHash(validated.email);

  if (!user) {
    return { kind: "unauthorized" as const, message: "Invalid credentials" };
  }

  if ((user as any).status === "blocked") {
    return { kind: "forbidden" as const, message: "User is blocked" };
  }

  const ok = await bcrypt.compare(
    validated.password,
    (user as any).passwordHash,
  );
  if (!ok) {
    return { kind: "unauthorized" as const, message: "Invalid credentials" };
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
        userAgent: payload.userAgent,
        ip: payload.ip,
      },
      getRefreshTtlSeconds(),
    );
  } catch (e: any) {
    const m = typeof e?.message === "string" ? e.message : String(e);
    return {
      kind: "redis_error" as const,
      message: "Redis unavailable",
      details: m,
    };
  }

  (user as any).lastLoginAt = new Date();
  try {
    await saveUser(user);
  } catch (e: any) {
    await deleteRefreshToken(refreshToken);
    const m = typeof e?.message === "string" ? e.message : String(e);
    return {
      kind: "internal_error" as const,
      message: "Internal Server Error",
      details: m,
    };
  }

  return {
    kind: "ok" as const,
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      email: (user as any).email,
      role: (user as any).role,
      fullName: (user as any).fullName,
      phone: (user as any).phone,
      avatar: (user as any).avatar,
    },
  };
};

export const refresh = async (payload: {
  refreshToken?: string;
  userAgent?: string;
  ip?: string;
}) => {
  const validated = validateRefreshInput({
    refreshToken: payload.refreshToken,
  });
  if (validated.kind === "missing_refresh") return validated;

  let data: { userId?: string } | null;
  try {
    data = await getRefreshToken(validated.refreshToken);
  } catch (e: any) {
    const m = typeof e?.message === "string" ? e.message : String(e);
    return {
      kind: "redis_error" as const,
      message: "Redis unavailable",
      details: m,
    };
  }

  if (!data?.userId) {
    return {
      kind: "invalid_refresh" as const,
      message: "Invalid refresh token",
    };
  }

  const user = await findActiveUserById(data.userId);
  if (!user) {
    return { kind: "invalid_refresh" as const, message: "User not found" };
  }

  if ((user as any).status === "blocked") {
    return { kind: "forbidden" as const, message: "User is blocked" };
  }

  const newRefreshToken = generateRandomString(64);

  try {
    await setRefreshToken(
      newRefreshToken,
      {
        userId: String(user._id),
        userAgent: payload.userAgent,
        ip: payload.ip,
      },
      getRefreshTtlSeconds(),
    );
    await deleteRefreshToken(validated.refreshToken);
  } catch (e: any) {
    const m = typeof e?.message === "string" ? e.message : String(e);
    return {
      kind: "redis_error" as const,
      message: isRedisErrorMessage(m)
        ? "Redis unavailable"
        : "Internal Server Error",
      details: m,
    };
  }

  const accessToken = signAccessToken({
    userId: String(user._id),
    role: (user as any).role,
  });

  return {
    kind: "ok" as const,
    accessToken,
    refreshToken: newRefreshToken,
  };
};

export const logout = async (payload: { refreshToken?: string }) => {
  const token = payload.refreshToken;
  if (token) {
    try {
      await deleteRefreshToken(token);
    } catch (e: any) {
      const m = typeof e?.message === "string" ? e.message : String(e);
      return {
        kind: "redis_error" as const,
        message: "Redis unavailable",
        details: m,
      };
    }
  }

  return { kind: "ok" as const };
};
