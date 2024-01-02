import { Express } from "express";
import { requireMongoDB } from "../../mongo";

export default function (app: Express) {
  app.get("/contracts/all", async function (req, res) {
    if (req.query.owner == null) {
      return;
    }

    const contracts = await requireMongoDB()
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
