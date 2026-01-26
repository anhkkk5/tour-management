import * as jwt from "jsonwebtoken";

export type AccessTokenPayload = {
  userId: string;
  role: "user" | "admin";
};

const getAccessTokenSecret = () => {
  const secret = process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_ACCESS_SECRET (or JWT_SECRET)");
  }
  return secret as jwt.Secret;
};

export const signAccessToken = (payload: AccessTokenPayload): string => {
  const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN ??
    "15m") as jwt.SignOptions["expiresIn"];
  return jwt.sign(payload, getAccessTokenSecret(), { expiresIn });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const decoded = jwt.verify(token, getAccessTokenSecret());
  if (typeof decoded !== "object" || decoded === null) {
    throw new Error("Invalid token payload");
  }
  const payload = decoded as any;
  if (!payload.userId || !payload.role) {
    throw new Error("Invalid token payload");
  }
  return { userId: String(payload.userId), role: payload.role };
};
