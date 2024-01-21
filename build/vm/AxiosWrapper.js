"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.axiosClient = void 0;
const axios_1 = __importDefault(require("axios"));
const util_1 = __importDefault(require("util"));
const logger_1 = __importDefault(require("../src/logger"));
const cli_color_1 = require("../src/cli-color");
exports.axiosClient = axios_1.default.create({});
exports.axiosClient.interceptors.response.use(function (response) {
    const params = util_1.default.inspect(response.config.params, { showHidden: false, depth: null, colors: true });
    const body = util_1.default.inspect(response.data, { showHidden: false, depth: null, colors: true });
    logger_1.default.info(`${cli_color_1.CliColor.BgMagenta}[axios]${cli_color_1.CliColor.Reset} -> (${response.config.method.toLocaleUpperCase()}) ${response.config.url} ${params} ${body}`);
    return response;
}, function (error) {
    return Promise.reject(error);
});
exports.axiosClient.interceptors.request.use(function (config) {
    const params = util_1.default.inspect(config.params, { showHidden: false, depth: null, colors: true });
    const body = util_1.default.inspect(config.data, { showHidden: false, depth: null, colors: true });
    logger_1.default.info(`${cli_color_1.CliColor.BgMagenta}[axios]${cli_color_1.CliColor.Reset} -> (${config.method.toLocaleUpperCase()}) ${config.url} ${params} ${body}`);
    return config;
}, function (error) {
    return Promise.reject(error);
});
class AxiosWrapper {
    static methods = [this.get];
    static async get(...args) {
        return axios_1.default.get.apply(this, args);
    }
}
exports.default = AxiosWrapper;
//# sourceMappingURL=AxiosWrapper.js.map