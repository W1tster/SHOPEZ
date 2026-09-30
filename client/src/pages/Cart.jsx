import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, clearCart, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  function handleCheckout() {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  }

  if (items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="card-shopez py-5 px-4 mx-auto my-4" style={{ maxWidth: '480px' }}>
          <div className="mb-3">
            <span style={{ fontSize: '3.5rem' }}>🛍️</span>
          </div>
          <h3 className="fw-bold text-dark mb-2">Your Shopping Cart is Empty</h3>
          <p className="text-muted small mb-4">
            Looks like you haven't added anything to your cart yet. Explore our curated collections to find what you love!
          </p>
          <div>
            <Link to="/" className="btn btn-shopez px-4">
              Explore Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Shopping Cart</h2>
          <span className="text-muted small">
            {items.length} unique item{items.length === 1 ? '' : 's'} in your bag
          </span>
        </div>
        <button
          className="btn btn-sm btn-link text-danger text-decoration-none"
          onClick={clearCart}
        >
          Clear Cart
        </button>
      </div>

      <div className="row g-4">
        {/* Cart Line Items Column */}
        <div className="col-12 col-lg-8">
          <div className="card-shopez overflow-hidden">
            <div className="table-responsive">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Price</th>
                    <th className="text-center">Quantity</th>
                    <th className="text-end">Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((lineItem) => {
                    const discountFactor = Number(lineItem.discountPercent) || 0;
                    const effectiveUnitPrice = lineItem.price - (lineItem.price * discountFactor) / 100;
                    const lineTotal = effectiveUnitPrice * lineItem.quantity;

                    return (
                      <tr key={lineItem.productId}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={lineItem.imageUrl || `https://picsum.photos/seed/${lineItem.productId}/100/100`}
                              alt={lineItem.name}
                              style={{
                                width: '56px',
                                height: '56px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                background: '#f1f5f9',
                              }}
                              onError={(e) => {
                                e.currentTarget.src = 'https://picsum.photos/seed/placeholder/100/100';
                              }}
                            />
                            <div>
                              <Link
                                to={`/products/${lineItem.productId}`}
                                className="fw-semibold text-dark text-decoration-none small text-truncate d-block"
                                style={{ maxWidth: '240px' }}
                              >
                                {lineItem.name}
                              </Link>
                              {discountFactor > 0 && (
                                <span className="badge bg-danger-subtle text-danger" style={{ fontSize: '0.65rem' }}>
                                  {discountFactor}% off promo
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="small fw-semibold text-secondary">
                          ${effectiveUnitPrice.toFixed(2)}
                        </td>

                        <td>
                          <div className="d-flex align-items-center justify-content-center mx-auto border rounded-3 p-1" style={{ width: '90px' }}>
                            <button
                              type="button"
                              className="btn btn-sm btn-link text-dark text-decoration-none p-0 px-1"
                              onClick={() => updateQuantity(lineItem.productId, Math.max(1, lineItem.quantity - 1))}
                            >
                              –
                            </button>
                            <input
                              type="number"
                              min="1"
                              className="form-control text-center border-0 p-0 shadow-none fw-bold"
                              style={{ width: '32px', fontSize: '0.88rem' }}
                              value={lineItem.quantity}
                              onChange={(e) => updateQuantity(lineItem.productId, Math.max(1, Number(e.target.value) || 1))}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-link text-dark text-decoration-none p-0 px-1"
                              onClick={() => updateQuantity(lineItem.productId, lineItem.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        </td>

                        <td className="text-end fw-bold text-dark">
                          ${lineTotal.toFixed(2)}
                        </td>

                        <td className="text-end pe-3">
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-danger p-0"
                            onClick={() => removeFromCart(lineItem.productId)}
                            title="Remove item from cart"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3">
            <Link to="/" className="text-decoration-none small text-muted d-inline-flex align-items-center gap-1">
              <span>← Continue browsing catalog</span>
            </Link>
          </div>
        </div>

        {/* Order Summary Column */}
        <div className="col-12 col-lg-4">
          <div className="card-shopez p-4 sticky-top" style={{ top: '80px' }}>
            <h5 className="fw-bold text-dark mb-3">Order Summary</h5>

            <div className="d-flex justify-content-between text-secondary mb-2 small">
              <span>Estimated Subtotal</span>
              <span className="fw-semibold text-dark">${subtotal.toFixed(2)}</span>
            </div>

            <div className="d-flex justify-content-between text-secondary mb-3 small">
              <span>Estimated Standard Shipping</span>
              <span className="text-success fw-bold">FREE</span>
            </div>

            <div className="p-2 rounded-3 mb-3 d-flex align-items-center gap-2 small" style={{ background: '#ecfdf5', color: '#065f46' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Complimentary free delivery applied</span>
            </div>

            <hr className="my-3" style={{ borderColor: 'var(--border-color)' }} />

            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="fs-6 fw-semibold text-dark">Estimated Total</span>
              <span className="fs-4 fw-extrabold text-dark">${subtotal.toFixed(2)}</span>
            </div>

            <button className="btn btn-shopez w-100 py-2 fs-6 mb-3" onClick={handleCheckout}>
              <span>Proceed to Checkout</span>
              <span>→</span>
            </button>

            {!user && (
              <p className="text-muted text-center small mb-0">
                You will be prompted to log in before completing your order.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
