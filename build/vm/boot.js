"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fillEnv = void 0;
const sync_fetch_1 = __importDefault(require("sync-fetch"));
const logger_1 = __importDefault(require("../src/logger"));
const util_1 = __importDefault(require("util"));
const lodash_1 = __importDefault(require("lodash"));
const AxiosWrapper_1 = require("./AxiosWrapper");
function fillEnv(vm) {
    const base = {
        log: (...arg) => {
            logger_1.default.info(arg.map(i => {
                return util_1.default.inspect(i, { showHidden: false, depth: null, colors: true });
            }).join(" "), { vm: vm.ID });
        },
        network_request_json: (url, params) => {
            return Object((0, sync_fetch_1.default)(url, params).json());
        },
        network_request_raw: (url, params) => {
            return String((0, sync_fetch_1.default)(url, params).text());
        },
    };
    const lodash = {};
    const axios_ = {};
    lodash_1.default.toPairs(lodash_1.default).map(k => {
        if (typeof k[1] == 'function') {
            lodash[k[0]] = k[1];
        }
    });
    lodash_1.default.toPairs(AxiosWrapper_1.axiosClient).map(k => {
        if (typeof k[1] == 'function') {
            axios_["axios_" + k[0]] = k[1];
        }
    });
    return {
        ...base,
        ...lodash,
        ...axios_
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