"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assert = void 0;
const logger_1 = __importDefault(require("../logger"));
function assert(predict, exitMessage = null) {
    if (!predict()) {
        logger_1.default.error("Some of the conditions do not satisfy the system startup. Please make sure everything is done correctly. Condition:");
        logger_1.default.error(predict.toString() + " != true");
        if (exitMessage) {
            logger_1.default.error(`💬 ${exitMessage}`);
        }
        process.exit(0);
    }
}
exports.assert = assert;
//# sourceMappingURL=assert.js.map