/**
 * mockRoutes.js - In-memory API routes for demo mode (no MongoDB needed)
 * Mounted when MongoDB is unavailable. Provides realistic product browsing,
 * auth login, cart checkout simulation, and admin analytics.
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { demoProducts, demoCoupons, demoUsers, demoOrders, demoReviews } = require('./mockDb');

// Mutable in-memory collections (shallow copy so originals stay clean)
let products = demoProducts.map((p) => ({ ...p }));
let coupons = demoCoupons.map((c) => ({ ...c }));
let users = demoUsers.map((u) => ({ ...u }));
let orders = [...demoOrders];
let reviews = [...demoReviews];

const router = express.Router();

// ─── Helpers ────────────────────────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET || 'shopez_demo_secret';

function makeToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function formatUser(u) {
  return { id: u._id, name: u.name, email: u.email, role: u.role };
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.substring(7).trim() : null;
  if (!token) return res.status(401).json({ message: 'Not authorized, no token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
  }
}

function adminMiddleware(req, res, next) {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ message: 'Admin access required' });
}

function uniqueId() {
  return Math.random().toString(36).substring(2, 18);
}

// ─── Health ──────────────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({ status: 'ok (demo mode)', dbConnected: false, timestamp: new Date().toISOString() });
});

// ─── Auth ────────────────────────────────────────────────────────────────────
router.post('/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

  const norm = email.toLowerCase().trim();
  if (users.find((u) => u.email === norm)) return res.status(400).json({ message: 'Email is already registered' });

  const newUser = {
    _id: uniqueId(),
    name: name.trim(),
    email: norm,
    password: bcrypt.hashSync(password, 10),
    role: 'customer',
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  const token = makeToken(newUser);
  return res.status(201).json({ token, user: formatUser(newUser) });
});

router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  const norm = email.toLowerCase().trim();
  const user = users.find((u) => u.email === norm);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  const token = makeToken(user);
  return res.json({ token, user: formatUser(user) });
});

router.get('/auth/me', authMiddleware, (req, res) => {
  const user = users.find((u) => u._id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { password: _pw, ...safeUser } = user;
  return res.json(safeUser);
});

// ─── Products ─────────────────────────────────────────────────────────────────
router.get('/products/categories', (_req, res) => {
  const cats = [...new Set(products.map((p) => p.category))];
  return res.json(cats);
});

router.get('/products', (req, res) => {
  const { search, category, minPrice, maxPrice, sort } = req.query;
  let results = [...products];

  if (search) results = results.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  if (category) results = results.filter((p) => p.category === category);
  if (minPrice) results = results.filter((p) => p.price >= Number(minPrice));
  if (maxPrice) results = results.filter((p) => p.price <= Number(maxPrice));

  if (sort === 'price_asc') results.sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') results.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') results.sort((a, b) => b.avgRating - a.avgRating);
  else results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return res.json(results);
});

router.get('/products/:id', (req, res) => {
  const product = products.find((p) => p._id === req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  return res.json(product);
});

router.post('/products', authMiddleware, adminMiddleware, (req, res) => {
  const { name, description, price, category, imageUrl, stock, discountPercent } = req.body;
  if (!name || !description || price == null || !category) {
    return res.status(400).json({ message: 'name, description, price and category are required' });
  }
  const newProduct = {
    _id: uniqueId(),
    name: name.trim(),
    description: description.trim(),
    price: Number(price),
    category: category.trim(),
    imageUrl: imageUrl || '',
    stock: Number(stock) || 0,
    discountPercent: Number(discountPercent) || 0,
    avgRating: 0,
    numReviews: 0,
    createdAt: new Date().toISOString(),
  };
  products.unshift(newProduct);
  return res.status(201).json(newProduct);
});

router.put('/products/:id', authMiddleware, adminMiddleware, (req, res) => {
  const idx = products.findIndex((p) => p._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Product not found' });
  products[idx] = { ...products[idx], ...req.body, _id: req.params.id };
  return res.json(products[idx]);
});

router.delete('/products/:id', authMiddleware, adminMiddleware, (req, res) => {
  const idx = products.findIndex((p) => p._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Product not found' });
  products.splice(idx, 1);
  return res.json({ message: 'Product deleted' });
});

// ─── Reviews ──────────────────────────────────────────────────────────────────
router.get('/reviews/product/:productId', (req, res) => {
  const productReviews = reviews
    .filter((r) => r.product === req.params.productId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return res.json(productReviews);
});

router.post('/reviews', authMiddleware, (req, res) => {
  const { productId, rating, comment } = req.body;
  if (!productId || !rating) return res.status(400).json({ message: 'productId and rating are required' });

  const product = products.find((p) => p._id === productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const reviewer = users.find((u) => u._id === req.user.id);
  const newReview = {
    _id: uniqueId(),
    product: productId,
    user: req.user.id,
    userName: reviewer ? reviewer.name : 'Anonymous Buyer',
    rating: Number(rating),
    comment: (comment || '').trim(),
    createdAt: new Date().toISOString(),
  };
  reviews.push(newReview);

  // Recalculate product average rating
  const productReviews = reviews.filter((r) => r.product === productId);
  product.numReviews = productReviews.length;
  product.avgRating = Math.round((productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length) * 10) / 10;

  return res.status(201).json(newReview);
});

// ─── Coupons ──────────────────────────────────────────────────────────────────
router.get('/coupons', authMiddleware, adminMiddleware, (_req, res) => {
  return res.json([...coupons].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

router.post('/coupons', authMiddleware, adminMiddleware, (req, res) => {
  const { code, discountPercent } = req.body;
  if (!code || !discountPercent) return res.status(400).json({ message: 'code and discountPercent are required' });

  const sanitized = code.trim().toUpperCase();
  if (coupons.find((c) => c.code === sanitized)) return res.status(400).json({ message: 'Coupon code already exists' });

  const newCoupon = {
    _id: uniqueId(),
    code: sanitized,
    discountPercent: Number(discountPercent),
    active: true,
    createdAt: new Date().toISOString(),
  };
  coupons.unshift(newCoupon);
  return res.status(201).json(newCoupon);
});

router.put('/coupons/:id', authMiddleware, adminMiddleware, (req, res) => {
  const idx = coupons.findIndex((c) => c._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Coupon not found' });
  coupons[idx] = { ...coupons[idx], ...req.body, _id: req.params.id };
  return res.json(coupons[idx]);
});

router.delete('/coupons/:id', authMiddleware, adminMiddleware, (req, res) => {
  const idx = coupons.findIndex((c) => c._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Coupon not found' });
  coupons.splice(idx, 1);
  return res.json({ message: 'Coupon deleted' });
});

router.post('/coupons/validate', authMiddleware, (req, res) => {
  const code = (req.body?.code || '').trim().toUpperCase();
  const coupon = coupons.find((c) => c.code === code && c.active);
  if (!coupon) return res.status(404).json({ message: 'Invalid or inactive coupon code' });
  return res.json({ code: coupon.code, discountPercent: coupon.discountPercent });
});

// ─── Orders ───────────────────────────────────────────────────────────────────
router.post('/orders', authMiddleware, (req, res) => {
  const { items, couponCode } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Order must contain at least one item' });
  }

  const orderLines = [];
  let grossSubtotal = 0;

  for (const line of items) {
    const product = products.find((p) => p._id === line.productId);
    if (!product) return res.status(404).json({ message: `Product ${line.productId} not found` });
    if (product.stock < line.quantity) return res.status(400).json({ message: `Not enough stock for ${product.name}` });

    const unitPrice = product.price - (product.price * (product.discountPercent || 0)) / 100;
    orderLines.push({ product: product._id, name: product.name, price: Math.round(unitPrice * 100) / 100, quantity: line.quantity });
    grossSubtotal += unitPrice * line.quantity;
    product.stock -= line.quantity;
  }

  let couponDiscount = 0;
  let registeredCoupon = null;

  if (couponCode && typeof couponCode === 'string') {
    const matchedCoupon = coupons.find((c) => c.code === couponCode.trim().toUpperCase() && c.active);
    if (matchedCoupon) {
      couponDiscount = (grossSubtotal * matchedCoupon.discountPercent) / 100;
      registeredCoupon = matchedCoupon.code;
    }
  }

  const round = (n) => Math.round(n * 100) / 100;
  const newOrder = {
    _id: uniqueId(),
    user: req.user.id,
    items: orderLines,
    subtotal: round(grossSubtotal),
    couponCode: registeredCoupon,
    discountAmount: round(couponDiscount),
    total: round(grossSubtotal - couponDiscount),
    status: 'placed',
    createdAt: new Date().toISOString(),
  };
  orders.push(newOrder);
  return res.status(201).json(newOrder);
});

router.get('/orders/myorders', authMiddleware, (req, res) => {
  const myOrders = orders.filter((o) => o.user === req.user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return res.json(myOrders);
});

router.get('/orders/:id', authMiddleware, (req, res) => {
  const order = orders.find((o) => o._id === req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.user !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to view this order' });
  }
  return res.json(order);
});

// ─── Admin ────────────────────────────────────────────────────────────────────
router.get('/admin/orders', authMiddleware, adminMiddleware, (_req, res) => {
  const enriched = orders
    .map((o) => {
      const user = users.find((u) => u._id === o.user);
      return { ...o, user: user ? { name: user.name, email: user.email } : { name: 'Unknown', email: '' } };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return res.json(enriched);
});

router.put('/admin/orders/:id/status', authMiddleware, adminMiddleware, (req, res) => {
  const { status } = req.body;
  const allowed = ['placed', 'shipped', 'delivered', 'cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ message: `status must be one of: ${allowed.join(', ')}` });

  const order = orders.find((o) => o._id === req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  order.status = status;
  return res.json(order);
});

router.get('/admin/analytics', authMiddleware, adminMiddleware, (_req, res) => {
  const totalOrders = orders.length;
  const totalSales = Math.round(orders.reduce((s, o) => s + o.total, 0) * 100) / 100;
  const totalProductsCount = products.length;

  const itemCounts = new Map();
  for (const order of orders) {
    for (const item of order.items) {
      itemCounts.set(item.name, (itemCounts.get(item.name) || 0) + item.quantity);
    }
  }
  const topProducts = Array.from(itemCounts.entries())
    .map(([name, quantitySold]) => ({ name, quantitySold }))
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 5);

  return res.json({ totalOrders, totalSales, totalProducts: totalProductsCount, topProducts });
});

module.exports = router;
