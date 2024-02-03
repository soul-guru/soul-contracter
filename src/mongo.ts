import mongoose from "mongoose";
import { Contracts } from "./models/contracts";
import { Connection } from "mongoose";
import { IDependency } from "./interfaces/IDependency";
import { requireTarget } from "../inject";

const BASE_HOST = process.env.MONGO_BASEHOST || process.env.MONGO_HOST || "127.0.0.1:3132"

// Function to create a MongoDB connection and return the connection object
export async function createMongoConnection(): Promise<Connection> {
  await mongoose.connect(
    process.env.MONGO_HOST || `mongodb://${BASE_HOST}/i2-mcr`, // Connect to MongoDB using the provided environment variable or a default URL
    {
      connectTimeoutMS: 3000, // Set connection timeout to 3000 milliseconds
    },
  );

  return mongoose.connection; // Return the MongoDB connection object
}

// Class for managing MongoDB connections
export class MongoConnector {
  private readonly connection: Connection;

  constructor(conn: Connection) {
    this.connection = conn;
  }

  // Get a Contracts instance associated with the MongoDB connection
  getContracts() {
    return new Contracts(this.connection);
  }
}

// Function to define MongoDB dependency
export function mongodbDependency(): IDependency<MongoConnector> {
  return {
    name: "MongoDB", // Set the dependency name
    requireHosts: [
      BASE_HOST, // Specify the required host(s)
    ],
    async instance() {
      const conn = await createMongoConnection(); // Create a MongoDB connection
      return new MongoConnector(conn); // Return a new MongoConnector instance
    },
    bootstrap() {},
  };
}

// Function to require a MongoDB connector instance
export const requireMongoDB: () => MongoConnector | null =
  function (): MongoConnector | null {
    return requireTarget<MongoConnector>("MongoDB"); // Use requireTarget to obtain a MongoDB connector instance
  };
