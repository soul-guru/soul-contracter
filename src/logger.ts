/**
 * @module logger
 * @description A logger module using Winston for logging with custom formatting and colorization.
 */

import winston from "winston";
import { color } from "terminal-color";
import winstonTimestampColorize from "winston-timestamp-colorize";

/**
 * Create a Winston logger instance.
 * @type {winston.Logger}
 */
const logger: winston.Logger = winston.createLogger({
  format: winston.format.combine(
    // Combine multiple formats
    winston.format.splat(), // Interpolate variables in the log message
    winston.format.timestamp(), // Add a timestamp to log entries
    winston.format.colorize(), // Colorize log messages
    winstonTimestampColorize({ color: "gray" }), // Colorize timestamp
    winston.format.printf(
      /**
       * Custom printf formatter for log entries.
       * @param {winston.LogEntry} info - Log entry information.
       * @returns {string} Formatted log entry string.
       */
      (info: winston.LogEntry): string => {
        if (info.vm) {
          return `${info.timestamp} [${color.fg.yellow(info.vm)}] <${info.level}>: ${
            info.message
          }`
        } else {
          return `${info.timestamp} <${info.level}>: ${
            info.message
          }`
        }
      },
    ),
  ),
  transports: [new winston.transports.Console({})], // Log to the console
});

winston.level = 'debug';

/**
 * Export the logger instance.
 * @type {winston.Logger}
 */
export default logger;
