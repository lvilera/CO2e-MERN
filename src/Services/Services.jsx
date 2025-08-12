import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../Home/Header';
import Footer2 from '../Home/Footer2';
import './Services.css';
import { useApi } from '../hooks/useApi';
import { API_BASE } from '../config';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const Services = () => {
  const { t, i18n } = useTranslation();
  const [featuredImages, setFeaturedImages] = useState([]);
  const [directoryListings, setDirectoryListings] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState('A');
  const [user, setUser] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [viewMode, setViewMode] = useState('alphabetical'); // 'alphabetical' or 'category'
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { get } = useApi();

  // Refs for animations
  const titleRef = useRef(null);
  const alphabetRef = useRef(null);
  const tableRef = useRef(null);
  const descriptionRef = useRef(null);
  const courseButtonRef = useRef(null);
  const serviceCardsRef = useRef(null);
  const bottomCardsRef = useRef(null);

  useEffect(() => {
    // Don't auto-clear location - let the backend API detect it properly
    fetchFeaturedImages();
    fetchDirectoryListings();
    fetchCategories();
    fetchUser();
    detectUserLocation();
  }, [i18n]);

  useEffect(() => {
    // Initialize animations
    initializeAnimations();
  }, [featuredImages, directoryListings]);

  const initializeAnimations = () => {
    // Title animation
    if (titleRef.current) {
      gsap.fromTo(titleRef.current, 
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
      );
    }

    // Alphabet filter animation
    if (alphabetRef.current) {
      const letters = alphabetRef.current.querySelectorAll('span');
      gsap.fromTo(letters,
        { opacity: 0, scale: 0.8 },
        { 
          opacity: 1, 
          scale: 1, 
          duration: 0.5, 
          stagger: 0.05,
          ease: "back.out(1.7)"
        }
      );
    }

    // Table animation
    if (tableRef.current) {
      gsap.fromTo(tableRef.current,
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          delay: 0.3,
          ease: "power2.out",
          scrollTrigger: {
            trigger: tableRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }





    // Description animation
    if (descriptionRef.current) {
      gsap.fromTo(descriptionRef.current,
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: descriptionRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Course button animation
    if (courseButtonRef.current) {
      gsap.fromTo(courseButtonRef.current,
        { opacity: 0, scale: 0.8 },
        { 
          opacity: 1, 
          scale: 1, 
          duration: 0.6,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: courseButtonRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Service cards animation
    if (serviceCardsRef.current) {
      const cards = serviceCardsRef.current.querySelectorAll('#scard');
      gsap.fromTo(cards,
        { opacity: 0, y: 50, rotation: -3 },
        { 
          opacity: 1, 
          y: 0, 
          rotation: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: serviceCardsRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Bottom cards animation
    if (bottomCardsRef.current) {
      const cards = bottomCardsRef.current.querySelectorAll('div');
      gsap.fromTo(cards,
        { opacity: 0, x: -50 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.8,
          stagger: 0.3,
          ease: "power2.out",
          scrollTrigger: {
            trigger: bottomCardsRef.current,
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
    } catch {
      setUser(null);
    }
  };

  const fetchFeaturedImages = async () => {
    try {
      console.log('Services: Fetching featured listings from:', `${API_BASE}/api/featured-listings`);
      
      // Try direct fetch first
      try {
        const response = await fetch(`${API_BASE}/api/featured-listings`);
        if (response.ok) {
          const data = await response.json();
          console.log('Services: Featured listings fetched successfully via direct fetch:', data);
          setFeaturedImages(data);
          return;
        }
      } catch (directError) {
        console.log('Services: Direct fetch failed for featured listings, trying useApi:', directError);
      }
      
      // Fallback to useApi
      const data = await get(`${API_BASE}/api/featured-listings`, 'Loading featured listings...');
      console.log('Services: Featured listings fetched successfully via useApi:', data);
      setFeaturedImages(data);
    } catch (err) {
      console.error('Services: Failed to fetch featured listings:', err);
      console.error('Services: API_BASE:', API_BASE);
      setFeaturedImages([]);
    }
  };

  const fetchDirectoryListings = async () => {
    try {
      console.log('Services: Fetching directory listings from:', `${API_BASE}/api/directory`);
      
      // Try direct fetch first
      try {
        const response = await fetch(`${API_BASE}/api/directory`);
        if (response.ok) {
          const data = await response.json();
          console.log('Services: Directory listings fetched successfully via direct fetch:', data);
          setDirectoryListings(data);
          return;
        }
      } catch (directError) {
        console.log('Services: Direct fetch failed, trying useApi:', directError);
      }
      
      // Fallback to useApi
      const data = await get(`${API_BASE}/api/directory`, 'Loading directory listings...');
      console.log('Services: Directory listings fetched successfully via useApi:', data);
      setDirectoryListings(data);
    } catch (err) {
      console.error('Services: Failed to fetch directory listings:', err);
      console.error('Services: API_BASE:', API_BASE);
      setDirectoryListings([]);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('Services: Fetching categories from:', `${API_BASE}/api/directory/categories`);
      
      // Try direct fetch first
      try {
        const response = await fetch(`${API_BASE}/api/directory/categories`);
        if (response.ok) {
          const data = await response.json();
          console.log('Services: Categories fetched successfully via direct fetch:', data);
          setCategories(data);
          return;
        }
      } catch (directError) {
        console.log('Services: Direct fetch failed, trying useApi:', directError);
      }
      
      // Fallback to useApi
      const data = await get(`${API_BASE}/api/directory/categories`, 'Loading categories...');
      console.log('Services: Categories fetched successfully via useApi:', data);
      setCategories(data);
    } catch (err) {
      console.error('Services: Failed to fetch categories:', err);
      console.error('Services: API_BASE:', API_BASE);
      setCategories([]);
    }
  };

  const handleImageUpload = async (listingId, file) => {
    setUploadingId(listingId);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      // PATCH endpoint to update directory listing with image
      const res = await fetch(`${API_BASE}/api/directory/${listingId}/image`, {
        method: 'PATCH',
        body: formData,
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to upload image');
      await fetchDirectoryListings();
    } catch (err) {
      setUploadError('Image upload failed.');
    } finally {
      setUploadingId(null);
    }
  };

  const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  
  // Detect and store user's location
  const detectUserLocation = async () => {
    console.log('Services: detectUserLocation called');
    
    // Check if we already have location in localStorage
    const existingLocation = localStorage.getItem('userLocation');
    if (existingLocation) {
      console.log('Services: Found existing location in localStorage:', existingLocation);
      // Don't override existing location - return early
      return;
    }
    
    console.log('Services: No existing location, attempting to detect from backend API...');
    
    try {
      // Call the same backend API that Directory page uses
      const response = await fetch(`${API_BASE}/api/directory/nearby`, {
        method: 'GET',
        credentials: 'include',
      });
      
      console.log('Services: Backend location response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Services: Backend location data:', data);
        
        if (data.userLocation && data.userLocation.city !== 'Unknown') {
          const locationData = {
            city: data.userLocation.city || '',
            state: data.userLocation.state || '',
            country: data.userLocation.country || ''
          };
          console.log('Services: Setting location from backend API:', locationData);
          localStorage.setItem('userLocation', JSON.stringify(locationData));
        } else {
          console.log('Services: Backend API returned unknown location, trying browser geolocation');
          // Try browser geolocation as fallback
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                console.log('Services: Browser geolocation success:', position.coords);
                // Don't set hardcoded location - let user set manually if needed
                console.log('Services: Browser geolocation available but no reverse geocoding - location not set');
              },
              (error) => {
                console.log('Services: Browser geolocation failed:', error);
                console.log('Services: No location detected - user will need to set manually');
              }
            );
          } else {
            console.log('Services: Browser geolocation not available - no location set');
          }
        }
      } else {
        console.log('Services: Backend API failed with status:', response.status);
        // Try browser geolocation as fallback
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('Services: Browser geolocation success:', position.coords);
              console.log('Services: Browser geolocation available but no reverse geocoding - location not set');
            },
            (error) => {
              console.log('Services: Browser geolocation failed:', error);
              console.log('Services: No location detected - user will need to set manually');
            }
          );
        } else {
          console.log('Services: Browser geolocation not available - no location set');
        }
      }
    } catch (error) {
      console.log('Services: Backend API fetch failed:', error);
      // Try browser geolocation as fallback
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('Services: Browser geolocation success:', position.coords);
            console.log('Services: Browser geolocation available but no reverse geocoding - location not set');
          },
          (error) => {
            console.log('Services: Browser geolocation failed:', error);
            console.log('Services: No location detected - user will need to set manually');
          }
        );
      } else {
        console.log('Services: Browser geolocation not available - no location set');
      }
    }
  };
  
  // Sync location data from other pages
  const syncLocationData = () => {
    const currentLocation = localStorage.getItem('userLocation');
    console.log('Services: Current location in localStorage:', currentLocation);
    
    if (currentLocation) {
      try {
        const parsedLocation = JSON.parse(currentLocation);
        console.log('Services: Parsed location data:', parsedLocation);
        return parsedLocation;
      } catch (error) {
        console.log('Services: Error parsing location data:', error);
        return null;
      }
    }
    return null;
  };

  // Determine filtered listings based on view mode
  const getFilteredListings = () => {
    // Sync location data first
    const userLocation = syncLocationData();
    console.log('Services: getFilteredListings - userLocation:', userLocation);
    
    if (viewMode === 'category') {
      if (selectedCategory) {
        // Special handling for Local Contractors - always filter by location
        if (selectedCategory === 'Local Contractors') {
          console.log('Services: Filtering Local Contractors by location:', userLocation);
          
          if (userLocation && userLocation.city && userLocation.state && userLocation.country) {
            // More flexible location matching - show contractors from same state/country
            const filtered = directoryListings.filter(l => {
              if (l.industry !== selectedCategory) return false;
              if (!l.city || !l.state || !l.country) return false;
              
              // Check if contractor is in the same state or country as user
              const sameState = l.state.toLowerCase() === userLocation.state.toLowerCase();
              const sameCountry = l.country.toLowerCase() === userLocation.country.toLowerCase();
              const sameCity = l.city.toLowerCase() === userLocation.city.toLowerCase();
              
              // Show contractors from same city, state, or country
              return sameCity || sameState || sameCountry;
            });
            
            console.log('Services: Local Contractors filtered results:', filtered.length, 'out of', directoryListings.filter(l => l.industry === selectedCategory).length);
            return filtered;
          } else {
            console.log('Services: No user location found, showing all Local Contractors');
            // If no user location, show all Local Contractors
            return directoryListings.filter(l => l.industry === selectedCategory);
          }
        }
        return directoryListings.filter(l => l.industry === selectedCategory);
      } else {
        return directoryListings; // Show all listings when no category is selected
      }
    } else {
      // In alphabetical view, show all listings that start with selected letter
      // But for Local Contractors, also apply location filtering if user location exists
      console.log('Services: Alphabetical view filtering with location:', userLocation);
      
      return directoryListings.filter(l => {
        const matchesLetter = (l.company || '').toUpperCase().startsWith(selectedLetter);
        
        // If it's a Local Contractor and we have user location, apply location filtering
        if (l.industry === 'Local Contractors' && userLocation && userLocation.city && userLocation.state && userLocation.country) {
          const hasLocationData = l.city && l.state && l.country;
          if (!hasLocationData) return false;
          
          // More flexible location matching
          const sameState = l.state.toLowerCase() === userLocation.state.toLowerCase();
          const sameCountry = l.country.toLowerCase() === userLocation.country.toLowerCase();
          const sameCity = l.city.toLowerCase() === userLocation.city.toLowerCase();
          
          const matchesLocation = sameCity || sameState || sameCountry;
          
          return matchesLetter && matchesLocation;
        }
        
        // For non-Local Contractors or when no location data, just filter by letter
        return matchesLetter;
      });
    }
  };
  
  const filteredListings = getFilteredListings();

  return (
    <>
      <div id="cover">
        <div id="totalr">
          <div id="Hederarea">
            <Header />
          </div>

          <div id="directory-listing">
            <div id="Listingg">
              <h1 ref={titleRef}>{t("services.directoryListing.title")}</h1>
              
              {/* Sorting Buttons - Positioned right below the heading */}
              <div id="barea1" style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '16px', 
                margin: '8px 220px 32px 20px',
                flexWrap: 'wrap',
                overflowX: 'auto !important',
                whiteSpace: 'nowrap !important',
                padding: '0 10px'
              }}>
                <button
                  onClick={() => {
                    setViewMode('alphabetical');
                    setSelectedCategory(null);
                  }}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    background: viewMode === 'alphabetical' ? '#90be55' : '#f0f0f0',
                    color: viewMode === 'alphabetical' ? 'white' : '#333',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '16px'
                  }}
                >
                  {t("services.sortByAlphabet")}
                </button>
                <button
                  onClick={() => {
                    setViewMode('category');
                    setSelectedCategory(null);
                  }}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    background: viewMode === 'category' ? '#90be55' : '#f0f0f0',
                    color: viewMode === 'category' ? 'white' : '#333',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '16px'
                  }}
                >
                  {t("services.sortByCategory")}
                </button>
              </div>

                            {/* Category Filter Row - Only show when in category mode */}
              {viewMode === 'category' && (
                <div className="category-filter-container" style={{ 
                  margin: '24px 0', 
                  width: '100%', 
                  padding: '0 20px',
                  display: 'flex',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <div className="category-scroll-wrapper" style={{
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#90be55 #f0f0f0',
                    WebkitOverflowScrolling: 'touch',
                    padding: '10px 0'
                  }}>
                    <div className="category-list" style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: 'clamp(14px, 3vw, 24px)',
                      fontWeight: '500'
                    }}>
                      <span
                        onClick={() => setSelectedCategory(null)}
                        style={{
                          cursor: 'pointer',
                          fontWeight: selectedCategory === null ? 700 : 400,
                          color: selectedCategory === null ? '#90be55' : '#222',
                          textDecoration: selectedCategory === null ? 'underline' : 'none',
                          fontSize: 'clamp(14px, 3vw, 24px)',
                          transition: 'all 0.2s ease',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          whiteSpace: 'nowrap',
                          minWidth: 'fit-content'
                        }}
                      >
                        {t("services.allCategories")}
                      </span>
                      {categories.map((category, idx) => (
                        <React.Fragment key={category}>
                          <span style={{ 
                            color: '#666', 
                            fontSize: 'clamp(14px, 3vw, 24px)',
                            whiteSpace: 'nowrap'
                          }}>,</span>
                          <span
                            onClick={() => setSelectedCategory(category)}
                            style={{
                              cursor: 'pointer',
                              fontWeight: selectedCategory === category ? 700 : 400,
                              color: selectedCategory === category ? '#90be55' : '#222',
                              textDecoration: selectedCategory === category ? 'underline' : 'none',
                              fontSize: 'clamp(14px, 3vw, 24px)',
                              transition: 'all 0.2s ease',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              whiteSpace: 'nowrap',
                          minWidth: 'fit-content'
                            }}
                          >
                            {t(`services.categories.${category.toLowerCase().replace(/\s+/g, '')}`)}
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                  
                  {/* Location indicator for Local Contractors - REMOVED */}
                </div>
              )}

              {/* Directory A-Z Filter Row - Only show when in alphabetical mode */}
              {viewMode === 'alphabetical' && (
                <div id="uppa">
                <div id="ppa">
              <div id="parenta" ref={alphabetRef} style={{ fontSize: 32, margin: '24px 0', textAlign: 'center', whiteSpace: 'nowrap', overflowX: 'auto', width: '100%' }}>
                {alphabet.map((letter, idx) => (
                  <span id="iparent" key={letter}>
                    <span
                      onClick={() => setSelectedLetter(letter)}
                      style={{
                        cursor: 'pointer',
                        fontWeight: selectedLetter === letter ? 700 : 400,
                        color: selectedLetter === letter ? '#90be55' : '#222',
                        textDecoration: selectedLetter === letter ? 'underline' : 'none',
                        fontSize: selectedLetter === letter ? 40 : 32,
                        transition: 'all 0.2s',
                      }}
                    >
                      {letter}
                    </span>
                    {idx < alphabet.length - 1 && <span>, </span>}
                  </span>
                ))}
              </div>
              </div>
              </div>
              )}
              
              {/* Location indicator for alphabetical view when Local Contractors are filtered - REMOVED */}

              {/* Directory Table */}
  
              <div id="ttable" ref={tableRef} style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              {filteredListings.length > 0 ? (
                <div className="table-responsive-container" style={{ 
                  maxWidth: '1200px', 
                  width: '100%',
                  margin: '0 auto', 
                  background: '#fff', 
                  borderRadius: 24, 
                  boxShadow: '0 6px 32px rgba(0,0,0,0.10)', 
                  padding: 0, 
                  marginTop: 32, 
                  overflow: 'hidden'
                }}>
                  <div className="table-wrapper" style={{ overflowX: 'auto', width: '100%' }}>
                    <table className="responsive-table" style={{ 
                      width: '100%', 
                      borderCollapse: 'separate', 
                      borderSpacing: 0, 
                      fontSize: 16,
                      minWidth: selectedCategory === 'Local Contractors' ? '920px' : '800px' // Ensure minimum width for readability
                    }}>
                      <thead>
                        <tr style={{ background: '#f7f7f7', fontWeight: 800 }}>
                          <th style={{ padding: '16px 12px', border: 'none', textAlign: 'center', letterSpacing: 1, minWidth: '120px' }}>COMPANY</th>
                          <th style={{ padding: '16px 12px', border: 'none', textAlign: 'center', letterSpacing: 1, minWidth: '120px' }}>SOCIAL LINK</th>
                          <th style={{ padding: '16px 12px', border: 'none', textAlign: 'center', letterSpacing: 1, minWidth: '180px' }}>EMAIL</th>
                          <th style={{ padding: '16px 12px', border: 'none', textAlign: 'center', letterSpacing: 1, minWidth: '140px' }}>PHONE NUMBER</th>
                          <th style={{ padding: '16px 12px', border: 'none', textAlign: 'center', letterSpacing: 1, minWidth: '120px' }}>CATEGORY</th>
                          {selectedCategory === 'Local Contractors' && (
                            <th style={{ padding: '16px 12px', border: 'none', textAlign: 'center', letterSpacing: 1, minWidth: '120px' }}>LOCATION</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredListings.length === 0 && (
                          <tr>
                            <td colSpan={selectedCategory === 'Local Contractors' ? 6 : 5} style={{ textAlign: 'center', color: '#888', padding: 24 }}>
                              {viewMode === 'category' 
                                ? (selectedCategory ? `No listings for category "${selectedCategory}".` : 'No listings in the directory yet.')
                                : `No listings for letter "${selectedLetter}".`
                              }
                            </td>
                          </tr>
                        )}
                        {filteredListings.map((l, i) => {
                          // Determine package: use listing.package, but if current user matches and has upgraded, use user.package
                          let effectivePackage = l.package;
                          if (user && user.email === l.email && user.package && user.package !== l.package) {
                            effectivePackage = user.package;
                          }
                          let style = { fontWeight: 400, color: '#222', textAlign: 'center', background: i % 2 === 0 ? '#fff' : '#fafbfc' };
                          if (effectivePackage === 'pro') style = { ...style, fontWeight: 700, color: '#27ae60' };
                          if (effectivePackage === 'premium') style = { ...style, fontWeight: 700, color: '#ff6b57' };
                          if (!effectivePackage || effectivePackage === 'free') style = { ...style, fontWeight: 400, color: '#000000' };
                          return (
                            <tr key={i}>
                              <td style={{ ...style, padding: '14px 12px', border: 'none', wordBreak: 'break-word' }}>{l.company}</td>
                              <td style={{ ...style, padding: '14px 12px', border: 'none' }}>
                                {l.socialType && l.socialLink ? (
                                  <>
                                    <a href={l.socialLink} target="_blank" rel="noopener noreferrer">
                                      <button id="tb" style={{ 
                                        padding: '4px 14px', 
                                        borderRadius: 8, 
                                        background: 'transparent', 
                                        color: style.color, 
                                        border: `2px solid ${style.color}`, 
                                        fontWeight: style.fontWeight, 
                                        fontSize: 16, 
                                        cursor: 'pointer', 
                                        textTransform: 'capitalize',
                                        opacity: 1
                                      }}>{l.socialType}</button>
                                    </a>
                                  </>
                                ) : ''}
                              </td>
                              <td style={{ ...style, padding: '14px 12px', border: 'none', wordBreak: 'break-all' }}>{l.email}</td>
                              <td style={{ ...style, padding: '14px 12px', border: 'none', wordBreak: 'break-word' }}>{l.phone}</td>
                              <td style={{ ...style, padding: '14px 12px', border: 'none', wordBreak: 'break-word' }}>{l.industry}</td>
                              {selectedCategory === 'Local Contractors' && (
                                <td style={{ ...style, padding: '14px 12px', border: 'none', wordBreak: 'break-word' }}>
                                  {l.city && l.state && l.country ? `${l.city}, ${l.state}, ${l.country}` : 'Location not specified'}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : directoryListings.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#aaa', fontSize: 18, marginTop: 40 }}>No companies in the directory yet.</div>
              ) : null}
            </div>
            </div>
          </div>
          <div id="featured">
            <h1>{t("services.featuredListing")}</h1>
          </div>

          <div id="bannerr1" style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            {featuredImages.length === 0 && (
              <div style={{ color: '#888', fontSize: 18 }}>No featured listings yet.</div>
            )}
            {featuredImages.map(img => (
              <div key={img._id} style={{ border: '1px solid #222', borderRadius: 28, padding: 0, background: '#fff', minWidth: 320, minHeight: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={img.imageUrl} alt="Featured" style={{ width: 320, height: 140, objectFit: 'contain', borderRadius: 24 }} />
            </div>
            ))}
          </div>

          <div id="des" ref={descriptionRef}>
            <div id="innerdes">
              <p>{t("services.description")}</p>
            </div>
          </div>

          <div id="ufcourse">
            <div id="fcourse" ref={courseButtonRef}>
              <button>{t("services.courseButton")}</button>
            </div>
          </div>

          <div id="utotalscard" ref={serviceCardsRef}>
            <div id="totalscard">
              {[1, 2, 3, 4].map((_, i) => (
                <div id="scard" key={i}>
                  <img src={`./s${i+1}.png`} />
                  <h1>{t(`services.cards.${i}.title`)}</h1>
                  <p>{t(`services.cards.${i}.desc`)}</p>
                  <div id="innerh1s">
                    <h1>{t("services.professor")}</h1>
                    <p>Marie Curie</p>
                  </div>
                  <div id="innerh1ss">
                    <h1>{t("services.commencing")}</h1>
                    <p>01/01/2024</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div id="ubottomtexter">
            <div id="bottomtexter">
              <p>{t("services.trainingSummary")}</p>
            </div>
          </div>

          <div id="bottomone" ref={bottomCardsRef}>
            <div id="bcard1">
              <h1>{t("services.course1.title")}</h1>
              <p>{t("services.course1.line1")}</p>
              <p>{t("services.course1.line2")}</p>
              <p>{t("services.course1.line3")}</p>
              <p>{t("services.course1.line4")}</p>
              <h1>⭐ 4.3 ★★★★★ (990 students)</h1>
              <p>{t("services.createdBy")}</p>
            </div>
            <div id="bcard11">
              <h1>{t("services.course2.title")}</h1>
              <p>{t("services.course2.desc")}</p>
              <h1>⭐ 4.4 ★★★★★ (4,576 students)</h1>
              <p>{t("services.createdBy")}</p>
            </div>
          </div>
        </div>
        <Footer2 />
      </div>
    </>
  );
};

export default Services;
