import { ContractRaw } from "../schemas/ContractRaw";
import _ from "lodash";
import crypto from "crypto";

export namespace Contracts {
  function generateSecureString(): string {
    return require("crypto").randomBytes(48).toString("hex");
  }

  export async function getAll() {
    return await ContractRaw.find({}).lean().exec();
  }

  export async function getAllByOwner(owner: string) {
    return await ContractRaw.find({ owner }).lean().exec();
  }

  export async function getSource(botId: string) {
    return await ContractRaw.findOne({ botId }).lean().exec();
  }

  export async function create(botId: string, owner: string) {
    return _.first(
      await ContractRaw.insertMany([
        {
          id: generateSecureString(),
          httpOverKey: generateSecureString(),
          botId: botId,
          owner: owner,
          mainBranch: "main",
          branches: [],
        },
      ]),
    );
  }

  export async function count(botId: string) {
    return await ContractRaw.countDocuments({
      botId: botId,
    });
  }

  export async function decryptInputForContract(
    botId: string,
    content: string,
  ) {
    const algorithm = "aes256";
    const key = _.get(
      await ContractRaw.findOne({ botId }).lean().exec(),
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

  export async function pushContractSource(
    branch: string = "main",
    source: string = "",
    botId: string,
  ) {
    var result = await ContractRaw.updateOne(
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
          await ContractRaw.updateOne(
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
