import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const STATUS_CONFIG = {
  placed: { label: 'Placed', bg: '#dbeafe', color: '#1e40af' },
  shipped: { label: 'Shipped', bg: '#f3e8ff', color: '#6b21a8' },
  delivered: { label: 'Delivered', bg: '#dcfce7', color: '#166534' },
  cancelled: { label: 'Cancelled', bg: '#fee2e2', color: '#991b1b' },
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api
      .get('/orders/myorders')
      .then((res) => {
        if (isMounted && Array.isArray(res.data)) {
          setOrders(res.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">My Orders</h2>
        <span className="text-muted small">
          Track fulfillment status and review purchase receipts
        </span>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading your orders...</span>
          </div>
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="card-shopez p-5 text-center my-4 mx-auto" style={{ maxWidth: '480px' }}>
          <div className="mb-3" style={{ fontSize: '3rem' }}>📦</div>
          <h4 className="fw-bold text-dark mb-2">No Orders Found</h4>
          <p className="text-muted small mb-4">
            You haven't placed any orders yet. Discover our catalog and find everyday favorites!
          </p>
          <Link to="/" className="btn btn-shopez px-4">
            Start Shopping
          </Link>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="d-flex flex-column gap-3">
          {orders.map((order) => {
            const statusMeta = STATUS_CONFIG[order.status] || {
              label: order.status,
              bg: '#f1f5f9',
              color: '#334155',
            };

            return (
              <div key={order._id} className="card-shopez p-4">
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3 pb-3 border-bottom">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="fw-bold text-dark">Order</span>
                      <span className="fw-mono small text-muted">#{order._id}</span>
                    </div>
                    <div className="text-muted small">
                      Placed on {new Date(order.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  <span
                    className="badge px-3 py-2 rounded-pill fw-semibold text-uppercase"
                    style={{
                      backgroundColor: statusMeta.bg,
                      color: statusMeta.color,
                      fontSize: '0.75rem',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {statusMeta.label}
                  </span>
                </div>

                {/* Items List */}
                <div className="d-flex flex-column gap-2 mb-3">
                  {order.items.map((lineItem, idx) => (
                    <div key={idx} className="d-flex justify-content-between align-items-center small">
                      <span className="text-dark fw-medium">
                        {lineItem.name} <span className="text-muted">× {lineItem.quantity}</span>
                      </span>
                      <span className="fw-semibold text-secondary">
                        ${(lineItem.price * lineItem.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="d-flex justify-content-between align-items-baseline pt-2 border-top">
                  <span className="small text-muted">Total Payment</span>
                  <span className="fw-extrabold text-dark fs-5">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
