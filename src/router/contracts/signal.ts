import { Express } from "express";
import { requireMongoDB } from "../../mongo";
import { VME } from "../../vm-driver";
import logger from "../../logger";
import hashIt from "hash-it";

export default function (app: Express) {
  app.post("/contracts/signal", async function (req, res) {
    const signalId = req.body.signalId || "pass";
    const signalProps = req.body.signalProps || {};
    const botId = req.body.botId || null;

    if (!["message", "shell"].includes(signalId)) {
      logger.info(`signal declined: ${signalId} -> ${botId}`);
      return res.status(400).json({
        data: "Unauthorized signal.ts sent",
      });
    }

    logger.info(`signal accepted: ${signalId} -> ${botId}`);

    requireMongoDB()
      ?.getContracts()
      ?.getSource(botId)
      .then((contract) => {
        logger.info(
          `executing contract (signal='${signalId}'): ${hashIt(
            contract,
          )}`,
        );

        if (contract != null) {
            VME.emit("signal", botId, signalId, signalProps, contract.id);

            res.json({
                data: "Signal emitted",
            });
        } else {
            VME.emit("signal", botId, signalId, signalProps, 'default');

            res.json({
                data: "Signal emitted",
            });
        }
      });
  });
}
