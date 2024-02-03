"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const init_1 = require("../init");
function safeSignal(functionName, context, args = null) {
    if (context && context[functionName] != null) {
        const results = context[functionName](args);
        (0, init_1.stdout)(`s(${functionName}): success`);
        return results;
    }
    else {
        (0, init_1.stdout)(`safeSignal ->>> (${functionName}): not found`);
    }
}
exports.default = safeSignal;
//# sourceMappingURL=signal.js.map