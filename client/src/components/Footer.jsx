import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-custom">
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="brand-badge-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </span>
              <span className="text-white fw-bold fs-5 tracking-tight">ShopEZ</span>
            </div>
            <p className="text-muted small pe-lg-4">
              Your trusted destination for premium electronics, stylish footwear, and everyday essentials.
              Engineered with modern speed and guaranteed reliability.
            </p>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="text-white fw-bold mb-3 small text-uppercase tracking-wider">Quick Links</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
              <li><Link to="/" className="text-muted text-decoration-none">Catalog</Link></li>
              <li><Link to="/cart" className="text-muted text-decoration-none">Shopping Cart</Link></li>
              <li><Link to="/my-orders" className="text-muted text-decoration-none">Order Tracking</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-bold mb-3 small text-uppercase tracking-wider">Demo Access</h6>
            <div className="p-3 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div className="text-light small fw-semibold mb-1">Admin Portal Demo</div>
              <div className="text-muted small">admin@shopez.com</div>
              <div className="text-muted small">Password: admin123</div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-bold mb-3 small text-uppercase tracking-wider">Perks & Promises</h6>
            <ul className="list-unstyled small text-muted d-flex flex-column gap-2 mb-0">
              <li>⚡ Fast simulated delivery dispatch</li>
              <li>🛡️ Mock 256-bit checkout security</li>
              <li>💬 Verified buyer feedback</li>
            </ul>
          </div>
        </div>

        <div className="border-top pt-3 d-flex flex-column flex-sm-row justify-content-between align-items-center small text-muted" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
          <div>© {new Date().getFullYear()} ShopEZ Inc. All rights reserved.</div>
          <div className="mt-2 mt-sm-0">Crafted with React, Node.js & Vite</div>
        </div>
      </div>
    </footer>
  );
}
