import { createClient } from "@clickhouse/client";
import { readFileSync } from "node:fs";
import moment from "moment/moment";

const clickhouseClient = createClient({
  host: process.env.CLICKHOUSE_HOST || "http://localhost:8123",
});

// clickhouseClient.command({
//   query: "DROP TABLE  vm_contracts_logs",
// })

export namespace ClickHouse {
  export async function bootstrap() {
    await clickhouseClient.command({
      query: readFileSync(
        process.cwd() + "/src/sql/CreateLogsTable.sql",
      ).toString("utf-8"),
    });

    await clickhouseClient.command({
      query: readFileSync(
        process.cwd() + "/src/sql/CreateOutTable.sql",
      ).toString("utf-8"),
    });
  }

  export async function selectContractErrors(contractId: string) {
    return await clickhouseClient.query({
      query:
        "SELECT * FROM vm_contracts_logs WHERE (contract_id == {contractId: String}) ORDER BY e_time DESC LIMIT 32;",
      query_params: { contractId },
      format: "JSONEachRow",
    });
  }

  export async function insertContractError(
    error: Error,
    botId: string,
    contractId: string,
    when_do: "UP" | "EVENT",
  ) {
    await clickhouseClient.insert({
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

  export async function insertContractStdout(
    stdout: string,
    botId: string,
    contractId: string,
  ) {
    await clickhouseClient.insert({
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

  export async function selectContractStdout(contractId: string) {
    return await clickhouseClient.query({
      query:
        "SELECT * FROM vm_contracts_stdout WHERE (contract_id == {contractId: String}) ORDER BY time DESC LIMIT 32;",
      query_params: { contractId },
      format: "JSONEachRow",
    });
  }
}

export default clickhouseClient;
