import { Express } from "express";
import { requireMongoDB } from "../../mongo";

export default function (app: Express) {
  app.post("/contracts/pre-validate", async function (req, res) {
    const botId = req.body.botId;

    const buffer = new Buffer(req.body.p2);
    const decrypted = await requireMongoDB()
      ?.getContracts()
      ?.decryptInputForContract(botId, req.body.p1);

    res.json({
      challenge: decrypted == buffer.toString("base64"),
    });
  });
}
