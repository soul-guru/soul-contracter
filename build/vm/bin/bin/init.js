var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
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
    if (args === void 0) { args = null; }
    if (context && context[functionName] != null) {
        var results = context[functionName](args);
        // @ts-ignore
        log("s(".concat(functionName, "): success"));
        return results;
    }
    else {
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
var OpenAI = /** @class */ (function () {
    /**
     * Creates an instance of the OpenAI class.
     *
     * @constructor
     * @param {string} apiKey - The API key for accessing the OpenAI API.
     * @param {string} [model='gpt-3.5-turbo'] - The model version to use (default: 'gpt-3.5-turbo').
     */
    function OpenAI(apiKey, model) {
        if (model === void 0) { model = 'gpt-3.5-turbo'; }
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
                messages: [{ role: 'user', content: text }],
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
}());
var Essent = /** @class */ (function () {
    function Essent() {
    }
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
}());
