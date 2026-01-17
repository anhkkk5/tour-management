import mongoose, { Schema } from "mongoose";

type TourScheduleStatus = "open" | "closed" | "full" | "cancelled";

export interface ITourSchedule {
  tourId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  capacity: number;
  bookedSeats: number;
  prices: {
    adult: number;
    child?: number;
    infant?: number;
  };
  bookingDeadline?: Date;
  notes?: string;
  status: TourScheduleStatus;
  deleted: boolean;
}

const tourScheduleSchema = new Schema<ITourSchedule>(
  {
    // 🔗 Liên kết tour
    tourId: {
      type: Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
      index: true,
    },

    // 📅 Thời gian khởi hành
    startDate: {
      type: Date,
      required: true,
      index: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    // 👥 Số lượng chỗ
    capacity: {
      type: Number,
      required: true,
    },

    bookedSeats: {
      type: Number,
      default: 0,
    },

    // 💰 Giá tour
    prices: {
      adult: {
        type: Number,
        required: true,
      },
      child: {
        type: Number,
      },
      infant: {
        type: Number,
      },
    },

    // ⏰ Hạn chốt booking
    bookingDeadline: {
      type: Date,
    },

    // 📝 Ghi chú riêng cho đợt này
    notes: {
      type: String,
    },

    // 🚦 Trạng thái
    status: {
      type: String,
      enum: ["open", "closed", "full", "cancelled"],
      default: "open",
      index: true,
    },

    // 🗑 Soft delete
    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// 📌 Index tổng hợp (rất quan trọng)
tourScheduleSchema.index({ tourId: 1, startDate: 1 });
tourScheduleSchema.index({ status: 1 });

// 🔥 Virtual: số chỗ còn lại
tourScheduleSchema.virtual("availableSeats").get(function () {
  return this.capacity - this.bookedSeats;
});

// 🔁 Tự động cập nhật status
(tourScheduleSchema as any).pre("save", async function(this: any) {
  if (this.capacity && this.bookedSeats !== undefined) {
    if (this.bookedSeats >= this.capacity) {
      this.status = "full";
    }
  }
});

const TourSchedule = mongoose.model<ITourSchedule>(
  "TourSchedule",
  tourScheduleSchema,
  "tourSchedules"
);

export default TourSchedule;
export { TourSchedule };
