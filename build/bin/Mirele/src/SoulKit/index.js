"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$store = exports.$kit = exports.Kit = void 0;
const Store_1 = require("./Store");
class Kit {
    constructor(huggingFaceToken) {
        this.huggingFaceToken = huggingFaceToken;
    }
    huggingFaceToken;
    generateAnswerWithOpenChat({ messages }) {
        return new Promise((resolve, reject) => {
            $foundation
                .$modules()
                .huggingFace({
                token: this.huggingFaceToken,
                model: "openchat/openchat-3.5-0106",
            })
                .create()
                .then((moduleCall) => {
                moduleCall
                    .call({
                    inputs: messages,
                    temperature: 80.0,
                })
                    .then((out) => {
                    const result = $foundation
                        .$array
                        .asHuggingFaceGeneratedText(out, messages);
                    resolve({
                        text: result,
                    });
                })
                    .catch(reject);
            })
                .catch(reject);
        });
    }
}
exports.Kit = Kit;
const $kit = (token) => new Kit(token);
exports.$kit = $kit;
let _factory = {};
const $store = (dialogId, init = { msg: [], data: {} }) => {
    if (!_factory.hasOwnProperty(dialogId)) {
        _factory[dialogId] = new Store_1.Store(dialogId, init);
    }
    return _factory[dialogId];
};
exports.$store = $store;
//# sourceMappingURL=index.js.map