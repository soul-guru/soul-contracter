"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contracts = void 0;
const ContractRaw_1 = require("../schemas/ContractRaw");
const lodash_1 = __importDefault(require("lodash"));
const crypto_1 = __importDefault(require("crypto"));
class Contracts {
    schema;
    constructor(conn) {
        this.schema = (0, ContractRaw_1.ContractRaw)(conn);
    }
    generateSecureString() {
        return require("crypto").randomBytes(48).toString("hex");
    }
    async getAll() {
        return await this.schema.find({}).lean().exec();
    }
    async getAllByOwner(owner) {
        return await this.schema.find({ owner }).lean().exec();
    }
    async getSource(botId) {
        return await this.schema.findOne({ botId }).lean().exec();
    }
    async create(botId, owner) {
        if (await this.schema.countDocuments({
            botId: botId,
            owner: owner,
        }) > 0) {
            return null;
        }
        return lodash_1.default.first(await this.schema.insertMany([
            {
                id: this.generateSecureString(),
                httpOverKey: this.generateSecureString(),
                botId: botId,
                owner: owner,
                mainBranch: "main",
                branches: [],
            },
        ]));
    }
    async count(botId) {
        return this.schema.countDocuments({
            botId: botId,
        });
    }
    async decryptInputForContract(botId, content) {
        const algorithm = "aes256";
        const key = lodash_1.default.get(await this.schema.findOne({ botId }).lean().exec(), "httpOverKey", null);
        if (!key) {
            return null;
        }
        const code = content;
        const decipher = crypto_1.default.createDecipher(algorithm, key);
        return decipher.update(code, "hex", "utf8") + decipher.final("utf8");
    }
    async pushContractSource(branch = "main", source = "", botId) {
        var result = await this.schema
            .updateOne({
            "branches.name": branch,
            botId,
        }, {
            $set: {
                "branches.$.source": source,
            },
            $inc: {
                version: 1,
            },
        })
            .lean()
            .exec();
        if (result.matchedCount == 1 && result.matchedCount == 1) {
            return true;
        }
        if (result.matchedCount == 0) {
            return ((await this.schema
                .updateOne({
                botId,
            }, {
                $push: {
                    branches: [{ source, name: branch, version: 1 }],
                },
            })
                .lean()
                .exec()).modifiedCount == 1);
        }
        return false;
    }
}
exports.Contracts = Contracts;
//# sourceMappingURL=contracts.js.map