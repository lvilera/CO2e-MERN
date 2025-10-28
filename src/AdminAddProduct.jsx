import React, { useState, useEffect, useRef } from 'react';
import DynamicHeader from './components/DynamicHeader';
import { API_BASE_URL } from './config';
import axios from 'axios';

const AdminAddProduct = () => {
  const [form, setForm] = useState({ title: '', description: '', price: '', image: null, fileURL: '' });
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editProductId, setEditProductId] = useState(null);

  const fileInputRef = useRef(null);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products`);
      setProducts(res.data);
    } catch (err) {
      setError('Failed to fetch products');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, type, files, value } = e.target;

    if (type === 'file') {
      const file = files[0];
      if (file) {
        setForm(prevForm => ({ ...prevForm, [name]: file }));
      }
    } else {
      setForm(prevForm => ({ ...prevForm, [name]: value }));
    }

    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("price", form.price);
    if (form.image && form.image instanceof File) {
      formData.append("image", form.image);
    }
    formData.append("fileURL", form.fileURL);

    try {
      if (editProductId) {
        await axios.put(`${API_BASE_URL}/api/products/${editProductId}`, formData);
        setMessage('Product updated successfully!');
        setEditProductId(null);
      } else {
        await axios.post(`${API_BASE_URL}/api/products`, formData);
        setMessage('Product added successfully!');
      }
      setForm({ title: '', description: '', price: '', image: null, fileURL: '' });
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/products/${id}`);
      setMessage('Product deleted successfully!');
      fetchProducts();
    } catch (err) {
      setError('Failed to delete product');
    }
  };

  const handleEdit = (product) => {
    setMessage("");
    setError("");
    if (product._id === editProductId) {
      setEditProductId(null);
      setForm({ title: '', description: '', price: '', image: null, fileURL: '' });
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    } else {
      setEditProductId(product._id);
      setForm({
        title: product.title,
        description: product.description,
        price: product.price,
        image: product.imageURL,
        fileURL: product.fileURL
      })
    }
  };

  const handleUploadNew = () => {
    setForm((prevState) => ({ ...prevState, image: null }));

    // Delay click until after re-render
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, 0);
  };

  return (
    <div>
      <DynamicHeader />
      <div id="TTw" style={{ maxWidth: 500, margin: '10rem auto', padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
        <h2>{editProductId ? "Edit" : "Add"} Product</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 10 }}>
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: 8, marginBottom: 8 }}
            />
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: 8, marginBottom: 8 }}
            />
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: 8, marginBottom: 8 }}
            />
            {(form.image && !(form.image instanceof File)) ?
              <div>
                <img src={form.image} alt='product' style={{ width: '100%', maxHeight: 350, marginBottom: 8 }} />
                <button onClick={handleUploadNew} style={{ padding: 10, background: '#007bff', color: '#fff', border: 'none', borderRadius: 4, marginBottom: 8 }}>Upload New</button>
              </div>
              :
              <input
                type="file"
                ref={fileInputRef}
                name="image"
                accept="image/*"
                onChange={handleChange}
                required
                style={{ width: '100%', padding: 8, marginBottom: 8 }}
              />
            }
            <input
              type="text"
              name="fileURL"
              placeholder="File URL"
              value={form.fileURL}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: 8, marginBottom: 8 }}
            />
          </div>
          <button id="insb" type="submit" disabled={loading} style={{ width: '100%', padding: 10, background: '#007bff', color: '#fff', border: 'none', borderRadius: 4 }}>
            {loading ? (editProductId ? "Updating..." : 'Adding...') : (editProductId ? "Update Product" : 'Add Product')}
          </button>
        </form>
        {message && <div style={{ color: 'green', marginTop: 10 }}>{message}</div>}
        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      </div>
      <div style={{ maxWidth: 700, margin: '2rem auto', padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
        <h3>Products List</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Title</th>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Price</th>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Image URL</th>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>File URL</th>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((inst) => (
              <tr key={inst._id}>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{inst.title}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{inst.price}</td>
                <td style={{ padding: 8, border: '1px solid #ddd', maxWidth: 200, textOverflow: 'ellipsis', overflow: "hidden" }}>{inst.imageURL}</td>
                <td style={{ padding: 8, border: '1px solid #ddd', maxWidth: 200, textOverflow: 'ellipsis', overflow: "hidden" }}>{inst.fileURL}</td>
                <td style={{ padding: 8, border: '1px solid #ddd', display: "flex", gap: "8px" }}>
                  <button onClick={() => handleEdit(inst)} style={{ background: editProductId === inst._id ? "#6c757d" : '#ffc107', color: editProductId === inst._id ? "#fff" : '#000', border: 'none', borderRadius: 4, padding: '6px 18px' }}>{editProductId === inst._id ? "Cancel" : "Edit"}</button>
                  <button onClick={() => handleDelete(inst._id)} style={{ background: '#dc3545', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px' }}>Delete</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: 20 }}>No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAddProduct;