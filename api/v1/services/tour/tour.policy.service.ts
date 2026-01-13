import TourPolicy from "../../models/tourPolicy.model";
import { toObjectIdMaybe } from "../../../../utils/mongo.util";

const normalizeList = (v: unknown): string[] => {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string");
  if (typeof v !== "string") return [];

  return v
    .split(/\r?\n|\u2022|\-|\*/)
    .map((s) => s.trim())
    .filter(Boolean);
};

export const getTourPolicy = async (tourObj: any) => {
  const policyId = toObjectIdMaybe(tourObj.policyId);

  if (policyId) {
    const policy = await TourPolicy.findById(policyId);
    if (policy) return policy;
  }

  const includedServices = normalizeList(tourObj.includedServices);
  const excludedServices = normalizeList(tourObj.excludedServices);

  if (
    includedServices.length ||
    excludedServices.length ||
    tourObj.childPolicy ||
    tourObj.cancellationPolicy
  ) {
    return {
      includedServices,
      excludedServices,
      childPolicy: tourObj.childPolicy ?? null,
      cancellationPolicy: tourObj.cancellationPolicy ?? null,
    };
  }

  return null;
};
