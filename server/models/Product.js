const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: '' },
    stock: { type: Number, required: true, min: 0, default: 0 },
    discountPercent: { type: Number, min: 0, max: 100, default: 0 },
    avgRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// speeds up catalog search/filter by name and category
productSchema.index({ name: 'text', category: 1 });

module.exports = mongoose.model('Product', productSchema);
