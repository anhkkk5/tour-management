"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadTourRelations = void 0;
const topicTour_model_1 = __importDefault(require("../../models/topicTour/topicTour.model"));
const location_model_1 = __importDefault(require("../../models/location/location.model"));
const mongo_util_1 = require("../../../../utils/mongo.util");
const loadTourRelations = async (tourObj) => {
    const topicTourId = (0, mongo_util_1.toObjectIdMaybe)(tourObj.topicTourId);
    const departureId = (0, mongo_util_1.toObjectIdMaybe)(tourObj.departureId);
    const destinationIds = Array.isArray(tourObj.destinationIds)
        ? tourObj.destinationIds.map(mongo_util_1.toObjectIdMaybe).filter(Boolean)
        : [];
    const [topicTour, departure, destinations] = await Promise.all([
        topicTourId ? topicTour_model_1.default.findById(topicTourId) : null,
        departureId ? location_model_1.default.findById(departureId) : null,
        destinationIds.length
            ? location_model_1.default.find({ _id: { $in: destinationIds } })
            : [],
    ]);
    return { topicTour, departure, destinations };
};
exports.loadTourRelations = loadTourRelations;
