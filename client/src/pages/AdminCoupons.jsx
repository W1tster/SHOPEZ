import { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminNav from '../components/AdminNav';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [creating, setCreating] = useState(false);

  function loadCoupons() {
    api.get('/coupons').then((res) => {
      if (Array.isArray(res.data)) setCoupons(res.data);
    });
  }

  useEffect(loadCoupons, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage('');
    setCreating(true);

    try {
      await api.post('/coupons', {
        code: code.trim(),
        discountPercent: Number(discountPercent),
      });
      setCode('');
      setDiscountPercent('');
      loadCoupons();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to create coupon code');
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(coupon) {
    try {
      await api.put(`/coupons/${coupon._id}`, { active: !coupon.active });
      loadCoupons();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update coupon status');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this coupon code permanently?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      loadCoupons();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete coupon');
    }
  }

  return (
    <div className="container py-4">
      <AdminNav />

      {/* Coupon Creation Card */}
      <div className="card-shopez p-4 mb-4">
        <h5 className="fw-bold text-dark mb-3">Create Promotion Coupon</h5>

        {errorMessage && (
          <div className="alert alert-danger py-2 small rounded-3 mb-3">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-5">
              <label className="form-label small fw-semibold text-secondary">Coupon Voucher Code</label>
              <input
                className="form-control"
                placeholder="e.g. FLASH25"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold text-secondary">Discount Percentage (%)</label>
              <input
                className="form-control"
                type="number"
                min="1"
                max="100"
                placeholder="25"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                required
              />
            </div>

            <div className="col-12 col-md-3">
              <button
                className="btn btn-shopez w-100 py-2"
                type="submit"
                disabled={creating}
              >
                {creating ? 'Saving...' : 'Add Coupon'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Coupons Table */}
      <div className="card-shopez overflow-hidden">
        <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
          <h6 className="fw-bold text-dark mb-0">Active Promotional Vouchers ({coupons.length})</h6>
        </div>

        <div className="table-responsive">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Voucher Code</th>
                <th>Discount Value</th>
                <th>Status</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id}>
                  <td>
                    <span className="badge bg-light text-primary border px-3 py-2 fw-mono fs-6">
                      {c.code}
                    </span>
                  </td>
                  <td>
                    <span className="fw-bold text-dark">{c.discountPercent}% Off</span>
                  </td>
                  <td>
                    <span
                      className={`badge rounded-pill px-3 py-2 ${
                        c.active ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'
                      }`}
                    >
                      {c.active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="text-end pe-4">
                    <button
                      className="btn btn-sm btn-outline-secondary me-2 py-1 px-3"
                      onClick={() => toggleActive(c)}
                    >
                      {c.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger py-1 px-3"
                      onClick={() => handleDelete(c._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {coupons.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted small">
                    No promo coupons created yet. Use the form above to add your first discount.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
