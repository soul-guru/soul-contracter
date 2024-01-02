import { Express } from "express";
import { requireMongoDB } from "../../mongo";
import { selectVmOrNull, VME } from "../../vm-driver";

const { md5 } = require("request/lib/helpers");

export default function (app: Express) {
  app.post("/contracts/push", async function (req, res) {
    const decrypted = await requireMongoDB()
      ?.getContracts()
      ?.decryptInputForContract(req.body.botId, req.body.data);

    if (md5(decrypted) == req.body.md5) {
      await requireMongoDB()
        ?.getContracts()
        ?.pushContractSource("main", decrypted, req.body.botId);
      const vm = selectVmOrNull(String(req.body.botId));

      if (vm != null) {
        VME.emit("down", req.body.botId)

        setTimeout(() => {
          VME.emit("up", req.body.botId)
        }, 2500)
      }


      return res.json({
        validMd5: md5(decrypted) == req.body.md5,
        vmRestarted: 0,
      });
    }
  });
}
