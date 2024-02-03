import logger from "../logger";

/**
 * Asserts a condition and exits the process if the condition is not satisfied.
 * @param {Function} predict - The condition to be checked.
 * @param {string|null} exitMessage - An optional message to log before exiting.
 */
export function assert(predict: Function, exitMessage: string | null = null) {
  if (!predict()) {
    logger.error("Some of the conditions do not satisfy the system startup. Please make sure everything is done correctly. Condition:");
    logger.error(predict.toString() + " != true");

    if (exitMessage) {
      logger.error(`💬 ${exitMessage}`);
    }

    process.exit(0);
  }
}
