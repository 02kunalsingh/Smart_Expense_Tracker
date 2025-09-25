const express = require("express");
const fs = require("fs");
const path = require("path");
const csvParser = require("csv-parser");
const { Parser } = require("json2csv");
const multer = require("multer");
const aiUtils = require("../utils/ai");
const Expense = require("../models/Expense");
const { authenticateToken, optionalAuth } = require("../middleware/auth");

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: path.join(__dirname, "../tmp") });

// Helper functions for database operations
async function loadExpenses(userId) {
  try {
    const expenses = await Expense.find({ userId }).sort({ date: -1 });
    return expenses;
  } catch (error) {
    console.error("Error loading expenses:", error);
    return [];
  }
}

async function saveExpense(expenseData, userId) {
  try {
    const expense = new Expense({
      ...expenseData,
      userId
    });
    return await expense.save();
  } catch (error) {
    console.error("Error saving expense:", error);
    throw error;
  }
}

async function updateExpense(expenseId, updateData, userId) {
  try {
    return await Expense.findOneAndUpdate(
      { _id: expenseId, userId },
      updateData,
      { new: true }
    );
  } catch (error) {
    console.error("Error updating expense:", error);
    throw error;
  }
}

async function deleteExpense(expenseId, userId) {
  try {
    return await Expense.findOneAndDelete({ _id: expenseId, userId });
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw error;
  }
}

// GET all expenses with optional filtering (requires authentication)
router.get("/", authenticateToken, async (req, res) => {
  try {
    let expenses = await loadExpenses(req.user._id);
    
    // Apply filters if provided
    const { category, startDate, endDate } = req.query;
    
    if (category) {
      expenses = expenses.filter(exp => exp.category === category);
    }
    
    if (startDate) {
      expenses = expenses.filter(exp => new Date(exp.date) >= new Date(startDate));
    }
    
    if (endDate) {
      expenses = expenses.filter(exp => new Date(exp.date) <= new Date(endDate));
    }
    
    res.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

// POST new expense (requires authentication)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { amount, description, category, date } = req.body;
    
    // If description is provided, try to extract information using AI
    let processedData = { amount, description, category, date };
    if (description && !amount) {
      const extracted = aiUtils.extractFromText(description);
      processedData = { ...processedData, ...extracted };
    }
    
    // If no category provided, use AI to categorize
    if (description && !category) {
      processedData.category = await aiUtils.categorizeExpense(description);
    }
    
    // Set default date if not provided
    if (!processedData.date) {
      processedData.date = new Date().toISOString();
    }
    
    const expenseData = {
      amount: parseFloat(processedData.amount) || 0,
      description: processedData.description || "",
      category: processedData.category || "Other",
      date: processedData.date,
      merchant: processedData.merchant || null
    };
    
    const expense = await saveExpense(expenseData, req.user._id);
    res.status(201).json(expense);
  } catch (error) {
    console.error("Error creating expense:", error);
    res.status(500).json({ error: "Failed to create expense" });
  }
});

// PUT update expense (requires authentication)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const expenseId = req.params.id;
    const { amount, description, category, date } = req.body;
    
    const updateData = {};
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (date !== undefined) updateData.date = date;
    
    const expense = await updateExpense(expenseId, updateData, req.user._id);
    
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    
    res.json(expense);
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ error: "Failed to update expense" });
  }
});

// DELETE expense (requires authentication)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const expenseId = req.params.id;
    const expense = await deleteExpense(expenseId, req.user._id);
    
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ error: "Failed to delete expense" });
  }
});


// Export CSV
router.get("/export/csv", (req, res) => {
const items = loadExpenses();
const parser = new Parser();
const csv = parser.parse(items);
res.header("Content-Type", "text/csv");
res.attachment("expenses.csv");
res.send(csv);
});


// Export JSON
router.get("/export/json", (req, res) => {
const items = loadExpenses();
res.json(items);
});


// Import CSV endpoint (multipart/form-data file field `file`)
router.post("/import/csv", upload.single("file"), (req, res) => {
if (!req.file) return res.status(400).json({ error: "No file" });
const results = [];
fs.createReadStream(req.file.path)
.pipe(csvParser())
.on("data", (data) => results.push(data))
.on("end", () => {
// Map CSV rows to expense objects (expecting columns: amount,description,category,date)
const current = loadExpenses();
const normalized = results.map(r => ({
id: Date.now() + Math.floor(Math.random() * 10000),
amount: parseFloat(r.amount) || 0,
description: r.description || "",
category: r.category || "Other",
date: r.date ? new Date(r.date).toISOString() : new Date().toISOString()
}));
const merged = current.concat(normalized);
saveExpenses(merged);
// cleanup uploaded file
try { fs.unlinkSync(req.file.path); } catch(e){}
res.json({ imported: normalized.length });
});
});


// Summary by category (for charts) - requires authentication
router.get("/summary", authenticateToken, async (req, res) => {
  try {
    const expenses = await loadExpenses(req.user._id);
    const summary = {};
    expenses.forEach(exp => {
      if (!summary[exp.category]) summary[exp.category] = 0;
      summary[exp.category] += (parseFloat(exp.amount) || 0);
    });
    res.json(summary);
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

// AI-powered smart suggestions (requires authentication)
router.get("/ai/suggestions", authenticateToken, async (req, res) => {
  try {
    const expenses = await loadExpenses(req.user._id);
    const list = Array.isArray(expenses) ? expenses : [];
    const suggestions = aiUtils.generateSmartSuggestions(list);
    res.json({ suggestions });
  } catch (error) {
    console.error("Error generating suggestions:", error);
    res.status(500).json({ error: "Failed to generate suggestions" });
  }
});

// AI-powered spending trend analysis (requires authentication)
router.get("/ai/trends", authenticateToken, async (req, res) => {
  try {
    const expenses = await loadExpenses(req.user._id);
    const list = Array.isArray(expenses) ? expenses : [];
    const trends = aiUtils.analyzeSpendingTrends(list);
    res.json({ trends });
  } catch (error) {
    console.error("Error analyzing trends:", error);
    res.status(500).json({ error: "Failed to analyze trends" });
  }
});

// Enhanced AI-powered expense insights dashboard with Gemini (requires authentication)
router.get("/ai/insights", authenticateToken, async (req, res) => {
  try {
    const expenses = await loadExpenses(req.user._id);
    const list = Array.isArray(expenses) ? expenses : [];
    
    // Try Gemini for advanced insights first
    const advancedInsights = await aiUtils.generateAdvancedInsights(expenses);
    
    const suggestions = aiUtils.generateSmartSuggestions(expenses);
    const trends = aiUtils.analyzeSpendingTrends(expenses);
    
    // Calculate additional insights
      const totalExpenses = list.length;
      const totalAmount = list.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    const avgExpense = totalExpenses > 0 ? totalAmount / totalExpenses : 0;
    
    // Top categories
    const categorySummary = {};
    list.forEach(exp => {
      if (!categorySummary[exp.category]) categorySummary[exp.category] = { total: 0, count: 0 };
      categorySummary[exp.category].total += parseFloat(exp.amount) || 0;
      categorySummary[exp.category].count += 1;
    });
    
    const topCategories = Object.entries(categorySummary)
      .sort(([,a], [,b]) => b.total - a.total)
      .slice(0, 5)
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        average: data.total / data.count
      }));
    
    // Recent spending pattern
    const recentExpenses = list
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
    
    res.json({
      overview: {
        totalExpenses,
        totalAmount,
        averageExpense: avgExpense
      },
      suggestions,
      trends,
      topCategories,
      recentExpenses,
      advancedInsights: advancedInsights || null
    });
  } catch (error) {
    console.error("Error generating insights:", error);
    res.status(500).json({ error: "Failed to generate insights" });
  }
});

// Enhanced AI-powered natural language query with Gemini (requires authentication)
router.post("/ai/query", authenticateToken, async (req, res) => {
  try {
    const { query } = req.body;
    const expenses = await loadExpenses(req.user._id);
    const list = Array.isArray(expenses) ? expenses : [];
    
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }
    
    // Try Gemini first for advanced processing
    const geminiResponse = await aiUtils.processGeminiQuery(query, expenses);
    
    if (geminiResponse) {
      return res.json(geminiResponse);
    }
    
    // Fallback to basic pattern matching
    const queryLower = query.toLowerCase();
    let response = { answer: "", data: null, insights: [], recommendations: [] };
    
    // Basic query patterns
    if (queryLower.includes("total") && queryLower.includes("spend")) {
      const total = list.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
      response.answer = `Your total spending is $${total.toFixed(2)}`;
      response.data = { total };
      response.insights = [`You've made ${expenses.length} transactions`];
    } else if (queryLower.includes("category") || queryLower.includes("most")) {
      const categorySummary = {};
      list.forEach(exp => {
        if (!categorySummary[exp.category]) categorySummary[exp.category] = 0;
        categorySummary[exp.category] += parseFloat(exp.amount) || 0;
      });
      const topCategory = Object.entries(categorySummary)
        .sort(([,a], [,b]) => b - a)[0];
      response.answer = `Your highest spending category is ${topCategory[0]} with $${topCategory[1].toFixed(2)}`;
      response.data = { topCategory: { category: topCategory[0], amount: topCategory[1] } };
      response.recommendations = [`Consider reviewing expenses in ${topCategory[0]} for potential savings`];
    } else if (queryLower.includes("average") || queryLower.includes("avg")) {
      const avg = list.length ? list.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0) / list.length : 0;
      response.answer = `Your average expense is $${avg.toFixed(2)}`;
      response.data = { average: avg };
    } else if (queryLower.includes("recent")) {
      const recent = list
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      response.answer = `Here are your 5 most recent expenses:`;
      response.data = { recent };
    } else {
      response.answer = "I can help you analyze your spending patterns. Try asking about your total spending, top categories, or recent expenses.";
      response.insights = ["Add more specific questions to get detailed insights about your spending patterns"];
    }
    
    res.json(response);
  } catch (error) {
    console.error("Error processing query:", error);
    res.status(500).json({ error: "Failed to process query" });
  }
});

// AI-powered expense prediction endpoint (requires authentication)
router.get("/ai/predictions", authenticateToken, async (req, res) => {
  try {
    const expenses = await loadExpenses(req.user._id);
    const list = Array.isArray(expenses) ? expenses : [];
    const predictions = await aiUtils.predictFutureExpenses(list);
    res.json({ predictions });
  } catch (error) {
    console.error("Error generating predictions:", error);
    res.status(500).json({ error: "Failed to generate predictions" });
  }
});

// AI-powered anomaly detection endpoint (requires authentication)
router.get("/ai/anomalies", authenticateToken, async (req, res) => {
  try {
    const expenses = await loadExpenses(req.user._id);
    const list = Array.isArray(expenses) ? expenses : [];
    const anomalies = aiUtils.detectAnomalies(list);
    res.json({ anomalies });
  } catch (error) {
    console.error("Error detecting anomalies:", error);
    res.status(500).json({ error: "Failed to detect anomalies" });
  }
});

// AI-powered optimization suggestions endpoint (requires authentication)
router.get("/ai/optimization", authenticateToken, async (req, res) => {
  try {
    const expenses = await loadExpenses(req.user._id);
    const list = Array.isArray(expenses) ? expenses : [];
    const optimization = await aiUtils.generateOptimizationSuggestions(list);
    res.json(optimization);
  } catch (error) {
    console.error("Error generating optimization suggestions:", error);
    res.status(500).json({ error: "Failed to generate optimization suggestions" });
  }
});

// AI-powered goal setting endpoint
router.get("/ai/goals", async (req, res) => {
  try {
    const expenses = loadExpenses();
    const goals = await aiUtils.generateExpenseGoals(expenses);
    res.json({ goals });
  } catch (error) {
    console.error("Error generating goals:", error);
    res.status(500).json({ error: "Failed to generate goals" });
  }
});

// AI-powered expense comparison endpoint
router.get("/ai/benchmark", async (req, res) => {
  try {
    const expenses = loadExpenses();
    const benchmark = req.query.benchmark || "national_average";
    const comparison = await aiUtils.compareExpenses(expenses, benchmark);
    res.json({ comparison });
  } catch (error) {
    console.error("Error generating benchmark comparison:", error);
    res.status(500).json({ error: "Failed to generate benchmark comparison" });
  }
});

// AI-powered receipt analysis endpoint
router.post("/ai/receipt", async (req, res) => {
  try {
    const { receiptText } = req.body;
    
    if (!receiptText) {
      return res.status(400).json({ error: "Receipt text is required" });
    }
    
    const analysis = await aiUtils.analyzeReceipt(receiptText);
    
    if (analysis) {
      // Auto-create expense from receipt analysis
      const expense = {
        id: Date.now() + Math.floor(Math.random() * 10000),
        amount: parseFloat(analysis.amount) || 0,
        description: analysis.items ? analysis.items.join(", ") : "Receipt purchase",
        category: analysis.category || "Other",
        date: analysis.date || new Date().toISOString(),
        merchant: analysis.merchant || null
      };
      
      const expenses = loadExpenses();
      expenses.push(expense);
      saveExpenses(expenses);
      
      res.json({ 
        analysis, 
        createdExpense: expense,
        message: "Receipt analyzed and expense created successfully"
      });
    } else {
      res.json({ 
        analysis: null,
        message: "Could not analyze receipt. Please try again or add expense manually."
      });
    }
  } catch (error) {
    console.error("Error analyzing receipt:", error);
    res.status(500).json({ error: "Failed to analyze receipt" });
  }
});

// AI-powered comprehensive dashboard endpoint
router.get("/ai/dashboard", async (req, res) => {
  try {
    const expenses = loadExpenses();
    
    // Get all AI insights in parallel
    const [
      suggestions,
      trends,
      predictions,
      anomalies,
      optimization,
      goals,
      advancedInsights
    ] = await Promise.all([
      Promise.resolve(aiUtils.generateSmartSuggestions(expenses)),
      Promise.resolve(aiUtils.analyzeSpendingTrends(expenses)),
      aiUtils.predictFutureExpenses(expenses),
      Promise.resolve(aiUtils.detectAnomalies(expenses)),
      aiUtils.generateOptimizationSuggestions(expenses),
      aiUtils.generateExpenseGoals(expenses),
      aiUtils.generateAdvancedInsights(expenses)
    ]);
    
    // Calculate summary statistics
    const totalExpenses = expenses.length;
    const totalAmount = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    const avgExpense = totalExpenses > 0 ? totalAmount / totalExpenses : 0;
    
    res.json({
      summary: {
        totalExpenses,
        totalAmount,
        averageExpense,
        dateRange: {
          first: expenses.length > 0 ? expenses[expenses.length - 1].date : null,
          last: expenses.length > 0 ? expenses[0].date : null
        }
      },
      insights: {
        suggestions,
        trends,
        predictions,
        anomalies,
        optimization,
        goals,
        advancedInsights
      }
    });
  } catch (error) {
    console.error("Error generating dashboard:", error);
    res.status(500).json({ error: "Failed to generate dashboard" });
  }
});

module.exports = router;