import {stdout} from "../init";

/**
 * Safely invokes a function within a given context,
 * handling potential undefined or null references.
 *
 * @function
 * @name safeSignal
 * @param {string} functionName - The name of the function to be invoked (may include namespaces, e.g., 'namespace.functionName').
 * @param {Object} context - The context object in which to look for the function to be invoked.
 * @param {...any} args - Arguments to be passed to the invoked function.
 * @returns {any} The result of the invoked function or undefined if the function is not found.
 */
export default function safeSignal(functionName: string, context: object, args: any = null): any {
  if (context && context[functionName] != null) {
    const results = context[functionName](args);
    stdout(`s(${functionName}): success`)
    return results
  } else {
    stdout(`safeSignal ->>> (${functionName}): not found`)
  }
}
