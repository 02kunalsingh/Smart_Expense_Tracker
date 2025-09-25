# 🤖 Gemini API Setup Guide

## Overview
Your AI Expense Tracker now includes powerful Gemini AI integration for advanced expense analysis, predictions, and insights!

## 🚀 New AI Features Added

### 1. **Advanced Expense Categorization**
- Uses Gemini AI for more accurate categorization
- Fallback to Hugging Face API
- Final fallback to keyword matching

### 2. **Expense Predictions**
- Predicts future spending based on historical patterns
- Identifies likely categories and recurring expenses
- Provides budget recommendations

### 3. **Anomaly Detection**
- Detects unusually high amounts (3x+ average)
- Identifies duplicate transactions
- Flags spending spikes in categories

### 4. **Optimization Suggestions**
- AI-powered money-saving recommendations
- Specific alternatives and optimizations
- Potential savings calculations

### 5. **Smart Goal Setting**
- Generates realistic financial goals
- Category-specific budget targets
- Actionable steps for improvement

### 6. **Receipt Analysis**
- Analyzes receipt text to extract expense data
- Auto-creates expenses from receipt information
- Supports future OCR integration

### 7. **Expense Benchmarking**
- Compares spending to national averages
- Identifies above/below average categories
- Provides improvement recommendations

### 8. **Natural Language Queries**
- Enhanced with Gemini AI for complex questions
- Provides detailed insights and recommendations
- Supports conversational expense analysis

## 🔧 Setup Instructions

### Step 1: Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key

### Step 2: Configure Environment Variables

#### Option A: Environment Variables (Recommended)
```bash
# Windows
set GEMINI_API_KEY=your_actual_gemini_api_key_here

# macOS/Linux
export GEMINI_API_KEY=your_actual_gemini_api_key_here
```

#### Option B: Create .env File
Create a `.env` file in the project root (alongside your MongoDB Atlas URI):
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
HF_API_KEY=your_huggingface_api_key_here
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.<id>.mongodb.net/expense-tracker-ai?retryWrites=true&w=majority
JWT_SECRET=change_this_secret
PORT=5000
```

### Step 3: Restart the Application
```bash
npm start
```

## 📡 New API Endpoints

### Core AI Endpoints
- `GET /api/expenses/ai/suggestions` - Smart suggestions
- `GET /api/expenses/ai/trends` - Spending trends
- `POST /api/expenses/ai/query` - Natural language queries
- `GET /api/expenses/ai/insights` - Advanced insights

### New Advanced Endpoints
- `GET /api/expenses/ai/predictions` - Future expense predictions
- `GET /api/expenses/ai/anomalies` - Anomaly detection
- `GET /api/expenses/ai/optimization` - Optimization suggestions
- `GET /api/expenses/ai/goals` - Smart goal setting
- `GET /api/expenses/ai/benchmark` - Expense benchmarking
- `POST /api/expenses/ai/receipt` - Receipt analysis
- `GET /api/expenses/ai/dashboard` - Comprehensive dashboard

## 🎯 Example Usage

### Natural Language Queries
```
"What's my spending trend this month?"
"How can I reduce my food expenses?"
"What are my biggest expense categories?"
"Predict my spending for next month"
"Find unusual transactions in my data"
```

### Receipt Analysis
```bash
curl -X POST http://localhost:5000/api/expenses/ai/receipt \
  -H "Content-Type: application/json" \
  -d '{"receiptText": "Starbucks Coffee $5.50 123 Main St 2024-01-15"}'
```

### Expense Predictions
```bash
curl http://localhost:5000/api/expenses/ai/predictions
```

### Anomaly Detection
```bash
curl http://localhost:5000/api/expenses/ai/anomalies
```

## 🔄 Fallback System

The AI system uses a smart fallback approach:

1. **Primary**: Gemini AI (if API key is configured)
2. **Secondary**: Hugging Face API (if configured)
3. **Tertiary**: Keyword-based categorization

This ensures the app works even without API keys, but with enhanced features when configured.

## 💡 Tips for Best Results

1. **Add More Data**: The more expenses you have, the better the AI predictions
2. **Use Descriptive Text**: "Lunch at McDonald's $12" works better than "Food $12"
3. **Regular Updates**: Add expenses regularly for better trend analysis
4. **Review Suggestions**: Check AI suggestions regularly for optimization opportunities

## 🚨 Troubleshooting

### Common Issues

1. **"Failed to generate dashboard"**
   - Check if Gemini API key is correctly set
   - Verify API key is valid and active
   - Check console for specific error messages

2. **"Gemini categorization error"**
   - API key might be invalid or expired
   - Check your Google AI Studio account
   - Verify billing/quota settings

3. **Slow responses**
   - Gemini API has rate limits
   - Large datasets may take longer to process
   - Consider reducing concurrent requests

### Debug Mode
Add `DEBUG=true` to your environment variables for detailed logging.

## 🎉 What's Next?

With Gemini AI integration, your expense tracker now includes:

- ✅ Advanced expense categorization
- ✅ Spending predictions and forecasting
- ✅ Anomaly and fraud detection
- ✅ Optimization recommendations
- ✅ Smart goal setting
- ✅ Receipt analysis capabilities
- ✅ Expense benchmarking
- ✅ Natural language processing
- ✅ Comprehensive AI dashboard

Your expense tracker is now a powerful AI-powered financial management tool! 🚀
