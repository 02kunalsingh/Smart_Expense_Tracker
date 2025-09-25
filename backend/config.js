module.exports = {
  // Hugging Face API Key for AI categorization
  // Get your API key from: https://huggingface.co/settings/tokens
  HF_API_KEY: process.env.HF_API_KEY || 'your_huggingface_api_key_here',
  
  // Google Gemini API Key for advanced AI features
  // Get your API key from: https://makersuite.google.com/app/apikey
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'your_gemini_api_key_here',
  
  // Server configuration
  PORT: process.env.PORT || 5000,
  
  // Data file path
  DATA_PATH: './routes/data/expenses.json'
};
