"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("./logger"));
const instance = axios_1.default.create();
instance.interceptors.request.use((request) => {
    const { baseURL, url, params, method, data, headers } = request;
    logger_1.default.info(`call (${request.method})${request.url}?${request.params || "#"} `);
    return request;
});
exports.default = instance;
//# sourceMappingURL=axios.js.map