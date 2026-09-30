import { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminNav from '../components/AdminNav';

const VALID_STATUSES = ['placed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  function loadOrders() {
    api
      .get('/admin/orders')
      .then((res) => {
        if (Array.isArray(res.data)) setOrders(res.data);
      })
      .finally(() => setLoading(false));
  }

  useEffect(loadOrders, []);

  async function handleStatusChange(orderId, newStatus) {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  }

  return (
    <div className="container py-4">
      <AdminNav />

      <div className="card-shopez overflow-hidden">
        <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
          <h6 className="fw-bold text-dark mb-0">Customer Orders ({orders.length})</h6>
        </div>

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading orders...</span>
            </div>
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="text-center py-5 text-muted small">
            No orders have been received yet.
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="table-responsive">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Customer Profile</th>
                  <th>Purchased Items</th>
                  <th>Total Amount</th>
                  <th>Fulfillment Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <div className="fw-mono small fw-bold text-dark">
                        #{order._id.substring(order._id.length - 8)}
                      </div>
                      <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                          style={{ width: '30px', height: '30px', background: '#6366f1', fontSize: '0.75rem' }}
                        >
                          {(order.user?.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-semibold text-dark small">{order.user?.name || 'Customer'}</div>
                          <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                            {order.user?.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="small text-secondary" style={{ maxWidth: '280px' }}>
                      {order.items.map((i) => `${i.name} (×${i.quantity})`).join(', ')}
                    </td>

                    <td className="fw-bold text-dark small">
                      ${order.total.toFixed(2)}
                    </td>

                    <td>
                      <select
                        className="form-select form-select-sm py-1"
                        style={{ width: '130px', fontSize: '0.82rem', fontWeight: 600 }}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      >
                        {VALID_STATUSES.map((statusKey) => (
                          <option key={statusKey} value={statusKey}>
                            {statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
