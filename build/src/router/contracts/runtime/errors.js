"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const clickhouse_1 = require("../../../clickhouse");
const mongo_1 = require("../../../mongo");
exports.default = (app) => {
    app.get("/contracts/runtime/errors", async function (req, res) {
        if (req.query.owner == null) {
            return;
        }
        const contracts = await (0, mongo_1.requireMongoDB)()
            ?.getContracts()
            ?.getAllByOwner(String(req.query.owner));
        let errors = [];
        for (const contract of contracts) {
            const out = await (0, clickhouse_1.requireClickhouseClient)()?.selectContractErrors(contract.id);
            const data = await out.json();
            errors.push(data);
        }
        res.json({
            data: errors,
        });
    });
};
//# sourceMappingURL=errors.js.map