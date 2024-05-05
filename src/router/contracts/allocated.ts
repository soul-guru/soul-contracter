import { Express } from "express";
import { selectVmOrNull } from "../../vm-driver";

export default function (app: Express) {
  app.get("/contracts/allocated", async function (req, res) {
    const metric = await selectVmOrNull(String(req.query.botId))?.getHeapStatistics();
    const workTimeInSeconds: BigInt = selectVmOrNull(
        String(req.query.botId)
    )?.workTime();

    res.header("Content-Type", "application/json").json({
      data: { metric, workTimeInSeconds: workTimeInSeconds.toString() },
    });
  });
}
