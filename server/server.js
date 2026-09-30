require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Base Middlewares
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopez';

function startServer() {
  app.listen(PORT, () => {
    const mode = mongoose.connection.readyState === 1 ? 'MongoDB Mode' : 'Demo Mode (in-memory)';
    console.log(`🚀 ShopEZ API Server running on port ${PORT} [${mode}]`);
  });
}

function mountRealRoutes() {
  const authRoutes = require('./routes/authRoutes');
  const productRoutes = require('./routes/productRoutes');
  const reviewRoutes = require('./routes/reviewRoutes');
  const couponRoutes = require('./routes/couponRoutes');
  const orderRoutes = require('./routes/orderRoutes');
  const adminRoutes = require('./routes/adminRoutes');

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', dbConnected: true, timestamp: new Date().toISOString() }));

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/coupons', couponRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/admin', adminRoutes);
}

function mountDemoRoutes() {
  const mockRoutes = require('./mockRoutes');

  // mockRoutes handles all /api/* paths internally
  app.use('/api', mockRoutes);
}

// Global Error Boundary
app.use((err, _req, res, _next) => {
  console.error('Unhandled Server Exception:', err.stack || err.message);
  res.status(500).json({ message: 'Internal server error' });
});

// ── Bootstrap ──────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 })
    .then(() => {
      console.log('✅ Connected to MongoDB database');
      mountRealRoutes();
      startServer();
    })
    .catch((error) => {
      console.warn(`\n⚠️  MongoDB unavailable (${error.message}).`);
      console.warn(`💡 Starting ShopEZ in Standalone Demo Mode on port ${PORT}...`);
      console.warn('   All features work with in-memory sample data.');
      console.warn('   Demo login: admin@shopez.com / admin123\n');
      mountDemoRoutes();
      startServer();
    });
}

module.exports = app;
