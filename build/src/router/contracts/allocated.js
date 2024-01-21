"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vm_driver_1 = require("../../vm-driver");
function default_1(app) {
    app.get("/contracts/allocated", async function (req, res) {
        const metric = await (0, vm_driver_1.selectVmOrNull)(String(req.query.botId))?.metric();
        const workTimeInSeconds = (0, vm_driver_1.selectVmOrNull)(String(req.query.botId))?.workTime();
        res.header("Content-Type", "application/json").json({
            data: { metric, workTimeInSeconds: workTimeInSeconds.toString() },
        });
    });
}
exports.default = default_1;
//# sourceMappingURL=allocated.js.map