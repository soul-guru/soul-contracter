import _ from "lodash";
import logger from "./logger";
import bodyParser from "body-parser";
import express, { Express, Response, Request } from "express";
import {CommentJSONValue, parse} from "comment-json";
import fs from "fs";

import create from "./router/contracts/create";
import signal from "./router/contracts/signal";
import allocated from "./router/contracts/allocated";
import stdout from "./router/contracts/runtime/stdout";
import errors from "./router/contracts/runtime/errors";
import preValidate from "./router/contracts/pre-validate";
import statistic from "./router/contracts/runtime/statistic";
import all from "./router/contracts/all";
import push from "./router/contracts/push";
import path from "node:path";

// Define paths as constants
const PATH_APP_JSON: string = path.normalize(process.cwd() + "/app.json");

const config: CommentJSONValue = parse(fs.readFileSync(PATH_APP_JSON).toString());

const app = express();

// Define middleware functions for Express
const notFoundInternal = (req: Request, res: Response): void => {
  res.status(404);

  // Respond with JSON
  if (req.accepts("json")) {
    res.json({ error: "Not found" });
    return;
  }
};

// Middleware functions
const bodyParserJson = () => bodyParser.json();
const bodyParserUrlencoded = () => bodyParser.urlencoded({ extended: true });

const libsForExpress = [
  bodyParserJson,
  bodyParserUrlencoded,
  // Add other middleware functions here as needed
];

// Router functions inside a folder
const routerInsideFolder = [
  stdout,
  all,
  errors,
  allocated,
  create,
  signal,
  push,
  preValidate,
  statistic,
];

// Service middleware functions
const serviceUse = [
  () => notFoundInternal,
  // Add other service middleware functions here as needed
];

const configureExpress = (): Express => {
  logger.info("AppConfigurator called");

  // Set configuration values for the Express application
  _.forEach(Object(config), (value, key) => {
    logger.info(`app set '${key}' = '${value}'`);
    app.set(key, value);
  });

  // Register middleware functions for Express
  libsForExpress.forEach((lib) => {
    const libExecuted = lib();
    logger.info(`app registered '${libExecuted.name}'`);
    app.use(libExecuted);
  });

  // Register router functions inside the folder
  routerInsideFolder.forEach((routerFunction) => routerFunction(app));

  // Register service middleware functions
  serviceUse.forEach((lib) => {
    const libExecuted = lib();
    logger.info(`app registered '${libExecuted.name}'`);
    app.use(libExecuted);
  });

  return app;
};

export default configureExpress;
