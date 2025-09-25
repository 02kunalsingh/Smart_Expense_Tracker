const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const HF_CATEGORY_MODEL = "facebook/bart-large-mnli"; // zero-shot classifier

// Initialize Gemini AI
let genAI = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

async function categorizeExpense(description) {
  // Try Gemini first if available
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `
        Categorize this expense description into one of these categories:
        Food & Dining, Transportation, Shopping & Retail, Bills & Utilities, Entertainment, 
        Healthcare, Education, Income, Subscriptions, Travel, Home & Garden, Personal Care, Insurance, Other
        
        Expense: "${description}"
        
        Respond with only the category name, nothing else.
      `;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const category = response.text().trim();
      
      // Validate the response is one of our categories
      const validCategories = [
        "Food & Dining", "Transportation", "Shopping & Retail", "Bills & Utilities", 
        "Entertainment", "Healthcare", "Education", "Income", "Subscriptions", 
        "Travel", "Home & Garden", "Personal Care", "Insurance", "Other"
      ];
      
      if (validCategories.includes(category)) {
        return category;
      }
    } catch (error) {
      console.error("Gemini categorization error:", error);
    }
  }
  
  // Fallback to Hugging Face
  if (process.env.HF_API_KEY && process.env.HF_API_KEY !== 'your_huggingface_api_key_here') {
    try {
      const resp = await axios.post(
        `https://api-inference.huggingface.co/models/${HF_CATEGORY_MODEL}`,
        {
          inputs: description,
          parameters: { 
            candidate_labels: [
              "Food & Dining", 
              "Transportation", 
              "Shopping & Retail", 
              "Bills & Utilities", 
              "Entertainment", 
              "Healthcare", 
              "Education", 
              "Income", 
              "Subscriptions", 
              "Travel", 
              "Home & Garden", 
              "Personal Care",
              "Insurance",
              "Other"
            ]
          }
        },
        { headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` } }
      );

      // resp.data object for zero-shot is usually { labels: [...], scores: [...] }
      if (resp.data && resp.data.labels && resp.data.labels.length) {
        return resp.data.labels[0];
      }
    } catch (err) {
      console.error("HF categorize error:", err?.message || err);
    }
  }
  
  // Final fallback to keyword matching
  return categorizeExpenseFallback(description);
}

// Fallback categorization using keyword matching
function categorizeExpenseFallback(description) {
  const desc = description.toLowerCase();
  
  // Food & Dining
  if (/restaurant|food|lunch|dinner|breakfast|cafe|coffee|pizza|burger|subway|mcdonald|kfc|starbucks|eat|meal|snack|grocery|supermarket|market/.test(desc)) {
    return "Food & Dining";
  }
  
  // Transportation
  if (/gas|fuel|petrol|uber|taxi|bus|train|metro|flight|airline|car|vehicle|parking|toll|transport/.test(desc)) {
    return "Transportation";
  }
  
  // Shopping & Retail
  if (/amazon|shop|store|mall|clothes|shirt|pants|shoes|electronics|phone|laptop|book|gift|purchase|buy/.test(desc)) {
    return "Shopping & Retail";
  }
  
  // Bills & Utilities
  if (/bill|electricity|water|gas|internet|phone|rent|mortgage|utility|payment|subscription|netflix|spotify|prime/.test(desc)) {
    return "Bills & Utilities";
  }
  
  // Entertainment
  if (/movie|cinema|theater|game|entertainment|fun|party|concert|show|ticket|sport|gym|fitness/.test(desc)) {
    return "Entertainment";
  }
  
  // Healthcare
  if (/doctor|hospital|pharmacy|medicine|medical|health|dental|clinic|therapy|prescription/.test(desc)) {
    return "Healthcare";
  }
  
  // Education
  if (/school|university|college|course|book|education|tuition|student|learning|class/.test(desc)) {
    return "Education";
  }
  
  // Income
  if (/salary|income|paycheck|bonus|refund|cashback|earnings|work|job|freelance/.test(desc)) {
    return "Income";
  }
  
  // Travel
  if (/hotel|vacation|travel|trip|holiday|flight|booking|airbnb|hostel/.test(desc)) {
    return "Travel";
  }
  
  return "Other";
}

// Enhanced text extraction with better amount and merchant detection
function extractFromText(text) {
  const result = { amount: null, date: null, description: text, merchant: null };

  // Enhanced amount extraction - handles various formats
  const amountPatterns = [
    /\$?\s?([0-9]+(?:\.[0-9]{1,2})?)\s*(?:dollars?|USD)?/i,
    /([0-9]+(?:\.[0-9]{1,2})?)\s*(?:dollars?|USD|usd)/i,
    /\$([0-9]+(?:\.[0-9]{1,2})?)/i,
    /([0-9]+(?:\.[0-9]{1,2})?)\s*\$/
  ];
  
  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.amount = parseFloat(match[1]);
      break;
    }
  }

  // Enhanced date extraction
  if (/yesterday/i.test(text)) {
    result.date = new Date(Date.now() - 86400000).toISOString();
  } else if (/today/i.test(text)) {
    result.date = new Date().toISOString();
  } else if (/tomorrow/i.test(text)) {
    result.date = new Date(Date.now() + 86400000).toISOString();
  } else {
    // ISO date format
    const iso = text.match(/(\d{4}-\d{2}-\d{2})/);
    if (iso) {
      result.date = new Date(iso[1]).toISOString();
    }
  }

  // Extract merchant name
  result.merchant = extractMerchantName(text);

  return result;
}

// Extract and standardize merchant names
function extractMerchantName(description) {
  const desc = description.toLowerCase();
  
  // Common merchant patterns
  const merchants = {
    // Food chains
    'mcdonald\'s': /mcdonald|mcd|mcdonalds/i,
    'starbucks': /starbucks|sbux/i,
    'subway': /subway/i,
    'kfc': /kfc|kentucky fried chicken/i,
    'pizza hut': /pizza hut/i,
    'domino\'s': /domino/i,
    
    // Retail
    'amazon': /amazon/i,
    'walmart': /walmart|wal-mart/i,
    'target': /target/i,
    'costco': /costco/i,
    
    // Services
    'uber': /uber/i,
    'lyft': /lyft/i,
    'netflix': /netflix/i,
    'spotify': /spotify/i,
    'google': /google|google play/i,
    'apple': /apple|app store/i,
    
    // Gas stations
    'shell': /shell/i,
    'exxon': /exxon/i,
    'bp': /bp|british petroleum/i,
    'chevron': /chevron/i,
    
    // Banks
    'chase': /chase/i,
    'bank of america': /bank of america|boa/i,
    'wells fargo': /wells fargo/i
  };
  
  for (const [merchant, pattern] of Object.entries(merchants)) {
    if (pattern.test(description)) {
      return merchant;
    }
  }
  
  return null;
}

// Generate smart suggestions based on expense patterns
function generateSmartSuggestions(expenses) {
  const suggestions = [];
  
  // Analyze spending patterns
  const monthlySpending = {};
  const categorySpending = {};
  const merchantFrequency = {};
  
  expenses.forEach(exp => {
    const month = new Date(exp.date).toISOString().substring(0, 7);
    const category = exp.category;
    const merchant = exp.merchant;
    
    monthlySpending[month] = (monthlySpending[month] || 0) + exp.amount;
    categorySpending[category] = (categorySpending[category] || 0) + exp.amount;
    if (merchant) {
      merchantFrequency[merchant] = (merchantFrequency[merchant] || 0) + 1;
    }
  });
  
  // Suggest budget categories
  const totalSpending = Object.values(monthlySpending).reduce((a, b) => a + b, 0);
  const avgMonthly = totalSpending / Math.max(Object.keys(monthlySpending).length, 1);
  
  if (avgMonthly > 0) {
    suggestions.push({
      type: 'budget',
      message: `Your average monthly spending is ₹${avgMonthly.toFixed(2)}`,
      recommendation: 'Consider setting a monthly budget to track your expenses better'
    });
  }
  
  // Suggest high-spending categories
  const topCategory = Object.entries(categorySpending)
    .sort(([,a], [,b]) => b - a)[0];
  
  if (topCategory && topCategory[1] > avgMonthly * 0.3) {
    suggestions.push({
      type: 'category',
      message: `${topCategory[0]} is your highest spending category (Rs${topCategory[1].toFixed(2)})`,
      recommendation: 'Consider reviewing expenses in this category for potential savings'
    });
  }
  
  // Suggest frequent merchants
  const topMerchant = Object.entries(merchantFrequency)
    .sort(([,a], [,b]) => b - a)[0];
  
  if (topMerchant && topMerchant[1] > 3) {
    suggestions.push({
      type: 'merchant',
      message: `You frequently shop at ${topMerchant[0]} (${topMerchant[1]} times)`,
      recommendation: 'Look for loyalty programs or bulk discounts'
    });
  }
  
  return suggestions;
}

// Analyze spending trends
function analyzeSpendingTrends(expenses) {
  if (expenses.length < 2) return null;
  
  const monthlyData = {};
  expenses.forEach(exp => {
    const month = new Date(exp.date).toISOString().substring(0, 7);
    if (!monthlyData[month]) {
      monthlyData[month] = { total: 0, count: 0 };
    }
    monthlyData[month].total += exp.amount;
    monthlyData[month].count += 1;
  });
  
  const months = Object.keys(monthlyData).sort();
  if (months.length < 2) return null;
  
  const trend = monthlyData[months[months.length - 1]].total - monthlyData[months[months.length - 2]].total;
  
  return {
    trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
    amount: Math.abs(trend),
    message: trend > 0 ? 
      `Spending increased by $${trend.toFixed(2)} this month` : 
      trend < 0 ? 
      `Spending decreased by $${Math.abs(trend).toFixed(2)} this month` :
      'Spending remained stable this month'
  };
}

// Advanced Gemini-powered natural language query processing
async function processGeminiQuery(query, expenses) {
  if (!genAI) {
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Prepare expense data for analysis
    const expenseSummary = {
      totalExpenses: expenses.length,
      totalAmount: expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0),
      categories: {},
      monthlyData: {},
      recentExpenses: expenses.slice(0, 10).map(exp => ({
        description: exp.description,
        amount: exp.amount,
        category: exp.category,
        date: exp.date,
        merchant: exp.merchant
      }))
    };

    // Calculate category breakdown
    expenses.forEach(exp => {
      const category = exp.category;
      if (!expenseSummary.categories[category]) {
        expenseSummary.categories[category] = { total: 0, count: 0 };
      }
      expenseSummary.categories[category].total += parseFloat(exp.amount) || 0;
      expenseSummary.categories[category].count += 1;
    });

    // Calculate monthly data
    expenses.forEach(exp => {
      const month = new Date(exp.date).toISOString().substring(0, 7);
      if (!expenseSummary.monthlyData[month]) {
        expenseSummary.monthlyData[month] = 0;
      }
      expenseSummary.monthlyData[month] += parseFloat(exp.amount) || 0;
    });

    const prompt = `
      You are an AI financial advisor analyzing expense data. Answer the user's question about their spending patterns.
      
      User Question: "${query}"
      
      Expense Data Summary:
      - Total Expenses: ${expenseSummary.totalExpenses}
      - Total Amount Spent: $${expenseSummary.totalAmount.toFixed(2)}
      - Categories: ${JSON.stringify(expenseSummary.categories)}
      - Monthly Data: ${JSON.stringify(expenseSummary.monthlyData)}
      - Recent Expenses: ${JSON.stringify(expenseSummary.recentExpenses)}
      
      Provide a helpful, insightful response. If the user asks for specific data, include relevant numbers and percentages.
      Be conversational and provide actionable insights when possible.
      
      Response format:
      {
        "answer": "Your detailed response here",
        "insights": ["insight1", "insight2", "insight3"],
        "recommendations": ["recommendation1", "recommendation2"],
        "data": { relevant numerical data }
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text().trim();
    
    try {
      // Try to parse as JSON first
      return JSON.parse(responseText);
    } catch (parseError) {
      // If not JSON, return as plain text
      return {
        answer: responseText,
        insights: [],
        recommendations: [],
        data: null
      };
    }
  } catch (error) {
    console.error("Gemini query processing error:", error);
    return null;
  }
}

// Enhanced expense analysis with Gemini
async function generateAdvancedInsights(expenses) {
  if (!genAI) {
    return generateSmartSuggestions(expenses);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const expenseData = expenses.map(exp => ({
      description: exp.description,
      amount: exp.amount,
      category: exp.category,
      date: exp.date,
      merchant: exp.merchant
    }));

    const prompt = `
      Analyze these expense transactions and provide advanced financial insights and recommendations:
      
      ${JSON.stringify(expenseData, null, 2)}
      
      Provide:
      1. Spending pattern analysis
      2. Budget recommendations
      3. Potential savings opportunities
      4. Spending trends and predictions
      5. Category-specific insights
      
      Format your response as:
      {
        "analysis": "Overall spending analysis",
        "insights": ["insight1", "insight2", "insight3"],
        "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
        "budget_suggestions": ["budget tip1", "budget tip2"],
        "savings_opportunities": ["savings opportunity1", "savings opportunity2"]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text().trim();
    
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      return {
        analysis: responseText,
        insights: [],
        recommendations: [],
        budget_suggestions: [],
        savings_opportunities: []
      };
    }
  } catch (error) {
    console.error("Gemini insights error:", error);
    return generateSmartSuggestions(expenses);
  }
}

// AI-powered expense prediction based on historical patterns
async function predictFutureExpenses(expenses) {
  if (!genAI) {
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Analyze historical patterns
    const monthlyData = {};
    const categoryPatterns = {};
    const merchantPatterns = {};
    
    expenses.forEach(exp => {
      const month = new Date(exp.date).toISOString().substring(0, 7);
      const category = exp.category;
      const merchant = exp.merchant;
      
      if (!monthlyData[month]) monthlyData[month] = 0;
      if (!categoryPatterns[category]) categoryPatterns[category] = [];
      if (merchant && !merchantPatterns[merchant]) merchantPatterns[merchant] = [];
      
      monthlyData[month] += parseFloat(exp.amount) || 0;
      categoryPatterns[category].push(parseFloat(exp.amount) || 0);
      if (merchant) merchantPatterns[merchant].push(parseFloat(exp.amount) || 0);
    });

    const prompt = `
      Analyze these expense patterns and predict likely future expenses:
      
      Monthly Spending: ${JSON.stringify(monthlyData)}
      Category Patterns: ${JSON.stringify(categoryPatterns)}
      Merchant Patterns: ${JSON.stringify(merchantPatterns)}
      
      Provide predictions for:
      1. Next month's likely spending amount
      2. Most probable expense categories
      3. Potential recurring expenses
      4. Seasonal spending patterns
      5. Budget recommendations based on predictions
      
      Format as:
      {
        "predictedMonthlySpending": estimated_amount,
        "likelyCategories": ["category1", "category2"],
        "recurringExpenses": ["expense1", "expense2"],
        "seasonalPatterns": "description",
        "budgetRecommendations": ["rec1", "rec2"],
        "confidence": "high/medium/low"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text().trim();
    
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      return {
        predictedMonthlySpending: 0,
        likelyCategories: [],
        recurringExpenses: [],
        seasonalPatterns: responseText,
        budgetRecommendations: [],
        confidence: "low"
      };
    }
  } catch (error) {
    console.error("Expense prediction error:", error);
    return null;
  }
}

// AI-powered fraud detection and anomaly detection
function detectAnomalies(expenses) {
  const anomalies = [];
  
  // Calculate average expense amount
  const amounts = expenses.map(exp => parseFloat(exp.amount) || 0);
  const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const threshold = avgAmount * 3; // 3x average as anomaly threshold
  
  // Detect unusually high amounts
  expenses.forEach(exp => {
    if (parseFloat(exp.amount) > threshold) {
      anomalies.push({
        type: "unusually_high_amount",
        expense: exp,
        reason: `Amount $${exp.amount} is ${(parseFloat(exp.amount) / avgAmount).toFixed(1)}x higher than average`,
        severity: "high"
      });
    }
  });
  
  // Detect duplicate transactions
  const transactionMap = new Map();
  expenses.forEach(exp => {
    const key = `${exp.description}-${exp.amount}-${new Date(exp.date).toDateString()}`;
    if (transactionMap.has(key)) {
      anomalies.push({
        type: "duplicate_transaction",
        expense: exp,
        reason: "Possible duplicate transaction detected",
        severity: "medium"
      });
    } else {
      transactionMap.set(key, exp);
    }
  });
  
  // Detect unusual spending patterns
  const categorySpending = {};
  expenses.forEach(exp => {
    if (!categorySpending[exp.category]) categorySpending[exp.category] = [];
    categorySpending[exp.category].push(parseFloat(exp.amount) || 0);
  });
  
  Object.entries(categorySpending).forEach(([category, amounts]) => {
    if (amounts.length > 1) {
      const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      amounts.forEach(amount => {
        if (amount > avg * 2) {
          anomalies.push({
            type: "category_spike",
            category: category,
            amount: amount,
            reason: `Unusual spike in ${category} spending`,
            severity: "medium"
          });
        }
      });
    }
  });
  
  return anomalies;
}

// AI-powered expense optimization suggestions
async function generateOptimizationSuggestions(expenses) {
  if (!genAI) {
    return [];
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const expenseData = expenses.map(exp => ({
      description: exp.description,
      amount: exp.amount,
      category: exp.category,
      date: exp.date,
      merchant: exp.merchant
    }));

    const prompt = `
      Analyze these expenses and provide optimization suggestions to help save money:
      
      ${JSON.stringify(expenseData, null, 2)}
      
      Provide specific, actionable suggestions for:
      1. Reducing unnecessary expenses
      2. Finding better alternatives
      3. Negotiating recurring bills
      4. Identifying subscription optimizations
      5. Suggesting budget-friendly alternatives
      
      Format as:
      {
        "suggestions": [
          {
            "type": "suggestion_type",
            "description": "suggestion text",
            "potential_savings": "estimated amount",
            "difficulty": "easy/medium/hard",
            "category": "category_name"
          }
        ],
        "total_potential_savings": estimated_total
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text().trim();
    
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      return {
        suggestions: [],
        total_potential_savings: 0
      };
    }
  } catch (error) {
    console.error("Optimization suggestions error:", error);
    return [];
  }
}

// AI-powered expense goal setting and tracking
async function generateExpenseGoals(expenses) {
  if (!genAI) {
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Calculate current spending patterns
    const monthlySpending = {};
    const categorySpending = {};
    
    expenses.forEach(exp => {
      const month = new Date(exp.date).toISOString().substring(0, 7);
      const category = exp.category;
      
      if (!monthlySpending[month]) monthlySpending[month] = 0;
      if (!categorySpending[category]) categorySpending[category] = 0;
      
      monthlySpending[month] += parseFloat(exp.amount) || 0;
      categorySpending[category] += parseFloat(exp.amount) || 0;
    });

    const avgMonthly = Object.values(monthlySpending).reduce((a, b) => a + b, 0) / Object.keys(monthlySpending).length;

    const prompt = `
      Based on this spending data, suggest realistic financial goals:
      
      Average Monthly Spending: $${avgMonthly.toFixed(2)}
      Category Breakdown: ${JSON.stringify(categorySpending)}
      Monthly History: ${JSON.stringify(monthlySpending)}
      
      Suggest SMART goals for:
      1. Monthly spending reduction
      2. Category-specific budgets
      3. Savings targets
      4. Spending habits to improve
      5. Timeline for achieving goals
      
      Format as:
      {
        "monthly_budget_goal": target_amount,
        "category_goals": [
          {"category": "name", "current": amount, "target": amount, "reduction_percent": percent}
        ],
        "savings_target": target_amount,
        "timeline": "description",
        "actionable_steps": ["step1", "step2", "step3"]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text().trim();
    
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      return {
        monthly_budget_goal: avgMonthly * 0.9,
        category_goals: [],
        savings_target: 0,
        timeline: "3 months",
        actionable_steps: []
      };
    }
  } catch (error) {
    console.error("Goal generation error:", error);
    return null;
  }
}

// AI-powered receipt analysis (for future OCR integration)
async function analyzeReceipt(receiptText) {
  if (!genAI) {
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
      Analyze this receipt text and extract expense information:
      
      Receipt Text: "${receiptText}"
      
      Extract and return:
      1. Total amount
      2. Merchant name
      3. Items purchased
      4. Category classification
      5. Date (if mentioned)
      
      Format as:
      {
        "amount": extracted_amount,
        "merchant": "merchant_name",
        "items": ["item1", "item2"],
        "category": "category_name",
        "date": "date_if_found",
        "confidence": "high/medium/low"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text().trim();
    
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      return null;
    }
  } catch (error) {
    console.error("Receipt analysis error:", error);
    return null;
  }
}

// AI-powered expense comparison and benchmarking
async function compareExpenses(expenses, benchmark = "national_average") {
  if (!genAI) {
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const categorySpending = {};
    expenses.forEach(exp => {
      if (!categorySpending[exp.category]) categorySpending[exp.category] = 0;
      categorySpending[exp.category] += parseFloat(exp.amount) || 0;
    });

    const prompt = `
      Compare these spending patterns with ${benchmark}:
      
      Category Spending: ${JSON.stringify(categorySpending)}
      
      Provide comparison analysis:
      1. How spending compares to typical patterns
      2. Categories that are above/below average
      3. Benchmarking insights
      4. Recommendations for improvement
      
      Format as:
      {
        "comparison_summary": "overall assessment",
        "above_average_categories": ["category1", "category2"],
        "below_average_categories": ["category3", "category4"],
        "benchmark_insights": ["insight1", "insight2"],
        "recommendations": ["rec1", "rec2"]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text().trim();
    
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      return {
        comparison_summary: "Comparison analysis completed",
        above_average_categories: [],
        below_average_categories: [],
        benchmark_insights: [],
        recommendations: []
      };
    }
  } catch (error) {
    console.error("Expense comparison error:", error);
    return null;
  }
}

module.exports = { 
  categorizeExpense, 
  extractFromText, 
  generateSmartSuggestions, 
  analyzeSpendingTrends,
  extractMerchantName,
  categorizeExpenseFallback,
  processGeminiQuery,
  generateAdvancedInsights,
  predictFutureExpenses,
  detectAnomalies,
  generateOptimizationSuggestions,
  generateExpenseGoals,
  analyzeReceipt,
  compareExpenses
};