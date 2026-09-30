import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  }

  function handleAutoFillAdmin() {
    setEmail('admin@shopez.com');
    setPassword('admin123');
  }

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '75vh' }}>
      <div className="card-shopez p-4 p-sm-5 w-100" style={{ maxWidth: '440px' }}>
        <div className="text-center mb-4">
          <div className="brand-badge-icon mx-auto mb-2" style={{ width: '42px', height: '42px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <h3 className="fw-bold text-dark mb-1">Welcome Back</h3>
          <p className="text-muted small">Sign in to your ShopEZ account</p>
        </div>

        {errorMessage && (
          <div className="alert alert-danger py-2 small rounded-3 mb-3" role="alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            className="btn btn-shopez w-100 py-2 mb-3"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Helper Box */}
        <div className="p-3 rounded-3 mb-3 text-center" style={{ background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
          <div className="small fw-semibold text-dark mb-1">Quick Demo Admin Access</div>
          <p className="text-muted small mb-2" style={{ fontSize: '0.8rem' }}>
            admin@shopez.com / admin123
          </p>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm py-1 px-3"
            onClick={handleAutoFillAdmin}
            style={{ fontSize: '0.8rem' }}
          >
            Fill Admin Credentials
          </button>
        </div>

        <p className="text-center text-muted small mb-0">
          Don't have an account?{' '}
          <Link to="/register" className="fw-semibold text-primary">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
}
