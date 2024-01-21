"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const { color } = require("terminal-color");
const winstonTimestampColorize = require("winston-timestamp-colorize");
const logger = winston_1.default.createLogger({
    format: winston_1.default.format.combine(winston_1.default.format.splat(), winston_1.default.format.timestamp(), winston_1.default.format.colorize(), winstonTimestampColorize({ color: "red" }), winston_1.default.format.printf((info) => `${info.timestamp} [${color.fg.yellow(info.vm)}] <${info.level}>: ${info.message}`)),
    transports: [new winston_1.default.transports.Console({})],
});
exports.default = logger;
//# sourceMappingURL=logger.js.map