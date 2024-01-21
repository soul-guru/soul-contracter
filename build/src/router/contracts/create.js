"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongo_1 = require("../../mongo");
function default_1(app) {
    app.post("/contracts/create", async function (req, res) {
        const botId = req.body.botId || null;
        const owner = req.body.owner || null;
        if (!botId) {
            return res.status(400).json({
                data: "botId is empty",
            });
        }
        if ((await (0, mongo_1.requireMongoDB)()?.getContracts()?.count(botId)) > 0) {
            return res.status(400).json({
                data: "There can be only 1 contract per agent. Please delete the existing contract to create a new one.",
            });
        }
        res.json({
            data: await (0, mongo_1.requireMongoDB)()?.getContracts()?.create(botId, owner),
        });
    });
}
exports.default = default_1;
//# sourceMappingURL=create.js.map