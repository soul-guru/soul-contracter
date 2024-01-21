"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireClickhouseClient = exports.clickHouseDependency = exports.ClickHouse = void 0;
const client_1 = require("@clickhouse/client");
const node_fs_1 = require("node:fs");
const moment_1 = __importDefault(require("moment/moment"));
const inject_1 = require("../inject");
class ClickHouse {
    clickhouseClient;
    constructor(ch) {
        this.clickhouseClient = ch;
    }
    async bootstrap() {
        await this.clickhouseClient.command({
            query: (0, node_fs_1.readFileSync)(process.cwd() + "/src/sql/CreateLogsTable.sql").toString("utf-8"),
        });
        await this.clickhouseClient.command({
            query: (0, node_fs_1.readFileSync)(process.cwd() + "/src/sql/CreateOutTable.sql").toString("utf-8"),
        });
    }
    async selectContractErrors(contractId) {
        return await this.clickhouseClient.query({
            query: "SELECT * FROM vm_contracts_logs WHERE (contract_id == {contractId: String}) ORDER BY e_time DESC LIMIT 32;",
            query_params: { contractId },
            format: "JSONEachRow",
        });
    }
    async insertContractError(error, botId, contractId, when_do) {
        await this.clickhouseClient.insert({
            table: "vm_contracts_logs",
            values: [
                {
                    e_name: error.name,
                    e_message: error.message,
                    when_do,
                    e_time: moment_1.default.utc(new Date()).format("YYYY-MM-DD HH:mm:ss"),
                    bot: botId,
                    contract_id: contractId,
                },
            ],
            format: "JSONEachRow",
        });
    }
    async insertContractStdout(stdout, botId, contractId) {
        await this.clickhouseClient.insert({
            table: "vm_contracts_stdout",
            values: [
                {
                    stdout: stdout,
                    time: moment_1.default.utc(new Date()).format("YYYY-MM-DD HH:mm:ss"),
                    bot: botId,
                    contract_id: contractId,
                },
            ],
            format: "JSONEachRow",
        });
    }
    async selectContractStdout(contractId) {
        return await this.clickhouseClient.query({
            query: "SELECT * FROM vm_contracts_stdout WHERE (contract_id == {contractId: String}) ORDER BY time DESC LIMIT 32;",
            query_params: { contractId },
            format: "JSONEachRow",
        });
    }
}
exports.ClickHouse = ClickHouse;
function clickHouseDependency() {
    return {
        name: "ClickHouse",
        requireHosts: [
            process.env.CLICKHOUSE_BASEHOST ||
                process.env.CLICKHOUSE_HOST ||
                "http://localhost:8123",
        ],
        async instance() {
            const clickhouseClient = (0, client_1.createClient)({
                host: process.env.CLICKHOUSE_HOST || "http://localhost:8123",
            });
            return new ClickHouse(clickhouseClient);
        },
        bootstrap() { },
        postCreate(instance) {
            instance.bootstrap().then(() => {
            });
        },
    };
}
exports.clickHouseDependency = clickHouseDependency;
const requireClickhouseClient = function () {
    return (0, inject_1.requireTarget)("ClickHouse");
};
exports.requireClickhouseClient = requireClickhouseClient;
//# sourceMappingURL=clickhouse.js.map