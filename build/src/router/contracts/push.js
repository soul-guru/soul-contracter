"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongo_1 = require("../../mongo");
const vm_driver_1 = require("../../vm-driver");
const { md5 } = require("request/lib/helpers");
function default_1(app) {
    app.post("/contracts/push", async function (req, res) {
        const decrypted = await (0, mongo_1.requireMongoDB)()
            ?.getContracts()
            ?.decryptInputForContract(req.body.botId, req.body.data);
        if (md5(decrypted) == req.body.md5) {
            await (0, mongo_1.requireMongoDB)()
                ?.getContracts()
                ?.pushContractSource("main", decrypted, req.body.botId);
            const vm = (0, vm_driver_1.selectVmOrNull)(String(req.body.botId));
            if (req.body.botId == 'default') {
                return;
            }
            if (vm != null) {
                vm_driver_1.VME.emit("down", req.body.botId);
                setTimeout(() => {
                    vm_driver_1.VME.emit("up", req.body.botId);
                }, 2500);
            }
            else {
                vm_driver_1.VME.emit("up", req.body.botId);
            }
            return res.json({
                validMd5: md5(decrypted) == req.body.md5,
                vmRestarted: 0,
            });
        }
    });
}
exports.default = default_1;
//# sourceMappingURL=push.js.map