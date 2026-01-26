import crypto from "crypto";

export const generateRandomString = (length = 64): string => {
  const bytes = crypto.randomBytes(Math.ceil(length / 2));
  return bytes.toString("hex").slice(0, length);
};
