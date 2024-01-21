"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("util"));
const vm_1 = __importDefault(require("../vm/vm"));
const hash_it_1 = __importDefault(require("hash-it"));
const http = __importStar(require("http"));
const logger_1 = __importDefault(require("./logger"));
const inject_1 = require("../inject");
const commander_1 = require("commander");
const app_1 = __importDefault(require("./app"));
const Bootloader_1 = __importDefault(require("../vm/Bootloader"));
const cli_color_1 = require("./cli-color");
const v8_1 = require("v8");
const vm_driver_1 = __importStar(require("./vm-driver"));
const clickhouse_1 = require("./clickhouse");
const mongo_1 = require("./mongo");
const fs = __importStar(require("fs"));
const prompt = require("prompt-sync")();
const term = require('terminal-kit').terminal;
const bootloader = async (args) => {
    (0, inject_1.inject)({
        mongodbDependency: mongo_1.mongodbDependency,
        clickHouseDependency: clickhouse_1.clickHouseDependency,
    }).then(async (targets) => {
        if (args.vmec) {
            (0, vm_driver_1.default)();
        }
        if (args.useExampleContract) {
            const contracts = await (0, mongo_1.requireMongoDB)()?.getContracts()?.getAll();
            const contractsList = util_1.default.inspect(contracts, {
                showHidden: false,
                depth: null,
                colors: true,
            });
            if (!contracts.find((i) => i.botId == "test")) {
                logger_1.default.info("Adding an example contract with the example keys");
                const contract = await (0, mongo_1.requireMongoDB)()?.getContracts()?.create("test", "test");
                logger_1.default.info("Contract added: " + contract);
            }
            logger_1.default.info("Contracts: " + contractsList);
        }
        if (args.vmecUpStartUp) {
            const contracts = await (0, mongo_1.requireMongoDB)().getContracts().getAll();
            logger_1.default.info(`Contracts found: ${contracts.length}`);
            for (const contract of contracts) {
                vm_driver_1.VME.emit("up", contract.botId);
            }
        }
        if (args.http) {
            const app = (0, app_1.default)();
            http
                .createServer(app)
                .on("request", (req) => {
                logger_1.default.info(`Incoming request (${String(req.method)})${String(req.url)} ${String(JSON.stringify(req.headers))}`);
            })
                .on("error", (err) => {
                logger_1.default.error(`Error in app ${err.message}`);
            })
                .listen(app.get("port"), function () {
                logger_1.default.info(`Express server listening on ${app.get("host")}:${app.get("port")} `);
                app._router.stack.forEach(function (r) {
                    if (r.route && r.route.path) {
                        logger_1.default.info(`Path '${r.route.path}' awaiting requests!`);
                    }
                });
            });
        }
    });
};
commander_1.program
    .command("machine")
    .option("--memory-usage", "in MB")
    .addArgument(new commander_1.Argument("dev-file", ""))
    .action(async (options) => {
    logger_1.default.info("Used Node version: " + process.version);
    logger_1.default.info("Used environment hash: " + (0, hash_it_1.default)(process.env));
    const history = [];
    const vm = new vm_1.default(2048, Bootloader_1.default, async () => {
        if (options && fs.existsSync(options)) {
            logger_1.default.info(`Attached: '${options}'`, { vm: vm.ID });
            await vm.compile(String(fs.readFileSync(options)));
        }
        logger_1.default.info(" >>> signal:boot", { vm: vm.ID });
        logger_1.default.info((await vm.compile("null")).evalClosureSync("return JSON.stringify(safeSignal('onBoot', $export))"));
        logger_1.default.info("Shell below", { vm: vm.ID });
        const shellEmulate = async (prefix = `(${cli_color_1.CliColor.FgCyan}${vm.ID}${cli_color_1.CliColor.Reset}) [mem: ${cli_color_1.CliColor.FgYellow}${vm.memory}${cli_color_1.CliColor.Reset}] ${cli_color_1.CliColor.FgGreen}➜${cli_color_1.CliColor.Reset} `) => {
            const autoComplete = JSON.parse((await vm.compile("null")).evalClosureSync("return JSON.stringify(Object.getOwnPropertyNames(this))"));
            term(`\n${prefix}`);
            term.inputField({ history: history, autoComplete: autoComplete, autoCompleteMenu: true }, async function (error, text) {
                history.push(text);
                console.log("\n");
                if (text == "exit") {
                    await vm.destroyMachine();
                    process.exit(0);
                }
                else if (text == "sm_m") {
                    logger_1.default.info("Zzzing! New message!");
                    const raw = prompt("Message: ");
                    logger_1.default.info((await vm.compile("null")).evalClosureSync(`return JSON.stringify(safeSignal('onMessage', $export, {context: [{ plainText: '${raw}' }]}))`));
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
                    const ctx = await vm.compile(text);
                }
                catch (e) {
                    logger_1.default.error(e, { vm: vm.ID });
                }
                await shellEmulate();
            });
        };
        shellEmulate();
    });
});
commander_1.program
    .command("serve")
    .option("--strict", "Enable strict mode")
    .option("--http", "Enable HTTP API")
    .option("--use-example-contract", "Use example contract")
    .option("--vmec", "Init and run VMEC")
    .option("--vmec-up-start-up", "Send UP to all machines when it runs")
    .action(async (options) => {
    await bootloader(options);
});
commander_1.program.parse();
//# sourceMappingURL=main.js.map