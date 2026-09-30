import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  const totalCartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  function handleLogout() {
    logout();
    navigate('/');
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom sticky-top">
      <div className="container">
        {/* Brand Logo */}
        <Link className="navbar-brand-custom" to="/" onClick={() => setNavOpen(false)}>
          <span className="brand-badge-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </span>
          <span>Shop<span style={{ color: '#818cf8' }}>EZ</span></span>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setNavOpen(!navOpen)}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Items */}
        <div className={`collapse navbar-collapse ${navOpen ? 'show py-3' : ''}`}>
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <li className="nav-item">
              <Link
                className={`nav-link nav-link-custom ${isActive('/') ? 'active' : ''}`}
                to="/"
                onClick={() => setNavOpen(false)}
              >
                Catalog
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link nav-link-custom d-inline-flex align-items-center ${isActive('/cart') ? 'active' : ''}`}
                to="/cart"
                onClick={() => setNavOpen(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="me-1">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span>Cart</span>
                {totalCartCount > 0 && (
                  <span className="cart-counter-badge">{totalCartCount}</span>
                )}
              </Link>
            </li>

            {user && (
              <li className="nav-item">
                <Link
                  className={`nav-link nav-link-custom ${isActive('/my-orders') ? 'active' : ''}`}
                  to="/my-orders"
                  onClick={() => setNavOpen(false)}
                >
                  My Orders
                </Link>
              </li>
            )}

            {user?.role === 'admin' && (
              <li className="nav-item">
                <Link
                  className={`nav-link nav-link-custom ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                  to="/admin"
                  onClick={() => setNavOpen(false)}
                  style={{ color: '#c084fc !important' }}
                >
                  <span className="badge me-1" style={{ background: 'rgba(192, 132, 252, 0.2)', color: '#c084fc' }}>Admin</span>
                  Portal
                </Link>
              </li>
            )}

            {user ? (
              <li className="nav-item ms-lg-2 d-flex align-items-center gap-2 mt-2 mt-lg-0">
                <div className="d-flex align-items-center gap-2 px-2 py-1 rounded" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                    style={{ width: '28px', height: '28px', background: 'var(--brand-gradient)', fontSize: '0.75rem' }}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-light small fw-medium">{user.name}</span>
                </div>
                <button
                  className="btn btn-outline-secondary btn-sm text-light border-0 py-1 px-2"
                  onClick={handleLogout}
                  title="Sign out of account"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  Logout
                </button>
              </li>
            ) : (
              <li className="nav-item ms-lg-2 d-flex align-items-center gap-2 mt-2 mt-lg-0">
                <Link
                  className="nav-link nav-link-custom px-3"
                  to="/login"
                  onClick={() => setNavOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  className="btn btn-shopez btn-sm px-3"
                  to="/register"
                  onClick={() => setNavOpen(false)}
                >
                  Sign Up
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
