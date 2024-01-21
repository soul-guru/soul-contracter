"use strict";

var $character = {
  empathy: Math.random(),
  optimism: Math.random(),
  resilience: Math.random(),
  adaptability: Math.random(),
  patience: Math.random(),
  curiosity: Math.random(),
  decisiveness: Math.random(),
  openness: Math.random(),
  creativity: Math.random(),
  integrity: Math.random(),
  humility: Math.random(),
  confidence: Math.random(),
  conscientiousness: Math.random(),
  friendliness: Math.random(),
  generosity: Math.random(),
  selfDiscipline: Math.random(),
  emotionalStability: Math.random(),
  reliability: Math.random(),
  leadership: Math.random(),
  tactfulness: Math.random(),
  tolerance: Math.random(),
  cooperativeness: Math.random(),
  assertiveness: Math.random(),
  senseOfHumor: Math.random()
};
"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
/**
 * The `$foundation` object contains various utility functions and methods.
 */
var $foundation = {
  /**
   * The `$system` object contains system-related functions.
   */
  $system: {
    /**
     * Get the names of all context functions available in the current context.
     * @returns {string[]} An array of context function names.
     */
    contextFunctions: Object.getOwnPropertyNames(this)
  },
  /**
   * The `$string` object contains string manipulation functions.
   */
  $string: {
    /**
     * Get URLs from a string.
     * @param {string} str - The input string.
     * @param {boolean} lower - Whether to convert URLs to lowercase.
     * @returns {string[] | undefined} An array of URLs found in the input string, or undefined if no URLs are found.
     * @throws {TypeError} Throws a TypeError if the `str` argument is not a string.
     */
    getUrls: function getUrls(str, lower) {
      if (lower === void 0) {
        lower = false;
      }
      var regexp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()'@:%_\+.~#?!&//=]*)/gi;
      var bracketsRegexp = /[()]/g;
      if (typeof str !== "string") {
        throw new TypeError("The str argument should be a string, got ".concat(_typeof(str)));
      }
      if (str) {
        var urls = str.match(regexp);
        if (urls) {
          return lower ? urls.map(function (item) {
            return item.toLowerCase().replace(bracketsRegexp, "");
          }) : urls.map(function (item) {
            return item.replace(bracketsRegexp, "");
          });
        } else {
          return undefined;
        }
      } else {
        return undefined;
      }
    }
  },
  /**
   * The `$dialog` object contains dialog-related functions.
   */
  $dialog: {
    /**
     * Reply with a plain text message in a dialog.
     * @param {string} dialogId - The ID of the dialog.
     * @param {string} text - The text message to send.
     * @returns {null} Returns null if either `text` or `dialogId` is not provided.
     */
    replyWithText: function replyWithText(dialogId, text) {
      var _a;
      if (!text || !dialogId) {
        return null;
      }
      // @ts-ignore
      (_a = answer || null) === null || _a === void 0 ? void 0 : _a.plainText({
        dialogId: dialogId,
        text: text.trim()
      });
      return null;
    },
    /**
     * Get the textual message from a context object.
     * @param {any[]} context - An array of context objects.
     * @returns {string | null} The textual message, or null if not found.
     */
    getTextualMessageOrNull: function getTextualMessageOrNull(context) {
      if (!context || !context[0] || !context[0].plainText) {
        return null;
      }
      return context[0].plainText || null;
    }
  }
};
"use strict";

var __assign = void 0 && (void 0).__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
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
function safeSignal(functionName, context, args) {
  if (args === void 0) {
    args = null;
  }
  if (context && context[functionName] != null) {
    var results = context[functionName](args);
    // @ts-ignore
    log("s(".concat(functionName, "): success"));
    return results;
  } else {
    // @ts-ignore
    log("safeSignal ->>> (".concat(functionName, "): not found"));
  }
}
// @ts-ignore
var NetworkingJSON = network_request_json || null;
// @ts-ignore
var NetworkingRAW = network_request_raw || null;
/**
 * Represents the OpenAI class for interacting with the OpenAI API.
 *
 * @class
 */
var OpenAI = /** @class */function () {
  /**
   * Creates an instance of the OpenAI class.
   *
   * @constructor
   * @param {string} apiKey - The API key for accessing the OpenAI API.
   * @param {string} [model='gpt-3.5-turbo'] - The model version to use (default: 'gpt-3.5-turbo').
   */
  function OpenAI(apiKey, model) {
    if (model === void 0) {
      model = 'gpt-3.5-turbo';
    }
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
  OpenAI.prototype.make = function (_a) {
    var text = _a.text;
    return NetworkingJSON('https://api.openai.com/v1/chat/completions', {
      body: JSON.stringify({
        model: this.model,
        messages: [{
          role: 'user',
          content: text
        }],
        temperature: 0,
        max_tokens: 2048
      }),
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: "Bearer ".concat(this.apiKey)
      }
    });
  };
  return OpenAI;
}();
var Essent = /** @class */function () {
  function Essent() {}
  Essent.prototype.task = function (taskName, model, value) {
    return NetworkingJSON("http://soul-essent:8080/task/".concat(taskName, "?model=").concat(model), {
      body: JSON.stringify({
        value: value
      }),
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      }
    });
  };
  Essent.prototype.snippet = function (snippetName, body) {
    return NetworkingRAW("http://soul-essent:8080/snippet/".concat(snippetName), {
      body: JSON.stringify(__assign({}, body)),
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      }
    });
  };
  Essent.prototype.intent = function (text) {
    return NetworkingJSON('http://soul-essent:8080/nlp/intent', {
      body: JSON.stringify({
        value: text
      }),
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      }
    });
  };
  Essent.prototype.emotion = function (text) {
    return NetworkingJSON('http://soul-essent:8080/nlp/emotion', {
      body: JSON.stringify({
        value: text
      }),
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      }
    });
  };
  return Essent;
}();
"use strict";
