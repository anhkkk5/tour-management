import mongoose, { Schema } from "mongoose";
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);
const tourSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, slug: "title", unique: true }, // Tự động tạo slug từ title
    thumbnail: String,
    thumbnailPublicId: String,
    images: [String],
    imagesPublicIds: [String],
    description: String,
    topicTourId: { type: Schema.Types.ObjectId, ref: "TopicTour" },
    departureId: { type: Schema.Types.ObjectId, ref: "Location" },
    destinationIds: [{ type: Schema.Types.ObjectId, ref: "Location" }],
    durationDays: Number,
    startSchedule: String,
    price: Number,
    availableSeats: Number,
    transportation: String,
    itinerary: [
      {
        day: Number,
        title: String,
        content: String,
      },
    ],
    policyId: { type: Schema.Types.ObjectId, ref: "TourPolicy" },
    includedServices: String,
    excludedServices: String,
    childPolicy: String,
    cancellationPolicy: String,
    notes: String,
    status: {
      type: String,
      enum: ["draft", "published", "hidden"],
      default: "draft",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deleteAt: Date,
  },
  {
    timestamps: true,
  },
);

tourSchema.index({ slug: 1 }, { unique: true });
tourSchema.index({ topicTourId: 1 });
tourSchema.index({ destinationIds: 1 });
tourSchema.index({ deleted: 1 });

const Tour = mongoose.model("Tour", tourSchema, "tours");
export default Tour;
