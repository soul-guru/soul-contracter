"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongo_1 = require("../../mongo");
const vm_driver_1 = require("../../vm-driver");
const logger_1 = __importDefault(require("../../logger"));
const hash_it_1 = __importDefault(require("hash-it"));
function default_1(app) {
    app.post("/contracts/signal", async function (req, res) {
        const signalId = req.body.signalId || "pass";
        const signalProps = req.body.signalProps || {};
        const botId = req.body.botId || null;
        if (!["message"].includes(signalId)) {
            logger_1.default.info(`signal declined: ${signalId} -> ${botId}`);
            return res.status(400).json({
                data: "Unauthorized signal sent",
            });
        }
        logger_1.default.info(`signal accepted: ${signalId} -> ${botId}`);
        (0, mongo_1.requireMongoDB)()
            ?.getContracts()
            ?.getSource(botId)
            .then((contract) => {
            logger_1.default.info(`executing contract (signal='${signalId}'): ${(0, hash_it_1.default)(contract)}`);
            if (contract != null) {
                vm_driver_1.VME.emit("signal", botId, signalId, signalProps, contract.id);
                res.json({
                    data: "Signal emitted",
                });
            }
            else {
                vm_driver_1.VME.emit("signal", botId, signalId, signalProps, 'default');
                res.json({
                    data: "Signal emitted",
                });
            }
        });
    });
}
exports.default = default_1;
//# sourceMappingURL=signal.js.map