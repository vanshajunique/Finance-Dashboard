const express = require("express");
// Root route (API check)
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Finance Dashboard API is running ",
  });
});

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const accountRoutes = require("./routes/accountRoutes");
const goalRoutes = require("./routes/goalRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

dotenv.config();

const app = express();
const uploadsDir = path.join(__dirname, "uploads");
const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      const error = new Error("CORS policy does not allow access from this origin");
      error.statusCode = 403;
      return callback(error);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;
const dbRetryDelayMs = Number(process.env.DB_RETRY_DELAY_MS || 5000);
let server;

const ensureDatabaseConnection = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error("MongoDB startup connection failed:", error.message);

    if (!isProduction) {
      throw error;
    }

    console.log(`Retrying MongoDB connection in ${dbRetryDelayMs}ms`);
    setTimeout(() => {
      ensureDatabaseConnection().catch((retryError) => {
        console.error("MongoDB retry failed:", retryError.message);
      });
    }, dbRetryDelayMs);
  }
};

const startServer = async () => {
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  await ensureDatabaseConnection();
};

const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully.`);

  if (server) {
    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
    return;
  }

  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);

  if (server) {
    server.close(() => process.exit(1));
    return;
  }

  process.exit(1);
});

startServer().catch((error) => {
  console.error("Server startup failed:", error);
  process.exit(1);
});
