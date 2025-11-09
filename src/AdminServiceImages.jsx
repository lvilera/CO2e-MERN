import React, { useState, useRef, useEffect, useCallback } from 'react';
import DynamicHeader from './components/DynamicHeader';
import Footer2 from './Home/Footer2';
import { API_BASE } from './config';

const AdminServiceImages = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const imageInputRef = useRef();

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/service-images`);
      const data = await res.json();
      setImages(data);
    } catch (err) {
      console.error('Error fetching images:', err);
      showMessage('Error fetching images', 'error');
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      showMessage('Please select an image.', 'error');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('image', image);
    
    try {
      // Get admin token from localStorage or cookie
      const token = localStorage.getItem('token') || getCookie('token');
      
      const res = await fetch(`${API_BASE}/api/service-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: formData,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      setImage(null);
      setPreview(null);
      imageInputRef.current.value = '';
      fetchImages();
      showMessage('Service image uploaded successfully!');
    } catch (err) {
      showMessage('Upload failed: ' + err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  // Helper function to get cookie value
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      // Get admin token from localStorage or cookie
      const token = localStorage.getItem('token') || getCookie('token');
      
      const res = await fetch(`${API_BASE}/api/service-images/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Delete failed');
      }
      
      fetchImages();
      showMessage('Service image deleted successfully!');
    } catch (err) {
      showMessage('Delete failed: ' + err.message, 'error');
    }
  };

  return (
    <>
      <DynamicHeader />
      <div style={{ maxWidth: 700, margin: '340px auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 32 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Admin: Service Images</h2>
        
        {/* Message Display */}
        {message.text && (
          <div style={{
            textAlign: 'center',
            marginBottom: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            fontWeight: '500',
            backgroundColor: message.type === 'error' ? '#fee' : '#efe',
            color: message.type === 'error' ? '#c33' : '#363',
            border: `1px solid ${message.type === 'error' ? '#fcc' : '#cfc'}`
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <label style={{ fontWeight: 500 }}>Upload Image</label>
          <input 
            type="file" 
            accept="image/*" 
            ref={imageInputRef} 
            onChange={handleImageChange} 
            required 
            style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} 
          />
          {preview && <img src={preview} alt="Preview" style={{ maxWidth: 300, margin: '10px auto', display: 'block', borderRadius: 12 }} />}
          
          <button 
            type="submit" 
            disabled={uploading} 
            style={{ 
              background: '#90be55', 
              color: 'white', 
              border: 'none', 
              borderRadius: 8, 
              padding: 14, 
              fontWeight: 600, 
              fontSize: 18, 
              marginTop: 10 
            }}
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </form>
        
        <hr style={{ margin: '32px 0' }} />
        
        <h3 style={{ textAlign: 'center', marginBottom: 16 }}>All Service Images</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
          {images.length === 0 && <div style={{ textAlign: 'center', color: '#888' }}>No images uploaded yet.</div>}
          {images.map(img => (
            <div key={img._id} style={{ 
              border: '1px solid #eee', 
              borderRadius: 10, 
              padding: 12, 
              position: 'relative', 
              background: '#fafafa' 
            }}>
              <img 
                src={img.imageUrl} 
                alt="Service" 
                style={{ 
                  width: 220, 
                  height: 120, 
                  objectFit: 'cover', 
                  borderRadius: 8, 
                  background: '#fff' 
                }} 
              />
              <button 
                onClick={() => handleDelete(img._id)} 
                style={{ 
                  position: 'absolute', 
                  top: 8, 
                  right: 8, 
                  background: '#e74c3c', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 6, 
                  padding: '4px 12px', 
                  cursor: 'pointer', 
                  fontWeight: 600 
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
      <Footer2 />
    </>
  );
};

export default AdminServiceImages; 