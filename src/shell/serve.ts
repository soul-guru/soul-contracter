import {inject} from "../../inject";
import {mongodbDependency, requireMongoDB} from "../mongo";
import {clickHouseDependency} from "../clickhouse";
import VMEC, {VME} from "../vm-driver";
import util from "util";
import logger from "../logger";
import appConfigurator from "../app";
import http from "http";
import {Command, program} from "commander";

const bootloader = async (args: {
  vmec?: boolean;
  http?: boolean;
  vmecUpStartUp?: boolean;
  useExampleContract?: boolean;
}) => {
  inject({
    mongodbDependency,
    clickHouseDependency,
  }).then(async (targets) => {
    // Execute actions based on command-line arguments
    if (args.vmec) {
      VMEC();
    }

    if (args.useExampleContract) {
      // Add example contract if not present
      const contracts = await requireMongoDB()?.getContracts()?.getAll();
      const contractsList = util.inspect(contracts, {
        showHidden: false,
        depth: null,
        colors: true,
      });

      if (!contracts.find((i) => i.botId == "test")) {
        logger.info("Adding an example contract with the example keys");

        const contract = await requireMongoDB()?.getContracts()?.create(
          "test",
          "test"
        );

        logger.info("Contract added: " + contract);
      }

      if (contracts.length < 5) {
        logger.info("Contracts: " + contractsList);
      } else {
        logger.info("Contracts: " + contractsList.length + " items");
      }
    }

    if (args.vmecUpStartUp) {
      // Send 'UP' to all machines on startup
      const contracts = await requireMongoDB().getContracts().getAll();

      logger.info(`Contracts found: ${contracts.length}`);

      for (const contract of contracts) {
        VME.emit("up", contract.botId);
      }
    }

    if (args.http) {
      // Setup and start HTTP server
      const app = appConfigurator();

      http
        .createServer(app)
        .on("request", (req) => {
          logger.info(
            `Incoming request (${String(req.method)})${String(
              req.url
            )} ${String(JSON.stringify(req.headers))}`
          );
        })
        .on("error", (err) => {
          logger.error(`Error in app ${err.message}`);
        })
        .listen(app.get("port"), function () {
          logger.info(
            `Express server listening on ${app.get("host")}:${app.get(
              "port"
            )} `
          );

          app._router.stack.forEach(function (r) {
            if (r.route && r.route.path) {
              logger.info(`Path '${r.route.path}' awaiting requests!`);
            }
          });
        });
    }
  });
};


/**
 * Command-line interface (CLI) configuration using Commander.
 */
export function serve(program: Command) {
  program
    .command("serve")
    .option("--strict", "Enable strict mode")
    .option("--http", "Enable HTTP API")
    .option("--use-example-contract", "Use example contract")
    .option("--vmec", "Init and run VMEC")
    .option("--vmec-up-start-up", "Send UP to all machines when it runs")
    .action(async (options) => {
      // Start the application with the provided options
      await bootloader(options);
    });
}
