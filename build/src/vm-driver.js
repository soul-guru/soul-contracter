"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVm = exports.selectVmOrNull = exports.vm = exports.VME = void 0;
const md5_1 = __importDefault(require("md5"));
const lodash_1 = __importDefault(require("lodash"));
const vm_1 = __importDefault(require("../vm/vm"));
const logger_1 = __importDefault(require("./logger"));
const CryptoFlow_1 = __importDefault(require("./CryptoFlow"));
const node_events_1 = __importDefault(require("node:events"));
const mongo_1 = require("./mongo");
const Bootloader_1 = __importDefault(require("../vm/Bootloader"));
const cli_color_1 = require("./classes/cli-color");
const clickhouse_1 = require("./clickhouse");
class VMEmitter extends node_events_1.default {
    on(eventName, listener) {
        logger_1.default.info(`VME registered ON signal '${String(eventName)}' with listener ${(0, md5_1.default)(String(listener))}`);
        return super.on(eventName, listener);
    }
    once(eventName, listener) {
        logger_1.default.info(`VME registered ONCE signal '${String(eventName)}' with listener ${(0, md5_1.default)(String(listener))}`);
        return super.once(eventName, listener);
    }
    emit(eventName, ...args) {
        logger_1.default.info(`VME sent signal '${String(eventName)}' to the virtual machine (${String(args)})`);
        return super.emit(eventName, ...args);
    }
}
exports.VME = new VMEmitter();
exports.vm = {};
setInterval(() => {
    lodash_1.default.toPairs(exports.vm).map((thisVm) => {
        let inUsed = false;
        if (thisVm[1] instanceof vm_1.default) {
            inUsed = !thisVm[1].isDisposed();
        }
        if (!inUsed) {
            delete exports.vm[thisVm[0]];
            logger_1.default.info(`${cli_color_1.CliColor.BgWhite}${cli_color_1.CliColor.FgBlack}[Waste Collector]${cli_color_1.CliColor.Reset} - I found a virtual machine that needs to be deleted! Machine '${thisVm[1].ID}' has been removed. I don't do my job in vain!`);
        }
    });
}, 5000);
function selectVmOrNull(name) {
    return lodash_1.default.get(exports.vm, name, null);
}
exports.selectVmOrNull = selectVmOrNull;
function deleteVm(name) {
    if (exports.vm[name] instanceof vm_1.default) {
        if (exports.vm[name].isDisposed()) {
            delete exports.vm[name];
            return true;
        }
        else {
            logger_1.default.error(`The virtual machine '${name}' still works, and the link to such a machine cannot be removed from memory`);
            return false;
        }
    }
    return false;
}
exports.deleteVm = deleteVm;
exports.default = () => {
    logger_1.default.info("VMEC called");
    const DefaultVM = new vm_1.default(512, Bootloader_1.default, async function (virtual) {
        if (await (0, mongo_1.requireMongoDB)()?.getContracts()?.count('default') == 0) {
            await (0, mongo_1.requireMongoDB)()
                ?.getContracts()
                ?.create("default", "default");
        }
        const contractDefaultVm = await (0, mongo_1.requireMongoDB)()
            ?.getContracts()
            ?.getSource("default");
        const actualDefaultVm = contractDefaultVm.branches.find((i) => i.name === contractDefaultVm.mainBranch);
        if (actualDefaultVm && typeof actualDefaultVm.source == "string") {
            logger_1.default.info("code for 'default' contract found", { vm: virtual.ID });
            await virtual
                .compile(actualDefaultVm.source)
                .then(context => {
                virtual.bootstrap().then(() => {
                    logger_1.default.info(`default contract vm bootstrap up`, { vm: virtual.ID });
                    virtual.emitter.on("log", (...args) => {
                        logger_1.default.info(String(args), { vm: virtual.ID });
                    });
                    virtual.signal("boot");
                });
            })
                .catch(error => logger_1.default.error(error.toString(), { vm: DefaultVM.ID }));
        }
        else {
            logger_1.default.warn("load any code into the 'default' contract");
        }
    });
    exports.VME.on("signal", async (botId, signalId, signalProps, contractId) => {
        logger_1.default.info(`virtual execution received signal '${signalId}' for '${contractId}' contract`);
        if (contractId == 'default') {
            await DefaultVM.signal(signalId, signalProps);
            return;
        }
        lodash_1.default.get(exports.vm, botId, null)
            ?.signal(signalId, signalProps)
            ?.then(() => logger_1.default.info(`VME found a virtual machine for agent ${botId} and sent a proxy signal ${signalId} there`))
            ?.catch((error) => {
            (0, clickhouse_1.requireClickhouseClient)()?.insertContractError(error, botId, contractId, "UP");
        });
    });
    exports.VME.on("down", async (botId, onVirtualMachineDown = null) => {
        if (!exports.vm[botId]) {
            logger_1.default.warn(`virtual machine ${botId} does not exist`);
            return;
        }
        let vmLocal = exports.vm[botId];
        if (vmLocal instanceof vm_1.default) {
            await vmLocal.destroyMachine();
        }
        exports.vm[botId] = null;
        delete exports.vm[botId];
        if (vmLocal.isDisposed()) {
            vmLocal = null;
            onVirtualMachineDown?.();
        }
    });
    exports.VME.on("up", async (botId) => {
        if (exports.vm[botId]) {
            logger_1.default.warn(`virtual machine ${botId} does not rise, as it is already in raised mode`);
            return;
        }
        const contract = await (0, mongo_1.requireMongoDB)()?.getContracts()?.getSource(botId);
        if (contract != null) {
            const actual = contract.branches.find((i) => i.name === contract.mainBranch);
            if (typeof actual?.source === "string") {
                const virtualMachine = new vm_1.default(16, Bootloader_1.default, (virtual) => {
                    exports.vm[botId] = virtual;
                    virtual.botId = contract.botId;
                    virtual.contractId = contract.id;
                    virtual
                        .compile(CryptoFlow_1.default.toDecrypted(actual.source))
                        .then(() => {
                        logger_1.default.info(`vm '${contract.botId}' is now up`, { vm: virtual.ID });
                        virtual.bootstrap().then(() => {
                            logger_1.default.info(`vm '${contract.botId}' bootstrap up`, { vm: virtual.ID });
                            virtual.emitter.on("log", (...args) => {
                                logger_1.default.info(String(args), { vm: virtual.ID });
                                (0, clickhouse_1.requireClickhouseClient)()?.insertContractStdout(args.join(" "), contract.botId, contract.id);
                            });
                            virtual.signal("boot");
                            exports.vm[contract.botId] = virtualMachine;
                        });
                    })
                        .catch((error) => {
                        logger_1.default.error(error.message, { vm: virtual.ID });
                        (0, clickhouse_1.requireClickhouseClient)()?.insertContractError(error, contract.botId, contract.id, "UP");
                    });
                });
            }
            else {
                logger_1.default.warn(`source in '${botId}' is not a code (${typeof actual?.source})`);
            }
        }
        else {
            logger_1.default.warn(`contract for '${botId}' not found`);
        }
    });
    return exports.VME;
};
//# sourceMappingURL=vm-driver.js.map