"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTourPolicyById = exports.updateTourPolicyById = exports.createTourPolicy = exports.getTourPolicyById = exports.listTourPolicies = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const tourPolicy_model_1 = __importDefault(require("../../models/tourPolicy/tourPolicy.model"));
const normalizeStringArray = (v) => {
    if (v === undefined)
        return undefined;
    if (!v)
        return [];
    if (Array.isArray(v))
        return v.filter((x) => typeof x === "string");
    return null;
};
const listTourPolicies = async () => {
    return tourPolicy_model_1.default.find({});
};
exports.listTourPolicies = listTourPolicies;
const getTourPolicyById = async (id) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        return { kind: "invalid_id" };
    }
    const policy = await tourPolicy_model_1.default.findById(id);
    if (!policy) {
        return { kind: "not_found" };
    }
    return { kind: "ok", policy };
};
exports.getTourPolicyById = getTourPolicyById;
const createTourPolicy = async (payload) => {
    const includedServices = normalizeStringArray(payload?.includedServices);
    if (includedServices === null) {
        return {
            kind: "validation_error",
            message: "includedServices must be an array of strings",
        };
    }
    const excludedServices = normalizeStringArray(payload?.excludedServices);
    if (excludedServices === null) {
        return {
            kind: "validation_error",
            message: "excludedServices must be an array of strings",
        };
    }
    const policy = new tourPolicy_model_1.default({
        includedServices: includedServices ?? [],
        excludedServices: excludedServices ?? [],
        childPolicy: typeof payload?.childPolicy === "string"
            ? payload.childPolicy
            : undefined,
        cancellationPolicy: typeof payload?.cancellationPolicy === "string"
            ? payload.cancellationPolicy
            : undefined,
    });
    const data = await policy.save();
    return { kind: "ok", policy: data };
};
exports.createTourPolicy = createTourPolicy;
const updateTourPolicyById = async (id, payload) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        return { kind: "invalid_id" };
    }
    const policy = await tourPolicy_model_1.default.findById(id);
    if (!policy) {
        return { kind: "not_found" };
    }
    const includedServices = normalizeStringArray(payload?.includedServices);
    if (includedServices === null) {
        return {
            kind: "validation_error",
            message: "includedServices must be an array of strings",
        };
    }
    const excludedServices = normalizeStringArray(payload?.excludedServices);
    if (excludedServices === null) {
        return {
            kind: "validation_error",
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
    return { kind: "ok", policy: data };
};
exports.updateTourPolicyById = updateTourPolicyById;
const deleteTourPolicyById = async (id) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        return { kind: "invalid_id" };
    }
    const policy = await tourPolicy_model_1.default.findById(id);
    if (!policy) {
        return { kind: "not_found" };
    }
    await tourPolicy_model_1.default.deleteOne({ _id: policy._id });
    return { kind: "ok" };
};
exports.deleteTourPolicyById = deleteTourPolicyById;
