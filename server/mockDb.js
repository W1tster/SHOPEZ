const bcrypt = require('bcryptjs');

// In-memory demo store used whenever a local/remote MongoDB instance is offline
const demoProducts = [
  {
    _id: '66a000000000000000000001',
    name: 'Wireless Noise-Canceling Headphones',
    description: 'Over-ear Bluetooth headphones with adaptive noise cancellation and 40h battery life.',
    price: 79.99,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    stock: 25,
    discountPercent: 10,
    avgRating: 4.8,
    numReviews: 12,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '66a000000000000000000002',
    name: 'Pro Performance Running Shoes',
    description: 'Engineered lightweight athletic footwear featuring breathable mesh and responsive cushioning.',
    price: 59.99,
    category: 'Footwear',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    stock: 40,
    discountPercent: 0,
    avgRating: 4.6,
    numReviews: 8,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '66a000000000000000000003',
    name: 'Insulated Stainless Steel Bottle (1L)',
    description: 'Double-wall vacuum flask keeping beverages ice-cold for 24 hours or steaming hot for 12 hours.',
    price: 19.99,
    category: 'Home & Kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
    stock: 100,
    discountPercent: 5,
    avgRating: 4.9,
    numReviews: 19,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '66a000000000000000000004',
    name: 'Tactile Mechanical Keyboard',
    description: 'Custom compact RGB backlit mechanical keyboard with hot-swappable tactile switches.',
    price: 89.99,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=80',
    stock: 15,
    discountPercent: 0,
    avgRating: 4.7,
    numReviews: 14,
    createdAt: new Date().toISOString(),
  },
];

const demoCoupons = [
  {
    _id: '66c000000000000000000001',
    code: 'WELCOME10',
    discountPercent: 10,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '66c000000000000000000002',
    code: 'FLASH20',
    discountPercent: 20,
    active: true,
    createdAt: new Date().toISOString(),
  },
];

const demoUsers = [
  {
    _id: '66b000000000000000000001',
    name: 'Store Admin',
    email: 'admin@shopez.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
];

const demoOrders = [];
const demoReviews = [
  {
    _id: '66d000000000000000000001',
    product: '66a000000000000000000001',
    user: '66b000000000000000000001',
    userName: 'Store Admin',
    rating: 5,
    comment: 'Exceptional sound clarity and extremely comfortable during long work sessions.',
    createdAt: new Date().toISOString(),
  },
];

module.exports = {
  demoProducts,
  demoCoupons,
  demoUsers,
  demoOrders,
  demoReviews,
};
