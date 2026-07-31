const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

// Configure CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Standard JSON and URL parsers
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Static files directory for uploads
app.use('/uploads', express.static('uploads'));

// Serve frontend static files
const frontendPublicPath = path.join(__dirname, '../public');
const frontendDistPath = path.join(__dirname, '../../frontend/dist');

app.use(express.static(frontendPublicPath));
app.use(express.static(frontendDistPath));

// Routes declaration
const authRouter = require('./routes/auth.routes');
const productRouter = require('./routes/product.routes');
const orderRouter = require('./routes/order.routes');

const { getCategories } = require('./controllers/product.controller');

app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.get('/api/categories', getCategories);
app.use('/api/orders', orderRouter);

// API root welcome endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Custom Merchandise API Engine Active",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      products: "/api/products",
      categories: "/api/categories",
      orders: "/api/orders",
      health: "/health"
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date()
  });
});

// SPA catch-all route to serve index.html for client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/health') || req.path.startsWith('/uploads')) {
    return next();
  }
  const indexPath = path.join(frontendPublicPath, 'index.html');
  const distIndexPath = path.join(frontendDistPath, 'index.html');

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else if (fs.existsSync(distIndexPath)) {
    res.sendFile(distIndexPath);
  } else {
    next();
  }
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;
