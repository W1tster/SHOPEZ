import { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminNav from '../components/AdminNav';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api
      .get('/admin/analytics')
      .then((res) => {
        if (isMounted) setStats(res.data);
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
      <AdminNav />

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading analytics...</span>
          </div>
        </div>
      )}

      {stats && (
        <>
          {/* KPI Stat Cards Grid */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-4">
              <div className="stat-card">
                <div className="text-muted small fw-semibold text-uppercase tracking-wider mb-1">
                  Gross Revenue
                </div>
                <div className="fs-2 fw-extrabold text-dark tracking-tight">
                  ${stats.totalSales.toFixed(2)}
                </div>
                <div className="small text-success mt-2 d-flex align-items-center gap-1">
                  <span>✓</span>
                  <span>Simulated lifetime receipts</span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="stat-card">
                <div className="text-muted small fw-semibold text-uppercase tracking-wider mb-1">
                  Orders Processed
                </div>
                <div className="fs-2 fw-extrabold text-dark tracking-tight">
                  {stats.totalOrders}
                </div>
                <div className="small text-primary mt-2 d-flex align-items-center gap-1">
                  <span>📦</span>
                  <span>Total purchase orders</span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="stat-card">
                <div className="text-muted small fw-semibold text-uppercase tracking-wider mb-1">
                  Catalog Inventory
                </div>
                <div className="fs-2 fw-extrabold text-dark tracking-tight">
                  {stats.totalProducts}
                </div>
                <div className="small text-secondary mt-2 d-flex align-items-center gap-1">
                  <span>🏷️</span>
                  <span>Active listed items</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Selling Products Showcase */}
          <div className="card-shopez p-4">
            <h5 className="fw-bold text-dark mb-3">Top Selling Products</h5>

            {stats.topProducts.length === 0 ? (
              <p className="text-muted small mb-0">
                No product sales recorded yet. Once orders are placed, top performers will appear here.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th>Product Title</th>
                      <th className="text-end">Units Sold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topProducts.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge rounded-circle bg-light text-dark border p-1" style={{ width: '24px', height: '24px' }}>
                              {idx + 1}
                            </span>
                            <span className="fw-semibold text-dark small">{item.name}</span>
                          </div>
                        </td>
                        <td className="text-end">
                          <span className="badge bg-primary-subtle text-primary fw-bold px-3 py-1">
                            {item.quantitySold} sold
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
