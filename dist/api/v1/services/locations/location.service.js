"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreLocationById = exports.softDeleteLocationById = exports.updateLocationById = exports.createLocation = exports.getLocationById = exports.getDeletedLocations = exports.listLocations = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const location_model_1 = __importDefault(require("../../models/location/location.model"));
const isValidLocationType = (value) => {
    return value === "domestic" || value === "international";
};
const listLocations = async () => {
    return location_model_1.default
        .find({
        deleted: false,
    })
        .select("_id name slug type");
};
exports.listLocations = listLocations;
const getDeletedLocations = async () => {
    return location_model_1.default
        .find({
        deleted: true,
    })
        .select("_id name slug type deleted deleteAt");
};
exports.getDeletedLocations = getDeletedLocations;
const getLocationById = async (id) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        return { kind: "invalid_id" };
    }
    const location = await location_model_1.default.findById(id);
    if (!location) {
        return { kind: "not_found" };
    }
    return { kind: "ok", location };
};
exports.getLocationById = getLocationById;
const createLocation = async (payload) => {
    if (!payload?.name) {
        return { kind: "validation_error", message: "Missing name" };
    }
    if (!payload?.type) {
        return { kind: "validation_error", message: "Missing type" };
    }
    if (!isValidLocationType(payload.type)) {
        return {
            kind: "validation_error",
            message: "Invalid type (must be domestic or international)",
        };
    }
    const location = new location_model_1.default({
        name: payload.name,
        type: payload.type,
    });
    try {
        const data = await location.save();
        return { kind: "ok", location: data };
    }
    catch (error) {
        if (error?.code === 11000) {
            return { kind: "duplicate_slug" };
        }
        throw error;
    }
};
exports.createLocation = createLocation;
const updateLocationById = async (id, payload) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        return { kind: "invalid_id" };
    }
    const location = await location_model_1.default.findOne({
        _id: id,
        deleted: false,
    });
    if (!location) {
        return { kind: "not_found" };
    }
    if (payload?.name !== undefined && !payload.name) {
        return { kind: "validation_error", message: "Missing name" };
    }
    if (payload?.type !== undefined && !payload.type) {
        return { kind: "validation_error", message: "Missing type" };
    }
    if (payload?.type !== undefined && !isValidLocationType(payload.type)) {
        return {
            kind: "validation_error",
            message: "Invalid type (must be domestic or international)",
        };
    }
    if (payload?.name !== undefined)
        location.name = payload.name;
    if (payload?.type !== undefined)
        location.type = payload.type;
    try {
        const data = await location.save();
        return { kind: "ok", location: data };
    }
    catch (error) {
        if (error?.code === 11000) {
            return { kind: "duplicate_slug" };
        }
        throw error;
    }
};
exports.updateLocationById = updateLocationById;
const softDeleteLocationById = async (id) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        return { kind: "invalid_id" };
    }
    const location = await location_model_1.default.findOne({
        _id: id,
        deleted: false,
    });
    if (!location) {
        return { kind: "not_found" };
    }
    location.deleted = true;
    location.deleteAt = new Date();
    const data = await location.save();
    return { kind: "ok", location: data };
};
exports.softDeleteLocationById = softDeleteLocationById;
const restoreLocationById = async (id) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        return { kind: "invalid_id" };
    }
    const location = await location_model_1.default.findOne({
        _id: id,
        deleted: true,
    });
    if (!location) {
        return { kind: "not_found" };
    }
    location.deleted = false;
    location.deleteAt = undefined;
    const data = await location.save();
    return { kind: "ok", location: data };
};
exports.restoreLocationById = restoreLocationById;
