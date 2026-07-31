const mongoose = require('mongoose');

const connectDB = async () => {
  // Check if we are forced to use mock JSON database
  if (process.env.USE_MOCK_DB === 'true') {
    console.log(`\n⚙️ Local JSON File-Based Database system forced!`);
    process.env.DB_MODE = 'json';
    return;
  }

  try {
    const dbHost = process.env.MONGODB_URI.includes('@') 
      ? process.env.MONGODB_URI.split('@').pop().split('?')[0] 
      : 'localhost';
      
    console.log(`\n🔄 Connecting to MongoDB database: ${dbHost}`);
    
    // Connect to primary MongoDB URI with a short 3-second timeout
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`✅ MongoDB Connected! Host: ${connectionInstance.connection.host}`);
    process.env.DB_MODE = 'mongodb';
  } catch (error) {
    console.warn(`⚠️ MongoDB Atlas connection failed: ${error.message}`);
    console.log(`🔄 Attempting local In-Memory MongoDB server fallback...`);
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      const connectionInstance = await mongoose.connect(mongoUri);
      console.log(`✅ In-Memory MongoDB Server Connected!`);
      process.env.DB_MODE = 'mongodb';
    } catch (memError) {
      console.warn(`⚠️ In-Memory MongoDB Server failed (likely missing VC++ Redistributable DLLs).`);
      console.log(`⚙️ Falling back to local JSON File-Based Database system...`);
      process.env.DB_MODE = 'json';
    }
  }
};

module.exports = connectDB;
