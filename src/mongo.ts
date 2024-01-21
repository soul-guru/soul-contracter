import { Contracts } from "./models/contracts";
import { Connection } from "mongoose";
import mongoose from "mongoose";
import { IDependency } from "./interfaces/IDependency";
import { requireTarget } from "../inject";

const BASE_HOST = process.env.MONGO_BASEHOST || process.env.MONGO_HOST || "127.0.0.1:3132"

export async function createMongoConnection(): Promise<Connection> {
  await mongoose.connect(
    process.env.MONGO_HOST || `mongodb://${BASE_HOST}/i2-mcr`,
    {
      connectTimeoutMS: 3000,
    },
  );

  return mongoose.connection;
}

export class MongoConnector {
  private readonly connection: Connection;

  constructor(conn: Connection) {
    this.connection = conn;
  }

  getContracts() {
    return new Contracts(this.connection);
  }
}

export function mongodbDependency(): IDependency<MongoConnector> {
  return {
    name: "MongoDB",
    requireHosts: [
      BASE_HOST,
    ],
    async instance() {
      const conn = await createMongoConnection();

      return new MongoConnector(conn);
    },
    bootstrap() {},
  };
}

export const requireMongoDB: () => MongoConnector | null =
  function (): MongoConnector | null {
    return requireTarget<MongoConnector>("MongoDB");
  };
