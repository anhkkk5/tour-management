import mongoose from "mongoose";
import TourPolicy from "../../models/tourPolicy/tourPolicy.model";

const normalizeStringArray = (v: unknown): string[] | null | undefined => {
  if (v === undefined) return undefined;
  if (!v) return [];
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string");
  return null;
};

export const listTourPolicies = async () => {
  return TourPolicy.find({});
};

export const getTourPolicyById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { kind: "invalid_id" as const };
  }

  const policy = await TourPolicy.findById(id);
  if (!policy) {
    return { kind: "not_found" as const };
  }

  return { kind: "ok" as const, policy };
};

export const createTourPolicy = async (payload: {
  includedServices?: unknown;
  excludedServices?: unknown;
  childPolicy?: unknown;
  cancellationPolicy?: unknown;
}) => {
  const includedServices = normalizeStringArray(payload?.includedServices);
  if (includedServices === null) {
    return {
      kind: "validation_error" as const,
      message: "includedServices must be an array of strings",
    };
  }

  const excludedServices = normalizeStringArray(payload?.excludedServices);
  if (excludedServices === null) {
    return {
      kind: "validation_error" as const,
      message: "excludedServices must be an array of strings",
    };
  }

  const policy = new TourPolicy({
    includedServices: includedServices ?? [],
    excludedServices: excludedServices ?? [],
    childPolicy:
      typeof payload?.childPolicy === "string"
        ? payload.childPolicy
        : undefined,
    cancellationPolicy:
      typeof payload?.cancellationPolicy === "string"
        ? payload.cancellationPolicy
        : undefined,
  });

  const data = await policy.save();
  return { kind: "ok" as const, policy: data };
};

export const updateTourPolicyById = async (
  id: string,
  payload: {
    includedServices?: unknown;
    excludedServices?: unknown;
    childPolicy?: unknown;
    cancellationPolicy?: unknown;
  },
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { kind: "invalid_id" as const };
  }

  const policy = await TourPolicy.findById(id);
  if (!policy) {
    return { kind: "not_found" as const };
  }

  const includedServices = normalizeStringArray(payload?.includedServices);
  if (includedServices === null) {
    return {
      kind: "validation_error" as const,
      message: "includedServices must be an array of strings",
    };
  }

  const excludedServices = normalizeStringArray(payload?.excludedServices);
  if (excludedServices === null) {
    return {
      kind: "validation_error" as const,
      message: "excludedServices must be an array of strings",
    };
  }

  if (includedServices !== undefined)
    policy.includedServices = includedServices;
  if (excludedServices !== undefined)
    policy.excludedServices = excludedServices;
  if (payload?.childPolicy !== undefined) {
    policy.childPolicy =
      typeof payload.childPolicy === "string" ? payload.childPolicy : undefined;
  }
  if (payload?.cancellationPolicy !== undefined) {
    policy.cancellationPolicy =
      typeof payload.cancellationPolicy === "string"
        ? payload.cancellationPolicy
        : undefined;
  }

  const data = await policy.save();
  return { kind: "ok" as const, policy: data };
};

export const deleteTourPolicyById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { kind: "invalid_id" as const };
  }

  const policy = await TourPolicy.findById(id);
  if (!policy) {
    return { kind: "not_found" as const };
  }

  await TourPolicy.deleteOne({ _id: policy._id });
  return { kind: "ok" as const };
};
