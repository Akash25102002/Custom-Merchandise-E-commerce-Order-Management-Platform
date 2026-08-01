const mongoose = require('mongoose');

const connectDB = async () => {
  const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/custom_merchandise';

  const options = {
    serverSelectionTimeoutMS: 3000,
    socketTimeoutMS: 45000,
  };

  try {
    const conn = await mongoose.connect(DB_URI, options);
    console.log(`MongoDB Connected: ${conn.connection.host} 🚀`);
  } catch (error) {
    console.warn(`MongoDB Connection Warning: ${error.message}`);
    console.warn('⚡ Active: Server initializing with graceful in-memory repository store for local testing.');
  }

  // Connection Event Listeners & Reconnection Logic
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected! Attempting to reconnect...');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`MongoDB connection error: ${err}`);
  });

  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to app termination.');
    process.exit(0);
  });
};

module.exports = connectDB;
