import { Link } from 'react-router-dom';
import StarRating from './StarRating';

export default function ProductCard({ product }) {
  const discountRate = Number(product.discountPercent) || 0;
  const hasDiscount = discountRate > 0;
  const discountedPrice = product.price - (product.price * discountRate) / 100;
  const imageSource = product.imageUrl || `https://picsum.photos/seed/${product._id || 'shopez'}/400/300`;

  return (
    <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
      <div className="card-shopez card-shopez-hoverable h-100 product-card-wrap">
        {/* Image Box */}
        <div className="product-img-box">
          <img
            src={imageSource}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = 'https://picsum.photos/seed/placeholder/400/300';
            }}
          />
          {hasDiscount && (
            <span className="badge-discount-chip">
              -{discountRate}% OFF
            </span>
          )}
          {product.category && (
            <span className="badge-category-chip">
              {product.category}
            </span>
          )}
        </div>

        {/* Card Body Content */}
        <div className="p-3 d-flex flex-column flex-grow-1">
          <div className="mb-2">
            <StarRating rating={product.avgRating} numReviews={product.numReviews} showScore={false} />
          </div>

          <h6
            className="fw-bold text-dark mb-2 text-truncate"
            title={product.name}
            style={{ fontSize: '0.96rem' }}
          >
            {product.name}
          </h6>

          <div className="d-flex align-items-baseline gap-1 mt-auto pt-2 mb-3">
            <span className="price-highlight-bold">
              ${discountedPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="price-original-struck">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          <Link
            to={`/products/${product._id}`}
            className="btn btn-shopez-outline btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
          >
            <span>View Details</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
