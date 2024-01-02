import * as mongoose from "mongoose";
import { Connection } from "mongoose";
const { Schema } = mongoose;

// Define the ContractType interface
export interface ContractType {
  id: string;
  botId: string;
  owner: string;
  mainBranch: string;
  httpOverKey: string;
  branches: [{ name: String; source: String; version: Number }];
}

// Define the schema for the ContractRaw model
export const schema = {
  id: String,
  botId: String,
  owner: String,
  httpOverKey: String,
  mainBranch: String,
  branches: [{ name: String, source: String, version: Number }],
};

// Create a Mongoose schema instance using the ContractType interface
export const ContractRawSchema = new Schema<ContractType>(schema);

// Create the Mongoose model for the ContractRaw collection
export const ContractRaw = (connection: Connection) =>
    mongoose.model("ContractRaw", ContractRawSchema, "ContractRaw", {
      connection,
    });
