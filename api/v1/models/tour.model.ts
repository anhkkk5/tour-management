import mongoose, { Schema } from "mongoose";

const tourSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, slug: "title", unique: true }, // Tự động tạo slug từ title
    thumbnail: String,
    description: String,
    topicTourId: { type: Schema.Types.ObjectId, ref: "TopicTour" },
    location: String,
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

const Tour = mongoose.model("Tour", tourSchema, "tours");
export default Tour;
