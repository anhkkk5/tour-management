"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TourSchedule = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const tourScheduleSchema = new mongoose_1.Schema({
    // 🔗 Liên kết tour
    tourId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
// 📌 Index tổng hợp (rất quan trọng)
tourScheduleSchema.index({ tourId: 1, startDate: 1 });
tourScheduleSchema.index({ status: 1 });
// 🔥 Virtual: số chỗ còn lại
tourScheduleSchema.virtual("availableSeats").get(function () {
    return this.capacity - this.bookedSeats;
});
// 🔁 Tự động cập nhật status
tourScheduleSchema.pre("save", async function () {
    if (this.capacity && this.bookedSeats !== undefined) {
        if (this.bookedSeats >= this.capacity) {
            this.status = "full";
        }
    }
});
const TourSchedule = mongoose_1.default.model("TourSchedule", tourScheduleSchema, "tourSchedules");
exports.TourSchedule = TourSchedule;
exports.default = TourSchedule;
