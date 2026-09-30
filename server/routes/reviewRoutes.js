const express = require('express');
const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * Computes average star rating rounded to one decimal place
 */
const calculateAverageRating = (reviewsList = []) => {
  if (!reviewsList.length) return 0;
  const ratingSum = reviewsList.reduce((acc, curr) => acc + curr.rating, 0);
  return Math.round((ratingSum / reviewsList.length) * 10) / 10;
};

// GET /api/reviews/product/:productId - Retrieve customer feedback for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const feedbackList = await Review.find({ product: req.params.productId }).sort({
      createdAt: -1,
    });
    return res.json(feedbackList);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
});

// POST /api/reviews - Submit customer review and re-compute product rating stats
router.post('/', protect, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating) {
      return res.status(400).json({ message: 'productId and rating are required' });
    }

    const targetProduct = await Product.findById(productId);
    if (!targetProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const reviewerProfile = await User.findById(req.user.id);

    const createdReview = await Review.create({
      product: productId,
      user: req.user.id,
      userName: reviewerProfile ? reviewerProfile.name : 'Anonymous Buyer',
      rating: Number(rating),
      comment: (comment || '').trim(),
    });

    // Refresh aggregated ratings on product document
    const updatedReviewCollection = await Review.find({ product: productId });
    targetProduct.numReviews = updatedReviewCollection.length;
    targetProduct.avgRating = calculateAverageRating(updatedReviewCollection);
    await targetProduct.save();

    return res.status(201).json(createdReview);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add review', error: error.message });
  }
});

module.exports = router;

