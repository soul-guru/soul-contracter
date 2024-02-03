import _ from "lodash";
import axios from "axios";
import logger from "./src/logger";
import { AxiosError } from "axios";
import {performance} from "node:perf_hooks";
import { IDependency } from "./src/interfaces/IDependency";

export const HTTP_BASE_PROTOCOL = "http";

export const globalThis = require("globalthis")(); // returns native globalThis if compliant

export async function inject(dependencies: {
  [key: string]: () => IDependency<any>;
}) {
  const targets = {};

  for (const dependency of _.chain(dependencies).values().value()) {
    const init: IDependency<any> = dependency.apply(null);

    for (const ip of init.requireHosts) {
      logger.info(
        `establish a connection with host '${ip}' as part of checking connections for the container depending on '${dependency.name}' (call: ${init.name})`,
        { when: "inject" },
      );

      const pStart = performance.now();

      try {
        let hostDomain = ip;

        if (ip.startsWith(HTTP_BASE_PROTOCOL)) {
          hostDomain = ip;
        } else {
          hostDomain = HTTP_BASE_PROTOCOL + "://" + ip;
        }

        await axios.get(hostDomain);

        logger.info(
          `service '${dependency.name}' (call: ${init.name}) hosts are fully operational and working correctly. Call it through requireTarget('${init.name}')`,
          { when: "inject" },
        );
      } catch (e) {
        if (e instanceof AxiosError) {
          logger.error(
            `attention! The dependency '${dependency.name}' is not satisfied because the host ${ip} does not respond to the ping command`,
          );
          if (process.env['STRICT'] != 'false') {
            process.exit(1)
          }
          continue;
        }
      }

      logger.info(
        `operation 'inject_${dependency.name}' took ${
          performance.now() - pStart
        } ms`,
      );
    }

    init.bootstrap();
    const instance = await init.instance();
    init?.postCreate?.(instance);
    targets[init.name] = instance;
  }

  globalThis.targets = targets;

  return new Proxy(targets, {
    get(target: {}, p: string | symbol, receiver: any): any {
      return targets[p];
    },

    set(target: {}, p: string | symbol, newValue: any, receiver: any): boolean {
      throw "Cannot write";
    },
  });
}

export function requireTarget<T>(name: string): T | null {
  return globalThis.targets[name] || null;
}
