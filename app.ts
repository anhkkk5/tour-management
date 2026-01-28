import express, { Express } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import path from "path";
import mainV1Routes from "./api/v1/routes/index.route";
import { errorHandler } from "./middlewares/error.middleware";

const cookieParser = require("cookie-parser");

export const createApp = (): Express => {
  const app: Express = express();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
        : true,
      credentials: true,
    }),
  );

  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const openapiDir = path.resolve(process.cwd(), "openapi");
  app.use("/openapi", express.static(openapiDir));
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
      swaggerOptions: {
        url: "/openapi/openapi.yaml",
      },
    }),
  );

  mainV1Routes(app);

  app.use((req, res) => {
    return res.status(404).json({ message: "Not Found" });
  });

  app.use(errorHandler);

  return app;
};
