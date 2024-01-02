import winston from "winston";

const { color } = require("terminal-color"); // Assuming this is a colorization library

const winstonTimestampColorize = require("winston-timestamp-colorize");

// Create a Winston logger instance
const logger = winston.createLogger({
    format: winston.format.combine(
        // Combine multiple formats
        winston.format.splat(), // Interpolate variables in the log message
        winston.format.timestamp(), // Add a timestamp to log entries
        winston.format.colorize(), // Colorize log messages
        winstonTimestampColorize({ color: "red" }), // Colorize timestamp
        winston.format.printf(
            // Custom printf formatter
            (info) =>
                `${info.timestamp} [${color.fg.yellow(info.vm)}] <${info.level}>: ${
                    info.message
                }`,
        ),
    ),
    transports: [new winston.transports.Console({})], // Log to the console
});

export default logger;
