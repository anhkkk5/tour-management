import mongoose from "mongoose";
import Tour from "../../models/tour/tour.model";
import { createTourPolicy } from "../tours/tour.policy.crud.service";
import { toObjectIdMaybe } from "../../../../utils/mongo.util";
import { deleteFromCloudinary } from "../../../../helpers/uploadToCloudinary";

import {
  applyTourUpdatePayload,
  findTourByIdInTopic,
  findTourCategoryBySlug,
  listToursByTopicCandidates,
  resolveTopicTourBySlugs,
  resolveTopicTourDocBySlugs,
} from "../../../../helpers/tourCategory.tour.helpers";

// [Get] api/v1/tourCategories/:slugTopicTour/:slugTour
export const getToursByCategorySlugAndTopicSlug = async (
  categorySlug: string,
  topicSlug: string,
) => {
  const tourCategory = await findTourCategoryBySlug(categorySlug);

  if (!tourCategory) {
    return { kind: "category_not_found" as const };
  }

  const resolved = await resolveTopicTourBySlugs(tourCategory, topicSlug);

  if (resolved.kind !== "ok") {
    return { kind: "topic_not_found" as const };
  }

  const tours = await listToursByTopicCandidates(
    resolved.topicTourIdCandidates,
    false,
  );

  return {
    kind: "ok" as const,
    tours,
  };
};
// [Get] api/v1/tourCategories/:slugTopicTour/:slugTour/deleted
export const getDeletedToursByCategorySlugAndTopicSlug = async (
  categorySlug: string,
  topicSlug: string,
) => {
  const tourCategory = await findTourCategoryBySlug(categorySlug);

  if (!tourCategory) {
    return { kind: "category_not_found" as const };
  }

  const resolved = await resolveTopicTourBySlugs(tourCategory, topicSlug);

  if (resolved.kind !== "ok") {
    return { kind: "topic_not_found" as const };
  }

  const tours = await listToursByTopicCandidates(
    resolved.topicTourIdCandidates,
    true,
  );

  return {
    kind: "ok" as const,
    tours,
  };
};

// [Post] api/v1/tourCategories/:slugTopicTour/:slugTour/create
export const createTour = async (
  categorySlug: string,
  topicSlug: string,
  payload: {
    title?: string;
    thumbnail?: string;
    thumbnailPublicId?: string;
    images?: string[];
    imagesPublicIds?: string[];
    description?: string;
    departureId?: unknown;
    destinationIds?: unknown;
    durationDays?: unknown;
    startSchedule?: unknown;
    price?: unknown;
    availableSeats?: unknown;
    transportation?: unknown;
    itinerary?: unknown;
    policyId?: unknown;
    policy?: {
      includedServices?: unknown;
      excludedServices?: unknown;
      childPolicy?: unknown;
      cancellationPolicy?: unknown;
    };
    notes?: string;
    status?: "draft" | "published" | "hidden";
  },
) => {
  if (!payload?.title) {
    return { kind: "validation_error" as const, message: "Missing title" };
  }

  if (!payload?.thumbnail) {
    return { kind: "validation_error" as const, message: "Missing thumbnail" };
  }

  if (!payload?.description) {
    return {
      kind: "validation_error" as const,
      message: "Missing description",
    };
  }

  const durationDays =
    typeof payload?.durationDays === "number" ? payload.durationDays : null;
  if (durationDays === null) {
    return {
      kind: "validation_error" as const,
      message: "Missing durationDays",
    };
  }

  const startSchedule =
    typeof payload?.startSchedule === "string" ? payload.startSchedule : null;
  if (!startSchedule) {
    return {
      kind: "validation_error" as const,
      message: "Missing startSchedule",
    };
  }

  const price = typeof payload?.price === "number" ? payload.price : null;
  if (price === null) {
    return { kind: "validation_error" as const, message: "Missing price" };
  }

  const availableSeats =
    typeof payload?.availableSeats === "number" ? payload.availableSeats : null;
  if (availableSeats === null) {
    return {
      kind: "validation_error" as const,
      message: "Missing availableSeats",
    };
  }

  const transportation =
    typeof payload?.transportation === "string" ? payload.transportation : null;
  if (!transportation) {
    return {
      kind: "validation_error" as const,
      message: "Missing transportation",
    };
  }

  const images =
    payload?.images === undefined
      ? []
      : Array.isArray(payload.images) &&
          payload.images.every((x) => typeof x === "string")
        ? payload.images
        : null;
  if (images === null) {
    return {
      kind: "validation_error" as const,
      message: "images must be an array of strings",
    };
  }

  const imagesPublicIds =
    payload?.imagesPublicIds === undefined
      ? []
      : Array.isArray(payload.imagesPublicIds) &&
          payload.imagesPublicIds.every((x) => typeof x === "string")
        ? payload.imagesPublicIds
        : null;
  if (imagesPublicIds === null) {
    return {
      kind: "validation_error" as const,
      message: "imagesPublicIds must be an array of strings",
    };
  }

  const itinerary = Array.isArray(payload?.itinerary)
    ? (payload.itinerary as any[])
    : null;
  if (!itinerary || itinerary.length === 0) {
    return {
      kind: "validation_error" as const,
      message: "Missing itinerary",
    };
  }

  const departureId = toObjectIdMaybe(payload?.departureId);
  if (!departureId) {
    return {
      kind: "validation_error" as const,
      message: "Invalid departureId",
    };
  }

  const destinationIdsRaw = payload?.destinationIds;
  if (!Array.isArray(destinationIdsRaw) || destinationIdsRaw.length === 0) {
    return {
      kind: "validation_error" as const,
      message: "destinationIds must be a non-empty array",
    };
  }

  const destinationIdsMapped = destinationIdsRaw.map(toObjectIdMaybe);
  if (destinationIdsMapped.some((id) => id === null)) {
    return {
      kind: "validation_error" as const,
      message: "Invalid destinationIds",
    };
  }

  const policyIdRaw = payload?.policyId;
  const policyObj = payload?.policy;

  if (policyIdRaw !== undefined && policyObj !== undefined) {
    return {
      kind: "validation_error" as const,
      message: "Provide either policyId or policy (not both)",
    };
  }

  let policyId =
    policyIdRaw === undefined ? undefined : toObjectIdMaybe(policyIdRaw);
  if (policyIdRaw !== undefined && !policyId) {
    return { kind: "validation_error" as const, message: "Invalid policyId" };
  }

  if (policyObj !== undefined) {
    const created = await createTourPolicy({
      includedServices: policyObj?.includedServices,
      excludedServices: policyObj?.excludedServices,
      childPolicy: policyObj?.childPolicy,
      cancellationPolicy: policyObj?.cancellationPolicy,
    });

    if (created.kind === "validation_error") {
      return { kind: "validation_error" as const, message: created.message };
    }

    policyId = created.policy._id;
  }

  const tourCategory = await findTourCategoryBySlug(categorySlug);

  if (!tourCategory) {
    return { kind: "category_not_found" as const };
  }

  const topicResolved = await resolveTopicTourDocBySlugs(
    tourCategory,
    topicSlug,
  );

  if (topicResolved.kind !== "ok") {
    return { kind: "topic_not_found" as const };
  }

  const tour = new Tour({
    title: payload.title,
    thumbnail: payload.thumbnail,
    thumbnailPublicId: payload.thumbnailPublicId,
    images,
    imagesPublicIds,
    description: payload.description,
    topicTourId: topicResolved.topicTour._id,
    departureId,
    destinationIds: destinationIdsMapped as mongoose.Types.ObjectId[],
    durationDays,
    startSchedule,
    price,
    availableSeats,
    transportation,
    itinerary,
    policyId,
    notes: payload.notes,
    status: "draft",
  });

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

// [Patch] api/v1/tourCategories/:slugTopicTour/:slugTour/edit/{id}
export const updateTourById = async (
  categorySlug: string,
  topicSlug: string,
  tourId: string,
  payload: {
    title?: string;
    thumbnail?: string;
    thumbnailPublicId?: string;
    images?: string[];
    imagesPublicIds?: string[];
    description?: string;
    departureId?: string;
    destinationIds?: string[];
    durationDays?: number;
    startSchedule?: string;
    price?: number;
    availableSeats?: number;
    transportation?: string;
    itinerary?: Array<{ day?: number; title?: string; content?: string }>;
    policyId?: string;
    includedServices?: string;
    excludedServices?: string;
    childPolicy?: string;
    cancellationPolicy?: string;
    notes?: string;
    status?: "draft" | "published" | "hidden";
  },
) => {
  if (!mongoose.Types.ObjectId.isValid(tourId)) {
    return { kind: "invalid_id" as const };
  }

  const tourCategory = await findTourCategoryBySlug(categorySlug);

  if (!tourCategory) {
    return { kind: "category_not_found" as const };
  }

  const topicResolved = await resolveTopicTourBySlugs(tourCategory, topicSlug);

  if (topicResolved.kind !== "ok") {
    return { kind: "topic_not_found" as const };
  }

  const tour = await findTourByIdInTopic(
    tourId,
    topicResolved.topicTourIdCandidates,
    false,
  );

  if (!tour) {
    return { kind: "tour_not_found" as const };
  }

  if (
    payload.thumbnailPublicId !== undefined &&
    payload.thumbnailPublicId &&
    tour.thumbnailPublicId &&
    payload.thumbnailPublicId !== tour.thumbnailPublicId
  ) {
    await deleteFromCloudinary(tour.thumbnailPublicId);
  }

  if (payload?.title !== undefined && !payload.title) {
    return { kind: "validation_error" as const, message: "Missing title" };
  }

  applyTourUpdatePayload(tour, payload);

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

// [Patch] api/v1/tourCategories/:slugTopicTour/:slugTour/delete/{id}
export const softDeleteTourById = async (
  categorySlug: string,
  topicSlug: string,
  tourId: string,
) => {
  if (!mongoose.Types.ObjectId.isValid(tourId)) {
    return { kind: "invalid_id" as const };
  }

  const tourCategory = await findTourCategoryBySlug(categorySlug);

  if (!tourCategory) {
    return { kind: "category_not_found" as const };
  }

  const topicResolved = await resolveTopicTourBySlugs(tourCategory, topicSlug);

  if (topicResolved.kind !== "ok") {
    return { kind: "topic_not_found" as const };
  }

  const tour = await findTourByIdInTopic(
    tourId,
    topicResolved.topicTourIdCandidates,
    false,
  );

  if (!tour) {
    return { kind: "tour_not_found" as const };
  }

  tour.deleted = true;
  tour.deleteAt = new Date();

  const data = await tour.save();

  return { kind: "ok" as const, tour: data };
};

// [Patch] api/v1/tourCategories/:slugTopicTour/:slugTour/restore/{id}
export const restoreTourById = async (
  categorySlug: string,
  topicSlug: string,
  tourId: string,
) => {
  if (!mongoose.Types.ObjectId.isValid(tourId)) {
    return { kind: "invalid_id" as const };
  }

  const tourCategory = await findTourCategoryBySlug(categorySlug);

  if (!tourCategory) {
    return { kind: "category_not_found" as const };
  }

  const topicResolved = await resolveTopicTourBySlugs(tourCategory, topicSlug);

  if (topicResolved.kind !== "ok") {
    return { kind: "topic_not_found" as const };
  }

  const tour = await findTourByIdInTopic(
    tourId,
    topicResolved.topicTourIdCandidates,
    true,
  );

  if (!tour || tour.deleted !== true) {
    return { kind: "tour_not_found" as const };
  }

  tour.deleted = false;
  tour.deleteAt = undefined;

  const data = await tour.save();

  return { kind: "ok" as const, tour: data };
};

// [Patch] api/v1/tourCategories/:slugTopicTour/:slugTour/bulk
export const bulkUpdateToursById = async (
  categorySlug: string,
  topicSlug: string,
  payload: {
    updates?: Array<{
      id?: string;
      title?: string;
      thumbnail?: string;
      images?: string[];
      description?: string;
      departureId?: string;
      destinationIds?: string[];
      durationDays?: number;
      startSchedule?: string;
      price?: number;
      availableSeats?: number;
      transportation?: string;
      itinerary?: Array<{ day?: number; title?: string; content?: string }>;
      policyId?: string;
      includedServices?: string;
      excludedServices?: string;
      childPolicy?: string;
      cancellationPolicy?: string;
      notes?: string;
      status?: "draft" | "published" | "hidden";
    }>;
  },
) => {
  if (!Array.isArray(payload?.updates) || payload.updates.length === 0) {
    return {
      kind: "validation_error" as const,
      message: "Missing updates",
    };
  }

  const tourCategory = await findTourCategoryBySlug(categorySlug);

  if (!tourCategory) {
    return { kind: "category_not_found" as const };
  }

  const topicResolved = await resolveTopicTourBySlugs(tourCategory, topicSlug);

  if (topicResolved.kind !== "ok") {
    return { kind: "topic_not_found" as const };
  }

  const results = await Promise.all(
    payload.updates.map(async (u) => {
      if (!u?.id) {
        return { id: u?.id ?? null, kind: "validation_error" as const };
      }

      const result = await updateTourById(categorySlug, topicSlug, u.id, {
        title: u.title,
        thumbnail: u.thumbnail,
        images: u.images,
        description: u.description,
        departureId: u.departureId,
        destinationIds: u.destinationIds,
        durationDays: u.durationDays,
        startSchedule: u.startSchedule,
        price: u.price,
        availableSeats: u.availableSeats,
        transportation: u.transportation,
        itinerary: u.itinerary,
        policyId: u.policyId,
        includedServices: u.includedServices,
        excludedServices: u.excludedServices,
        childPolicy: u.childPolicy,
        cancellationPolicy: u.cancellationPolicy,
        notes: u.notes,
        status: u.status,
      });

      return { id: u.id, ...result };
    }),
  );

  return { kind: "ok" as const, results };
};

// [Patch] api/v1/tourCategories/:slugTopicTour/:slugTour/restore/bulk
export const bulkRestoreToursById = async (
  categorySlug: string,
  topicSlug: string,
  payload: {
    ids?: string[];
  },
) => {
  if (!Array.isArray(payload?.ids) || payload.ids.length === 0) {
    return {
      kind: "validation_error" as const,
      message: "Missing ids",
    };
  }

  const tourCategory = await findTourCategoryBySlug(categorySlug);

  if (!tourCategory) {
    return { kind: "category_not_found" as const };
  }

  const topicResolved = await resolveTopicTourBySlugs(tourCategory, topicSlug);

  if (topicResolved.kind !== "ok") {
    return { kind: "topic_not_found" as const };
  }

  const results = await Promise.all(
    payload.ids.map(async (id) => {
      const result = await restoreTourById(categorySlug, topicSlug, id);
      return { id, ...result };
    }),
  );

  return { kind: "ok" as const, results };
};
