"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongo_1 = require("../../mongo");
function default_1(app) {
    app.post("/contracts/pre-validate", async function (req, res) {
        const botId = req.body.botId;
        const buffer = new Buffer(req.body.p2);
        const decrypted = await (0, mongo_1.requireMongoDB)()
            ?.getContracts()
            ?.decryptInputForContract(botId, req.body.p1);
        res.json({
            challenge: decrypted == buffer.toString("base64"),
        });
    });
}
exports.default = default_1;
//# sourceMappingURL=pre-validate.js.map