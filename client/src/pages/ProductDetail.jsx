import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import StarRating from '../components/StarRating';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successBanner, setSuccessBanner] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  function loadReviews() {
    api
      .get(`/reviews/product/${id}`)
      .then((res) => {
        if (Array.isArray(res.data)) setReviews(res.data);
      })
      .catch(() => {});
  }

  useEffect(() => {
    let isMounted = true;
    api
      .get(`/products/${id}`)
      .then((res) => {
        if (isMounted) setProduct(res.data);
      })
      .catch(() => {
        if (isMounted) setErrorMessage('Product not found or unavailable');
      });

    loadReviews();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function handleAddToCart() {
    if (!product) return;
    addToCart(product, Math.max(1, Number(quantity)));
    setSuccessBanner(`Added ${quantity} unit(s) of "${product.name}" to your cart!`);
    setTimeout(() => setSuccessBanner(''), 3000);
  }

  async function handleSubmitReview(e) {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        productId: id,
        rating: Number(rating),
        comment: comment.trim(),
      });
      setComment('');
      setRating(5);
      loadReviews();
      api.get(`/products/${id}`).then((res) => setProduct(res.data));
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  }

  if (errorMessage && !product) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger mx-auto" style={{ maxWidth: '500px' }}>
          {errorMessage}
        </div>
        <Link to="/" className="btn btn-shopez mt-3">
          Back to Catalog
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading product...</span>
        </div>
      </div>
    );
  }

  const discountRate = Number(product.discountPercent) || 0;
  const hasDiscount = discountRate > 0;
  const effectivePrice = product.price - (product.price * discountRate) / 100;
  const totalSavings = hasDiscount ? (product.price * discountRate) / 100 : 0;
  const isInStock = product.stock > 0;

  return (
    <div className="container py-4">
      {/* Breadcrumb Trail */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none text-muted">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none text-muted">Catalog</Link>
          </li>
          <li className="breadcrumb-item active text-dark fw-medium" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Main Showcase Grid */}
      <div className="row g-4 mb-5">
        {/* Product Media Column */}
        <div className="col-12 col-md-6 col-lg-5">
          <div className="card-shopez position-relative p-2" style={{ backgroundColor: '#ffffff' }}>
            <div
              style={{
                height: '380px',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={product.imageUrl || `https://picsum.photos/seed/${product._id}/600/500`}
                alt={product.name}
                className="img-fluid w-100 h-100"
                style={{ objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.src = 'https://picsum.photos/seed/placeholder/600/500';
                }}
              />
            </div>
            {hasDiscount && (
              <span className="badge-discount-chip" style={{ top: '18px', right: '18px' }}>
                Save {discountRate}%
              </span>
            )}
          </div>
        </div>

        {/* Product Details & Actions Column */}
        <div className="col-12 col-md-6 col-lg-7">
          <div className="ps-lg-3">
            {/* Category tag */}
            <span
              className="badge px-3 py-2 rounded-pill mb-2 fw-semibold"
              style={{ background: '#eef2ff', color: '#4f46e5' }}
            >
              {product.category}
            </span>

            {/* Title */}
            <h1 className="fw-bold text-dark mb-2 tracking-tight" style={{ fontSize: '1.85rem' }}>
              {product.name}
            </h1>

            {/* Star Rating Overview */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <StarRating rating={product.avgRating} numReviews={product.numReviews} showScore={true} />
            </div>

            {/* Price Box */}
            <div className="p-3 rounded-3 mb-4 d-inline-flex align-items-baseline gap-2 flex-wrap" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <span className="fs-2 fw-extrabold text-dark" style={{ letterSpacing: '-0.02em' }}>
                ${effectivePrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-muted text-decoration-line-through fs-5 ms-1">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="badge bg-danger ms-2">
                    Save ${totalSavings.toFixed(2)}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-secondary leading-relaxed mb-4" style={{ lineHeight: '1.7' }}>
              {product.description}
            </p>

            {/* Stock Availability */}
            <div className="d-flex align-items-center gap-2 mb-4">
              {isInStock ? (
                <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill" style={{ background: '#ecfdf5', color: '#065f46', fontSize: '0.85rem', fontWeight: 600 }}>
                  <span className="pulse-dot"></span>
                  <span>In Stock ({product.stock} units available)</span>
                </div>
              ) : (
                <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-danger-subtle text-danger" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  <span>Out of stock</span>
                </div>
              )}
            </div>

            {/* Purchasing Stepper & Cart Action */}
            {isInStock && (
              <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                <div className="d-flex align-items-center border rounded-3 p-1" style={{ borderColor: 'var(--border-color)', background: '#fff' }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-dark text-decoration-none px-2 py-1"
                    onClick={() => setQuantity((q) => Math.max(1, Number(q) - 1))}
                  >
                    –
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    className="form-control text-center border-0 p-0 shadow-none fw-bold"
                    style={{ width: '45px', fontSize: '1rem' }}
                    value={quantity}
                    onChange={(e) => {
                      const val = Math.max(1, Math.min(product.stock, Number(e.target.value) || 1));
                      setQuantity(val);
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-dark text-decoration-none px-2 py-1"
                    onClick={() => setQuantity((q) => Math.min(product.stock, Number(q) + 1))}
                  >
                    +
                  </button>
                </div>

                <button className="btn btn-shopez px-4 py-2" onClick={handleAddToCart}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  <span>Add to Cart</span>
                </button>
              </div>
            )}

            {/* Success Toast */}
            {successBanner && (
              <div className="alert alert-success d-flex align-items-center justify-content-between py-2 px-3 rounded-3" role="alert">
                <span>{successBanner}</span>
                <Link to="/cart" className="btn btn-sm btn-success py-1 px-2 fw-semibold ms-2">
                  View Cart
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <hr className="my-5" style={{ borderColor: 'var(--border-color)' }} />

      {/* Customer Reviews Section */}
      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h4 className="fw-bold mb-0 text-dark">Verified Customer Reviews</h4>
            <span className="text-muted small">
              {reviews.length} total feedback
            </span>
          </div>

          {reviews.length === 0 ? (
            <div className="card-shopez p-4 text-center text-muted">
              No customer reviews yet. Be the first to share your experience!
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {reviews.map((rev) => (
                <div key={rev._id} className="card-shopez p-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{ width: '32px', height: '32px', background: '#3b82f6', fontSize: '0.8rem' }}
                      >
                        {(rev.userName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-bold text-dark small">{rev.userName}</div>
                        <span className="badge bg-light text-muted border" style={{ fontSize: '0.65rem' }}>
                          Verified Purchase
                        </span>
                      </div>
                    </div>
                    <StarRating rating={rev.rating} />
                  </div>
                  <p className="mb-0 text-secondary small" style={{ lineHeight: '1.5' }}>
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leave a Review Form Column */}
        <div className="col-12 col-lg-5">
          <div className="card-shopez p-4 sticky-top" style={{ top: '80px' }}>
            <h5 className="fw-bold text-dark mb-3">Share Your Experience</h5>
            {user ? (
              <form onSubmit={handleSubmitReview}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">
                    Your Rating
                  </label>
                  <select
                    className="form-select"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 - Exceptional)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                    <option value={3}>⭐⭐⭐ (3 - Average)</option>
                    <option value={2}>⭐⭐ (2 - Below Expectations)</option>
                    <option value={1}>⭐ (1 - Unsatisfactory)</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">
                    Your Review
                  </label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Tell us about the build quality, performance, and features..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                </div>

                <button
                  className="btn btn-shopez w-100"
                  type="submit"
                  disabled={submittingReview}
                >
                  {submittingReview ? 'Submitting...' : 'Post Customer Review'}
                </button>
              </form>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted small mb-3">
                  You need to be signed in to submit a verified product review.
                </p>
                <button
                  className="btn btn-shopez-outline btn-sm w-100"
                  onClick={() => navigate('/login')}
                >
                  Sign In to Review
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
