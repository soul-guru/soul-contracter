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
exports.serve = void 0;
const inject_1 = require("../../inject");
const mongo_1 = require("../mongo");
const clickhouse_1 = require("../clickhouse");
const vm_driver_1 = __importStar(require("../vm-driver"));
const util_1 = __importDefault(require("util"));
const logger_1 = __importDefault(require("../logger"));
const app_1 = __importDefault(require("../app"));
const http_1 = __importDefault(require("http"));
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
            if (contracts.length < 5) {
                logger_1.default.info("Contracts: " + contractsList);
            }
            else {
                logger_1.default.info("Contracts: " + contractsList.length + " items");
            }
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
            http_1.default
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
function serve(program) {
    program
        .command("serve")
        .option("--strict", "Enable strict mode")
        .option("--http", "Enable HTTP API")
        .option("--use-example-contract", "Use example contract")
        .option("--vmec", "Init and run VMEC")
        .option("--vmec-up-start-up", "Send UP to all machines when it runs")
        .action(async (options) => {
        await bootloader(options);
    });
}
exports.serve = serve;
//# sourceMappingURL=serve.js.map