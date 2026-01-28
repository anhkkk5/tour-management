"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const path_1 = __importDefault(require("path"));
const index_route_1 = __importDefault(require("./api/v1/routes/index.route"));
const error_middleware_1 = require("./middlewares/error.middleware");
const cookieParser = require("cookie-parser");
const createApp = () => {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({
        origin: process.env.CORS_ORIGIN
            ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
            : true,
        credentials: true,
    }));
    app.use(cookieParser());
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    const openapiDir = path_1.default.resolve(process.cwd(), "openapi");
    app.use("/openapi", express_1.default.static(openapiDir));
    app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(undefined, {
        swaggerOptions: {
            url: "/openapi/openapi.yaml",
        },
    }));
    (0, index_route_1.default)(app);
    app.use((req, res) => {
        return res.status(404).json({ message: "Not Found" });
    });
    app.use(error_middleware_1.errorHandler);
    return app;
};
exports.createApp = createApp;
