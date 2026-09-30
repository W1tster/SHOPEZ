const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * Rounds monetary amounts to 2 decimal places
 */
const roundMoney = (amount) => Math.round(amount * 100) / 100;

/**
 * Computes discounted unit price for an inventory item
 */
const computeEffectivePrice = (originalPrice, discountPercentage = 0) => {
  const discountFactor = (originalPrice * discountPercentage) / 100;
  return originalPrice - discountFactor;
};

// POST /api/orders - Process checkout order and deplete inventory
router.post('/', protect, async (req, res) => {
  try {
    const { items, couponCode } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    const orderLines = [];
    let grossSubtotal = 0;

    // Validate inventory and prepare order line items
    for (const line of items) {
      const product = await Product.findById(line.productId);

      if (!product) {
        return res.status(404).json({ message: `Product ${line.productId} not found` });
      }

      if (product.stock < line.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${product.name}` });
      }

      const unitPrice = computeEffectivePrice(product.price, product.discountPercent);

      orderLines.push({
        product: product._id,
        name: product.name,
        price: roundMoney(unitPrice),
        quantity: line.quantity,
      });

      grossSubtotal += unitPrice * line.quantity;

      // Decrement inventory stock
      product.stock -= line.quantity;
      await product.save();
    }

    let couponDiscount = 0;
    let registeredCoupon = null;

    if (couponCode && typeof couponCode === 'string') {
      const matchedCoupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
        active: true,
      });

      if (matchedCoupon) {
        couponDiscount = (grossSubtotal * matchedCoupon.discountPercent) / 100;
        registeredCoupon = matchedCoupon.code;
      }
    }

    const finalPayableTotal = roundMoney(grossSubtotal - couponDiscount);

    const createdOrder = await Order.create({
      user: req.user.id,
      items: orderLines,
      subtotal: roundMoney(grossSubtotal),
      couponCode: registeredCoupon,
      discountAmount: roundMoney(couponDiscount),
      total: finalPayableTotal,
      status: 'placed',
    });

    return res.status(201).json(createdOrder);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to place order', error: error.message });
  }
});

// GET /api/orders/myorders - Fetch customer purchase history
router.get('/myorders', protect, async (req, res) => {
  try {
    const customerOrders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.json(customerOrders);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
});

// GET /api/orders/:id - Retrieve order receipt details
router.get('/:id', protect, async (req, res) => {
  try {
    const matchedOrder = await Order.findById(req.params.id);

    if (!matchedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const isOrderOwner = matchedOrder.user.toString() === req.user.id;
    const isStaffAdmin = req.user.role === 'admin';

    if (!isOrderOwner && !isStaffAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    return res.json(matchedOrder);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
});

module.exports = router;

