import mongoose, { Schema } from "mongoose";
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);
const tourCategorySchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, slug: "title", unique: true }, // Tự động tạo slug từ title
    thumbnail: String,
    description: String,
    deleted: {
      type: Boolean,
      default: false,
    },
    deleteAt: Date,
  },
  {
    timestamps: true,
  }
);

const TourCategory = mongoose.model(
  "TourCategory",
  tourCategorySchema,
  "tourCategories"
);
export default TourCategory;
