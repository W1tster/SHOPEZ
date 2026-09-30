import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');

  const discountAmount = appliedCoupon
    ? (subtotal * appliedCoupon.discountPercent) / 100
    : 0;
  const finalPayableTotal = Math.max(0, subtotal - discountAmount);

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setCouponError('');
    setAppliedCoupon(null);
    try {
      const { data } = await api.post('/coupons/validate', { code: couponCode.trim() });
      setAppliedCoupon(data);
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid or expired coupon');
    }
  }

  async function handlePlaceOrder() {
    setPlacingOrder(true);
    setOrderError('');
    try {
      const { data } = await api.post('/orders', {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      });
      clearCart();
      navigate(`/order-confirmation/${data._id}`);
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="card-shopez py-5 px-4 mx-auto" style={{ maxWidth: '460px' }}>
          <h4 className="fw-bold mb-3 text-dark">Your cart is currently empty</h4>
          <p className="text-muted small mb-4">Please add products before heading to checkout.</p>
          <Link to="/" className="btn btn-shopez">Browse Catalog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Checkout Progress Stepper */}
      <div className="d-flex align-items-center justify-content-center gap-2 gap-sm-4 mb-4 pb-2 text-center small fw-semibold">
        <span className="text-muted d-flex align-items-center gap-1">
          <span className="badge rounded-circle bg-success text-white p-1">✓</span>
          <span>1. Cart</span>
        </span>
        <span className="text-muted">⎯⎯</span>
        <span className="text-primary d-flex align-items-center gap-1 fw-bold">
          <span className="badge rounded-circle text-white p-1" style={{ background: 'var(--brand-gradient)' }}>2</span>
          <span>2. Payment Simulation</span>
        </span>
        <span className="text-muted">⎯⎯</span>
        <span className="text-muted d-flex align-items-center gap-1">
          <span className="badge rounded-circle bg-light text-muted p-1">3</span>
          <span>3. Receipt</span>
        </span>
      </div>

      <div className="row g-4">
        {/* Left Column: Items and Payment Simulation */}
        <div className="col-12 col-lg-7">
          {/* Order Items Review */}
          <div className="card-shopez p-4 mb-4">
            <h5 className="fw-bold text-dark mb-3">Order Items ({items.length})</h5>
            <div className="d-flex flex-column gap-3">
              {items.map((item) => {
                const discount = Number(item.discountPercent) || 0;
                const effective = item.price - (item.price * discount) / 100;
                return (
                  <div key={item.productId} className="d-flex align-items-center justify-content-between border-bottom pb-2">
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={item.imageUrl || `https://picsum.photos/seed/${item.productId}/80/80`}
                        alt={item.name}
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }}
                        onError={(e) => {
                          e.currentTarget.src = 'https://picsum.photos/seed/placeholder/80/80';
                        }}
                      />
                      <div>
                        <div className="fw-semibold text-dark small">{item.name}</div>
                        <div className="text-muted small">Qty: {item.quantity} × ${effective.toFixed(2)}</div>
                      </div>
                    </div>
                    <span className="fw-bold text-dark small">${(effective * item.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Promotional Voucher Card */}
          <div className="card-shopez p-4 mb-4">
            <h6 className="fw-bold text-dark mb-2">Have a Promotional Code?</h6>
            <p className="text-muted small mb-3">
              Try code <span className="badge bg-light text-primary border">WELCOME10</span> for 10% off your total purchase!
            </p>
            <div className="input-group">
              <input
                className="form-control"
                placeholder="e.g. WELCOME10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button
                className="btn btn-shopez-outline"
                type="button"
                onClick={handleApplyCoupon}
              >
                Apply Coupon
              </button>
            </div>
            {couponError && <div className="text-danger small mt-2">{couponError}</div>}
            {appliedCoupon && (
              <div className="alert alert-success py-2 px-3 small mt-2 mb-0 rounded-3 d-flex align-items-center justify-content-between">
                <span>🎉 Promo code <strong>{appliedCoupon.code}</strong> applied ({appliedCoupon.discountPercent}% discount)!</span>
                <span className="fw-bold">-${discountAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Simulated Gateway Mock Card */}
          <div className="card-shopez p-4" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="small text-uppercase tracking-wider fw-bold text-indigo" style={{ color: '#818cf8' }}>
                Simulated Payment Gateway
              </span>
              <span className="badge bg-success-subtle text-success">Mock Sandbox Mode</span>
            </div>
            <div className="fs-6 fw-mono mb-2" style={{ letterSpacing: '0.15em' }}>
              •••• •••• •••• 4242
            </div>
            <div className="d-flex justify-content-between text-muted small">
              <span>Cardholder: Demo Customer</span>
              <span>Expires: 12/28</span>
            </div>
            <div className="mt-3 pt-3 border-top border-secondary small text-light opacity-75">
              💡 No real payment or credit card is processed. Clicking "Authorize Order" safely simulates a successful payment transaction.
            </div>
          </div>
        </div>

        {/* Right Column: Order Calculation & Payment Authorization */}
        <div className="col-12 col-lg-5">
          <div className="card-shopez p-4 sticky-top" style={{ top: '80px' }}>
            <h5 className="fw-bold text-dark mb-4">Payment Summary</h5>

            <div className="d-flex justify-content-between text-secondary mb-2 small">
              <span>Merchandise Subtotal</span>
              <span className="fw-semibold text-dark">${subtotal.toFixed(2)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="d-flex justify-content-between text-success mb-2 small">
                <span>Coupon Discount ({appliedCoupon?.code})</span>
                <span className="fw-bold">-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="d-flex justify-content-between text-secondary mb-3 small">
              <span>Express Delivery</span>
              <span className="text-success fw-bold">FREE</span>
            </div>

            <hr className="my-3" style={{ borderColor: 'var(--border-color)' }} />

            <div className="d-flex justify-content-between align-items-baseline mb-4">
              <span className="fs-6 fw-bold text-dark">Total Amount Due</span>
              <span className="fs-3 fw-extrabold text-dark">${finalPayableTotal.toFixed(2)}</span>
            </div>

            {orderError && (
              <div className="alert alert-danger py-2 small rounded-3 mb-3">
                {orderError}
              </div>
            )}

            <button
              className="btn btn-shopez w-100 py-3 fs-6"
              onClick={handlePlaceOrder}
              disabled={placingOrder}
            >
              {placingOrder ? (
                <span className="d-flex align-items-center justify-content-center gap-2">
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Processing Mock Order...</span>
                </span>
              ) : (
                <span>Authorize & Place Order (${finalPayableTotal.toFixed(2)})</span>
              )}
            </button>

            <div className="text-center text-muted small mt-3 d-flex align-items-center justify-content-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span>Instant order confirmation & tracking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
