"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const isolated_vm_1 = require("isolated-vm");
const boot_1 = __importDefault(require("./boot"));
const node_fs_1 = require("node:fs");
const uniqid_1 = __importDefault(require("uniqid"));
const node_events_1 = __importDefault(require("node:events"));
const clickhouse_1 = require("../src/clickhouse");
const fs_1 = require("fs");
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("../src/logger"));
const Bootloader_1 = __importDefault(require("../vm/Bootloader"));
const hash_it_1 = __importDefault(require("hash-it"));
const lodash_1 = __importDefault(require("lodash"));
const AxiosWrapper_1 = __importDefault(require("./AxiosWrapper"));
const hoek_1 = require("@hapi/hoek");
const parent_schedule_1 = require("../src/parent-schedule");
class VMEmitter extends node_events_1.default {
    on(eventName, listener) {
        logger_1.default.info(`attached VMEmitter: @${String(eventName)}`);
        return super.on(eventName, (...args) => listener(args));
    }
    emit(eventName, ...args) {
        logger_1.default.info(`(:${String(eventName)}) ------> @ (${(0, hash_it_1.default)(args)})`);
        return super.emit(eventName, ...args);
    }
}
class VM {
    memory;
    bootloader;
    onReady;
    isReady = false;
    isolate = undefined;
    bootableIsolated;
    context = undefined;
    _botId;
    _contractId;
    jobs = [];
    ID;
    emitter = new VMEmitter();
    set botId(value) {
        this._botId = value;
    }
    set contractId(value) {
        this._contractId = value;
    }
    initDaemon() {
        logger_1.default.info(`creating cron job for '0 0 * * *'`, {
            vm: this.ID,
        });
        this.jobs.push(parent_schedule_1.schedule.scheduleJob('0 0 * * *', () => {
            if (!this.isDisposed()) {
                this.context.evalClosure(`safeSignal('onNewDay', $worker)`);
            }
        }));
    }
    constructor(memory = 32, bootloader = Bootloader_1.default, onReady = () => { }) {
        this.memory = memory;
        this.bootloader = bootloader;
        this.onReady = onReady;
        this.ID = (0, uniqid_1.default)();
        logger_1.default.info("creating VM", { vm: this.ID });
        if (!(0, fs_1.existsSync)(bootloader.sysFile)) {
            logger_1.default.error(bootloader.sysFile + " not found");
            process.exit(1);
        }
        (0, node_fs_1.readFile)(bootloader.sysFile, undefined, (err, buffer) => {
            const bootScript = buffer.toString("utf-8");
            logger_1.default.info(`used bootloader (${(0, hash_it_1.default)(bootloader)})`, { vm: this.ID });
            this.bootableIsolated = (0, boot_1.default)(this);
            logger_1.default.info(`used ISO (${(0, hash_it_1.default)(this.bootableIsolated)})`, {
                vm: this.ID,
            });
            const opt = {
                memoryLimit: this.memory,
                snapshot: undefined,
            };
            logger_1.default.info(`used opt (${(0, hash_it_1.default)(opt)}), ${JSON.stringify(opt)}`, {
                vm: this.ID,
            });
            this.isolate = new isolated_vm_1.Isolate({
                ...opt,
                inspector: true,
                onCatastrophicError: () => {
                    logger_1.default.error("VM BROKE! onCatastrophicError");
                    process.abort();
                },
            });
            logger_1.default.info("creating init context", { vm: this.ID });
            this.createContext().then((context) => {
                this.context = context;
                logger_1.default.info("context created!", { vm: this.ID });
                logger_1.default.info("running *boot-script*", { vm: this.ID });
                this.isolate.compileScript(bootScript).then((sysRunnable) => {
                    logger_1.default.info("*boot-script* done!", { vm: this.ID });
                    sysRunnable.run(context).then((r) => {
                        logger_1.default.info(`'${bootloader.sysFile}' compiled and executed as bootloader system code. Hash: ${(0, hash_it_1.default)(bootScript)}`, { vm: this.ID });
                        logger_1.default.info(`init daemon`, { vm: this.ID });
                        this.initDaemon();
                        this.isReady = true;
                        logger_1.default.info(`VM ready`, { vm: this.ID });
                        onReady?.(this);
                    });
                });
            });
        });
    }
    metric() {
        return this.isolate.getHeapStatisticsSync();
    }
    workTime() {
        return this.isolate.cpuTime;
    }
    createContext() {
        const contextSync = this.isolate.createContextSync();
        return this.fillContext(contextSync);
    }
    async fillContext(context) {
        for (const pair of lodash_1.default.toPairs(this.bootableIsolated.env)) {
            await context.global.set(pair[0], pair[1]);
        }
        await context.evalClosure(`
    (function() {
        axios = {
            get: function (...args) {
                return $0.apply(undefined, args, { arguments: { copy: true }, result: { promise: true } });
            }
        };
    })();    
`, AxiosWrapper_1.default.methods, { arguments: { reference: true } });
        context.evalClosureSync(`
      globalThis.console = {
        log: $0,
      }
      
      globalThis.answer = {
        plainText: $1,
      }
    `, [
            (...args) => this.emitter.emit("log", args),
            ({ dialogId, text }) => {
                axios_1.default
                    .post(process.env.I2_CLUSTER_FLOW +
                    "/service/dialogs/resolve/" +
                    dialogId, {
                    markup: [{ plainText: text }],
                })
                    .catch(console.error);
            },
        ]);
        return context;
    }
    async refreshContext() {
        await this.context.release();
        this.context = await this.createContext();
    }
    isDisposed() {
        if (this.isolate == null) {
            return true;
        }
        return this.isolate.isDisposed;
    }
    async destroyMachine() {
        this.emitter.removeAllListeners("signal");
        this.emitter.removeAllListeners("boot");
        this.emitter.removeAllListeners("message");
        logger_1.default.info("[DESTROY] removed all: signal, boot, message listeners", { vm: this.ID });
        this.context.release();
        this.isolate.dispose();
        logger_1.default.info("[DESTROY] The content and the virtual machine were destroyed at the level of rejecting referencing objects inside the machine", { vm: this.ID });
        this.isolate = null;
        this.context = null;
        logger_1.default.info("[DESTROY] The context and the virtual machine itself as a cell in memory were destroyed", { vm: this.ID });
        this.jobs.forEach(job => {
            if (job) {
                logger_1.default.info(`[DESTROY] job ${job} killed`, { vm: this.ID });
                job.cancel();
            }
        });
        this.jobs = [];
    }
    async compile(source) {
        const compileRunnable = await this.isolate.compileScript(source);
        compileRunnable.runSync(this.context);
        return this.context;
    }
    async bootstrap() {
        this.emitter.on("boot", () => {
            this.captureErrorRunnable(this.context.evalClosure(`safeSignal('onBoot', $export)`));
        });
        this.emitter.on("message", (objects) => {
            if (lodash_1.default.isArray(objects)) {
                for (const object of lodash_1.default.flatten(objects)) {
                    object.context = (0, hoek_1.flatten)(object.context);
                    object.dialogId = String(object.dialogId);
                    let obj = JSON.stringify(object);
                    this.captureErrorRunnable(this.context.evalClosure(`safeSignal('onMessage', $export, JSON.parse('${obj}'))`));
                }
            }
        });
    }
    async signal(signal, props = null) {
        if (!this.isolate.isDisposed) {
            logger_1.default.info(`(:${signal}) ------> ${this.ID}`, { vm: this.ID });
            return this.emitter.emit(signal, props);
        }
        else {
            logger_1.default.error(`WARNING! VM '${this._botId}' IS DOWN WHEN GET SIGNAL`);
            return null;
        }
    }
    captureErrorRunnable(promise, ignoreError = true) {
        return new Promise(async (resolve, reject) => {
            try {
                return resolve(await promise);
            }
            catch (error) {
                if (error instanceof Error) {
                    logger_1.default.error(error.message);
                    (0, clickhouse_1.requireClickhouseClient)()
                        ?.insertContractError(error, this._botId, this._contractId, "EVENT")
                        .catch(console.error);
                }
                !ignoreError && reject(error);
            }
        });
    }
}
exports.default = VM;
//# sourceMappingURL=vm.js.map