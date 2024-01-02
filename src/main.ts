import util from "util";
import VM from "../vm/vm";
import hash from "hash-it";
import * as http from "http";
import logger from "./logger";
import { inject } from "../inject";
import { program } from "commander";
import appConfigurator from "./app";
import Bootloader from "./Bootloader";
import { CliColor } from "./cli-color";
import { getHeapStatistics } from "v8";
import VMEC, { VME } from "./vm-driver";
import { clickHouseDependency } from "./clickhouse";
import { ChalkAnimation } from "@figliolia/chalk-animation";
import { mongodbDependency, requireMongoDB } from "./mongo";

const prompt = require("prompt-sync")();

require("yargonaut").style("blue").font("Small Slant"); // that's it!

/**
 * Initialize and start the application.
 * @param {Object} args - Command-line arguments.
 */
const bootloader = async (args: {
  vmec?: boolean;
  http?: boolean;
  vmecUpStartUp?: boolean;
  useExampleContract?: boolean;
}) => {
  // Inject dependencies
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

      logger.info("Contracts: " + contractsList);
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
program
    .command("machine")
    .option("--memoryUsage", "in MB")
    .action(async (options) => {
      // Log Node.js version and environment hash
      logger.info("Used Node version: " + process.version);
      logger.info("Used environment hash: " + hash(process.env));

      // Create and interact with a virtual machine (VM)
      const vm = new VM(32, Bootloader, () => {
        logger.info("Shell below", { vm: vm.ID });

        /**
         * Emulate a shell for interacting with the VM.
         * @param {string} prefix - Shell prompt prefix.
         */
        const shellEmulate = async (
            prefix: string = `(${CliColor.FgCyan}${vm.ID}${CliColor.Reset}) [mem: ${CliColor.FgYellow}${vm.memory}${CliColor.Reset}] ${CliColor.FgGreen}➜${CliColor.Reset} `
        ) => {
          const text = prompt(`${prefix}`);

          if (text == "exit") {
            process.exit(0);
          } else if (text == "mem") {
            const metricVm = util.inspect(vm.metric(), {
              showHidden: false,
              depth: null,
              colors: true,
            });
            const metricHost = util.inspect(getHeapStatistics(), {
              showHidden: false,
              depth: null,
              colors: true,
            });

            const p = (vm.metric().used_heap_size /
                getHeapStatistics().used_heap_size) * 100;

            logger.info("VM: " + metricVm, { vm: vm.ID });
            logger.info("Host-i2-machine: " + metricHost);
            logger.info("p=%" + p);

            return await shellEmulate();
          }

          try {
            const ctx = await vm.compile(text);

            await ctx.eval('log({context: Object.getOwnPropertyNames(this)})');
          } catch (e) {
            logger.error(e, { vm: vm.ID });
          }

          await shellEmulate();
        };

        // Start the shell emulation
        shellEmulate();
      });
    });

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

/**
 * Start a ChalkAnimation banner and display additional information.
 */
const animation = ChalkAnimation.karaoke("  Cogito ergo sum", 2);

setTimeout(() => {
  animation.stop();

  console.log("  Which means I live. ❤️");
  console.log(
      "  SOUL CE is a set of tools for running custom scripts in an isolated environment.\n  Completely isolated environment. Soul CE can understand contracts in vanilla JavaScript. "
  );
  console.log("");

  // Parse the CLI commands
  program.parse();
}, 1000);
