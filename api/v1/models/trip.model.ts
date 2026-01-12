import mongoose, { Schema, Document } from "mongoose";
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);

export interface ITrip extends Document {
  title: string;
  slug: string;
  destination: string;
  budget: number;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  aiPlan: object; // Dữ liệu JSON từ Gemini
  thumbnail: string;
}

const TripSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, slug: "title", unique: true }, // Tự động tạo slug từ title
    destination: { type: String, required: true },
    budget: { type: Number, default: 0 },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    aiPlan: { type: Object }, // Lưu toàn bộ JSON mà AI trả về
    thumbnail: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ITrip>("Trip", TripSchema, "trips");
