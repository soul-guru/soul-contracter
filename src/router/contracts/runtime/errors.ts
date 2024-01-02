import { Express } from "express";
import { requireClickhouseClient } from "../../../clickhouse";
import { requireMongoDB } from "../../../mongo";

export default (app: Express) => {
  app.get("/contracts/runtime/errors", async function (req, res) {
    if (req.query.owner == null) {
      return;
    }

    const contracts = await requireMongoDB()
      ?.getContracts()
      ?.getAllByOwner(String(req.query.owner));

    let errors = [];

    for (const contract of contracts) {
      const out = await requireClickhouseClient()?.selectContractErrors(
        contract.id,
      );
      const data = await out.json();

      errors.push(data);
    }

    res.json({
      data: errors,
    });
  });
};
