require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`⚙️ Server is running at port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed !!! ", err.message);
  });
