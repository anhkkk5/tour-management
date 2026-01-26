import mongoose, { Schema } from "mongoose";

const tourPolicySchema = new Schema(
  {
    includedServices: [String],
    excludedServices: [String],
    childPolicy: String,
    cancellationPolicy: String,
  },
  {
    timestamps: true,
  }
);

const TourPolicy = mongoose.model(
  "TourPolicy",
  tourPolicySchema,
  "tourPolicies"
);

export default TourPolicy;
