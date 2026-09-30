import { Link, useLocation } from 'react-router-dom';

export default function AdminNav() {
  const location = useLocation();

  const navItems = [
    { label: 'Analytics Overview', path: '/admin' },
    { label: 'Inventory Products', path: '/admin/products' },
    { label: 'Customer Orders', path: '/admin/orders' },
    { label: 'Discount Coupons', path: '/admin/coupons' },
  ];

  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4 pb-3 border-bottom">
      <div>
        <span className="badge px-3 py-1 rounded-pill mb-1 fw-bold" style={{ background: 'rgba(79, 70, 229, 0.12)', color: '#4f46e5' }}>
          ADMINISTRATION CONSOLE
        </span>
        <h3 className="fw-bold text-dark mb-0">Store Operations</h3>
      </div>

      <div className="d-flex flex-wrap gap-2">
        {navItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`btn btn-sm ${
                isSelected ? 'btn-shopez' : 'btn-shopez-outline'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
