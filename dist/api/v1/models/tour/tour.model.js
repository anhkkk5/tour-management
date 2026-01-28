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
const mongoose_1 = __importStar(require("mongoose"));
const slug = require("mongoose-slug-updater");
mongoose_1.default.plugin(slug);
const tourSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    slug: { type: String, slug: "title", unique: true }, // Tự động tạo slug từ title
    thumbnail: String,
    thumbnailPublicId: String,
    images: [String],
    imagesPublicIds: [String],
    description: String,
    topicTourId: { type: mongoose_1.Schema.Types.ObjectId, ref: "TopicTour" },
    departureId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Location" },
    destinationIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Location" }],
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
    policyId: { type: mongoose_1.Schema.Types.ObjectId, ref: "TourPolicy" },
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
}, {
    timestamps: true,
});
tourSchema.index({ slug: 1 }, { unique: true });
tourSchema.index({ topicTourId: 1 });
tourSchema.index({ destinationIds: 1 });
tourSchema.index({ deleted: 1 });
const Tour = mongoose_1.default.model("Tour", tourSchema, "tours");
exports.default = Tour;
