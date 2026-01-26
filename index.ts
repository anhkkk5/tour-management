import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import * as database from "./config/database";
import swaggerUi from "swagger-ui-express";
import path from "path";
import mainV1Routes from "./api/v1/routes/index.route";

const cookieParser = require("cookie-parser");
dotenv.config();
database.connect();
const app: Express = express();
const port: number | string = process.env.PORT || 3002;

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
// Lắng nghe cổng
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
