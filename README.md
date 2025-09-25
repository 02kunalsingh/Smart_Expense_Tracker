# AI Expense Tracker

A modern expense tracking application with AI-powered categorization and beautiful data visualization.

## Features

- 🤖 **AI-Powered Categorization**: Automatically categorizes expenses using Hugging Face's BART model
- 📊 **Interactive Charts**: Beautiful pie charts showing spending patterns
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 📤 **CSV Import/Export**: Import expenses from CSV files or export your data
- 🔍 **Advanced Filtering**: Filter expenses by category, date range, and more
- 💾 **Local Storage**: Data is stored locally in JSON format

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure AI Features (Optional)

To enable AI-powered expense categorization, you'll need a Hugging Face API key:

1. Go to [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Create a new access token
3. Set the environment variable:
   ```bash
   # Windows
   set HF_API_KEY=your_api_key_here
   
   # macOS/Linux
   export HF_API_KEY=your_api_key_here
   ```

### 3. Configure MongoDB Atlas

Create a free cluster on MongoDB Atlas, add your IP to Network Access, and create a database user. Copy your connection string and set it in an `.env` file at the project root:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.<id>.mongodb.net/expense-tracker-ai?retryWrites=true&w=majority&appName=<appName>
JWT_SECRET=change_this_secret
HF_API_KEY=your_hf_api_key_optional
GEMINI_API_KEY=your_gemini_key_optional
```

Ensure the database name in the URI is `expense-tracker-ai` (or any name you prefer).

### 4. Start the Application

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

### 5. Open in Browser

Navigate to `http://localhost:5000` in your web browser.

## Usage

### Adding Expenses

1. **Quick Add**: Type a description like "Lunch $12 at Subway" and the AI will automatically extract the amount and categorize it.
2. **Manual Add**: Fill in the amount, description, and date fields manually.
3. **Category Selection**: The AI will suggest categories, but you can override them.

### AI Features

The application uses Hugging Face's BART model to:
- **Extract amounts** from natural language descriptions
- **Categorize expenses** into predefined categories:
  - Food
  - Travel
  - Shopping
  - Bills
  - Entertainment
  - Income
  - Other

### Data Management

- **Import CSV**: Upload CSV files with columns: `amount`, `description`, `category`, `date`
- **Export CSV**: Download your expense data as a CSV file
- **Export JSON**: Download your expense data as a JSON file

### Filtering and Analysis

- Filter expenses by category
- Filter by date range
- View spending patterns in interactive charts
- Sort expenses by date (newest first)

## Project Structure

```
expense-tracker-ai/
├── backend/
│   ├── routes/
│   │   ├── data/
│   │   │   └── expenses.json      # Expense data storage
│   │   └── expenses.js            # API routes for expenses
│   ├── utils/
│   │   └── ai.js                  # AI categorization logic
│   ├── config.js                  # Configuration settings
│   └── server.js                  # Express server setup
├── frontend/
│   ├── index.html                 # Main HTML page
│   ├── script.js                  # Frontend JavaScript logic
│   ├── charts.js                  # Chart.js integration
│   └── style.css                  # Styling and dark mode
├── package.json                   # Dependencies and scripts
└── README.md                      # This file
```

## API Endpoints

- `GET /api/expenses` - Get all expenses (with optional filtering)
- `POST /api/expenses` - Create a new expense
- `PUT /api/expenses/:id` - Update an expense
- `DELETE /api/expenses/:id` - Delete an expense
- `GET /api/expenses/summary` - Get expense summary by category
- `GET /api/expenses/export/csv` - Export expenses as CSV
- `GET /api/expenses/export/json` - Export expenses as JSON
- `POST /api/expenses/import/csv` - Import expenses from CSV

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Charts**: Chart.js
- **AI**: Hugging Face Transformers API
- **Data Storage**: JSON files
- **File Upload**: Multer
- **Styling**: Custom CSS with dark mode support

## Development

### Adding New Features

1. **Backend**: Add new routes in `backend/routes/expenses.js`
2. **Frontend**: Update `frontend/script.js` for new functionality
3. **Styling**: Modify `frontend/style.css` for UI changes

### Environment Variables

- `HF_API_KEY`: Hugging Face API key for AI features
- `PORT`: Server port (default: 5000)

## Troubleshooting

### Common Issues

1. **AI Categorization not working**: Check if `HF_API_KEY` is set correctly
2. **Charts not displaying**: Ensure Chart.js is loaded and data exists
3. **CSV import failing**: Check file format matches expected columns
4. **Server not starting**: Verify all dependencies are installed with `npm install`

### Sample Data

The application comes with sample expense data to help you get started immediately.

## License

ISC License - feel free to use this project for personal or commercial purposes.

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve this application!
# Smart_Expense_Tracker
