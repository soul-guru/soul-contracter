"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./logger"));
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const CryptoFlow_1 = __importDefault(require("./CryptoFlow"));
const serve_1 = require("./shell/serve");
const machine_1 = require("./shell/machine");
dotenv_1.default.config();
const PATH_CRYPTOFLOW = ".cryptoflow";
const PATH_KEY_VALIDATION = ".cryptoflow-its-true";
if (!fs.existsSync(PATH_CRYPTOFLOW)) {
    fs.writeFileSync(PATH_CRYPTOFLOW, CryptoFlow_1.default.generatePassword(512));
    logger_1.default.info("🔒 Password generated for CryptoFlow");
}
CryptoFlow_1.default.key = String(fs.readFileSync(PATH_CRYPTOFLOW));
logger_1.default.info("🔒 CryptoFlow password applied");
if (!fs.existsSync(PATH_KEY_VALIDATION)) {
    fs.writeFileSync(PATH_KEY_VALIDATION, CryptoFlow_1.default.toEncrypted('hello world'));
    logger_1.default.info("🔒 Key validation file created for CryptoFlow");
}
try {
    CryptoFlow_1.default.toDecrypted(String(fs.readFileSync(PATH_KEY_VALIDATION)));
    logger_1.default.info("🔒🤗 Ay, it's a blast, the password is correct!");
}
catch (e) {
    logger_1.default.error(e);
    logger_1.default.error("CryptoFlow.. Key NOT TRUE");
    logger_1.default.error("🔒 We cannot continue to work with an incorrect encryption key, as this may damage the system, which will lead to legal and technical problems. I'm killing the server for the purpose of trying to save data");
    process.exit(0);
}
(0, machine_1.machine)(commander_1.program);
(0, serve_1.serve)(commander_1.program);
commander_1.program.parse();
//# sourceMappingURL=main.js.map