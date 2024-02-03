"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.machine = void 0;
const commander_1 = require("commander");
const logger_1 = __importDefault(require("../logger"));
const hash_it_1 = __importDefault(require("hash-it"));
const util_1 = __importDefault(require("util"));
const vm_1 = __importDefault(require("../../vm/vm"));
const Bootloader_1 = __importDefault(require("../../vm/Bootloader"));
const fs_1 = __importDefault(require("fs"));
const cli_color_1 = require("../classes/cli-color");
const v8_1 = require("v8");
function machine(program) {
    program
        .command("machine")
        .option("--memory-usage", "in MB")
        .addArgument(new commander_1.Argument("dev-file", ""))
        .action(async (options) => {
        const prompt = require("prompt-sync")();
        const term = require('terminal-kit').terminal;
        logger_1.default.info("Used Node version: " + process.version);
        logger_1.default.info("Used environment hash: " + (0, hash_it_1.default)(process.env));
        let colorize;
        try {
            colorize = require('json-colorizer');
        }
        catch (e) {
            colorize = function (any, opt) {
                return util_1.default.inspect(any, { showHidden: false, depth: null, colors: true });
            };
        }
        const history = [];
        const vm = new vm_1.default(2048, Bootloader_1.default, async () => {
            if (options && fs_1.default.existsSync(options)) {
                logger_1.default.info(`Attached: '${options}'`, { vm: vm.ID });
                await vm.compile(String(fs_1.default.readFileSync(options)));
            }
            logger_1.default.info(" >>> signal.ts:boot", { vm: vm.ID });
            logger_1.default.info((await vm.compile("null")).evalClosureSync("return JSON.stringify(safeSignal('onBoot', $export))"));
            logger_1.default.info("Shell below", { vm: vm.ID });
            const session = (await vm.compile("{}"));
            session.evalClosureSync("SimulatorKit = {}");
            const shellEmulate = async (prefix = `(${cli_color_1.CliColor.FgCyan}${vm.ID}${cli_color_1.CliColor.Reset}) [mem: ${cli_color_1.CliColor.FgYellow}${vm.memory}${cli_color_1.CliColor.Reset}] ${cli_color_1.CliColor.FgGreen}➜${cli_color_1.CliColor.Reset} `) => {
                const autoComplete = [
                    "SimulatorKit.EmulateIncomingMessage"
                ].concat(JSON.parse(session.evalClosureSync("return JSON.stringify(Object.getOwnPropertyNames(this))")));
                term(`\n${prefix}`);
                term.inputField({ history: history, autoComplete: autoComplete, autoCompleteMenu: true }, async function (error, text) {
                    history.push(text);
                    console.log("\n");
                    if (text == "exit") {
                        await vm.destroyMachine();
                        process.exit(0);
                    }
                    else if (text == "SimulatorKit.EmulateIncomingMessage") {
                        logger_1.default.info("Zzzing! New message!");
                        const raw = prompt("Message: ");
                        logger_1.default.info(session.evalClosureSync(`return JSON.stringify(safeSignal('onMessage', $export, {context: [{ plainText: '${raw}' }]}))`));
                    }
                    else if (text == "mem") {
                        const metricVm = util_1.default.inspect(vm.metric(), {
                            showHidden: false,
                            depth: null,
                            colors: true,
                        });
                        const metricHost = util_1.default.inspect((0, v8_1.getHeapStatistics)(), {
                            showHidden: false,
                            depth: null,
                            colors: true,
                        });
                        const p = (vm.metric().used_heap_size /
                            (0, v8_1.getHeapStatistics)().used_heap_size) * 100;
                        logger_1.default.info("VM: " + metricVm, { vm: vm.ID });
                        logger_1.default.info("Host-i2-machine: " + metricHost);
                        logger_1.default.info("p=%" + p);
                        return await shellEmulate();
                    }
                    try {
                        session.evalClosureSync(text);
                    }
                    catch (e) {
                        logger_1.default.error(colorize(e, { pretty: true }), { vm: vm.ID });
                    }
                    await shellEmulate();
                });
            };
            shellEmulate();
        });
    });
}
exports.machine = machine;
//# sourceMappingURL=machine.js.map