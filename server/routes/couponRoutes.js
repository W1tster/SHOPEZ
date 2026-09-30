const express = require('express');
const Coupon = require('../models/Coupon');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/coupons - List all discount promotions (Admin only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const promotionCoupons = await Coupon.find().sort({ createdAt: -1 });
    return res.json(promotionCoupons);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch coupons', error: error.message });
  }
});

// POST /api/coupons - Create a new discount promo code (Admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { code, discountPercent } = req.body;

    if (!code || !discountPercent) {
      return res.status(400).json({ message: 'code and discountPercent are required' });
    }

    const sanitizedCode = code.trim().toUpperCase();
    const existingCoupon = await Coupon.findOne({ code: sanitizedCode });

    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const createdCoupon = await Coupon.create({
      code: sanitizedCode,
      discountPercent: Number(discountPercent),
    });

    return res.status(201).json(createdCoupon);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create coupon', error: error.message });
  }
});

// PUT /api/coupons/:id - Modify promo active state or attributes (Admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const modifiedCoupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!modifiedCoupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    return res.json(modifiedCoupon);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update coupon', error: error.message });
  }
});

// DELETE /api/coupons/:id - Remove coupon voucher (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!deletedCoupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    return res.json({ message: 'Coupon deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete coupon', error: error.message });
  }
});

// POST /api/coupons/validate - Check coupon validity during customer checkout
router.post('/validate', protect, async (req, res) => {
  try {
    const inputCode = (req.body?.code || '').trim().toUpperCase();
    const matchingCoupon = await Coupon.findOne({ code: inputCode, active: true });

    if (!matchingCoupon) {
      return res.status(404).json({ message: 'Invalid or inactive coupon code' });
    }

    return res.json({
      code: matchingCoupon.code,
      discountPercent: matchingCoupon.discountPercent,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to validate coupon', error: error.message });
  }
});

module.exports = router;

