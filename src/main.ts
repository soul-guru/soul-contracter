import dotenv from 'dotenv';
import logger from "./logger";
import {program} from "commander";
import * as fs from "fs";
import CryptoFlow from "./CryptoFlow";
import {serve} from "./shell/serve";
import {machine} from "./shell/machine";

dotenv.config();

const PATH_CRYPTOFLOW = ".cryptoflow";
const PATH_KEY_VALIDATION = ".cryptoflow-its-true";

// Initialize CryptoFlow password if not exists
if (!fs.existsSync(PATH_CRYPTOFLOW)) {
  fs.writeFileSync(PATH_CRYPTOFLOW, CryptoFlow.generatePassword(512));
  logger.info("🔒 Password generated for CryptoFlow");
}

CryptoFlow.key = String(fs.readFileSync(PATH_CRYPTOFLOW));
logger.info("🔒 CryptoFlow password applied");

// Create key validation file if not exists
if (!fs.existsSync(PATH_KEY_VALIDATION)) {
  fs.writeFileSync(PATH_KEY_VALIDATION, CryptoFlow.toEncrypted('hello world'));
  logger.info("🔒 Key validation file created for CryptoFlow");
}

try {
  CryptoFlow.toDecrypted(String(fs.readFileSync(PATH_KEY_VALIDATION)));
  logger.info("🔒🤗 Ay, it's a blast, the password is correct!");
} catch (e) {
  logger.error(e);
  logger.error("CryptoFlow.. Key NOT TRUE");
  logger.error("🔒 We cannot continue to work with an incorrect encryption key, as this may damage the system, which will lead to legal and technical problems. I'm killing the server for the purpose of trying to save data");
  process.exit(0);
}

machine(program)
serve(program)

program.parse()
