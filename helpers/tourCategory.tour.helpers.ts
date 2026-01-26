import mongoose from "mongoose";
import tourCategoryModel from "../api/v1/models/tourCategory/tourCategory.model";
import TopicTour from "../api/v1/models/topicTour/topicTour.model";
import Tour from "../api/v1/models/tour/tour.model";

type TopicResolveResult =
  | {
      kind: "ok";
      topicTourIdCandidates: any[];
      topicTour?: any;
      topicTourFromString?: any;
    }
  | { kind: "topic_not_found" };

export const findTourCategoryBySlug = async (categorySlug: string) => {
  return tourCategoryModel.findOne({
    deleted: false,
    slug: categorySlug,
  });
};

const uniqueByTypeAndString = (values: any[]) => {
  const map = new Map<string, any>();

  for (const v of values) {
    if (v === undefined || v === null) continue;
    const key = `${typeof v}:${String(v)}`;
    if (!map.has(key)) map.set(key, v);
  }

  return Array.from(map.values());
};

export const buildIdCandidates = (id: any) => {
  return uniqueByTypeAndString([id, String(id)]);
};

export const resolveTopicTourBySlugs = async (
  tourCategory: any,
  topicSlug: string,
): Promise<TopicResolveResult> => {
  const topicTour = await TopicTour.findOne({
    deleted: false,
    slug: topicSlug,
    tourCategoryId: tourCategory._id,
  });

  if (topicTour?._id) {
    return {
      kind: "ok",
      topicTour,
      topicTourIdCandidates: buildIdCandidates(topicTour._id),
    };
  }

  const topicTourFromString = await TopicTour.collection.findOne({
    deleted: false,
    slug: topicSlug,
    tourCategoryId: tourCategory._id.toString(),
  });

  if (!topicTourFromString?._id) {
    return { kind: "topic_not_found" };
  }

  return {
    kind: "ok",
    topicTourFromString,
    topicTourIdCandidates: buildIdCandidates(topicTourFromString._id),
  };
};

export const resolveTopicTourDocBySlugs = async (
  tourCategory: any,
  topicSlug: string,
) => {
  const resolved = await resolveTopicTourBySlugs(tourCategory, topicSlug);

  if (resolved.kind !== "ok") {
    return resolved;
  }

  if (resolved.topicTour?._id) {
    return { kind: "ok" as const, topicTour: resolved.topicTour };
  }

  const id = resolved.topicTourFromString?._id;
  if (!id) {
    return { kind: "topic_not_found" as const };
  }

  const topicTour = await TopicTour.findById(id);
  if (!topicTour) {
    return { kind: "topic_not_found" as const };
  }

  return { kind: "ok" as const, topicTour };
};

export const mergeById = (items: any[]) => {
  const map = new Map<string, any>();

  for (const item of items) {
    if (!item?._id) continue;
    map.set(String(item._id), item);
  }

  return Array.from(map.values());
};

export const listToursByTopicCandidates = async (
  topicTourIdCandidates: any[],
  deleted: boolean,
) => {
  const objectIdCandidates = topicTourIdCandidates.filter(
    (v) => typeof v !== "string",
  );

  const tours = await Tour.find({
    deleted,
    topicTourId: {
      $in: objectIdCandidates.length > 0 ? objectIdCandidates : [],
    } as any,
  });

  const toursFromString = await Tour.collection
    .find({
      deleted,
      topicTourId: { $in: topicTourIdCandidates },
    })
    .toArray();

  return mergeById([...tours, ...toursFromString]);
};

export const findTourByIdInTopic = async (
  tourId: string,
  topicTourIdCandidates: any[],
  deleted: boolean,
) => {
  const tourFromStringTopic = await Tour.collection.findOne({
    _id: new mongoose.Types.ObjectId(tourId) as any,
    deleted,
    topicTourId: { $in: topicTourIdCandidates },
  });

  if (tourFromStringTopic?._id) {
    return Tour.findById(tourFromStringTopic._id);
  }

  return Tour.findOne({
    _id: tourId,
    deleted,
    topicTourId: { $in: topicTourIdCandidates } as any,
  });
};

export const applyTourUpdatePayload = (tour: any, payload: any) => {
  if (payload?.title !== undefined) tour.title = payload.title;
  if (payload?.thumbnail !== undefined) tour.thumbnail = payload.thumbnail;
  if (payload?.thumbnailPublicId !== undefined)
    tour.thumbnailPublicId = payload.thumbnailPublicId;
  if (payload?.images !== undefined) tour.images = payload.images;
  if (payload?.imagesPublicIds !== undefined)
    tour.imagesPublicIds = payload.imagesPublicIds;
  if (payload?.description !== undefined)
    tour.description = payload.description;
  if (payload?.departureId !== undefined)
    tour.departureId = payload.departureId;
  if (payload?.destinationIds !== undefined)
    tour.destinationIds = payload.destinationIds;
  if (payload?.durationDays !== undefined)
    tour.durationDays = payload.durationDays;
  if (payload?.startSchedule !== undefined)
    tour.startSchedule = payload.startSchedule;
  if (payload?.price !== undefined) tour.price = payload.price;
  if (payload?.availableSeats !== undefined)
    tour.availableSeats = payload.availableSeats;
  if (payload?.transportation !== undefined)
    tour.transportation = payload.transportation;
  if (payload?.itinerary !== undefined) tour.itinerary = payload.itinerary;
  if (payload?.policyId !== undefined) tour.policyId = payload.policyId;
  if (payload?.includedServices !== undefined)
    tour.includedServices = payload.includedServices;
  if (payload?.excludedServices !== undefined)
    tour.excludedServices = payload.excludedServices;
  if (payload?.childPolicy !== undefined)
    tour.childPolicy = payload.childPolicy;
  if (payload?.cancellationPolicy !== undefined)
    tour.cancellationPolicy = payload.cancellationPolicy;
  if (payload?.notes !== undefined) tour.notes = payload.notes;
  if (payload?.status !== undefined) tour.status = payload.status;
};
