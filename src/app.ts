import _ from "lodash";
import logger from "./logger";
import bodyParser from "body-parser";
import all from "./router/contracts/all";
import express, { Express, Response, Request } from "express";
import push from "./router/contracts/push";
import { NextHandleFunction } from "connect";
import create from "./router/contracts/create";
import signal from "./router/contracts/signal";
import allocated from "./router/contracts/allocated";
import stdout from "./router/contracts/runtime/stdout";
import errors from "./router/contracts/runtime/errors";
import preValidate from "./router/contracts/pre-validate";

const config = require("../app.json");

const app = express();

const router = [
  // ...pass
];

/**
 * Middleware function for handling 404 errors.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
const notFound_internal = (req: Request, res: Response): void => {
  res.status(404);

  // respond with json
  if (req.accepts("json")) {
    res.json({ error: "Not found" });
    return;
  }
};

/**
 * Array of service middleware functions.
 * @type {(() => (req: Request, res: Response) => void)[]}
 */
const serviceUse: (() => (req: Request, res: Response) => void)[] = [
  // 404
  () => notFound_internal,
];

/**
 * Array of middleware functions for configuring Express.
 * @type {(() => NextHandleFunction)[]}
 */
const libsForExpress: (() => NextHandleFunction)[] = [
  () => bodyParser.json(),
  () => bodyParser.urlencoded({ extended: true }),
].concat(router);

/**
 * Array of router functions inside a folder.
 * @type {((app: Express) => void)[]}
 */
const routerInsideFolder: ((app: Express) => void)[] = [
  stdout,
  all,
  errors,
  allocated,
  create,
  signal,
  push,
  preValidate,
];

/**
 * Configure and set up the Express application.
 * @returns {Express} - The configured Express application instance.
 */
export default (): Express => {
  logger.info("AppConfigurator called");

  // Set configuration values for the Express application
  _.map(config, function (v, k) {
    logger.info(`app set '${k}' = '${v}'`);

    app.set(k, v);
  });

  // Register middleware functions for Express
  libsForExpress.forEach((lib) => {
    const libExecuted = lib();
    logger.info(`app registered '${libExecuted.name}'`);

    app.use(libExecuted);
  });

  // Register router functions inside the folder
  routerInsideFolder.forEach((it) => it(app));

  // Register service middleware functions
  serviceUse.forEach((lib) => {
    const libExecuted = lib();
    logger.info(`app registered '${libExecuted.name}'`);

    app.use(libExecuted);
  });

  return app;
};