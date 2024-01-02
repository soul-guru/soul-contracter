import { Express } from "express";
import { requireMongoDB } from "../../../mongo";
import { requireClickhouseClient } from "../../../clickhouse";

export default (app: Express) => {
  app.get("/contracts/runtime/stdout", async function (req, res) {
    if (req.query.owner == null) {
      return;
    }

    const contracts = await requireMongoDB()
      ?.getContracts()
      ?.getAllByOwner(String(req.query.owner));

    let stdout = [];

    for (const contract of contracts) {
      const out = await requireClickhouseClient()?.selectContractStdout(
        contract.id,
      );
      const data = await out.json();

      stdout.push(data);
    }

    res.json({
      data: stdout,
    });
  });
};
