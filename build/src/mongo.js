"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireMongoDB = exports.mongodbDependency = exports.MongoConnector = exports.createMongoConnection = void 0;
const contracts_1 = require("./models/contracts");
const mongoose_1 = __importDefault(require("mongoose"));
const inject_1 = require("../inject");
const BASE_HOST = process.env.MONGO_BASEHOST || process.env.MONGO_HOST || "127.0.0.1:3132";
async function createMongoConnection() {
    await mongoose_1.default.connect(process.env.MONGO_HOST || `mongodb://${BASE_HOST}/i2-mcr`, {
        connectTimeoutMS: 3000,
    });
    return mongoose_1.default.connection;
}
exports.createMongoConnection = createMongoConnection;
class MongoConnector {
    connection;
    constructor(conn) {
        this.connection = conn;
    }
    getContracts() {
        return new contracts_1.Contracts(this.connection);
    }
}
exports.MongoConnector = MongoConnector;
function mongodbDependency() {
    return {
        name: "MongoDB",
        requireHosts: [
            BASE_HOST,
        ],
        async instance() {
            const conn = await createMongoConnection();
            return new MongoConnector(conn);
        },
        bootstrap() { },
    };
}
exports.mongodbDependency = mongodbDependency;
const requireMongoDB = function () {
    return (0, inject_1.requireTarget)("MongoDB");
};
exports.requireMongoDB = requireMongoDB;
//# sourceMappingURL=mongo.js.map