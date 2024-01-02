import { Express } from "express";
import { requireMongoDB } from "../../mongo";
import { VME } from "../../vm-driver";
import logger from "../../logger";

export default function (app: Express) {
  app.post("/contracts/signal", async function (req, res) {
    const signalId = req.body.signalId || "pass";
    const signalProps = req.body.signalProps || {};
    const botId = req.body.botId || null;

    if (!["message"].includes(signalId)) {
      logger.info(`signal declined: ${signalId} -> ${botId}`);
      return res.status(400).json({
        data: "Unauthorized signal sent",
      });
    }

    logger.info(`signal accepted: ${signalId} -> ${botId}`);

    requireMongoDB()
      ?.getContracts()
      ?.getSource(botId)
      .then((contract) => {
        logger.info(
          `executing contract (signal='${signalId}'): ${JSON.stringify(
            contract,
          )}`,
        );

        VME.emit("signal", botId, signalId, signalProps, contract.id);

        res.json({
          data: "Signal emitted",
        });
      });
  });
}
