
/**
 * Safely invokes a function within a given context, handling potential undefined or null references.
 *
 * @function
 * @name safeSignal
 * @param {string} functionName - The name of the function to be invoked (may include namespaces, e.g., 'namespace.functionName').
 * @param {Object} context - The context object in which to look for the function to be invoked.
 * @param {...any} args - Arguments to be passed to the invoked function.
 * @returns {any} The result of the invoked function or undefined if the function is not found.
 */
function safeSignal(functionName: string, context: string, args: any = null) {
  if (context && context[functionName] != null) {
    const results = context[functionName](args);

    // @ts-ignore
    log(`s(${functionName}): success`)

    return results
  } else {
    // @ts-ignore
    log(`safeSignal ->>> (${functionName}): not found`)
  }
}

/**
 * Type definition for the networking implementation function.
 *
 * @typedef {Function} NetworkingImpl
 * @param {string} url - The URL for the network request.
 * @param {Object} params - Parameters for the network request.
 * @returns {any} The result of the network request.
 */
type NetworkingImpl = (url: string, params: object) => any;

// @ts-ignore
const NetworkingJSON: NetworkingImpl = network_request_json || null;

// @ts-ignore
const NetworkingRAW: NetworkingImpl = network_request_raw || null;

/**
 * Represents the OpenAI class for interacting with the OpenAI API.
 *
 * @class
 */
class OpenAI {
  private readonly apiKey: string;
  private readonly model: string;

  /**
   * Creates an instance of the OpenAI class.
   *
   * @constructor
   * @param {string} apiKey - The API key for accessing the OpenAI API.
   * @param {string} [model='gpt-3.5-turbo'] - The model version to use (default: 'gpt-3.5-turbo').
   */
  constructor(apiKey: string, model: string = 'gpt-3.5-turbo') {
    this.apiKey = apiKey;
    this.model = model;
  }

  /**
   * Makes a request to the OpenAI API for chat completions.
   *
   * @method
   * @name make
   * @param {Object} options - Options for the chat completion request.
   * @param {string} options.text - The text content for the chat completion.
   * @returns {Promise<any>} A promise that resolves with the result of the chat completion.
   */
  make({ text }: { text: string }): Promise<any> {
    return NetworkingJSON('https://api.openai.com/v1/chat/completions', {
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: text }],
        temperature: 0,
        max_tokens: 2048,
      }),
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
    });
  }
}

class Essent {
  task(taskName: string, model: string, value: string) {
    return NetworkingJSON(`http://soul-essent:8080/task/${taskName}?model=${model}`, {
      body: JSON.stringify({
        value
      }),
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });
  }

  snippet(snippetName: string | 'ytcc', body: object) {
    return NetworkingRAW(`http://soul-essent:8080/snippet/${snippetName}`, {
      body: JSON.stringify({
        ...body
      }),
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });
  }

  intent(text) {
    return NetworkingJSON('http://soul-essent:8080/nlp/intent', {
      body: JSON.stringify({
        value: text
      }),
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });
  }

  emotion(text) {
    return NetworkingJSON('http://soul-essent:8080/nlp/emotion', {
      body: JSON.stringify({
        value: text
      }),
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });
  }
}

