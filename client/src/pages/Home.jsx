import { useEffect, useState, useMemo } from 'react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch available product categories once on mount
  useEffect(() => {
    let isMounted = true;
    api
      .get('/products/categories')
      .then((res) => {
        if (isMounted && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch product catalog whenever search, category, or sort changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const queryParams = {};
    if (search.trim()) queryParams.search = search.trim();
    if (selectedCategory) queryParams.category = selectedCategory;
    if (sortOption) queryParams.sort = sortOption;

    api
      .get('/products', { params: queryParams })
      .then((res) => {
        if (isMounted) {
          setProducts(res.data);
          setErrorMessage('');
        }
      })
      .catch(() => {
        if (isMounted) {
          setErrorMessage('Could not load products. Please check if the backend server is running.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [search, selectedCategory, sortOption]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count++;
    if (selectedCategory) count++;
    if (sortOption) count++;
    return count;
  }, [search, selectedCategory, sortOption]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSortOption('');
  };

  return (
    <div className="container py-4">
      {/* Hero Banner Showcase */}
      <div className="hero-banner">
        <div className="row align-items-center">
          <div className="col-lg-8">
            <div className="hero-pill-badge">
              <span className="pulse-dot"></span>
              <span>ShopEZ Curated Collection 2026</span>
            </div>
            <h1 className="display-5 fw-extrabold mb-3 text-white tracking-tight" style={{ fontWeight: 800 }}>
              Elevate Your Everyday Essentials
            </h1>
            <p className="text-light opacity-75 fs-6 mb-4 pe-lg-5">
              Explore high-performance audio, premium footwear, modern work tools, and kitchen gear.
              Fast mock checkout, verified reviews, and guaranteed satisfaction.
            </p>

            <div className="d-flex flex-wrap gap-3 text-light small fw-medium">
              <div className="d-flex align-items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                <span>Instant simulated dispatch</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span>Safe demo checkout</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <span>Real verified customer reviews</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Search & Filtering Header */}
      <div className="card-shopez p-3 p-md-4 mb-4">
        <div className="row g-3 align-items-center">
          {/* Search Input with Icon */}
          <div className="col-12 col-md-5">
            <div className="position-relative">
              <input
                className="form-control ps-4"
                placeholder="Search products by keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted text-decoration-none pe-3"
                  onClick={() => setSearch('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="col-6 col-md-3">
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="col-6 col-md-4">
            <select
              className="form-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="">Sort: Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
            </select>
          </div>
        </div>

        {/* Quick Category Filter Pills */}
        <div className="d-flex align-items-center gap-2 mt-3 pt-3 border-top overflow-auto pb-1">
          <span className="small text-muted fw-semibold me-1 text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
            Quick:
          </span>
          <button
            type="button"
            className={`filter-pill ${selectedCategory === '' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('')}
          >
            All Items
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={`filter-pill ${selectedCategory === c ? 'active' : ''}`}
              onClick={() => setSelectedCategory(c === selectedCategory ? '' : c)}
            >
              {c}
            </button>
          ))}

          {activeFilterCount > 0 && (
            <button
              type="button"
              className="btn btn-link btn-sm text-danger text-decoration-none ms-auto small"
              onClick={handleResetFilters}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Catalog Status and Items Count */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0 text-dark" style={{ letterSpacing: '-0.02em' }}>
          {selectedCategory ? `${selectedCategory}` : 'Featured Catalog'}
        </h4>
        {!loading && (
          <span className="small text-muted fw-medium">
            {products.length} item{products.length === 1 ? '' : 's'} available
          </span>
        )}
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="alert alert-danger rounded-3 mb-4 p-3" role="alert">
          <div className="d-flex align-items-center justify-content-between">
            <span className="fw-bold d-flex align-items-center gap-2">
              <span>⚠️</span>
              <span>Could not reach the ShopEZ server — make sure it's running on port 5000</span>
            </span>
            <button
              className="btn btn-outline-danger btn-sm ms-3"
              onClick={() => {
                setLoading(true);
                setErrorMessage('');
                api
                  .get('/products')
                  .then((res) => { setProducts(res.data); setLoading(false); })
                  .catch(() => { setErrorMessage('Server still unreachable'); setLoading(false); });
              }}
            >
              Retry
            </button>
          </div>
        </div>
      )}


      {/* Loading Skeletons */}
      {loading && (
        <div className="row">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
              <div className="skeleton-card"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !errorMessage && products.length === 0 && (
        <div className="card-shopez text-center py-5 px-3 my-4">
          <div className="mb-3">
            <span style={{ fontSize: '3rem' }}>🔍</span>
          </div>
          <h5 className="fw-bold text-dark">No products found</h5>
          <p className="text-muted small mx-auto" style={{ maxWidth: '380px' }}>
            We couldn't find any products matching your current search or filter criteria. Try adjusting your query.
          </p>
          <div>
            <button className="btn btn-shopez btn-sm" onClick={handleResetFilters}>
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !errorMessage && (
        <div className="row">
          {products.map((item) => (
            <ProductCard key={item._id} product={item} />
          ))}
        </div>
      )}
    </div>
  );
}
