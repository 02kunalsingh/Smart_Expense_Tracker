// backend/controllers/expensesController.js
const fs = require("fs");
const csvParser = require("csv-parser");
const Expense = require("../models/Expense");

exports.importCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csvParser())
      .on("data", (row) => results.push(row))
      .on("end", async () => {
        try {
          await Expense.insertMany(results);
          res.json({ message: "CSV imported successfully", count: results.length });
        } catch (err) {
          res.status(500).json({ error: "Failed to save expenses" });
        } finally {
          fs.unlinkSync(req.file.path); // cleanup
        }
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
