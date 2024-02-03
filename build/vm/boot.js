"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fillEnv = void 0;
const logger_1 = __importDefault(require("../src/logger"));
const util_1 = __importDefault(require("util"));
const lodash_1 = __importDefault(require("lodash"));
function fillEnv(vm) {
    const base = {
        log: (arg) => {
            logger_1.default.info(util_1.default.inspect(arg, { showHidden: false, depth: null, colors: true }), { vm: vm.ID });
        }
    };
    const lodash = {};
    lodash_1.default.toPairs(lodash_1.default).map(k => {
        if (typeof k[1] == 'function') {
            lodash[k[0]] = k[1];
        }
    });
    return {
        ...base,
        ...lodash,
    };
}
exports.fillEnv = fillEnv;
function getBootableISO(vm) {
    return {
        env: fillEnv(vm)
    };
}
exports.default = getBootableISO;
//# sourceMappingURL=boot.js.map