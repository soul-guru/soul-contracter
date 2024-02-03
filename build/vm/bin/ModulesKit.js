"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModulesKit = void 0;
const Call_1 = require("./Call");
const HuggingFace_1 = require("./modules/HuggingFace");
exports.ModulesKit = {
    huggingFace: (configs) => new HuggingFace_1.HuggingFaceModule(configs),
    bm3d_horizon: {
        listen: new Call_1.Call("http://62.197.49.215:1101/opt/brain/listen", "bm3d Horizon", "", {
            "body": "Hello, I am a John!",
            "namespace": "DIALOG_ID or USER_ID"
        }),
        find: new Call_1.Call("http://62.197.49.215:1101/opt/brain/find", "bm3d Horizon", "", {
            "body": "Hello, I am a John!",
            "namespace": "DIALOG_ID or USER_ID"
        })
    }
};
//# sourceMappingURL=ModulesKit.js.map