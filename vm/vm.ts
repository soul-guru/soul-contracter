import { Context } from "isolated-vm";
import getBootableISO from "./boot";
import { readFileSync } from "node:fs";

const ivm = require("isolated-vm");

import EventEmitter from "node:events";
import { ClickHouse } from "../src/clickhouse";
import { existsSync } from "fs";
import axios from "axios";
import { ResolverOpenAI } from "../src/resolvers/OpenAI";
import fetch from 'sync-fetch'

class VMEmitter extends EventEmitter {}

export default class VM {
  private readonly bootableIsolated = getBootableISO();
  private readonly sysFile = process.cwd() + "/vm/sys.js";
  private context: Context = undefined;

  public readonly botId: string;
  public readonly contractId: string;
  public readonly memory: number = 32;

  public readonly emitter = new VMEmitter();

  constructor(contractId: string, botId: string, memory: number) {
    this.contractId = contractId;
    this.botId = botId;
    this.memory = memory;

    if (!existsSync(this.sysFile)) {
      throw Error("sys.js not found");
    }
  }

  private isolate = new ivm.Isolate({
    memoryLimit: this.memory,
    inspector: true,
    onCatastrophicError: () => {
      process.abort();
    },
  });

  public metric() {
    return this.isolate.getHeapStatisticsSync();
  }

  public workTime() {
    return this.isolate.cpuTime;
  }

  public async stop() {
    if (!this.isolate.isDisposed) {
      return this.isolate.dispose();
    }

    return null;
  }

  private createContext() {
    // Create a new context within this isolate. Each context has its own copy of all the builtin
    // Objects. So for instance if one context does Object.prototype.foo = 1 this would not affect any
    // other contexts.
    const contextSync = this.isolate.createContextSync();

    return this.fillContext(contextSync);
  }

  private async fillContext(context: Context): Promise<Context> {
    await context.global.set("log", console.log);

    await context.global.set("network_request_json", (url: string, params: object) => {
      // SECURITY!!
      if (["jar1", "jar2", "jar3"].includes((new URL(url)).host)) {
        return null
      }

      return Object(fetch(url, params).json())
    });

    await context.global.set("network_request_raw", (url: string, params: object) => {
      return String(fetch(url, params).text())
    });


    // await context.global.set('openAiTest', async ({text}) => {
    //   return await this.captureErrorRunnable(new ResolverOpenAI().take(text))
    // });

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
        }
      ],
    );

    return context;
  }

  public async compile(source: string): Promise<Context> {
    this.context = await this.createContext();

    const sysRunnable = await this.isolate.compileScript(
      readFileSync(this.sysFile).toString("utf-8"),
    );

    await sysRunnable.run(this.context);

    const compileRunnable = await this.isolate.compileScript(source);

    await compileRunnable.run(this.context);

    return this.context;
  }

  public async bootstrap() {
    this.bootableIsolated.vmEmitter.once("boot", () => {
      this.captureErrorRunnable(
        this.context.evalClosure(`safeSignal('onBoot', $export)`)
      );
    });

    this.bootableIsolated.vmEmitter.on("message", (object) => {
      const obj = JSON.stringify(object);

      this.captureErrorRunnable(
        this.context.evalClosure(
          `safeSignal('onMessage', $export, JSON.parse('${obj}'))`,
        ),
      );
    });
  }

  public async signal(signal: string, props: any | null = null) {
    return this.bootableIsolated.vmEmitter.emit(signal, props);
  }

  private captureErrorRunnable<T = any>(promise: Promise<T>, ignoreError = true) {
    return new Promise(async (resolve, reject) => {
      try {
        return resolve(await promise)
      } catch (error) {
        if (error instanceof Error) {
          ClickHouse.insertContractError(
            error,
            this.botId,
            this.contractId,
            "EVENT",
          ).catch(console.error)
        }

        !ignoreError && reject(error);
      }
    });
  }
}
