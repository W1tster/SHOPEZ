import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    api
      .get(`/orders/${id}`)
      .then((res) => {
        if (isMounted) setOrder(res.data);
      })
      .catch(() => {
        if (isMounted) setError('Could not locate that order receipt.');
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  function handleCopyOrderId() {
    if (order?._id) {
      navigator.clipboard.writeText(order._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger mx-auto" style={{ maxWidth: '480px' }}>
          {error}
        </div>
        <Link to="/" className="btn btn-shopez mt-3">
          Return to Catalog
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading receipt...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: '640px' }}>
      {/* Celebration Header */}
      <div className="text-center mb-4">
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 text-white"
          style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h2 className="fw-bold text-dark mb-1">Order Confirmed!</h2>
        <p className="text-muted small">
          Thank you for your purchase. We are preparing your items for simulated delivery.
        </p>

        {/* Order Reference Badge */}
        <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-light border mt-1">
          <span className="small text-muted">Order ID:</span>
          <span className="small fw-mono fw-bold text-dark">{order._id}</span>
          <button
            type="button"
            className="btn btn-sm btn-link p-0 text-primary text-decoration-none small"
            onClick={handleCopyOrderId}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Itemized Receipt Card */}
      <div className="card-shopez p-4 mb-4">
        <h6 className="fw-bold text-dark mb-3">Receipt Breakdown</h6>
        <div className="d-flex flex-column gap-2 mb-3">
          {order.items.map((item, idx) => (
            <div key={idx} className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <div>
                <span className="fw-semibold text-dark small">{item.name}</span>
                <span className="text-muted small ms-2">× {item.quantity}</span>
              </div>
              <span className="fw-bold text-dark small">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="d-flex justify-content-between text-secondary mb-2 small">
          <span>Subtotal</span>
          <span className="fw-semibold text-dark">${order.subtotal.toFixed(2)}</span>
        </div>

        {order.discountAmount > 0 && (
          <div className="d-flex justify-content-between text-success mb-2 small">
            <span>Promotion Savings ({order.couponCode})</span>
            <span className="fw-bold">-${order.discountAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="d-flex justify-content-between text-secondary mb-3 small">
          <span>Shipping</span>
          <span className="text-success fw-bold">FREE</span>
        </div>

        <hr className="my-2" style={{ borderColor: 'var(--border-color)' }} />

        <div className="d-flex justify-content-between align-items-baseline pt-2">
          <span className="fs-6 fw-bold text-dark">Total Paid</span>
          <span className="fs-4 fw-extrabold text-dark">${order.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex gap-3 justify-content-center">
        <Link to="/" className="btn btn-shopez px-4">
          Continue Shopping
        </Link>
        <Link to="/my-orders" className="btn btn-shopez-outline px-4">
          View My Orders
        </Link>
      </div>
    </div>
  );
}
