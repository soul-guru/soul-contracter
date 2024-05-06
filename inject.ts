import _ from "lodash";
import axios from "axios";
import logger from "./src/logger";
import { AxiosError } from "axios";
import {performance} from "node:perf_hooks";
import { IDependency } from "./src/interfaces/IDependency";

export const HTTP_BASE_PROTOCOL = "http";

export const globalThis = require("globalthis")(); // returns native globalThis if compliant

/**
 * Inject function to initialize and configure dependencies.
 *
 * This function takes an object where the keys are the dependency names and the
 * values are functions that return an {@link IDependency} object. The function
 * will iterate over the dependency functions, check if the hosts are
 * responding, and then call the bootstrap and instance functions of the
 * dependency.
 *
 * The function also creates a Proxy object that allows you to access the
 * instances of the injected dependencies as if they were on the global scope.
 *
 * @param {Object.<string, () => IDependency<any>>} dependencies - An object with keys as dependency names and values as functions that return an {@link IDependency} object.
 * @returns {Proxy<Object.<string, any>>} A proxy object that allows you to access the instances of the injected dependencies as if they were on the global scope.
 */
export async function inject(
  dependencies: {
    [key: string]: () => IDependency<any>;
  },
): Promise<Proxy<{ [key: string]: any }>> {
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
          if (process.env["STRICT"] != "false") {
            process.exit(1);
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
    /**
     * Getter for the proxy object that allows you to access the instances of the
     * injected dependencies as if they were on the global scope.
     *
     * @param {Object} target - The target object.
     * @param {string|symbol} p - The property to get from the target object.
     * @param {*} receiver - The receiver of the get operation.
     * @returns {*} The value of the property from the target object.
     */
    get(target: {}, p: string | symbol, receiver: any): any {
      return targets[p];
    },

    /**
     * Setter for the proxy object that throws an error if the user tries to
     * write to the proxy object.
     *
     * @param {Object} target - The target object.
     * @param {string|symbol} p - The property to set on the target object.
     * @param {*} newValue - The new value to set on the property.
     * @param {*} receiver - The receiver of the set operation.
     * @returns {boolean} Always returns false.
     */
    set(target: {}, p: string | symbol, newValue: any, receiver: any): boolean {
      throw "Cannot write";
    },
  });
}


export function requireTarget<T>(name: string): T | null {
  return globalThis.targets[name] || null;
}
