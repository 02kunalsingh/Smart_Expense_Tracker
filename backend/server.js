const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

// Database connection
const connectDB = require("./config/database");

// Routes
const expensesRouter = require("./routes/expenses");
const authRouter = require("./routes/auth");


const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, "../frontend")));


// file upload middleware for CSV import
const upload = multer({ dest: path.join(__dirname, "tmp") });

// Ensure tmp directory exists
const tmpDir = path.join(__dirname, "tmp");
if (!require("fs").existsSync(tmpDir)) {
  require("fs").mkdirSync(tmpDir, { recursive: true });
}

// CSV upload endpoint - delegates to expenses router
app.post("/api/upload-csv", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  
  // Redirect to expenses import endpoint
  const expensesRouter = require("./routes/expenses");
  expensesRouter(req, res);
});


// Routes
app.use("/api/auth", authRouter);
app.use("/api/expenses", expensesRouter);

// Connect to database and start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Database: MongoDB Atlas`);
      console.log(`🔐 Authentication: JWT enabled`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();