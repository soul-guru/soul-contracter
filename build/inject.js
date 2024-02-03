"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireTarget = exports.inject = exports.globalThis = exports.HTTP_BASE_PROTOCOL = void 0;
const lodash_1 = __importDefault(require("lodash"));
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("./src/logger"));
const axios_2 = require("axios");
const node_perf_hooks_1 = require("node:perf_hooks");
exports.HTTP_BASE_PROTOCOL = "http";
exports.globalThis = require("globalthis")();
async function inject(dependencies) {
    const targets = {};
    for (const dependency of lodash_1.default.chain(dependencies).values().value()) {
        const init = dependency.apply(null);
        for (const ip of init.requireHosts) {
            logger_1.default.info(`establish a connection with host '${ip}' as part of checking connections for the container depending on '${dependency.name}' (call: ${init.name})`, { when: "inject" });
            const pStart = node_perf_hooks_1.performance.now();
            try {
                let hostDomain = ip;
                if (ip.startsWith(exports.HTTP_BASE_PROTOCOL)) {
                    hostDomain = ip;
                }
                else {
                    hostDomain = exports.HTTP_BASE_PROTOCOL + "://" + ip;
                }
                await axios_1.default.get(hostDomain);
                logger_1.default.info(`service '${dependency.name}' (call: ${init.name}) hosts are fully operational and working correctly. Call it through requireTarget('${init.name}')`, { when: "inject" });
            }
            catch (e) {
                if (e instanceof axios_2.AxiosError) {
                    logger_1.default.error(`attention! The dependency '${dependency.name}' is not satisfied because the host ${ip} does not respond to the ping command`);
                    if (process.env['STRICT'] != 'false') {
                        process.exit(1);
                    }
                    continue;
                }
            }
            logger_1.default.info(`operation 'inject_${dependency.name}' took ${node_perf_hooks_1.performance.now() - pStart} ms`);
        }
        init.bootstrap();
        const instance = await init.instance();
        init?.postCreate?.(instance);
        targets[init.name] = instance;
    }
    exports.globalThis.targets = targets;
    return new Proxy(targets, {
        get(target, p, receiver) {
            return targets[p];
        },
        set(target, p, newValue, receiver) {
            throw "Cannot write";
        },
    });
}
exports.inject = inject;
function requireTarget(name) {
    return exports.globalThis.targets[name] || null;
}
exports.requireTarget = requireTarget;
//# sourceMappingURL=inject.js.map