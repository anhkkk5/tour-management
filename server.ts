import dotenv from "dotenv";
import type { Express } from "express";
import * as database from "./config/database";
import { createApp } from "./app";

dotenv.config();

type StartServerOptions = {
  port?: number | string;
};

export const startServer = async (options: StartServerOptions = {}) => {
  await database.connect();

  const app: Express = createApp();
  const port: number | string = options.port ?? process.env.PORT ?? 3002;

  return app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
};

if (require.main === module) {
  startServer();
}
