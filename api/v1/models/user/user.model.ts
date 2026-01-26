import mongoose, { Schema, Document } from "mongoose";

interface IUser extends Document {
  email: string;
  passwordHash: string;

  fullName?: string;
  phone?: string;
  avatar?: string;

  role: "user" | "admin";
  emailVerified: boolean;
  status: "active" | "blocked";
  lastLoginAt?: Date;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },

    fullName: String,
    phone: String,
    avatar: String,

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    emailVerified: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },

    lastLoginAt: Date,

    deleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Tạo model
const User = mongoose.model<IUser>("User", userSchema, "users");

export default User;
