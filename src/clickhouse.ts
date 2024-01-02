import { ClickHouseClient, createClient } from "@clickhouse/client";
import { readFileSync } from "node:fs";
import moment from "moment/moment";
import { IDependency } from "./interfaces/IDependency";
import { requireTarget } from "../inject";

/**
 * Represents a client for interacting with ClickHouse database.
 */
export class ClickHouse {
  private clickhouseClient: ClickHouseClient;

  /**
   * Constructs a ClickHouse instance with a ClickHouse client.
   * @param {ClickHouseClient} ch - ClickHouse client instance.
   */
  constructor(ch: ClickHouseClient) {
    this.clickhouseClient = ch;
  }

  /**
   * Initializes ClickHouse tables by executing SQL scripts.
   */
  async bootstrap() {
    await this.clickhouseClient.command({
      query: readFileSync(
          process.cwd() + "/src/sql/CreateLogsTable.sql",
      ).toString("utf-8"),
    });

    await this.clickhouseClient.command({
      query: readFileSync(
          process.cwd() + "/src/sql/CreateOutTable.sql",
      ).toString("utf-8"),
    });
  }

  /**
   * Retrieves contract errors from ClickHouse for a given contract ID.
   * @param {string} contractId - Contract ID to query.
   * @returns {Promise<any>} - Result of the ClickHouse query.
   */
  async selectContractErrors(contractId: string) {
    return await this.clickhouseClient.query({
      query:
          "SELECT * FROM vm_contracts_logs WHERE (contract_id == {contractId: String}) ORDER BY e_time DESC LIMIT 32;",
      query_params: { contractId },
      format: "JSONEachRow",
    });
  }

  /**
   * Inserts a contract error into ClickHouse.
   * @param {Error} error - Error object to be inserted.
   * @param {string} botId - Bot ID associated with the error.
   * @param {string} contractId - Contract ID associated with the error.
   * @param {"UP" | "EVENT"} when_do - Type of operation causing the error.
   */
  async insertContractError(
      error: Error,
      botId: string,
      contractId: string,
      when_do: "UP" | "EVENT",
  ) {
    await this.clickhouseClient.insert({
      table: "vm_contracts_logs",
      values: [
        {
          e_name: error.name,
          e_message: error.message,
          when_do,
          e_time: moment.utc(new Date()).format("YYYY-MM-DD HH:mm:ss"),
          bot: botId,
          contract_id: contractId,
        },
      ],
      format: "JSONEachRow",
    });
  }

  /**
   * Inserts contract standard output into ClickHouse.
   * @param {string} stdout - Standard output content to be inserted.
   * @param {string} botId - Bot ID associated with the standard output.
   * @param {string} contractId - Contract ID associated with the standard output.
   */
  async insertContractStdout(
      stdout: string,
      botId: string,
      contractId: string,
  ) {
    await this.clickhouseClient.insert({
      table: "vm_contracts_stdout",
      values: [
        {
          stdout: stdout,
          time: moment.utc(new Date()).format("YYYY-MM-DD HH:mm:ss"),
          bot: botId,
          contract_id: contractId,
        },
      ],
      format: "JSONEachRow",
    });
  }

  /**
   * Retrieves contract standard output from ClickHouse for a given contract ID.
   * @param {string} contractId - Contract ID to query.
   * @returns {Promise<any>} - Result of the ClickHouse query.
   */
  async selectContractStdout(contractId: string) {
    return await this.clickhouseClient.query({
      query:
          "SELECT * FROM vm_contracts_stdout WHERE (contract_id == {contractId: String}) ORDER BY time DESC LIMIT 32;",
      query_params: { contractId },
      format: "JSONEachRow",
    });
  }
}

/**
 * Returns a ClickHouse dependency for dependency injection.
 * @returns {IDependency<ClickHouse>} - ClickHouse dependency.
 */
export function clickHouseDependency(): IDependency<ClickHouse> {
  return {
    name: "ClickHouse",
    requireHosts: [
      process.env.CLICKHOUSE_BASEHOST ||
      process.env.CLICKHOUSE_HOST ||
      "http://localhost:8123",
    ],
    /**
     * Creates a ClickHouse instance.
     * @returns {Promise<ClickHouse>} - ClickHouse instance.
     */
    async instance() {
      const clickhouseClient = createClient({
        host: process.env.CLICKHOUSE_HOST || "http://localhost:8123",
      });

      return new ClickHouse(clickhouseClient);
    },
    /**
     * Initializes the ClickHouse instance after creation.
     * @param {ClickHouse} instance - ClickHouse instance.
     */
    bootstrap() {},
    /**
     * Performs actions after creating the ClickHouse instance.
     * @param {ClickHouse} instance - ClickHouse instance.
     */
    postCreate(instance) {
      instance.bootstrap().then(() => {
        // Additional post-creation actions if needed.
      });
    },
  };
}

/**
 * Helper function to require a ClickHouse client instance.
 * @returns {ClickHouse | null} - ClickHouse client instance or null if not available.
 */
export const requireClickhouseClient: () => ClickHouse | null =
    function (): ClickHouse | null {
      return requireTarget<ClickHouse>("ClickHouse");
    };
