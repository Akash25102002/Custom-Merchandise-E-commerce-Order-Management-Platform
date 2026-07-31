require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔄 Connecting to MongoDB Atlas...');
console.log('URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected successfully to database:', mongoose.connection.name);
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });
