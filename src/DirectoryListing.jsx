import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Header from './Home/Header';
import Footer2 from './Home/Footer2';
import { useApi } from './hooks/useApi';
import { API_BASE } from './config';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setupIPhoneDetection, isIPhoneSafari, getAuthHeaders } from './utils/iphoneFix';
import './DirectoryListing.css';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const DirectoryListing = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null); // { package: 'free'|'pro'|'premium', ... }
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(false);
  
  // Refs for animations
  const titleRef = useRef(null);
  const iphoneMsgRef = useRef(null);
  
  const [selectedLetter, setSelectedLetter] = useState('A');
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [userLocation, setUserLocation] = useState(null);
  const { get, post } = useApi();
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');

  useEffect(() => {
    setupIPhoneDetection();
    setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    if (isIPhoneSafari() && iphoneMsgRef.current) {
      gsap.fromTo(iphoneMsgRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' });
    }
    // Always fetch listings regardless of login status
    fetchListings();
    // Only fetch user info if logged in
    if (isLoggedIn) {
      fetchUser();
    }
    // Auto-detect user location
    detectUserLocation();
  }, [isLoggedIn]);

  useEffect(() => {
    // Initialize animations
    initializeAnimations();
  }, [user, listings]);

  const initializeAnimations = () => {
    // Title animation
    if (titleRef.current) {
      gsap.fromTo(titleRef.current,
        { opacity: 0, y: 50 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }
  };

  const fetchUser = async () => {
    try {
      const data = await get(`${API_BASE}/api/me`, 'Loading user info...');
      setUser({ ...data, package: (data.package || '').toLowerCase().replace(' plan', '').trim() });
    } catch (err) {
      setUser(null);
    }
  };

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      setApiError(false);
      console.log('Starting fetchListings...');
      console.log('API_BASE:', API_BASE);
      console.log('isLoggedIn:', isLoggedIn);
      
      let data;
      
      // For iPhone Safari, try the special endpoint first
      if (isIPhoneSafari()) {
        console.log('iPhone Safari detected, trying special endpoint...');
        try {
          const response = await fetch(`${API_BASE}/api/directory/iphone-access`, {
            credentials: 'include',
            headers: getAuthHeaders(),
          });
          
          console.log('iPhone endpoint response status:', response.status);
          
          if (response.ok) {
            const result = await response.json();
            data = result.listings;
            console.log('iPhone endpoint success, data:', data);
          } else {
            throw new Error(`iPhone endpoint failed with status: ${response.status}`);
          }
        } catch (iphoneError) {
          console.log('iPhone endpoint failed, trying regular endpoint:', iphoneError);
          // Try direct fetch without authentication for public access
          const response = await fetch(`${API_BASE}/api/directory`);
          console.log('Direct fetch response status:', response.status);
          
          if (response.ok) {
            data = await response.json();
            console.log('Direct fetch success, data:', data);
          } else {
            throw new Error(`Regular endpoint failed with status: ${response.status}`);
          }
        }
      } else {
        console.log('Regular browser, trying direct fetch...');
        // Try direct fetch without authentication for public access
        try {
          const response = await fetch(`${API_BASE}/api/directory`);
          console.log('Direct fetch response status:', response.status);
          
          if (response.ok) {
            data = await response.json();
            console.log('Direct fetch success, data:', data);
          } else {
            console.log('Direct fetch failed, trying useApi fallback...');
            // Fallback to useApi if direct fetch fails
            data = await get(`${API_BASE}/api/directory`, 'Loading directory listings...');
          }
        } catch (directError) {
          console.log('Direct fetch failed, trying useApi:', directError);
          data = await get(`${API_BASE}/api/directory`, 'Loading directory listings...');
        }
      }
      
      console.log('Final fetched listings:', data); // Debug log
      setListings(data || []);
    } catch (err) {
      console.error('Listings fetch error:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        API_BASE: API_BASE
      });
      setListings([]);
      setApiError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const detectUserLocation = async () => {
    try {
      // Try to get location from IP using the backend
      const response = await fetch(`${API_BASE}/api/directory/nearby`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.userLocation && data.userLocation.city !== 'Unknown') {
          setUserLocation(data.userLocation);
        }
      }
    } catch (error) {
      console.log('Could not auto-detect location:', error);
      // Fallback: try browser geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              // Use a free reverse geocoding service
              const { latitude, longitude } = position.coords;
              const geoResponse = await fetch(
                `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_OPENCAGE_API_KEY`
              );
              if (geoResponse.ok) {
                const geoData = await geoResponse.json();
                if (geoData.results && geoData.results.length > 0) {
                  const result = geoData.results[0].components;
                  setUserLocation({
                    city: result.city || result.town || result.village || '',
                    state: result.state || '',
                    country: result.country || ''
                  });
                }
              }
            } catch (geoError) {
              console.log('Geolocation reverse lookup failed:', geoError);
            }
          },
          (error) => {
            console.log('Browser geolocation failed:', error);
          }
        );
      }
    }
  };

  const filteredListings = listings.filter(listing => {
    if (!listing.company) return false;
    
    // If user selected "Local Contractors" and we have user location, filter by location
    if (selectedIndustry === "Local Contractors" && userLocation) {
      // Check if listing has location data and matches user's location
      if (listing.city && listing.state && listing.country) {
        const locationMatch = 
          listing.city.toLowerCase() === userLocation.city.toLowerCase() ||
          listing.state.toLowerCase() === userLocation.state.toLowerCase() ||
          listing.country.toLowerCase() === userLocation.country.toLowerCase();
        
        if (!locationMatch) return false;
      } else {
        // If listing has no location data, don't show it for local search
        return false;
      }
    }
    
    // Filter by selected letter
    return listing.company.toUpperCase().startsWith(selectedLetter);
  });
  // Debug log for filtered listings
  console.log('Selected letter:', selectedLetter);
  console.log('Total listings:', listings.length);
  console.log('Filtered listings:', filteredListings.length);
  console.log('Filtered listings data:', filteredListings);

  const getRowStyle = (userPackage) => {
    if (userPackage === 'free') return {};
    if (userPackage === 'pro') return { fontWeight: 'bold', color: '#4CAF50' };
    if (userPackage === 'premium') return { fontWeight: 'bold', color: '#2196F3' };
    return {};
  };

  return (
    <>
      <Header />
      <div style={{ margin:'120px',background: '#fff', minHeight: '100vh', padding: '180px 0 60px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <h1 ref={titleRef} style={{ textAlign: 'center', marginBottom: 40, color: '#333' }}>Directory Listing</h1>
          {isIPhoneSafari() ? (
            <div ref={iphoneMsgRef} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              minHeight: '40vh', background: '#e3f2fd', borderRadius: 12, border: '1px solid #2196f3',
              boxShadow: '0 4px 24px rgba(33,150,243,0.08)', padding: 40, margin: '40px 0',
              animation: 'fadeIn 1s',
            }}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 24 }}>
                <circle cx="12" cy="12" r="12" fill="#2196f3" fillOpacity="0.1"/>
                <path d="M8 17h8M8 13h8M8 9h8" stroke="#2196f3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="6" y="5" width="12" height="14" rx="2" stroke="#2196f3" strokeWidth="2"/>
              </svg>
              <h2 style={{ color: '#1976d2', marginBottom: 16, fontWeight: 700, fontSize: 28 }}>{t('directory.desktop_only')}</h2>
              <p style={{ color: '#1976d2', fontSize: 18, textAlign: 'center', maxWidth: 400 }}>
                {t('directory.desktop_message')}
              </p>
            </div>
          ) : (
            <>
              {isIPhoneSafari() && (
                <div style={{ 
                  background: '#e3f2fd', 
                  padding: '15px', 
                  borderRadius: '8px', 
                  marginBottom: '20px',
                  border: '1px solid #2196f3',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: 0, color: '#1976d2', fontSize: '14px' }}>
                    📱 <strong>Mobile View:</strong> Directory listings are viewable on mobile. 
                    To submit your company listing, please use a desktop computer.
                  </p>
                </div>
              )}
              
              {!isLoggedIn ? (
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                  <p style={{ color: '#666', fontSize: 18 }}>
                    Please log in to view the directory listings.
                  </p>
                </div>
              ) : (
                <>
                  {isLoading ? (
                    <div style={{ marginTop: 40, textAlign: 'center' }}>
                      <div style={{ padding: '40px', color: '#666', fontSize: '18px' }}>
                        Loading directory listings...
                      </div>
                    </div>
                  ) : apiError ? (
                    <div style={{ marginTop: 40, textAlign: 'center' }}>
                      <div style={{ 
                        padding: '40px', 
                        color: '#e74c3c', 
                        fontSize: '18px',
                        background: '#fdf2f2',
                        borderRadius: '10px',
                        border: '1px solid #fecaca'
                      }}>
                        Unable to load directory listings. Please check your connection and try again.
                        <br />
                        <small style={{ color: '#666', marginTop: '10px', display: 'block' }}>
                          API Base: {API_BASE}
                        </small>
                      </div>
                    </div>
                  ) : listings.length > 0 ? (
                    <div style={{ marginTop: 40 }}>
                      <h2 style={{ textAlign: 'center', marginBottom: 20, color: '#333' }}>Directory Listings</h2>
                      
                      {/* Industry Filter */}
                      <div style={{ marginBottom: 20, textAlign: "center" }}>
                        <label style={{ display: "block", marginBottom: 10, fontWeight: "bold" }}>
                          Filter by Industry:
                        </label>
                        <select
                          value={selectedIndustry}
                          onChange={(e) => setSelectedIndustry(e.target.value)}
                          style={{
                            padding: "8px 16px",
                            borderRadius: 5,
                            border: "1px solid #ddd",
                            fontSize: 14,
                            minWidth: 200
                          }}
                        >
                          <option value="All">All Industries</option>
                          <option value="Local Contractors">Local Contractors</option>
                          <option value="Construction">Construction</option>
                          <option value="Plumbing">Plumbing</option>
                          <option value="Electrical">Electrical</option>
                          <option value="HVAC">HVAC</option>
                          <option value="Landscaping">Landscaping</option>
                          <option value="Retail">Retail</option>
                          <option value="Wholesaler">Wholesaler</option>
                          <option value="Broker">Broker</option>
                        </select>
                        {selectedIndustry === "Local Contractors" && userLocation && (
                          <>
                            <button
                              onClick={() => setSelectedIndustry("All")}
                              style={{
                                background: "#f44336",
                                color: "white",
                                border: "none",
                                padding: "4px 8px",
                                borderRadius: 3,
                                cursor: "pointer",
                                fontSize: 12,
                                marginLeft: 10
                              }}
                            >
                              Reset Filter
                            </button>
                            <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
                              📍 Showing contractors in: {userLocation.city}, {userLocation.state}, {userLocation.country}
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Alphabet Navigation */}
                      <div className="alphabet-nav">
                        {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => (
                          <button
                            key={letter}
                            onClick={() => setSelectedLetter(letter)}
                            className={selectedLetter === letter ? 'active' : ''}
                          >
                            {letter}
                          </button>
                        ))}
                      </div>

                      {/* Show message when no listings for selected letter */}
                      {filteredListings.length === 0 && (
                        <div className="no-listings-message">
                          No companies in the directory starting with "{selectedLetter}" yet.
                        </div>
                      )}

                      {/* Listings Grid */}
                      {filteredListings.length > 0 && (
                        <div style={{ display: 'grid', gap: 15 }}>
                          {filteredListings.map((listing, index) => (
                            <div key={index} style={{ ...getRowStyle(listing.package), padding: '15px', border: '1px solid #eee', borderRadius: 8, background: '#f9f9f9' }}>
                              <p style={{ margin: 0, fontWeight: 'bold' }}>{listing.company}</p>
                              <p style={{ margin: 0, color: '#555' }}>{listing.email}</p>
                              <p style={{ margin: 0, color: '#555' }}>{listing.phone}</p>
                              <p style={{ margin: 0, color: '#555' }}>{listing.address}</p>
                              <p style={{ margin: 0, color: '#555' }}>{listing.socialType && listing.socialLink ? `${listing.socialType}: ${listing.socialLink}` : ''}</p>
                              <p style={{ margin: 0, color: '#555' }}>{listing.industry}</p>
                              <p style={{ margin: 0, color: '#555' }}>{listing.description}</p>
                              {listing.image && (
                                <img src={listing.image} alt="Company Logo" style={{ maxWidth: '100px', height: 'auto', marginTop: 10 }} />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ marginTop: 40 }}>
                      <div className="no-listings-message">
                        No companies in the directory yet.
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
      <Footer2 />
    </>
  );
};

export default DirectoryListing; 