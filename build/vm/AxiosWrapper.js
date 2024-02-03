"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.axiosDeterminateRouter = exports.axiosClient = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
const util_1 = __importDefault(require("util"));
const logger_1 = __importDefault(require("../src/logger"));
const cli_color_1 = require("../src/classes/cli-color");
const mongo_1 = require("../src/mongo");
const vm_driver_1 = require("../src/vm-driver");
const assert_1 = require("../src/classes/assert");
dotenv_1.default.config();
(0, assert_1.assert)(() => process.env.I2_CLUSTER_FLOW);
const appConfig = require("../app.json");
exports.axiosClient = axios_1.default.create({});
exports.axiosClient.interceptors.response.use(function (response) {
    const params = util_1.default.inspect(response.config.params, { showHidden: false, depth: null, colors: true });
    const body = util_1.default.inspect(response.data, { showHidden: false, depth: null, colors: true });
    if (typeof response.config['vmid'] != "string") {
        logger_1.default.error(`$\{CliColor.BgMagenta}[axios]$\{CliColor.Reset} An attempt to send a request without authorization and association with a specific container is prevented`);
        return null;
    }
    const bytes = (new TextEncoder().encode(response.data)).length;
    if ((0, vm_driver_1.selectVmOrNull)(response.config['vmid'])?.botId) {
        (0, mongo_1.requireMongoDB)()
            ?.getContracts()
            ?.updateIncomingTrafficUsage((0, vm_driver_1.selectVmOrNull)(response.config['vmid']).botId, bytes)
            ?.then()
            ?.catch();
    }
    else {
        logger_1.default.warn(`Unaccounted traffic of ${bytes} bytes goes straight down the drain`);
    }
    logger_1.default.info(`${cli_color_1.CliColor.BgMagenta}[axios]${cli_color_1.CliColor.Reset} -> (${response.config.method.toLocaleUpperCase()}) ${response.config.url} ${params} ${body}`, {
        vm: null
    });
    return response;
}, function (error) {
    return Promise.reject(error);
});
exports.axiosClient.interceptors.request.use(function (config) {
    const params = util_1.default.inspect(config.params, { showHidden: false, depth: null, colors: true });
    const body = util_1.default.inspect(config.data, { showHidden: false, depth: null, colors: true });
    if (typeof config['vmid'] != "string") {
        logger_1.default.error(`$\{CliColor.BgMagenta}[axios]$\{CliColor.Reset} An attempt to send a request without authorization and association with a specific container is prevented`);
        return null;
    }
    logger_1.default.info(`${cli_color_1.CliColor.BgMagenta}[axios]${cli_color_1.CliColor.Reset} -> (${config.method.toLocaleUpperCase()}) ${config.url} ${params} ${body}`, {
        vm: config['vmid']
    });
    const bytes = (new TextEncoder().encode(config.data)).length;
    if ((0, vm_driver_1.selectVmOrNull)(config['vmid'])?.botId) {
        (0, mongo_1.requireMongoDB)()
            ?.getContracts()
            ?.updateIncomingTrafficUsage((0, vm_driver_1.selectVmOrNull)(config['vmid']).botId, bytes)
            ?.then()
            ?.catch();
    }
    else {
        logger_1.default.warn(`Unaccounted traffic of ${bytes} bytes goes straight down the drain`);
    }
    for (const host of appConfig.firewall.deny) {
        if (config.url.indexOf(host) > -1) {
            return {
                ...config,
                url: "/",
                baseURL: "/"
            };
        }
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});
class AxiosWrapper {
    static methods = [this.request];
    static request(argv) {
        const { vmid, args } = argv;
        return new Promise(async (resolve, reject) => {
            exports.axiosClient.apply(null, [{ ...args, vmid }]).then(function (result) {
                resolve(JSON.stringify({
                    data: result.data,
                    config: result.config,
                    tip: "Please note this is a stripped-down build for Core-VM, so online response and request data may not be complete"
                }));
            }).catch(function (error) {
                reject(JSON.stringify({
                    message: error.message,
                    config: error.config,
                    name: error.name,
                    tip: "Please note this is a stripped-down build for Core-VM, so online response and request data may not be complete",
                    helpers: {
                        errorMessage: error?.response?.data ? error.response.data : null
                    }
                }));
            });
        });
    }
}
exports.default = AxiosWrapper;
exports.axiosDeterminateRouter = {
    resolveDialog: ({ dialogId, text }) => {
        axios_1.default
            .post(process.env.I2_CLUSTER_FLOW +
            "/service/dialogs/resolve/" +
            dialogId, {
            markup: [{ plainText: text }],
        })
            .catch(console.error);
    },
    resolveDialogWithGif: ({ dialogId, src, gifDescription = "" }) => {
        axios_1.default
            .post(process.env.I2_CLUSTER_FLOW +
            "/service/dialogs/resolve/" +
            dialogId, {
            markup: [{ gifDescription, gifHref: src }],
        })
            .catch(console.error);
    },
};
//# sourceMappingURL=AxiosWrapper.js.map