import mongoose from "mongoose";

export const toObjectIdMaybe = (
  value: unknown
): mongoose.Types.ObjectId | null => {
  if (!value) return null;
  if (value instanceof mongoose.Types.ObjectId) return value;
  if (typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value)) {
    return new mongoose.Types.ObjectId(value);
  }
  return null;
};
