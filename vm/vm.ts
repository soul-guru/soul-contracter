import {Context, Isolate, IsolateOptions, Reference} from "isolated-vm";
import getBootableISO from "./boot";
import { readFile } from "node:fs";
import uniqid from "uniqid";

import EventEmitter from "node:events";
import { requireClickhouseClient } from "../src/clickhouse";
import { existsSync } from "fs";
import axios from "axios";
import logger from "../src/logger";
import Bootloader from "../vm/Bootloader";
import hashIt from "hash-it";
import {IBootableIso} from "../src/interfaces/IBootableIso";
import _ from "lodash";
import AxiosWrapper, {axiosDeterminateRouter} from "./AxiosWrapper";
import {flatten} from "@hapi/hoek";
import {schedule} from "../src/parent-schedule";

/**
 * A custom EventEmitter class that extends the built-in EventEmitter.
 * This class adds custom logging functionality to the on and emit methods.
 */
class VMEmitter extends EventEmitter {
  /**
   * Register an event listener for the specified event.
   * @param eventName - The name of the event to listen to (string or symbol).
   * @param listener - The callback function to execute when the event is emitted.
   * @returns This instance of VMEmitter to allow method chaining.
   */
  on(eventName: string | symbol, listener: (...args: any[]) => void): this {
    /**
     * Logs a message indicating that a listener is attached to a specific event.
     * @param eventName - The name of the attached event.
     */
    logger.info(`attached VMEmitter: @${String(eventName)}`);

    // Wrap the listener to ensure it receives its arguments as an array
    return super.on(eventName, (...args: any[]) => listener(args));
  }

  /**
   * Emit an event with the specified name and arguments.
   * @param eventName - The name of the event to emit (string or symbol).
   * @param args
   * @returns true if any listeners were called, false otherwise.
   */
  emit(eventName: string | symbol, ...args: (string | any[])[]): boolean {
    /**
     * Logs a message indicating that an event is being emitted, along with the event name and a hash of the arguments.
     * @param eventName - The name of the emitted event.
     * @param args - The arguments passed to the event.
     */
    logger.info(`(:${String(eventName)}) ------> @ (${hashIt(args)})`);

    // Trigger the event and call registered listeners
    return super.emit(eventName, ...args);
  }
}


export default class VM {
  private isReady: boolean = false;
  private isolate: Isolate = undefined;
  private bootableIsolated: IBootableIso;
  private context: Context = undefined;
  private _botId: string;
  private _contractId: string;

  private jobs = []

  public readonly ID: string;
  public readonly emitter = new VMEmitter();

  set botId(value: string) {
    this._botId = value;
  }

  set contractId(value: string) {
    this._contractId = value;
  }

  /**
   * Initializes a daemon process in the form of a cron job.
   * The cron job is scheduled to run at midnight every day ('0 0 * * *').
   * It checks if the VM is not disposed and triggers an 'onNewDay' event in the VM's context.
   */
  private initDaemon() {
    logger.info(`creating cron job for '0 0 * * *'`, {
      vm: this.ID,
    });


    this.jobs.push(
      schedule.scheduleJob('0 0 * * *', () => {
        if (!this.isDisposed()) {
          this.context.evalClosure(`safeSignal('onNewDay', $worker)`)
        }
      })
    );
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
        inspector: true,
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
              `'${bootloader.sysFile}' compiled and executed as bootloader system code. Hash: ${hashIt(bootScript)}`,
              { vm: this.ID },
            );

            logger.info(
              `init daemon`,
              { vm: this.ID },
            );

            this.initDaemon()

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
      // logger.info(`attach ->${CliColor.BgBlue}${pair[0]}${CliColor.Reset} (${pair[1].length}) into context`, {vm: this.ID})
      await context.global.set(pair[0], pair[1]);
    }

    // context.evalClosureSync(
    //     `globalThis.layer = (arg) => $0.apply(null, [arg], { result: { promise: true } });`,
    //     [ new Reference(async (arg) => {
    //       return (await axiosClient.get(arg))
    //     })]
    // );

    context.evalClosureSync(`
    (function() {
        axios = async function (...args) {
            return JSON.parse(await $0.apply(undefined, args, { arguments: { copy: true }, result: { promise: true } }));
        };
    })();    
`, AxiosWrapper.methods, {arguments: {reference: true}, result: {reference: true, promise: true}});

    context.evalClosureSync(
      `
      globalThis.answer = {
        plainText: $0,
      }
      
      globalThis.axiosDeterminateRouter = {
        resolveDialog: $0,
      }
    `,
      [
        axiosDeterminateRouter.resolveDialog
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

  /**
   * Asynchronously cleans up and destroys the virtual machine.
   * Removes all listeners from the emitter, releases the execution context,
   * and disposes of the isolate. After this operation, the VM instance should
   * be considered non-functional.
   */
  public async destroyMachine(): Promise<void> {
    this.emitter.removeAllListeners("log");
    this.emitter.removeAllListeners("signal");
    this.emitter.removeAllListeners("boot");
    this.emitter.removeAllListeners("message");
    logger.info("[DESTROY] removed all: signal, boot, log, message listeners", {vm: this.ID})

    this.context.release();
    this.isolate.dispose();
    logger.info("[DESTROY] The content and the virtual machine were destroyed at the level of rejecting referencing objects inside the machine", {vm: this.ID})

    this.isolate = null;
    this.context = null;
    logger.info("[DESTROY] The context and the virtual machine itself as a cell in memory were destroyed", {vm: this.ID})

    this.jobs.forEach(job => {
      if (job) {
        logger.info(`[DESTROY] job ${job} killed`, {vm: this.ID})
        job.cancel()
      }
    })

    this.jobs = []
  }

  /**
   * Asynchronously compiles a given source script within the VM's context.
   * Used to dynamically execute scripts within the VM's isolated environment.
   * @param source - The source code to be compiled.
   * @returns A promise resolving to the Context in which the script was compiled.
   */
  public async compile(source: string): Promise<Context> {
    const compileRunnable = await this.isolate.compileScript(source);

    compileRunnable.runSync(this.context);

    return this.context;
  }

  /**
   * Initializes the VM by setting up event listeners for 'boot' and 'message' events.
   * Uses captureErrorRunnable method to safely execute closures within the VM's context.
   */
  public async bootstrap() {
    this.emitter.on("boot", () => {
      this.captureErrorRunnable(
        this.context.evalClosure(`safeSignal('onBoot', $export)`),
      );
    });

    this.emitter.on("log", (data) => {
      logger.info(data)
    });

    this.emitter.on("message", (objects) => {
      if (_.isArray(objects)) {
        for (const object of _.flatten(objects)) {
          object.context = flatten(object.context);
          object.dialogId = String(object.dialogId);

          let obj = JSON.stringify(object);

          this.captureErrorRunnable(
            this.context.evalClosure(`safeSignal('onMessage', $export, JSON.parse('${obj}'))`),
          );
        }
      }
    });
  }

  /**
   * Emits a signal within the VM. If to isolate is disposed, logs an error.
   * @param signal - The signal to emit.
   * @param props - Additional properties to pass with the signal.
   * @returns null if to isolate is disposed, otherwise the result of the emitter.emit function.
   */
  public async signal(signal: string, props: any | null = null) {
    if (!this.isolate.isDisposed) {
      logger.info(`(:${signal}) ------> ${this.ID}`, {vm: this.ID});
      return this.emitter.emit(signal, props);
    } else {
      logger.error(`WARNING! VM '${this._botId}' IS DOWN WHEN GET SIGNAL`);
      return null;
    }
  }

  /**
   * Executes a promise and captures any errors that occur during its execution.
   * If an error occurs, it logs the error and optionally rejects the promise.
   * @param promise - The promise to execute.
   * @param ignoreError - Whether to ignore the error and not reject the promise.
   * @returns A new promise that resolves to the result of the input promise.
   */
  private captureErrorRunnable<T = any>(
    promise: Promise<T>,
    ignoreError = true,
  ): Promise<T | void> {
    return new Promise(async (resolve, reject) => {
      try {
        return resolve(await promise);
      } catch (error) {
        if (error instanceof Error) {
          let colorize: (any: any) => any

          try {
            colorize = require('json-colorizer')
          } catch (e) {
            colorize = function (any) {
              return any
            }
          }

          logger.error(colorize(error.message));

          requireClickhouseClient()
            ?.insertContractError(error, this._botId, this._contractId, "EVENT")
            .catch(console.error);
        }
        !ignoreError && reject(error);
      }
    });
  }

}
