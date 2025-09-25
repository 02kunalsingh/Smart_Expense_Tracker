const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const defaultAtlasUri = 'mongodb+srv://Kunal:Kunal123@cluster0.qi3td3a.mongodb.net/expense-tracker-ai?retryWrites=true&w=majority&appName=Cluster0';
    const mongoURI = process.env.MONGODB_URI || defaultAtlasUri;

    const conn = await mongoose.connect(mongoURI);

    const isAtlas = /mongodb\.net/i.test(conn.connection.host) || /mongodb\.net/i.test(mongoURI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}${isAtlas ? ' (Atlas)' : ''}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('Ensure MONGODB_URI is set in your environment (e.g., .env) with a valid MongoDB Atlas connection string.');
    process.exit(1);
  }
};

module.exports = connectDB;
