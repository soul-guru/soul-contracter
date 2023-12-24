const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_HOST || "mongodb://127.0.0.1:3131/i2-mcr");

export const connection = mongoose;
