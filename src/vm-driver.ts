import _ from "lodash";
import VM from "../vm/vm";
import logger from "./logger";
import {CliColor} from "./cli-color";
import Bootloader from "./Bootloader";
import EventEmitter from "node:events";
import { requireMongoDB } from "./mongo";
const { md5 } = require("request/lib/helpers");
import { requireClickhouseClient } from "./clickhouse";

/**
 * VMEmitter class extends EventEmitter to handle signals in the virtual machine environment.
 */
class VMEmitter extends EventEmitter {
  /**
   * Register an event listener for the specified event.
   * @param {string | symbol} eventName - The name of the event.
   * @param {(...args: any[]) => void} listener - The callback function to be executed when the event is triggered.
   * @returns {this} - The instance of the VMEmitter.
   */
  on(eventName: string | symbol, listener: (...args: any[]) => void): this {
    logger.info(
        `VME registered ON signal '${String(eventName)}' with listener ${md5(
            String(listener)
        )}`
    );
    return super.on(eventName, listener);
  }

  /**
   * Register a one-time event listener for the specified event.
   * @param {string | symbol} eventName - The name of the event.
   * @param {(...args: any[]) => void} listener - The callback function to be executed once when the event is triggered.
   * @returns {this} - The instance of the VMEmitter.
   */
  once(eventName: string | symbol, listener: (...args: any[]) => void): this {
    logger.info(
        `VME registered ONCE signal '${String(eventName)}' with listener ${md5(
            String(listener)
        )}`
    );
    return super.once(eventName, listener);
  }

  /**
   * Emit the specified event with optional arguments.
   * @param {string | symbol} eventName - The name of the event to emit.
   * @param {...any} args - Optional arguments to be passed to the event listeners.
   * @returns {boolean} - Returns true if the event had listeners, false otherwise.
   */
  emit(eventName: string | symbol, ...args: any[]): boolean {
    logger.info(
        `VME sent signal '${String(eventName)}' to the virtual machine (${String(
            args
        )})`
    );
    return super.emit(eventName, ...args);
  }
}

/**
 * Global instance of VMEmitter for handling signals in the virtual machine environment.
 */
export const VME = new VMEmitter();

/**
 * Object to store instances of virtual machines with keys as identifiers.
 * @type {{ [key: string]: VM }}
 */
export const vm: { [key: string]: VM } = {};

/**
 * Periodically check and remove virtual machines that are no longer in use.
 */
setInterval(() => {
  // logger.info(`${CliColor.BgWhite}${CliColor.FgBlack}[Waste Collector]${CliColor.Reset} - hard work!`)

  // Iterate over key-value pairs in the vm object
  _.toPairs(vm).map((thisVm) => {
    let inUsed = false;

    // Check if the value is an instance of VM and is not disposed
    if (thisVm[1] instanceof VM) {
      inUsed = !thisVm[1].isDisposed();
    }

    // If the virtual machine is not in use, remove it from the vm object
    if (!inUsed) {
      delete vm[thisVm[0]];
      logger.info(`${CliColor.BgWhite}${CliColor.FgBlack}[Waste Collector]${CliColor.Reset} - I found a virtual machine that needs to be deleted! Machine '${thisVm[1].ID}' has been removed. I don't do my job in vain!`);
    }
  });
}, 5000);


/**
 * Select a virtual machine by its name from the vm object.
 * @param {string} name - The name or identifier of the virtual machine.
 * @returns {VM | null} - Returns the selected virtual machine or null if not found.
 */
export function selectVmOrNull(name: string): VM | null {
  return _.get(vm, name, null);
}

/**
 * Delete a virtual machine by its name from the vm object.
 * @param {string} name - The name or identifier of the virtual machine.
 * @returns {boolean} - Returns true if the virtual machine was successfully deleted, false otherwise.
 */
export function deleteVm(name: string): boolean {
  // Check if the value associated with the name is an instance of VM
  if (vm[name] instanceof VM) {
    // Check if the virtual machine is disposed
    if (vm[name].isDisposed()) {
      // Delete the virtual machine from the vm object
      delete vm[name];
      return true;
    } else {
      // Log an error if the virtual machine is still active
      logger.error(`The virtual machine '${name}' still works, and the link to such a machine cannot be removed from memory`);
      return false;
    }
  }

  // Return false if the virtual machine with the given name is not found
  return false;
}

/**
 * Initialize and configure the Virtual Machine Emitter (VME).
 * @returns {VMEmitter} - The configured VME instance.
 */
export default () => {
  logger.info("VMEC called");

  // Signal event: Triggered when a signal is received for virtual execution
  VME.on("signal", async (botId, signalId, signalProps, contractId) => {
    logger.info(
        `virtual execution received signal '${signalId}' for '${contractId}' contract`,
    );

    // Get the virtual machine associated with the botId
    _.get(vm, botId, null)
        ?.signal(signalId, signalProps)
        ?.then(() =>
            logger.info(
                `VME found a virtual machine for agent ${botId} and sent a proxy signal ${signalId} there`,
            ),
        )
        ?.catch((error) => {
          requireClickhouseClient()?.insertContractError(
              error,
              botId,
              contractId,
              "UP",
          );
        });
  });

  // Down event: Triggered when a virtual machine is taken down
  VME.on("down", async (botId) => {
    if (!vm[botId]) {
      logger.warn(`virtual machine ${botId} does not exist`);
      return;
    }

    let vmLocal = vm[botId];

    if (vmLocal instanceof VM) {
      await vmLocal.destroyMachine();
    }
  });

  // Up event: Triggered when a virtual machine is brought up
  VME.on("up", async (botId) => {
    if (vm[botId]) {
      logger.warn(`virtual machine ${botId} does not rise, as it is already in raised mode`);
      return;
    }

    const contract = await requireMongoDB()?.getContracts()?.getSource(botId);

    if (contract != null) {
      const actual = contract.branches.find(
          (i) => i.name === contract.mainBranch,
      );

      if (typeof actual?.source === "string") {
        const virtualMachine = new VM(32, Bootloader, (virtual) => {
          vm[botId] = virtual;

          virtual.botId = contract.botId;
          virtual.contractId = contract.id;

          virtual // @ts-ignore
              .compile(actual.source)
              .then(() => {
                logger.info(`vm '${contract.botId}' is now up`, { vm: virtual.ID });

                virtual.bootstrap().then(() => {
                  logger.info(`vm '${contract.botId}' bootstrap up`, { vm: virtual.ID });

                  virtual.emitter.on("log", (...args) => {
                    logger.info(String(args), { vm: virtual.ID });

                    requireClickhouseClient()?.insertContractStdout(
                        args.join(" "),
                        contract.botId,
                        contract.id,
                    );
                  });

                  virtual.signal("boot");

                  vm[contract.botId] = virtualMachine;
                });
              })
              .catch((error: Error) => {
                logger.error(error.message, { vm: virtual.ID });

                requireClickhouseClient()?.insertContractError(
                    error,
                    contract.botId,
                    contract.id,
                    "UP",
                );
              });
        });
      } else {
        logger.warn(`source in '${botId}' is not a code (${typeof actual?.source})`);
      }
    } else {
      logger.warn(`contract for '${botId}' not found`);
    }
  });

  return VME;
};