import mongoose, { Schema } from "mongoose";
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);
const topicTourSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, slug: "title", unique: true }, // Tự động tạo slug từ title
    thumbnail: String,
    description: String,
    tourCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "TourCategory",
      required: true,
    },
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

const TopicTour = mongoose.model("TopicTour", topicTourSchema, "topicTours");
export default TopicTour;
