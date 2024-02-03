import safeSignal from "./opt/signal";

export function stdout(out: string) {
  // @ts-ignore
  log(out)
}

/** Function that count occurrences of a substring in a string;
 * @param {String} string               The string
 * @param {String} subString            The sub string to search for
 * @param {Boolean} [allowOverlapping]  Optional. (Default:false)
 *
 * @author Vitim.us https://gist.github.com/victornpb/7736865
 * @see Unit Test https://jsfiddle.net/Victornpb/5axuh96u/
 * @see https://stackoverflow.com/a/7924240/938822
 */
export function occurrences(string: string, subString: string, allowOverlapping: boolean = false) {

  string += "";
  subString += "";
  if (subString.length <= 0) return (string.length + 1);

  var n = 0,
    pos = 0,
    step = allowOverlapping ? 1 : subString.length;

  while (true) {
    pos = string.indexOf(subString, pos);
    if (pos >= 0) {
      ++n;
      pos += step;
    } else break;
  }
  return n;
}

const STDOUT_SYS_BANNER = "░▄▀▀░▀▄▀░▄▀▀░░░█▒█░█▄▒▄█░▒░░▄▀▀░▄▀▄▒█▀▄▒██▀\n" +
  "▒▄██░▒█▒▒▄██▒░░▀▄▀░█▒▀▒█░▀▀░▀▄▄░▀▄▀░█▀▄░█▄▄";

stdout(STDOUT_SYS_BANNER)

const self = this

/**
 * @return {{require('axios').default}}
 */
//@ts-ignore
let systemNetworkAsAxios = () => SYSTEM.axios


/**
 * Represents the OpenAI class for interacting with the OpenAI API.
 *
 * @class
 */
// class OpenAI {
//   private readonly apiKey: string;
//   private readonly model: string;
//
//   /**
//    * Creates an instance of the OpenAI class.
//    *
//    * @constructor
//    * @param {string} apiKey - The API key for accessing the OpenAI API.
//    * @param {string} [model='gpt-3.5-turbo'] - The model version to use (default: 'gpt-3.5-turbo').
//    */
//   constructor(apiKey: string, model: string = 'gpt-3.5-turbo') {
//     this.apiKey = apiKey;
//     this.model = model;
//   }
//
//   /**
//    * Makes a request to the OpenAI API for chat completions.
//    *
//    * @method
//    * @name make
//    * @param {Object} options - Options for the chat completion request.
//    * @param {string} options.text - The text content for the chat completion.
//    * @returns {Promise<any>} A promise that resolves with the result of the chat completion.
//    */
//   make({ text }: { text: string }): Promise<any> {
//     return axios('https://api.openai.com/v1/chat/completions', {
//       body: JSON.stringify({
//         model: this.model,
//         messages: [{ role: 'user', content: text }],
//         temperature: 0,
//         max_tokens: 2048,
//       }),
//       method: 'POST',
//       headers: {
//         'content-type': 'application/json',
//         Authorization: `Bearer ${this.apiKey}`,
//       },
//     });
//   }
// }

