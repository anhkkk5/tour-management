import mongoose from "mongoose";
import Tour from "../../models/tour.model";
import { loadTourRelations } from "./tour.relation.service";
import { getTourSchedules } from "./tour.schedule.service";
import { getTourPolicy } from "./tour.policy.service";
import { toObjectIdMaybe } from "../../../../utils/mongo.util";

// Define strict types for payload
interface TourUpdatePayload {
  title?: string;
  thumbnail?: string;
  images?: string[];
  description?: string;
  departureId?: string | null;
  destinationIds?: string[] | null;
  durationDays?: number;
  startSchedule?: string;
  price?: number;
  availableSeats?: number;
  transportation?: string;
  itinerary?: Array<{ day?: number; title?: string; content?: string }>;
  policyId?: string | null;
  notes?: string;
  status?: "draft" | "published" | "hidden";
}

// [Get] api/v1/tours/:slugTour
export const getTourDetailBySlug = async (slug: string) => {
  const tour = await Tour.findOne({ deleted: false, slug });

  if (!tour) {
    return { kind: "not_found" as const };
  }

  const tourObj = tour.toObject();

  const [relations, schedules, policy] = await Promise.all([
    loadTourRelations(tourObj),
    getTourSchedules(tourObj),
    getTourPolicy(tourObj),
  ]);

  return {
    kind: "ok" as const,
    tour: tourObj,
    ...relations,
    schedules,
    policy,
  };
};

// [Patch] api/v1/tours/edit/:id
export const updateTourById = async (
  id: string,
  payload: TourUpdatePayload
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { kind: "invalid_id" as const };
  }

  const tour = await Tour.findOne({ _id: id, deleted: false });

  if (!tour) {
    return { kind: "not_found" as const };
  }

  // Validate title if provided but empty
  if (payload.title !== undefined && !payload.title) {
    return { kind: "validation_error" as const, message: "Missing title" };
  }

  // Simple fields mapping
  const simpleFields: (keyof TourUpdatePayload)[] = [
    "title",
    "thumbnail",
    "images",
    "description",
    "durationDays",
    "startSchedule",
    "price",
    "availableSeats",
    "transportation",
    "itinerary",
    "notes",
    "status",
  ];

  simpleFields.forEach((field) => {
    if (payload[field] !== undefined) {
      (tour as any)[field] = payload[field];
    }
  });

  // Handle specific fields
  if (payload.departureId !== undefined) {
    if (payload.departureId === null) {
      tour.departureId = null;
    } else {
      const depId = toObjectIdMaybe(payload.departureId);
      if (!depId) {
        return {
          kind: "validation_error" as const,
          message: "Invalid departureId",
        };
      }
      tour.departureId = depId;
    }
  }

  if (payload.destinationIds !== undefined) {
    if (Array.isArray(payload.destinationIds)) {
      const mapped = payload.destinationIds.map(toObjectIdMaybe);
      const hasInvalid = mapped.some((id) => id === null);

      if (hasInvalid) {
        return {
          kind: "validation_error" as const,
          message: "Invalid destinationIds",
        };
      }

      tour.destinationIds = mapped as mongoose.Types.ObjectId[];
    } else if (payload.destinationIds === null) {
      tour.destinationIds = [];
    } else {
      return {
        kind: "validation_error" as const,
        message: "destinationIds must be an array",
      };
    }
  }

  if (payload.policyId !== undefined) {
    if (payload.policyId === null) {
      tour.policyId = null;
    } else {
      const pId = toObjectIdMaybe(payload.policyId);
      if (!pId) {
        return {
          kind: "validation_error" as const,
          message: "Invalid policyId",
        };
      }
      tour.policyId = pId;
    }
  }

  try {
    const data = await tour.save();
    return { kind: "ok" as const, tour: data };
  } catch (error: any) {
    if (error?.code === 11000) {
      return { kind: "duplicate_slug" as const };
    }
    throw error;
  }
};
