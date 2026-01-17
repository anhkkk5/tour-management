import mongoose from "mongoose";
import { TourSchedule } from "../../models/tourSchedule.model";
import { toObjectIdMaybe } from "../../../../utils/mongo.util";

const toDateMaybe = (v: unknown): Date | null => {
  if (v === undefined || v === null) return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  if (typeof v === "string" || typeof v === "number") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

const toNumberMaybe = (v: unknown): number | null => {
  if (v === undefined || v === null) return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

export const listTourSchedulesByTourId = async (tourId: string) => {
  const tourObjectId = toObjectIdMaybe(tourId);
  if (!tourObjectId) {
    return { kind: "invalid_id" as const };
  }

  const schedules = await TourSchedule.find({
    tourId: tourObjectId,
    deleted: false,
  }).lean();

  return { kind: "ok" as const, schedules };
};

export const getTourScheduleById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { kind: "invalid_id" as const };
  }

  const schedule = await TourSchedule.findById(id).lean();
  if (!schedule) {
    return { kind: "not_found" as const };
  }

  return { kind: "ok" as const, schedule };
};

export const createTourSchedule = async (
  tourId: string,
  payload: {
    startDate?: unknown;
    endDate?: unknown;
    capacity?: unknown;
    bookedSeats?: unknown;
    prices?: unknown;
    bookingDeadline?: unknown;
    notes?: unknown;
    status?: unknown;
  }
) => {
  const tourObjectId = toObjectIdMaybe(tourId);
  if (!tourObjectId) {
    return { kind: "invalid_id" as const };
  }

  const startDate = toDateMaybe(payload?.startDate);
  if (!startDate) {
    return { kind: "validation_error" as const, message: "Missing startDate" };
  }

  const endDate = toDateMaybe(payload?.endDate);
  if (!endDate) {
    return { kind: "validation_error" as const, message: "Missing endDate" };
  }

  const capacity = toNumberMaybe(payload?.capacity);
  if (capacity === null) {
    return { kind: "validation_error" as const, message: "Missing capacity" };
  }

  const prices = payload?.prices as any;
  const adultPrice = toNumberMaybe(prices?.adult);
  if (adultPrice === null) {
    return {
      kind: "validation_error" as const,
      message: "Missing prices.adult",
    };
  }

  const schedule = new TourSchedule({
    tourId: tourObjectId,
    startDate,
    endDate,
    capacity,
    bookedSeats: toNumberMaybe(payload?.bookedSeats) ?? 0,
    prices: {
      adult: adultPrice,
      child: toNumberMaybe(prices?.child) ?? undefined,
      infant: toNumberMaybe(prices?.infant) ?? undefined,
    },
    bookingDeadline: toDateMaybe(payload?.bookingDeadline) ?? undefined,
    notes: typeof payload?.notes === "string" ? payload.notes : undefined,
    status:
      payload?.status === "open" ||
      payload?.status === "closed" ||
      payload?.status === "full" ||
      payload?.status === "cancelled"
        ? payload.status
        : "open",
    deleted: false,
  });

  try {
    const data = await schedule.save();
    return { kind: "ok" as const, schedule: data };
  } catch (error: any) {
    return { kind: "validation_error" as const, message: error.message };
  }
};

export const updateTourScheduleById = async (
  id: string,
  payload: {
    startDate?: unknown;
    endDate?: unknown;
    capacity?: unknown;
    bookedSeats?: unknown;
    prices?: unknown;
    bookingDeadline?: unknown;
    notes?: unknown;
    status?: unknown;
  }
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { kind: "invalid_id" as const };
  }

  const schedule: any = await TourSchedule.findById(id);
  if (!schedule) {
    return { kind: "not_found" as const };
  }

  // Helper to validate and assign date
  const updateDate = (field: string, value: unknown, targetField: string) => {
    if (value !== undefined) {
      const d = toDateMaybe(value);
      if (!d) return `Invalid ${field}`;
      schedule[targetField] = d;
    }
    return null;
  };

  // Helper to validate and assign number
  const updateNumber = (field: string, value: unknown, targetField: string) => {
    if (value !== undefined) {
      const n = toNumberMaybe(value);
      if (n === null) return `Invalid ${field}`;
      schedule[targetField] = n;
    }
    return null;
  };

  const errors = [
    updateDate("startDate", payload.startDate, "startDate"),
    updateDate("endDate", payload.endDate, "endDate"),
    updateNumber("capacity", payload.capacity, "capacity"),
    updateNumber("bookedSeats", payload.bookedSeats, "bookedSeats"),
  ].filter(Boolean);

  if (errors.length > 0) {
    return { kind: "validation_error" as const, message: errors[0]! };
  }

  if (payload.prices !== undefined) {
    const prices = payload.prices as any;
    if (prices === null || typeof prices !== "object") {
      return { kind: "validation_error" as const, message: "Invalid prices" };
    }

    const adultPrice = toNumberMaybe(prices?.adult);
    if (adultPrice === null) {
      return { kind: "validation_error" as const, message: "Missing prices.adult" };
    }

    schedule.prices = {
      adult: adultPrice,
      child: toNumberMaybe(prices?.child) ?? undefined,
      infant: toNumberMaybe(prices?.infant) ?? undefined,
    };
  }

  if (payload.bookingDeadline !== undefined) {
    const d = toDateMaybe(payload.bookingDeadline);
    if (payload.bookingDeadline !== null && !d) {
       return { kind: "validation_error" as const, message: "Invalid bookingDeadline" };
    }
    schedule.bookingDeadline = d ?? undefined;
  }

  if (payload.notes !== undefined) {
    schedule.notes = typeof payload.notes === "string" ? payload.notes : undefined;
  }

  if (payload.status !== undefined) {
    const validStatuses = ["open", "closed", "full", "cancelled"];
    if (typeof payload.status !== "string" || !validStatuses.includes(payload.status)) {
      return { kind: "validation_error" as const, message: "Invalid status" };
    }
    schedule.status = payload.status;
  }

  const data = await schedule.save();
  return { kind: "ok" as const, schedule: data };
};

export const softDeleteTourScheduleById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { kind: "invalid_id" as const };
  }

  const schedule: any = await TourSchedule.findById(id);
  if (!schedule) {
    return { kind: "not_found" as const };
  }

  schedule.deleted = true;
  const data = await schedule.save();
  return { kind: "ok" as const, schedule: data };
};

export const restoreTourScheduleById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { kind: "invalid_id" as const };
  }

  const schedule: any = await TourSchedule.findById(id);
  if (!schedule) {
    return { kind: "not_found" as const };
  }

  schedule.deleted = false;
  const data = await schedule.save();
  return { kind: "ok" as const, schedule: data };
};
