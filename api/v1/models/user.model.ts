import mongoose, { Schema, Document } from "mongoose";

// Định nghĩa Interface để TypeScript hiểu cấu trúc User
export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  token?: string;
  deleted: boolean;
  deletedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true, // Ngăn chặn trùng email
      lowercase: true, // Luôn lưu email ở dạng chữ thường
      trim: true,
    },
    password: { type: String, required: true },
    token: { type: String, default: "" },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: { type: Date },
  },
  {
    timestamps: true, // Tự động tạo createdAt và updatedAt
  }
);

// Tạo model
const User = mongoose.model<IUser>("User", userSchema, "users");

export default User;
