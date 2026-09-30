const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Enforce authentication & admin privilege across all administrative endpoints
router.use(protect, adminOnly);

const VALID_ORDER_STATUSES = ['placed', 'shipped', 'delivered', 'cancelled'];

/**
 * Aggregates item sales volume across orders and returns top 5 performers
 */
const aggregateTopSellingProducts = (orders = []) => {
  const itemCounts = new Map();

  for (const order of orders) {
    if (!Array.isArray(order.items)) continue;
    for (const item of order.items) {
      const currentCount = itemCounts.get(item.name) || 0;
      itemCounts.set(item.name, currentCount + item.quantity);
    }
  }

  return Array.from(itemCounts.entries())
    .map(([name, quantitySold]) => ({ name, quantitySold }))
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 5);
};

// GET /api/admin/orders - Retrieve complete history of all customer orders
router.get('/orders', async (req, res) => {
  try {
    const allCustomerOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    return res.json(allCustomerOrders);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
});

// PUT /api/admin/orders/:id/status - Update shipping or fulfillment status
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!VALID_ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `status must be one of: ${VALID_ORDER_STATUSES.join(', ')}`,
      });
    }

    const modifiedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!modifiedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.json(modifiedOrder);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
});

// GET /api/admin/analytics - Calculate high-level business revenue KPIs
router.get('/analytics', async (req, res) => {
  try {
    const ordersList = await Order.find();
    const totalOrdersCount = ordersList.length;

    const cumulativeSales = ordersList.reduce((acc, order) => acc + (order.total || 0), 0);
    const totalCatalogItems = await Product.countDocuments();
    const topPerformingProducts = aggregateTopSellingProducts(ordersList);

    return res.json({
      totalOrders: totalOrdersCount,
      totalSales: Math.round(cumulativeSales * 100) / 100,
      totalProducts: totalCatalogItems,
      topProducts: topPerformingProducts,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
});

module.exports = router;

