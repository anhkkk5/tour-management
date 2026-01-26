import mongoose from "mongoose";
import locationModel from "../../models/location/location.model";

const isValidLocationType = (
  value: unknown,
): value is "domestic" | "international" => {
  return value === "domestic" || value === "international";
};

export const listLocations = async () => {
  return locationModel
    .find({
      deleted: false,
    })
    .select("_id name slug type");
};

export const getDeletedLocations = async () => {
  return locationModel
    .find({
      deleted: true,
    })
    .select("_id name slug type deleted deleteAt");
};

export const getLocationById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { kind: "invalid_id" as const };
  }

  const location = await locationModel.findById(id);

  if (!location) {
    return { kind: "not_found" as const };
  }

  return { kind: "ok" as const, location };
};

export const createLocation = async (payload: {
  name?: string;
  type?: string;
}) => {
  if (!payload?.name) {
    return { kind: "validation_error" as const, message: "Missing name" };
  }

  if (!payload?.type) {
    return { kind: "validation_error" as const, message: "Missing type" };
  }

  if (!isValidLocationType(payload.type)) {
    return {
      kind: "validation_error" as const,
      message: "Invalid type (must be domestic or international)",
    };
  }

  const location = new locationModel({
    name: payload.name,
    type: payload.type,
  });

  try {
    const data = await location.save();
    return { kind: "ok" as const, location: data };
  } catch (error: any) {
    if (error?.code === 11000) {
      return { kind: "duplicate_slug" as const };
    }
    throw error;
  }
};

export const updateLocationById = async (
  id: string,
  payload: {
    name?: string;
    type?: string;
  },
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { kind: "invalid_id" as const };
  }

  const location: any = await locationModel.findOne({
    _id: id,
    deleted: false,
  });

  if (!location) {
    return { kind: "not_found" as const };
  }

  if (payload?.name !== undefined && !payload.name) {
    return { kind: "validation_error" as const, message: "Missing name" };
  }

  if (payload?.type !== undefined && !payload.type) {
    return { kind: "validation_error" as const, message: "Missing type" };
  }

  if (payload?.type !== undefined && !isValidLocationType(payload.type)) {
    return {
      kind: "validation_error" as const,
      message: "Invalid type (must be domestic or international)",
    };
  }

  if (payload?.name !== undefined) location.name = payload.name;
  if (payload?.type !== undefined) location.type = payload.type;

  try {
    const data = await location.save();
    return { kind: "ok" as const, location: data };
  } catch (error: any) {
    if (error?.code === 11000) {
      return { kind: "duplicate_slug" as const };
    }
    throw error;
  }
};

export const softDeleteLocationById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { kind: "invalid_id" as const };
  }

  const location: any = await locationModel.findOne({
    _id: id,
    deleted: false,
  });

  if (!location) {
    return { kind: "not_found" as const };
  }

  location.deleted = true;
  location.deleteAt = new Date();

  const data = await location.save();
  return { kind: "ok" as const, location: data };
};

export const restoreLocationById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { kind: "invalid_id" as const };
  }

  const location: any = await locationModel.findOne({
    _id: id,
    deleted: true,
  });

  if (!location) {
    return { kind: "not_found" as const };
  }

  location.deleted = false;
  location.deleteAt = undefined;

  const data = await location.save();
  return { kind: "ok" as const, location: data };
};
