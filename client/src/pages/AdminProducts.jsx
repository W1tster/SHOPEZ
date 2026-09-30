import { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminNav from '../components/AdminNav';

const initialFormValues = {
  name: '',
  description: '',
  price: '',
  category: '',
  imageUrl: '',
  stock: '',
  discountPercent: '',
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialFormValues);
  const [editingId, setEditingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);

  function loadProducts() {
    api.get('/products').then((res) => {
      if (Array.isArray(res.data)) setProducts(res.data);
    });
  }

  useEffect(loadProducts, []);

  function handleFieldChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleResetForm() {
    setForm(initialFormValues);
    setEditingId(null);
    setErrorMessage('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage('');
    setSaving(true);

    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock) || 0,
      discountPercent: Number(form.discountPercent) || 0,
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      handleResetForm();
      loadProducts();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to save product changes.');
    } finally {
      setSaving(false);
    }
  }

  function handleStartEdit(item) {
    setEditingId(item._id);
    setForm({
      name: item.name || '',
      description: item.description || '',
      price: item.price ?? '',
      category: item.category || '',
      imageUrl: item.imageUrl || '',
      stock: item.stock ?? '',
      discountPercent: item.discountPercent ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDeleteProduct(id) {
    if (!window.confirm('Are you sure you want to permanently delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  }

  return (
    <div className="container py-4">
      <AdminNav />

      {/* Product Editor Card */}
      <div className="card-shopez p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark mb-0">
            {editingId ? 'Edit Product Details' : 'Create New Catalog Item'}
          </h5>
          {editingId && (
            <span className="badge bg-warning-subtle text-warning-emphasis">
              Editing Mode: #{editingId}
            </span>
          )}
        </div>

        {errorMessage && (
          <div className="alert alert-danger py-2 small rounded-3 mb-3">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold text-secondary">Product Name</label>
              <input
                className="form-control"
                name="name"
                placeholder="e.g. Noise Cancelling Earbuds"
                value={form.name}
                onChange={handleFieldChange}
                required
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold text-secondary">Category</label>
              <input
                className="form-control"
                name="category"
                placeholder="e.g. Electronics"
                value={form.category}
                onChange={handleFieldChange}
                required
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold text-secondary">Image URL</label>
              <input
                className="form-control"
                name="imageUrl"
                placeholder="https://images.example.com/item.jpg"
                value={form.imageUrl}
                onChange={handleFieldChange}
              />
            </div>

            <div className="col-12">
              <label className="form-label small fw-semibold text-secondary">Description</label>
              <textarea
                className="form-control"
                rows="3"
                name="description"
                placeholder="Detailed features, specifications, and materials..."
                value={form.description}
                onChange={handleFieldChange}
                required
              />
            </div>

            <div className="col-12 col-sm-4">
              <label className="form-label small fw-semibold text-secondary">Base Price ($)</label>
              <input
                className="form-control"
                name="price"
                type="number"
                step="0.01"
                placeholder="49.99"
                value={form.price}
                onChange={handleFieldChange}
                required
              />
            </div>

            <div className="col-12 col-sm-4">
              <label className="form-label small fw-semibold text-secondary">Stock Inventory</label>
              <input
                className="form-control"
                name="stock"
                type="number"
                placeholder="25"
                value={form.stock}
                onChange={handleFieldChange}
                required
              />
            </div>

            <div className="col-12 col-sm-4">
              <label className="form-label small fw-semibold text-secondary">Promo Discount (%)</label>
              <input
                className="form-control"
                name="discountPercent"
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={form.discountPercent}
                onChange={handleFieldChange}
              />
            </div>

            <div className="col-12 d-flex gap-2 justify-content-end mt-3">
              {editingId && (
                <button
                  className="btn btn-outline-secondary btn-sm px-3"
                  type="button"
                  onClick={handleResetForm}
                >
                  Cancel
                </button>
              )}
              <button
                className="btn btn-shopez btn-sm px-4"
                type="submit"
                disabled={saving}
              >
                {saving ? 'Saving...' : editingId ? 'Update Product' : 'Add to Catalog'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Catalog Inventory Table */}
      <div className="card-shopez overflow-hidden">
        <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
          <h6 className="fw-bold text-dark mb-0">Current Inventory ({products.length})</h6>
        </div>

        <div className="table-responsive">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Stock</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => (
                <tr key={item._id}>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={item.imageUrl || `https://picsum.photos/seed/${item._id}/60/60`}
                        alt={item.name}
                        style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px' }}
                        onError={(e) => {
                          e.currentTarget.src = 'https://picsum.photos/seed/placeholder/60/60';
                        }}
                      />
                      <div>
                        <div className="fw-semibold text-dark small">{item.name}</div>
                        <div className="text-muted small fw-mono" style={{ fontSize: '0.75rem' }}>
                          ID: {item._id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-light text-secondary border">
                      {item.category}
                    </span>
                  </td>
                  <td className="fw-bold text-dark small">${item.price.toFixed(2)}</td>
                  <td>
                    {item.discountPercent > 0 ? (
                      <span className="badge bg-danger-subtle text-danger">
                        {item.discountPercent}% off
                      </span>
                    ) : (
                      <span className="text-muted small">None</span>
                    )}
                  </td>
                  <td>
                    {item.stock > 0 ? (
                      <span className="badge bg-success-subtle text-success">
                        {item.stock} in stock
                      </span>
                    ) : (
                      <span className="badge bg-danger-subtle text-danger">Out of stock</span>
                    )}
                  </td>
                  <td className="text-end pe-4">
                    <button
                      className="btn btn-sm btn-outline-secondary me-2 py-1 px-2"
                      onClick={() => handleStartEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger py-1 px-2"
                      onClick={() => handleDeleteProduct(item._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
