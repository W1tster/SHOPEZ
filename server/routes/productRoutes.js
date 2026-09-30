const express = require('express');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

/**
 * Builds a MongoDB filter object from request query parameters
 */
const constructCatalogFilter = ({ search, category, minPrice, maxPrice }) => {
  const criteria = {};

  if (search && search.trim()) {
    criteria.name = { $regex: search.trim(), $options: 'i' };
  }

  if (category && category.trim()) {
    criteria.category = category.trim();
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    criteria.price = {};
    if (minPrice !== undefined && minPrice !== '') {
      criteria.price.$gte = Number(minPrice);
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      criteria.price.$lte = Number(maxPrice);
    }
  }

  return criteria;
};

/**
 * Determines Mongoose sort criteria based on sorting string
 */
const determineSortOption = (sortParam) => {
  switch (sortParam) {
    case 'price_asc':
      return { price: 1 };
    case 'price_desc':
      return { price: -1 };
    case 'rating':
      return { avgRating: -1 };
    default:
      return { createdAt: -1 };
  }
};

// GET /api/products - Query and filter catalog products
router.get('/', async (req, res) => {
  try {
    const filter = constructCatalogFilter(req.query);
    const sortCriteria = determineSortOption(req.query.sort);

    const productCatalog = await Product.find(filter).sort(sortCriteria);
    return res.json(productCatalog);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
});

// GET /api/products/categories - Distinct categories for filter pills and select menus
router.get('/categories', async (req, res) => {
  try {
    const uniqueCategories = await Product.distinct('category');
    return res.json(uniqueCategories);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
});

// GET /api/products/:id - Single product details
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch product', error: error.message });
  }
});

// POST /api/products - Create a new product (Admin privileges required)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, stock, discountPercent } = req.body;

    if (!name || !description || price == null || !category) {
      return res.status(400).json({ message: 'name, description, price and category are required' });
    }

    const createdProduct = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category: category.trim(),
      imageUrl: imageUrl || '',
      stock: Number(stock) || 0,
      discountPercent: Number(discountPercent) || 0,
    });

    return res.status(201).json(createdProduct);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
});

// PUT /api/products/:id - Update existing product attributes (Admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json(updatedProduct);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
});

// DELETE /api/products/:id - Remove product from inventory (Admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const removedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!removedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json({ message: 'Product deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
});

module.exports = router;

