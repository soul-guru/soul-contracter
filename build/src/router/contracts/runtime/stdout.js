"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongo_1 = require("../../../mongo");
const clickhouse_1 = require("../../../clickhouse");
exports.default = (app) => {
    app.get("/contracts/runtime/stdout", async function (req, res) {
        if (req.query.owner == null) {
            return;
        }
        const contracts = await (0, mongo_1.requireMongoDB)()
            ?.getContracts()
            ?.getAllByOwner(String(req.query.owner));
        let stdout = [];
        for (const contract of contracts) {
            const out = await (0, clickhouse_1.requireClickhouseClient)()?.selectContractStdout(contract.id);
            const data = await out.json();
            stdout.push(data);
        }
        res.json({
            data: stdout,
        });
    });
};
//# sourceMappingURL=stdout.js.map