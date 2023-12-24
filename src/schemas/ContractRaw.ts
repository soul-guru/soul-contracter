import * as mongoose from "mongoose";
const { Schema } = mongoose;

const ContractRawSchema = new Schema({
  id: String,
  botId: String,
  owner: String,
  httpOverKey: String,
  mainBranch: String,
  branches: [{ name: String, source: String, version: Number }],
});

export const ContractRaw = mongoose.model("ContractRaw", ContractRawSchema);
