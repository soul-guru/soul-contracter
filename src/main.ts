import util from "util";
import VM from "../vm/vm";
import hash from "hash-it";
import * as http from "http";
import logger from "./logger";
import { inject } from "../inject";
import {Argument, program} from "commander";
import appConfigurator from "./app";
import Bootloader from "../vm/Bootloader";
import { CliColor } from "./cli-color";
import { getHeapStatistics } from "v8";
import VMEC, { VME } from "./vm-driver";
import { clickHouseDependency } from "./clickhouse";
import { ChalkAnimation } from "@figliolia/chalk-animation";
import { mongodbDependency, requireMongoDB } from "./mongo";
import * as fs from "fs";
import CryptoFlow from "./CryptoFlow";


// require("yargonaut").style("blue").font("Small Slant"); // that's it!

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
    if (!fs.existsSync(".cryptoflow")) {
      fs.writeFileSync(
        ".cryptoflow",
        CryptoFlow.generatePassword(512)
      )

      logger.info("🔒 Password generated for CryptoFlow")
    }

    let cfp = String(fs.readFileSync(".cryptoflow"))

    CryptoFlow.key = cfp

    logger.info("🔒 CryptoFlow password applied")

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
program
    .command("machine")
    .option("--memory-usage", "in MB")
    .addArgument(new Argument("dev-file", ""))
    .action(async (options) => {
      const prompt = require("prompt-sync")();
      const term = require('terminal-kit').terminal;

      // Log Node.js version and environment hash
      logger.info("Used Node version: " + process.version);
      logger.info("Used environment hash: " + hash(process.env));

      let colorize: (any: any, opt: object) => any

      try {
        colorize = require('json-colorizer')
      } catch (e) {
        colorize = function (any, opt) {
          return util.inspect(any, { showHidden: false, depth: null, colors: true })
        }
      }

      const history = [];

      // Create and interact with a virtual machine (VM)
      const vm = new VM(2048, Bootloader, async () => {
        if (options && fs.existsSync(options)) {
          logger.info(`Attached: '${options}'`, { vm: vm.ID });
          await vm.compile(String(fs.readFileSync(options)))
        }

        logger.info(" >>> signal:boot", { vm: vm.ID });

        logger.info((await vm.compile("null")).evalClosureSync("return JSON.stringify(safeSignal('onBoot', $export))"))

        logger.info("Shell below", { vm: vm.ID });

        const session = (await vm.compile("{}"))

        session.evalClosureSync("SimulatorKit = {}")

        /**
         * Emulate a shell for interacting with the VM.
         * @param {string} prefix - Shell prompt prefix.
         */
        const shellEmulate = async (
            prefix: string = `(${CliColor.FgCyan}${vm.ID}${CliColor.Reset}) [mem: ${CliColor.FgYellow}${vm.memory}${CliColor.Reset}] ${CliColor.FgGreen}➜${CliColor.Reset} `
        ) => {
          const autoComplete = [
            "SimulatorKit.EmulateIncomingMessage"
          ].concat(JSON.parse(session.evalClosureSync("return JSON.stringify(Object.getOwnPropertyNames(this))")));

          term(`\n${prefix}`);

          term.inputField(
            { history: history , autoComplete: autoComplete , autoCompleteMenu: true } ,
            async function( error , text ) {
              history.push(text)
              console.log("\n")

              if (text == "exit") {
                await vm.destroyMachine()
                process.exit(0);
              } else if (text == "SimulatorKit.EmulateIncomingMessage") {
                logger.info("Zzzing! New message!")
                const raw = prompt("Message: ")
                logger.info(session.evalClosureSync(`return JSON.stringify(safeSignal('onMessage', $export, {context: [{ plainText: '${raw}' }]}))`))
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
                session.evalClosureSync(text)
              } catch (e) {

                logger.error(colorize(e, {pretty: true}), { vm: vm.ID });
              }

              await shellEmulate();
            }
          ) ;
          // const text = prompt();
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
// const animation = ChalkAnimation.karaoke("  Cogito ergo sum", 2);

// setTimeout(() => {
//   animation.stop();
//
//   console.log("  Which means I live. ❤️");
//   console.log(
//       "  SOUL CE is a set of tools for running custom scripts in an isolated environment.\n  Completely isolated environment. Soul CE can understand contracts in vanilla JavaScript. "
//   );
//   console.log("");
//
//   // Parse the CLI commands
//   program.parse();
// }, 1000);

program.parse()
