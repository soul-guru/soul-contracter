import { Express } from "express";
import { requireMongoDB } from "../../../mongo";
import { requireClickhouseClient } from "../../../clickhouse";
import {vm} from "../../../vm-driver";
import moment from "moment/moment";

export default (app: Express) => {
  app.get("/contracts/runtime/statistic", async function (req, res) {
    const metric = Object.values(vm).map(instance => ({
      id: instance.ID,
      metric: instance.getHeapStatistics(),
      uptime: instance.startupAt.diff(moment()),
      workTime: instance.workTime().toString()
    }))

    res.json({
      data: {
        countVms: Object.values(vm).length,
        metric
      },
    });
  });
};
