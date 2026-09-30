// Run with: npm run seed
// Creates one admin account, a sample coupon, and a few sample products.
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB for seeding...');

  const adminEmail = 'admin@shopez.com';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash('admin123', 10);
    await User.create({ name: 'Store Admin', email: adminEmail, password: hashed, role: 'admin' });
    console.log(`Admin created -> email: ${adminEmail} / password: admin123`);
  } else {
    console.log('Admin already exists, skipping.');
  }

  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    await Product.insertMany([
      {
        name: 'Wireless Headphones',
        description: 'Over-ear Bluetooth headphones with noise cancellation.',
        price: 79.99,
        category: 'Electronics',
        imageUrl: 'https://picsum.photos/seed/headphones/400/300',
        stock: 25,
        discountPercent: 10,
      },
      {
        name: 'Running Shoes',
        description: 'Lightweight running shoes with breathable mesh.',
        price: 59.99,
        category: 'Footwear',
        imageUrl: 'https://picsum.photos/seed/shoes/400/300',
        stock: 40,
        discountPercent: 0,
      },
      {
        name: 'Stainless Steel Water Bottle',
        description: 'Keeps drinks cold for 24 hours, 1L capacity.',
        price: 19.99,
        category: 'Home & Kitchen',
        imageUrl: 'https://picsum.photos/seed/bottle/400/300',
        stock: 100,
        discountPercent: 5,
      },
      {
        name: 'Mechanical Keyboard',
        description: 'RGB backlit mechanical keyboard with blue switches.',
        price: 89.99,
        category: 'Electronics',
        imageUrl: 'https://picsum.photos/seed/keyboard/400/300',
        stock: 15,
        discountPercent: 0,
      },
    ]);
    console.log('Sample products created.');
  } else {
    console.log('Products already exist, skipping.');
  }

  const existingCoupon = await Coupon.findOne({ code: 'WELCOME10' });
  if (!existingCoupon) {
    await Coupon.create({ code: 'WELCOME10', discountPercent: 10, active: true });
    console.log('Sample coupon created -> code: WELCOME10 (10% off)');
  } else {
    console.log('Coupon already exists, skipping.');
  }

  console.log('Seeding complete.');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
