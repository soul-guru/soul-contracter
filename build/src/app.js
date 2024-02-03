"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const logger_1 = __importDefault(require("./logger"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const comment_json_1 = require("comment-json");
const fs_1 = __importDefault(require("fs"));
const create_1 = __importDefault(require("./router/contracts/create"));
const signal_1 = __importDefault(require("./router/contracts/signal"));
const allocated_1 = __importDefault(require("./router/contracts/allocated"));
const stdout_1 = __importDefault(require("./router/contracts/runtime/stdout"));
const errors_1 = __importDefault(require("./router/contracts/runtime/errors"));
const pre_validate_1 = __importDefault(require("./router/contracts/pre-validate"));
const statistic_1 = __importDefault(require("./router/contracts/runtime/statistic"));
const all_1 = __importDefault(require("./router/contracts/all"));
const push_1 = __importDefault(require("./router/contracts/push"));
const node_path_1 = __importDefault(require("node:path"));
const PATH_APP_JSON = node_path_1.default.normalize(process.cwd() + "/app.json");
const config = (0, comment_json_1.parse)(fs_1.default.readFileSync(PATH_APP_JSON).toString());
const app = (0, express_1.default)();
const notFoundInternal = (req, res) => {
    res.status(404);
    if (req.accepts("json")) {
        res.json({ error: "Not found" });
        return;
    }
};
const bodyParserJson = () => body_parser_1.default.json();
const bodyParserUrlencoded = () => body_parser_1.default.urlencoded({ extended: true });
const libsForExpress = [
    bodyParserJson,
    bodyParserUrlencoded,
];
const routerInsideFolder = [
    stdout_1.default,
    all_1.default,
    errors_1.default,
    allocated_1.default,
    create_1.default,
    signal_1.default,
    push_1.default,
    pre_validate_1.default,
    statistic_1.default,
];
const serviceUse = [
    () => notFoundInternal,
];
const configureExpress = () => {
    logger_1.default.info("AppConfigurator called");
    lodash_1.default.forEach(Object(config), (value, key) => {
        logger_1.default.info(`app set '${key}' = '${value}'`);
        app.set(key, value);
    });
    libsForExpress.forEach((lib) => {
        const libExecuted = lib();
        logger_1.default.info(`app registered '${libExecuted.name}'`);
        app.use(libExecuted);
    });
    routerInsideFolder.forEach((routerFunction) => routerFunction(app));
    serviceUse.forEach((lib) => {
        const libExecuted = lib();
        logger_1.default.info(`app registered '${libExecuted.name}'`);
        app.use(libExecuted);
    });
    return app;
};
exports.default = configureExpress;
//# sourceMappingURL=app.js.map