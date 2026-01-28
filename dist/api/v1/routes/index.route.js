"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const trip_route_1 = require("./trip.route");
const tour_route_1 = require("./tour/tour.route");
const tourCategory_route_1 = require("./tourCategory/tourCategory.route");
const location_route_1 = require("./location/location.route");
const auth_route_1 = require("./auth/auth.route");
const users_route_1 = require("./users/users.route");
const router = express_1.default.Router();
const mainV1Routes = (app) => {
    const version = "/api/v1";
    app.use(version + "/trips", trip_route_1.tripRouter);
    app.use(version + "/tours", tour_route_1.tourRouter);
    app.use(version + "/tour_category", tourCategory_route_1.tourCategoryRouter);
    app.use(version + "/locations", location_route_1.locationRouter);
    app.use(version + "/auth", auth_route_1.authRouter);
    app.use(version + "/users", users_route_1.usersRouter);
};
exports.default = mainV1Routes;
