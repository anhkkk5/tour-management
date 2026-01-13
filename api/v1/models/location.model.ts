import mongoose, { Schema } from "mongoose";
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);
const locationSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, slug: "name", unique: true }, // Tự động tạo slug từ name
    type: { type: String, required: true },

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

const Location = mongoose.model("Location", locationSchema, "locations");
export default Location;
