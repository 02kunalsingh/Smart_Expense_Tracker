# 🗄️ MongoDB Atlas Setup Guide

## Overview
Your AI Expense Tracker now includes MongoDB Atlas integration for secure, cloud-based data storage with user authentication!

## 🚀 New Features Added

### 1. **User Authentication System**
- ✅ JWT-based authentication
- ✅ User registration and login
- ✅ Password hashing with bcrypt
- ✅ Protected routes and middleware
- ✅ User session management

### 2. **Database Integration**
- ✅ MongoDB Atlas cloud database
- ✅ Mongoose ODM for data modeling
- ✅ User and Expense models
- ✅ Data isolation by user
- ✅ Automatic data validation

### 3. **Enhanced Security**
- ✅ Password encryption
- ✅ JWT token authentication
- ✅ Protected API endpoints
- ✅ User-specific data access

## 🔧 MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new project (e.g., "Expense Tracker AI")

### Step 2: Create a Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select a cloud provider and region
4. Give your cluster a name (e.g., "expense-tracker-cluster")
5. Click "Create"

### Step 3: Configure Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and strong password
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### Step 4: Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" driver
5. Copy the connection string

### Step 6: Configure Environment Variables

Create a `.env` file in your project root:
```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/expense-tracker-ai?retryWrites=true&w=majority

# JWT Secret (change this to a secure random string)
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Gemini API Key (optional)
GEMINI_API_KEY=your_gemini_api_key_here

# Hugging Face API Key (optional)
HF_API_KEY=your_huggingface_api_key_here

# Server Port
PORT=5000
```

**Important:** Replace `<username>`, `<password>`, and `<cluster-url>` with your actual MongoDB Atlas credentials.

## 🔐 Authentication System

### User Registration
- Email validation and uniqueness
- Password hashing with bcrypt
- User profile creation
- Automatic JWT token generation

### User Login
- Email/password authentication
- JWT token generation
- Session management
- Automatic token refresh

### Protected Routes
All expense-related endpoints now require authentication:
- `GET /api/expenses` - Get user's expenses
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- All AI endpoints require authentication

## 📱 Frontend Authentication

### Login Page (`/login.html`)
- Email and password fields
- Form validation
- Error handling
- Automatic redirect on success

### Signup Page (`/signup.html`)
- First name, last name, email, password
- Password confirmation
- Form validation
- User creation

### Main App (`/index.html`)
- Authentication check on page load
- User info display
- Logout functionality
- Protected content

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` file with your MongoDB Atlas connection string and JWT secret.

### 3. Start the Application
```bash
npm start
```

### 4. Access the Application
1. Open `http://localhost:5000` in your browser
2. You'll be redirected to `/login.html`
3. Create a new account or sign in
4. Start tracking your expenses!

## 🔧 API Endpoints

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/verify-token` - Verify JWT token

### Expense Endpoints (Protected)
- `GET /api/expenses` - Get user's expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/summary` - Get expense summary
- All AI endpoints (`/api/expenses/ai/*`)

## 🛡️ Security Features

### Password Security
- Bcrypt hashing with salt rounds
- Minimum 6 character requirement
- Secure password comparison

### JWT Security
- 7-day token expiration
- Secure secret key
- Automatic token validation

### Data Protection
- User-specific data isolation
- Protected API endpoints
- Secure database connections

## 🎯 User Experience

### Seamless Authentication
- Automatic login persistence
- Smooth redirects
- User-friendly error messages

### Personalized Experience
- User-specific expense data
- Personalized AI insights
- Custom user preferences

### Mobile Responsive
- Works on all devices
- Touch-friendly interface
- Optimized for mobile use

## 🚨 Troubleshooting

### Common Issues

1. **"MongoDB connection error"**
   - Check your MongoDB Atlas connection string
   - Verify network access settings
   - Ensure database user has correct permissions

2. **"Authentication failed"**
   - Check JWT_SECRET in environment variables
   - Verify user credentials
   - Check token expiration

3. **"User already exists"**
   - Email must be unique
   - Try logging in instead of registering

4. **"Token expired"**
   - Tokens expire after 7 days
   - User needs to login again

### Debug Mode
Add `DEBUG=true` to your environment variables for detailed logging.

## 🎉 What's Next?

With MongoDB Atlas and authentication integration, your expense tracker now includes:

- ✅ **Secure user authentication**
- ✅ **Cloud database storage**
- ✅ **User-specific data isolation**
- ✅ **Protected API endpoints**
- ✅ **JWT token management**
- ✅ **Password security**
- ✅ **Scalable architecture**
- ✅ **Professional user experience**

Your expense tracker is now a production-ready, secure financial management application! 🚀

## 📞 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify your MongoDB Atlas configuration
3. Ensure all environment variables are set correctly
4. Check network connectivity

Happy expense tracking! 💰
