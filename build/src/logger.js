"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const terminal_color_1 = require("terminal-color");
const winston_timestamp_colorize_1 = __importDefault(require("winston-timestamp-colorize"));
const logger = winston_1.default.createLogger({
    format: winston_1.default.format.combine(winston_1.default.format.splat(), winston_1.default.format.timestamp(), winston_1.default.format.colorize(), (0, winston_timestamp_colorize_1.default)({ color: "gray" }), winston_1.default.format.printf((info) => {
        if (info.vm) {
            return `${info.timestamp} [${terminal_color_1.color.fg.yellow(info.vm)}] <${info.level}>: ${info.message}`;
        }
        else {
            return `${info.timestamp} <${info.level}>: ${info.message}`;
        }
    })),
    transports: [new winston_1.default.transports.Console({})],
});
winston_1.default.level = 'debug';
exports.default = logger;
//# sourceMappingURL=logger.js.map