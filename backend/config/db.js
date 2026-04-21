const mongoose = require("mongoose");

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  const connection = await mongoose.connect(process.env.MONGO_URI, {
    autoIndex: process.env.NODE_ENV !== "production",
    maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 10),
    minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE || 1),
    serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 5000),
    socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS || 45000)
  });

  mongoose.connection.on("error", (error) => {
    console.error("MongoDB runtime error:", error.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });

  console.log(`MongoDB connected: ${connection.connection.host}`);
};

module.exports = connectDB;
