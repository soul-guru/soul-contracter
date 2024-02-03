"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vm_driver_1 = require("../../../vm-driver");
const moment_1 = __importDefault(require("moment/moment"));
exports.default = (app) => {
    app.get("/contracts/runtime/statistic", async function (req, res) {
        const metric = Object.values(vm_driver_1.vm).map(instance => ({
            id: instance.ID,
            metric: instance.metric(),
            uptime: instance.startupAt.diff((0, moment_1.default)()),
            workTime: instance.workTime().toString()
        }));
        res.json({
            data: {
                countVms: Object.values(vm_driver_1.vm).length,
                metric
            },
        });
    });
};
//# sourceMappingURL=statistic.js.map