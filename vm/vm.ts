import {Context, Isolate, IsolateOptions, Reference} from "isolated-vm";
import getBootableISO from "./boot";
import { readFile } from "node:fs";
import uniqid from "uniqid";

import EventEmitter from "node:events";
import { requireClickhouseClient } from "../src/clickhouse";
import { existsSync } from "fs";
import axios from "axios";
import logger from "../src/logger";
import Bootloader from "../src/Bootloader";
import hashIt from "hash-it";
import {IBootableIso} from "../src/interfaces/IBootableIso";
import _ from "lodash";
import {CliColor} from "../src/cli-color";
import AxiosWrapper from "./AxiosWrapper";

class VMEmitter extends EventEmitter {}

export default class VM {
  private isReady: boolean = false;
  private isolate: Isolate = undefined;
  private bootableIsolated: IBootableIso;
  private context: Context = undefined;
  private _botId: string;
  private _contractId: string;

  public readonly ID: string;
  public readonly emitter = new VMEmitter();

  set botId(value: string) {
    this._botId = value;
  }

  set contractId(value: string) {
    this._contractId = value;
  }


  constructor(
    readonly memory: number = 32,
    readonly bootloader = Bootloader,
    readonly onReady: (vm: VM) => void = () => {}
  ) {
    this.ID = uniqid();

    logger.info("creating VM", {vm: this.ID});

    if (!existsSync(bootloader.sysFile)) {
      logger.error(bootloader.sysFile + " not found");
      process.exit(1);
    }

    readFile(bootloader.sysFile, undefined, (err, buffer) => {
      const bootScript = buffer.toString("utf-8");
      logger.info(`used bootloader (${hashIt(bootloader)})`, { vm: this.ID });

      this.bootableIsolated = getBootableISO(this);

      logger.info(`used ISO (${hashIt(this.bootableIsolated)})`, {
        vm: this.ID,
      });

      const opt: IsolateOptions = {
        memoryLimit: this.memory,
        snapshot: undefined,
      };

      logger.info(`used opt (${hashIt(opt)}), ${JSON.stringify(opt)}`, {
        vm: this.ID,
      });

      this.isolate = new Isolate({
        ...opt,
        onCatastrophicError: () => {
          logger.error("VM BROKE! onCatastrophicError");
          process.abort();
        },
      });

      logger.info("creating init context", { vm: this.ID });

      this.createContext().then((context) => {
        this.context = context;

        logger.info("context created!", { vm: this.ID });
        logger.info("running *boot-script*", { vm: this.ID });

        this.isolate.compileScript(bootScript).then((sysRunnable) => {
          logger.info("*boot-script* done!", { vm: this.ID });

          sysRunnable.run(context).then((r) => {
            logger.info(
              `'${bootloader.sysFile}' compiled and executed as bootloader system code. Hash: ${r}`,
              { vm: this.ID },
            );
            this.isReady = true;
            logger.info(`VM ready`, { vm: this.ID });
            onReady?.(this)
          });
        });
      });
    });
  }


  public metric() {
    return this.isolate.getHeapStatisticsSync();
  }

  public workTime() {
    return this.isolate.cpuTime;
  }

  private createContext() {
    // Create a new context within this isolate. Each context has its own copy of all the builtin
    // Objects. So for instance if one context does Object.prototype.foo = 1 this would not affect any
    // other contexts.
    const contextSync = this.isolate.createContextSync();

    return this.fillContext(contextSync);
  }

  private async fillContext(context: Context): Promise<Context> {
    for (const pair of _.toPairs(this.bootableIsolated.env)) {
      logger.info(`attach ->${CliColor.BgBlue}${pair[0]}${CliColor.Reset} (${pair[1].length}) into context`, {vm: this.ID})
      await context.global.set(pair[0], pair[1]);
    }

    // context.evalClosureSync(
    //     `globalThis.layer = (arg) => $0.apply(null, [arg], { result: { promise: true } });`,
    //     [ new Reference(async (arg) => {
    //       return (await axiosClient.get(arg))
    //     })]
    // );

    await context.evalClosure(`
    (function() {
        axios = {
            get: function (...args) {
                return $0.apply(undefined, args, { arguments: { copy: true }, result: { promise: true } });
            }
        };
    })();    
`, AxiosWrapper.methods, {arguments: {reference: true}});

    context.evalClosureSync(
      `
      globalThis.console = {
        log: $0,
      }
      
      globalThis.answer = {
        plainText: $1,
      }
    `,
      [
        (...args) => this.emitter.emit("log", args),

        ({ dialogId, text }) => {
          axios
            .post(
              process.env.I2_CLUSTER_FLOW +
                "/service/dialogs/resolve/" +
                dialogId,
              {
                markup: [{ plainText: text }],
              },
            )
            .catch(console.error);
        },
      ],
    );

    return context;
  }

  public async refreshContext() {
    await this.context.release()

    this.context = await this.createContext()
  }

  public isDisposed() {
    if (this.isolate == null) {
      return true
    }

    return this.isolate.isDisposed
  }

  public async destroyMachine() {
    await this.emitter.removeAllListeners("signal")
    await this.emitter.removeAllListeners("boot")
    await this.emitter.removeAllListeners("message")

    await this.context.release()
    await this.isolate.dispose()

    this.isolate = null
    this.context = null
  }

  public async compile(source: string): Promise<Context> {
    const compileRunnable = await this.isolate.compileScript(source);

    await compileRunnable.run(this.context);

    return this.context;
  }

  public async bootstrap() {
    this.emitter.on("boot", () => {
      this.captureErrorRunnable(
        this.context.evalClosure(`safeSignal('onBoot', $export)`),
      );
    });

    this.emitter.on("message", (object) => {
      const obj = JSON.stringify(object);

      this.captureErrorRunnable(
        this.context.evalClosure(
          `safeSignal('onMessage', $export, JSON.parse('${obj}'))`,
        ),
      );
    });
  }

  public async signal(signal: string, props: any | null = null) {
    if (!this.isolate.isDisposed) {
      logger.info(`(:${signal}) ------> .... -----> ${this.ID}`)
      return this.emitter.emit(signal, props);
    } else {
      logger.error(`WARNING! VM '${this._botId}' IS DOWN WHEN GET SIGNAL`);
      return null;
    }
  }

  private captureErrorRunnable<T = any>(
    promise: Promise<T>,
    ignoreError = true,
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        return resolve(await promise);
      } catch (error) {
        if (error instanceof Error) {
          logger.error(error.message)

          requireClickhouseClient()
            ?.insertContractError(error, this._botId, this._contractId, "EVENT")
            .catch(console.error);
        }

        !ignoreError && reject(error);
      }
    });
  }
}
