import { Express } from "express";
import { requireMongoDB } from "../../mongo";

export default function (app: Express) {
  app.post("/contracts/create", async function (req, res) {
    const botId = req.body.botId || null;
    const owner = req.body.owner || null;

    if (!botId) {
      return res.status(400).json({
        data: "botId is empty",
      });
    }

    if ((await requireMongoDB()?.getContracts()?.count(botId)) > 0) {
      return res.status(400).json({
        data: "There can be only 1 contract per agent. Please delete the existing contract to create a new one.",
      });
    }

    res.json({
      data: await requireMongoDB()?.getContracts()?.create(botId, owner),
    });
  });
}
