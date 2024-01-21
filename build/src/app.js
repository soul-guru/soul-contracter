"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const logger_1 = __importDefault(require("./logger"));
const body_parser_1 = __importDefault(require("body-parser"));
const all_1 = __importDefault(require("./router/contracts/all"));
const express_1 = __importDefault(require("express"));
const push_1 = __importDefault(require("./router/contracts/push"));
const create_1 = __importDefault(require("./router/contracts/create"));
const signal_1 = __importDefault(require("./router/contracts/signal"));
const allocated_1 = __importDefault(require("./router/contracts/allocated"));
const stdout_1 = __importDefault(require("./router/contracts/runtime/stdout"));
const errors_1 = __importDefault(require("./router/contracts/runtime/errors"));
const pre_validate_1 = __importDefault(require("./router/contracts/pre-validate"));
const config = require("../app.json");
const app = (0, express_1.default)();
const router = [];
const notFound_internal = (req, res) => {
    res.status(404);
    if (req.accepts("json")) {
        res.json({ error: "Not found" });
        return;
    }
};
const serviceUse = [
    () => notFound_internal,
];
const libsForExpress = [
    () => body_parser_1.default.json(),
    () => body_parser_1.default.urlencoded({ extended: true }),
].concat(router);
const routerInsideFolder = [
    stdout_1.default,
    all_1.default,
    errors_1.default,
    allocated_1.default,
    create_1.default,
    signal_1.default,
    push_1.default,
    pre_validate_1.default,
];
exports.default = () => {
    logger_1.default.info("AppConfigurator called");
    lodash_1.default.map(config, function (v, k) {
        logger_1.default.info(`app set '${k}' = '${v}'`);
        app.set(k, v);
    });
    libsForExpress.forEach((lib) => {
        const libExecuted = lib();
        logger_1.default.info(`app registered '${libExecuted.name}'`);
        app.use(libExecuted);
    });
    routerInsideFolder.forEach((it) => it(app));
    serviceUse.forEach((lib) => {
        const libExecuted = lib();
        logger_1.default.info(`app registered '${libExecuted.name}'`);
        app.use(libExecuted);
    });
    return app;
};
//# sourceMappingURL=app.js.map