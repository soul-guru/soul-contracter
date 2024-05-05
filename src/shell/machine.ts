import {Argument, Command} from "commander";
import logger from "../logger";
import hash from "hash-it";
import util from "util";
import VM from "../../vm/vm";
import Bootloader from "../../vm/Bootloader";
import fs from "fs";
import {CliColor} from "../classes/cli-color";
import {getHeapStatistics} from "v8";

/**
 * Command-line interface (CLI) configuration using Commander.
 */
export function machine(program: Command) {
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

        logger.info(" >>> signal.ts:boot", { vm: vm.ID });

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
                const metricVm = util.inspect(vm.getHeapStatistics(), {
                  showHidden: false,
                  depth: null,
                  colors: true,
                });

                const metricHost = util.inspect(getHeapStatistics(), {
                  showHidden: false,
                  depth: null,
                  colors: true,
                });

                const p = (vm.getHeapStatistics().used_heap_size /
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
}