"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTourPolicy = void 0;
const tourPolicy_model_1 = __importDefault(require("../../models/tourPolicy/tourPolicy.model"));
const mongo_util_1 = require("../../../../utils/mongo.util");
const normalizeList = (v) => {
    if (!v)
        return [];
    if (Array.isArray(v))
        return v.filter((x) => typeof x === "string");
    if (typeof v !== "string")
        return [];
    return v
        .split(/\r?\n|\u2022|\-|\*/)
        .map((s) => s.trim())
        .filter(Boolean);
};
const getTourPolicy = async (tourObj) => {
    const policyId = (0, mongo_util_1.toObjectIdMaybe)(tourObj.policyId);
    if (policyId) {
        const policy = await tourPolicy_model_1.default.findById(policyId);
        if (policy)
            return policy;
    }
    const includedServices = normalizeList(tourObj.includedServices);
    const excludedServices = normalizeList(tourObj.excludedServices);
    if (includedServices.length ||
        excludedServices.length ||
        tourObj.childPolicy ||
        tourObj.cancellationPolicy) {
        return {
            includedServices,
            excludedServices,
            childPolicy: tourObj.childPolicy ?? null,
            cancellationPolicy: tourObj.cancellationPolicy ?? null,
        };
    }
    return null;
};
exports.getTourPolicy = getTourPolicy;
