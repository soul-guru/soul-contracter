"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExposedDialog = void 0;
const OpenDialog_1 = __importDefault(require("./OpenDialog"));
class ExposedDialog extends OpenDialog_1.default {
    async call({ dialogId, context }) {
        super.call({ dialogId, context });
    }
}
exports.ExposedDialog = ExposedDialog;
//# sourceMappingURL=ExposedDialog.js.map