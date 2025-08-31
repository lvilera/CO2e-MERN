import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';

const FeaturedListings = () => {
  const [featuredImages, setFeaturedImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedImages();
  }, []);

  const fetchFeaturedImages = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/featured-listings`);
      if (response.ok) {
        const data = await response.json();
        setFeaturedImages(data);
      } else {
        console.error('Failed to fetch featured images');
      }
    } catch (error) {
      console.error('Error fetching featured images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (listing) => {
    if (listing.link) {
      window.open(listing.link, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <section style={{ 
        padding: '60px 20px',
        background: '#f8f9fa',
        textAlign: 'center'
      }}>
        <div style={{ color: '#666' }}>Loading featured content...</div>
      </section>
    );
  }

  if (featuredImages.length === 0) {
    return null; // Don't show section if no featured images
  }

  return (
    <section style={{
      padding: '80px 20px',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      position: 'relative'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: '700',
          color: '#333',
          marginBottom: '20px',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          Featured <span style={{ color: '#90be55' }}>Highlights</span>
        </h2>
        
        <p style={{
          fontSize: 'clamp(16px, 2.5vw, 20px)',
          color: '#666',
          marginBottom: '60px',
          maxWidth: '600px',
          margin: '0 auto 60px auto',
          lineHeight: '1.6'
        }}>
          Discover our curated selection of featured content and highlights
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          alignItems: 'start'
        }}>
          {featuredImages.map((listing, index) => (
            <div
              key={listing._id}
              onClick={() => handleImageClick(listing)}
              style={{
                background: '#fff',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                cursor: listing.link ? 'pointer' : 'default',
                transform: 'translateY(0)',
                animation: `fadeInUp 0.6s ease forwards ${index * 0.1}s`,
                opacity: 0
              }}
              onMouseEnter={(e) => {
                if (listing.link) {
                  e.target.style.transform = 'translateY(-8px)';
                  e.target.style.boxShadow = '0 16px 48px rgba(0,0,0,0.15)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{
                position: 'relative',
                paddingBottom: '60%', // 16:9.6 aspect ratio
                overflow: 'hidden'
              }}>
                <img
                  src={listing.imageUrl}
                  alt={listing.title || 'Featured content'}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (listing.link) {
                      e.target.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                  }}
                />
                {listing.link && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    Click to view
                  </div>
                )}
              </div>

              {(listing.title || listing.description) && (
                <div style={{
                  padding: '24px'
                }}>
                  {listing.title && (
                    <h3 style={{
                      fontSize: 'clamp(18px, 3vw, 24px)',
                      fontWeight: '600',
                      color: '#333',
                      marginBottom: '12px',
                      lineHeight: '1.3'
                    }}>
                      {listing.title}
                    </h3>
                  )}
                  
                  {listing.description && (
                    <p style={{
                      fontSize: '14px',
                      color: '#666',
                      lineHeight: '1.5',
                      margin: 0
                    }}>
                      {listing.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default FeaturedListings; 