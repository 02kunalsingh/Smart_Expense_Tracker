// backend/server.js
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// Database connection
const connectDB = require("./config/database");

// Routes
const expensesRouter = require("./routes/expenses");
const authRouter = require("./routes/auth");

// Initialize app
const app = express();
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "*"
}));
app.use(express.json());

// Serve static frontend files
const frontendDir = path.join(__dirname, "../frontend");
app.use(express.static(frontendDir));

// File upload middleware for CSV import
const upload = multer({ dest: path.join(__dirname, "tmp") });

// Ensure tmp directory exists
const tmpDir = path.join(__dirname, "tmp");
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

// CSV upload endpoint (delegate to expenses controller)
// const { importCSV } = require("./controllers/expensesController");
// app.post("/api/upload-csv", upload.single("file"), importCSV);

// Routes
app.use("/api/auth", authRouter);
app.use("/api/expenses", expensesRouter);

// Health check (for Render uptime checks)
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Root: send login page
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendDir, "login.html"));
});

// Connect to DB and start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
