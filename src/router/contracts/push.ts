import { Express } from "express";
import { requireMongoDB } from "../../mongo";
import { selectVmOrNull, VME } from "../../vm-driver";
import CryptoFlow from "../../CryptoFlow";

const { md5 } = require("request/lib/helpers");

export default function (app: Express) {
  app.post("/contracts/push", async function (req, res) {
    const decrypted = await requireMongoDB()
      ?.getContracts()
      ?.decryptInputForContract(req.body.botId, req.body.data);

    if (md5(decrypted) == req.body.md5) {
      await requireMongoDB()
        ?.getContracts()
        ?.pushContractSource(
          "main",
          CryptoFlow.toEncrypted(decrypted),
          req.body.botId
        );


      const vm = selectVmOrNull(String(req.body.botId));

      if (req.body.botId == 'default') {
        return res.status(400).json({
          validMd5: md5(decrypted) == req.body.md5,
          vmRestarted: 0,
        });
      }

      if (vm != null) {
        VME.emit("down", req.body.botId, () => {
          VME.emit("up", req.body.botId)
        })
      } else {
        VME.emit("up", req.body.botId)
      }


      return res.json({
        validMd5: md5(decrypted) == req.body.md5,
        vmRestarted: 0,
      });
    }
  });
}
