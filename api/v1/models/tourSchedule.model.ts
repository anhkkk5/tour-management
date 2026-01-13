import mongoose, { Schema } from "mongoose";

const tourScheduleSchema = new Schema(
  {
    tourId: { type: Schema.Types.ObjectId, ref: "Tour", required: true },
    startDate: Date,
    endDate: Date,
    price: Number,
    availableSeats: Number,
    status: {
      type: String,
      enum: ["open", "closed", "full"],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

tourScheduleSchema.index({ tourId: 1, startDate: 1 });

tourScheduleSchema.index({ status: 1 });

const TourSchedule = mongoose.model(
  "TourSchedule",
  tourScheduleSchema,
  "tourSchedules"
);

export default TourSchedule;
