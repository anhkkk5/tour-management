import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import * as database from "./config/database";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import YAML from "yaml";
import mainV1Routes from "./api/v1/routes/index.route";
dotenv.config();
database.connect();
const app: Express = express();
const port: number | string = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const swaggerFilePath = path.resolve(process.cwd(), "swagger.yml");
const swaggerDocument = YAML.parse(fs.readFileSync(swaggerFilePath, "utf8"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

mainV1Routes(app);
// Lắng nghe cổng
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
