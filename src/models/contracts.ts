import {
  ContractRaw,
  ContractType,
} from "../schemas/ContractRaw";
import _ from "lodash";
import crypto from "crypto";
import { Connection, Model } from "mongoose";

export class Contracts {
  private schema: Model<ContractType>;

  constructor(conn: Connection) {
    // Initialize the MongoDB model for contracts
    this.schema = ContractRaw(conn);
  }

  // Generate a secure random string
  generateSecureString(): string {
    return require("crypto").randomBytes(48).toString("hex");
  }

  // Retrieve all contracts
  async getAll() {
    return await this.schema.find({}).lean().exec();
  }

  async updateIncomingTrafficUsage(botId: string, incBytes: number) {
    return await this.schema.updateOne({
      botId
    }, {
      $inc: {
        netIncomingTrafficBytes: incBytes
      }
    }).lean().exec();
  }

  async updateOutcomingTrafficUsage(botId: string, incBytes: number) {
    return await this.schema.updateOne({
      botId
    }, {
      $inc: {
        netOutcomingTrafficBytes: incBytes
      }
    }).lean().exec();
  }

  // Retrieve contracts by owner
  async getAllByOwner(owner: string) {
    return await this.schema.find({ owner }).lean().exec();
  }

  // Retrieve contract source by botId
  async getSource(botId: string) {
    return await this.schema.findOne({ botId }).lean().exec();
  }

  // Create a new contract
  async create(botId: string, owner: string) {
    if (await this.schema.countDocuments({
      botId: botId,
      owner: owner,
    }) > 0) {
      return null;
    }

    return _.first(
        await this.schema.insertMany([
          {
            id: this.generateSecureString(),
            httpOverKey: this.generateSecureString(),
            botId: botId,
            owner: owner,
            mainBranch: "main",
            branches: [],
          },
        ]),
    );
  }

  // Count the number of contracts for a given botId
  async count(botId: string) {
    return this.schema.countDocuments({
      botId: botId,
    });
  }

  // Decrypt input for a contract using AES256
  async decryptInputForContract(botId: string, content: string) {
    const algorithm = "aes256";
    const key = _.get(
        await this.schema.findOne({ botId }).lean().exec(),
        "httpOverKey",
        null,
    );

    if (!key) {
      return null;
    }

    const code = content;
    const decipher = crypto.createDecipher(algorithm, key);

    return decipher.update(code, "hex", "utf8") + decipher.final("utf8");
  }

  // Update or insert contract source for a given branch and botId
  async pushContractSource(
      branch: string = "main",
      source: string = "",
      botId: string,
  ) {
    var result = await this.schema
        .updateOne(
            {
              "branches.name": branch,
              botId,
            },
            {
              $set: {
                "branches.$.source": source,
              },
              $inc: {
                version: 1,
              },
            },
        )
        .lean()
        .exec();

    if (result.matchedCount == 1 && result.matchedCount == 1) {
      return true;
    }

    if (result.matchedCount == 0) {
      return (
          (
              await this.schema
                  .updateOne(
                      {
                        botId,
                      },
                      {
                        $push: {
                          branches: [{ source, name: branch, version: 1 }],
                        },
                      },
                  )
                  .lean()
                  .exec()
          ).modifiedCount == 1
      );
    }

    return false;
  }
}
