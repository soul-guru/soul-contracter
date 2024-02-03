"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("lodash");
require("./init");
require("./ModulesKit");
const Foundation_1 = __importDefault(require("./Foundation"));
const signal_1 = __importDefault(require("./opt/signal"));
const axios_1 = require("./opt/axios");
const Character_1 = require("./classes/Character");
void Foundation_1.default;
(0, signal_1.default)("_sys_ignore_", {}, "Great, sys.js is loaded! So cool. But what is this? Why are you listening to this signal? It doesn't have any value");
axios_1.axios.toString();
Character_1.Character.toString();
//# sourceMappingURL=bundle.js.map