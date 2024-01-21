"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongo_1 = require("../../mongo");
function default_1(app) {
    app.get("/contracts/all", async function (req, res) {
        if (req.query.owner == null) {
            return;
        }
        const contracts = await (0, mongo_1.requireMongoDB)()
            ?.getContracts()
            ?.getAllByOwner(String(req.query.owner));
        const results = contracts.map((contract) => ({
            id: contract.id,
            botId: contract.botId,
            mainBranch: contract.mainBranch,
        }));
        res.json({
            data: results,
        });
    });
}
exports.default = default_1;
//# sourceMappingURL=all.js.map