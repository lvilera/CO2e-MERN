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
  const [selectedCategory, setSelectedCategory] = useState('Local Contractors'); // 'Local Contractors' = main category, others = sub-categories
  const [showSubCategories, setShowSubCategories] = useState(false);
  const [subCategories, setSubCategories] = useState([]);
  
  // Debug: Log when categories change
  useEffect(() => {
    console.log('Categories state changed:', categories);
  }, [categories]);
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
    console.log('Services component mounted, fetching data...');
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

    // Table animation - appear immediately without scroll trigger
    if (tableRef.current) {
      gsap.fromTo(tableRef.current,
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          delay: 0.3,
          ease: "power2.out"
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
      // Try direct fetch first
      try {
        const response = await fetch(`${API_BASE}/api/featured-listings`);
        if (response.ok) {
          const data = await response.json();
          setFeaturedImages(data);
          return;
        }
      } catch (directError) {
        // Fallback to useApi
      }
      
      // Fallback to useApi
      const data = await get(`${API_BASE}/api/featured-listings`, 'Loading featured listings...');
      setFeaturedImages(data);
    } catch (err) {
      console.error('Services: Failed to fetch featured listings:', err);
      setFeaturedImages([]);
    }
  };

  const fetchDirectoryListings = async () => {
    try {
      // Try direct fetch first
      try {
        const response = await fetch(`${API_BASE}/api/directory`);
        if (response.ok) {
          const data = await response.json();
          console.log('Services: Fetched directory listings:', data.length, 'entries');
          console.log('Sample entries:', data.slice(0, 3));
          setDirectoryListings(data);
          return;
        }
      } catch (directError) {
        console.error('Direct fetch failed:', directError);
        // Fallback to useApi
      }
      
      // Fallback to useApi
      const data = await get(`${API_BASE}/api/directory`, 'Loading directory listings...');
      console.log('Services: Fetched directory listings via useApi:', data.length, 'entries');
      setDirectoryListings(data);
    } catch (err) {
      console.error('Services: Failed to fetch directory listings:', err);
      setDirectoryListings([]);
    }
  };

  const fetchCategories = async () => {
    try {
      // First, get the actual unique industries from the database
      const response = await fetch(`${API_BASE}/api/directory`);
        if (response.ok) {
        const listings = await response.json();
        
        // Extract unique industries and display categories from database
        const uniqueIndustries = [...new Set(listings.map(l => l.industry).filter(Boolean))];
        const uniqueDisplayCategories = [...new Set(listings.map(l => l.displayCategory).filter(Boolean))];
        console.log('Unique industries from database:', uniqueIndustries);
        console.log('Unique display categories from database:', uniqueDisplayCategories);
        
        // Create a mapping from database industries to display categories
        const industryToCategory = {
          'Broker': 'Broker',
          'Exchange': 'Exchange',
          'Local Contractors': 'Local Contractors',
          'Project': 'Project',
          'Retail': 'Retail',
          'Wholesaler': 'Wholesaler',
          // Map other industries to appropriate categories
          'Construction': 'Project',
          'Technology': 'Project',
          'Finance': 'Project',
          'Wholesale': 'Wholesaler'
        };
        
        // Create display categories based on actual data
        const displayCategories = [];
        
        // First, add display categories from the database
        uniqueDisplayCategories.forEach(displayCategory => {
          if (!displayCategories.includes(displayCategory)) {
            displayCategories.push(displayCategory);
          }
        });
        
        // Then, map any remaining industries to categories
        uniqueIndustries.forEach(industry => {
          const category = industryToCategory[industry] || industry;
          if (!displayCategories.includes(category)) {
            displayCategories.push(category);
          }
        });
        
        console.log('Display categories:', displayCategories);
        console.log('Categories state being set to:', displayCategories);
        setCategories(displayCategories);
      } else {
        // Fallback to predefined categories
        const fallbackCategories = [
          'Broker',
          'Exchange', 
          'Local Contractors',
          'Project',
          'Retail',
          'Wholesaler'
        ];
        setCategories(fallbackCategories);
      }
      
      // Still fetch contractor types for Local Contractors subcategories
      try {
        const contractorResponse = await fetch(`${API_BASE}/api/directory/contractor-types`);
        if (contractorResponse.ok) {
          const contractorTypes = await contractorResponse.json();
          setSubCategories(contractorTypes);
        } else {
          setSubCategories([]);
        }
      } catch (contractorError) {
        setSubCategories([]);
      }
    } catch (err) {
      console.error('Services: Failed to set categories:', err);
      
            // Fallback to hardcoded categories
      const fallbackCategories = [
        'Broker',
        'Exchange', 
        'Local Contractors',
        'Project',
        'Retail',
        'Wholesaler'
      ];
      
      setCategories(fallbackCategories);
          setSubCategories([]);
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
    // Check if we already have location in localStorage
    const existingLocation = localStorage.getItem('userLocation');
    if (existingLocation) {
      // Don't override existing location - return early
      return;
    }
    
    try {
      // Call the same backend API that Directory page uses
      const response = await fetch(`${API_BASE}/api/directory/nearby`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.userLocation && data.userLocation.city !== 'Unknown') {
          const locationData = {
            city: data.userLocation.city || '',
            state: data.userLocation.state || '',
            country: data.userLocation.country || ''
          };
          localStorage.setItem('userLocation', JSON.stringify(locationData));
        } else {
          // Try browser geolocation as fallback
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                // Don't set hardcoded location - let user set manually if needed
              },
              (error) => {
                // Browser geolocation failed
              }
            );
          }
        }
      } else {
        // Try browser geolocation as fallback
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              // Browser geolocation available but no reverse geocoding - location not set
            },
            (error) => {
              // Browser geolocation failed
            }
          );
        }
      }
    } catch (error) {
      // Try browser geolocation as fallback
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Browser geolocation available but no reverse geocoding - location not set
          },
          (error) => {
            // Browser geolocation failed
          }
        );
      }
    }
  };
  
  // Sync location data from other pages
  const syncLocationData = () => {
    const currentLocation = localStorage.getItem('userLocation');
    
    if (currentLocation) {
      try {
        const parsedLocation = JSON.parse(currentLocation);
        return parsedLocation;
      } catch (error) {
        return null;
      }
    }
    return null;
  };

  // Determine filtered listings based on view mode
  const getFilteredListings = () => {
    // Sync location data first
    const userLocation = syncLocationData();
    
    console.log('getFilteredListings called with:', {
      viewMode,
      selectedCategory,
      totalListings: directoryListings.length,
      sampleIndustries: directoryListings.slice(0, 5).map(l => l.industry)
    });
    
    if (viewMode === 'category') {
      if (selectedCategory) {
        // If no category is selected, show Local Contractors by default
        if (!selectedCategory) {
          console.log('No category selected, showing Local Contractors by default');
          return directoryListings.filter(listing => 
            listing.displayCategory === 'Local Contractors' || 
            listing.industry === 'Local Contractors'
          );
        }
        
        // Special handling for Local Contractors - always filter by location
        if (selectedCategory === 'Local Contractors') {
          if (userLocation && userLocation.city && userLocation.state && userLocation.country) {
            // More flexible location matching - show contractors from same state/country
            const filtered = directoryListings.filter(l => {
              // Check displayCategory first, then fallback to industry
              const isLocalContractor = (l.displayCategory === selectedCategory) || (l.industry === selectedCategory);
              if (!isLocalContractor) return false;
              if (!l.city || !l.state || !l.country) return false;
              
              // Check if contractor is in the same state or country as user
              const sameState = l.state.toLowerCase() === userLocation.state.toLowerCase();
              const sameCountry = l.country.toLowerCase() === userLocation.country.toLowerCase();
              const sameCity = l.city.toLowerCase() === userLocation.city.toLowerCase();
              
              // Show contractors from same city, state, or country
              return sameCity || sameState || sameCountry;
            });
            
            return filtered;
          } else {
            // If no user location, show all Local Contractors
            return directoryListings.filter(l => {
              // Check displayCategory first, then fallback to industry
              return (l.displayCategory === selectedCategory) || (l.industry === selectedCategory);
            });
          }
        }
        
        // Handle contractor type subcategories (e.g., Plumber, Electrician)
        // Check if selectedCategory is a contractor type from the dynamically fetched subcategories
        if (subCategories.includes(selectedCategory)) {
          // Filter by both industry (Local Contractors) and contractor type
          return directoryListings.filter(l => {
            if (l.industry !== 'Local Contractors') return false;
            
            // Check if the listing has the specific contractor type
            // This could be in contractorType field or customContractorType field
            const listingContractorType = l.contractorType || l.customContractorType || '';
            const matchesContractorType = listingContractorType.toLowerCase() === selectedCategory.toLowerCase();
            
            return matchesContractorType;
          });
        }
        
        // Handle industry mapping for Project category
        if (selectedCategory === 'Project') {
          const projectListings = directoryListings.filter(l => {
            // Use displayCategory if available, otherwise fall back to industry mapping
            if (l.displayCategory === 'Project') return true;
            
            // Fallback: Map database industries to Project category
            const projectIndustries = ['Construction', 'Technology', 'Finance'];
            return projectIndustries.includes(l.industry);
          });
          console.log('Project category filtering:', {
            selectedCategory,
            totalListings: directoryListings.length,
            projectListings: projectListings.length,
            projectIndustries: ['Construction', 'Technology', 'Finance'],
            foundIndustries: [...new Set(projectListings.map(l => l.industry))]
          });
          return projectListings;
        }
        
        // Handle industry mapping for Wholesaler category
        if (selectedCategory === 'Wholesaler') {
          return directoryListings.filter(l => {
            // Use displayCategory if available, otherwise fall back to industry mapping
            if (l.displayCategory === 'Wholesaler') return true;
            
            // Fallback: Map database industries to Wholesaler category
            const wholesalerIndustries = ['Wholesale'];
            return wholesalerIndustries.includes(l.industry);
          });
        }
        
        // For other categories, do exact matching (check both displayCategory and industry)
        return directoryListings.filter(l => {
          // First check displayCategory if available
          if (l.displayCategory === selectedCategory) return true;
          // Fallback to industry matching
          return l.industry === selectedCategory;
        });
      } else {
        return directoryListings; // Show all listings when no category is selected
      }
    } else {
      // In alphabetical view, show all listings that start with selected letter
      // But for Local Contractors, also apply location filtering if user location exists
      
      return directoryListings.filter(l => {
        // Ensure company name exists and filter by first letter
        const companyName = l.company || l.Company || '';
        const matchesLetter = companyName.toUpperCase().startsWith(selectedLetter);
        
        // If it's a Local Contractor and we have user location, apply location filtering
        if ((l.displayCategory === 'Local Contractors' || l.industry === 'Local Contractors') && userLocation && userLocation.city && userLocation.state && userLocation.country) {
          const hasLocationData = l.city && l.state && l.country;
          if (!hasLocationData) {
            return false;
          }
          
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

          <div id="directory-listing" style={{ maxWidth: '100%', overflow: 'hidden' }}>
            <div id="Listingg" style={{ 
              paddingTop: '80px',
              paddingLeft: 'clamp(20px, 5vw, 220px)',
              paddingRight: 'clamp(20px, 5vw, 220px)',
              textAlign: 'center'
            }}>
              <h1 ref={titleRef} style={{ 
                position: 'relative',
                fontSize: 'clamp(32px, 8vw, 50px)',
                lineHeight: '1.2',
                marginBottom: '20px'
              }}>
                {/* Anchor div for navbar navigation - ensures heading appears from start */}
                <div id="directory-listing-anchor" style={{ position: 'absolute', top: '-100px', visibility: 'hidden', height: '0', width: '0' }}></div>
                {t("services.directoryListing.title")}
              </h1>
              
              {/* Sorting Buttons - Positioned above the category section */}
              <div id="barea1" style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '16px', 
                margin: '20px auto',
                maxWidth: '800px',
                flexWrap: 'wrap',
                overflowX: 'auto !important',
                whiteSpace: 'nowrap !important',
                padding: '0 20px',
                width: '100%',
                textAlign: 'center'
              }}>
                <button
                  onClick={() => {
                    setViewMode('alphabetical');
                    setSelectedLetter('A');
                    setSelectedCategory('Local Contractors');
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
                    fontSize: '16px',
                    textAlign: 'center',
                    display: 'inline-block',
                    margin: '0'
                  }}
                >
                  {t("services.sortByAlphabet")}
                </button>
                <button
                  onClick={() => {
                    setViewMode('category');
                    setSelectedCategory('Local Contractors'); // Show Local Contractors by default
                    setShowSubCategories(true);
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
                    fontSize: '16px',
                    textAlign: 'center',
                    display: 'inline-block',
                    margin: '0'
                  }}
                >
                  {t("services.sortByCategory")}
                </button>
              </div>
              
              {/* Category Filter Row - Only show when in category mode - MOVED HERE */}
              {viewMode === 'category' && (
                <div  className="category-filter-container" style={{ 
                  margin: '20px auto 30px auto', 
                  width: '100%', 
                  maxWidth: '1200px',
                  padding: '0 20px',
                  display: 'flex',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  <div className="category-scroll-wrapper" style={{
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#90be55 #f0f0f0',
                    WebkitOverflowScrolling: 'touch',
                    padding: '10px 0',
                    textAlign: 'center',
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%'
                  }}>
                    <div className="category-list" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: 'clamp(14px, 3vw, 24px)',
                      fontWeight: '500',
                      width: '100%',
                      textAlign: 'center',
                      minHeight: '44px',
                      flexWrap: 'wrap',
                      margin: '0 auto',
                      padding: '0'
                    }}>
                      {categories.map((category, idx) => (
                        <span id="" className="category-item"
                          key={category}
                          onClick={() => {
                            if (category === 'Local Contractors') {
                              setSelectedCategory(category);
                              setShowSubCategories(true); // Show subcategories
                            } else {
                              // If selecting a different main category, reset to that category
                              setSelectedCategory(category);
                              setShowSubCategories(false);
                            }
                          }}
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
                            minWidth: 'fit-content',
                            textAlign: 'left'
                          }}
                        >
                          {t(`services.categories.${category.toLowerCase().replace(/\s+/g, '')}`)}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Sub-categories - Show when Local Contractors is selected or any of its subcategories */}
                  {(selectedCategory === 'Local Contractors' || subCategories.includes(selectedCategory)) && (
                    <div id="sider" className="sub-categories-container" style={{
                      marginTop: '16px',
                      padding: '16px',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef',
                      width: '100%',
                      maxWidth: '800px',
                      textAlign: 'center'
                    }}>
                      <div className="sub-categories-instruction" style={{
                        fontSize: 'clamp(12px, 2.5vw, 18px)',
                        color: '#666',
                        marginBottom: '12px',
                        textAlign: 'center'
                      }}>
                        {t('services.selectServiceType')}
                      </div>
                      <div className="sub-categories-list" style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '8px',
                        margin: '0 auto',
                        textAlign: 'center'
                      }}>
                        {subCategories.map((subCat, idx) => (
                          <span
                            key={subCat}
                            onClick={() => {
                              setSelectedCategory(subCat);
                              setShowSubCategories(true); // Keep subcategories visible
                            }}
                            style={{
                              cursor: 'pointer',
                              fontWeight: selectedCategory === subCat ? 700 : 400,
                              color: selectedCategory === subCat ? '#90be55' : '#666',
                              textDecoration: selectedCategory === subCat ? 'underline' : 'none',
                              fontSize: 'clamp(12px, 2.5vw, 16px)',
                              transition: 'all 0.2s ease',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              border: selectedCategory === subCat ? '2px solid #90be55' : '1px solid #ddd',
                              background: selectedCategory === subCat ? '#f0f8f0' : 'white',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {subCat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Location indicator for Local Contractors - REMOVED */}
                </div>
              )}
              
              {/* Directory A-Z Filter Row - Only show when in alphabetical mode */}
              {viewMode === 'alphabetical' && (
                <div id="uppa" style={{ padding: '0 20px' }}>
                <div id="ppa">
              <div id="parenta" ref={alphabetRef} style={{ 
                fontSize: 'clamp(20px, 6vw, 32px)', 
                margin: '16px auto', 
                textAlign: 'center', 
                whiteSpace: 'nowrap', 
                overflowX: 'auto', 
                width: '100%',
                maxWidth: '1200px',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'thin'
              }}>
                {alphabet.map((letter, idx) => (
                  <span id="iparent" key={letter}>
                    <span
                      onClick={() => {
                        setSelectedLetter(letter);
                      }}
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
  
              <div id="ttable" ref={tableRef} style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                width: '100%',
                padding: '0 20px',
                marginTop: '20px'
              }}>
              {filteredListings.length > 0 ? (
                <div className="table-responsive-container" style={{ 
                  maxWidth: '1200px', 
                  width: '100%',
                  margin: '0 auto', 
                  background: '#fff', 
                  borderRadius: 'clamp(16px, 3vw, 24px)', 
                  boxShadow: '0 6px 32px rgba(0,0,0,0.10)', 
                  padding: 0, 
                  marginTop: 0, 
                  display: 'flex',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  <div className="table-wrapper" style={{ 
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <table className="responsive-table" style={{ 
                      width: '100%', 
                      maxWidth: '100%',
                      borderCollapse: 'separate', 
                      borderSpacing: 0, 
                      fontSize: 'clamp(14px, 3vw, 16px)',
                      margin: '0 auto',
                      tableLayout: 'fixed'
                    }}>
                      <thead>
                        <tr style={{ background: '#f7f7f7', fontWeight: 800 }}>
                          <th style={{ 
                            padding: 'clamp(8px, 2vw, 16px) clamp(6px, 1.5vw, 12px)', 
                            border: 'none', 
                            textAlign: 'center', 
                            letterSpacing: 1, 
                            fontSize: 'clamp(12px, 2.5vw, 16px)',
                            width: selectedCategory === 'Local Contractors' ? '16%' : '20%'
                          }}>COMPANY</th>
                          <th style={{ 
                            padding: 'clamp(8px, 2vw, 16px) clamp(6px, 1.5vw, 12px)', 
                            border: 'none', 
                            textAlign: 'center', 
                            letterSpacing: 1, 
                            fontSize: 'clamp(12px, 2.5vw, 16px)',
                            width: selectedCategory === 'Local Contractors' ? '12%' : '15%'
                          }}>SOCIAL LINK</th>
                          <th style={{ 
                            padding: 'clamp(8px, 2vw, 16px) clamp(6px, 1.5vw, 12px)', 
                            border: 'none', 
                            textAlign: 'center', 
                            letterSpacing: 1, 
                            fontSize: 'clamp(12px, 2.5vw, 16px)',
                            width: selectedCategory === 'Local Contractors' ? '20%' : '25%'
                          }}>EMAIL</th>
                          <th style={{ 
                            padding: 'clamp(8px, 2vw, 16px) clamp(6px, 1.5vw, 12px)', 
                            border: 'none', 
                            textAlign: 'center', 
                            letterSpacing: 1, 
                            fontSize: 'clamp(12px, 2.5vw, 16px)',
                            width: selectedCategory === 'Local Contractors' ? '16%' : '20%'
                          }}>PHONE NUMBER</th>
                          <th style={{ 
                            padding: 'clamp(8px, 2vw, 16px) clamp(6px, 1.5vw, 12px)', 
                            border: 'none', 
                            textAlign: 'center', 
                            letterSpacing: 1, 
                            fontSize: 'clamp(12px, 2.5vw, 16px)',
                            width: selectedCategory === 'Local Contractors' ? '16%' : '20%'
                          }}>CATEGORY</th>
                          {selectedCategory === 'Local Contractors' && (
                            <th style={{ 
                              padding: 'clamp(8px, 2vw, 16px) clamp(6px, 1.5vw, 12px)', 
                              border: 'none', 
                              textAlign: 'center', 
                              letterSpacing: 1, 
                              fontSize: 'clamp(12px, 2.5vw, 16px)',
                              width: '20%'
                            }}>LOCATION</th>
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
                              <td style={{ 
                                ...style, 
                                padding: 'clamp(8px, 2vw, 14px) clamp(6px, 1.5vw, 12px)', 
                                border: 'none', 
                                wordBreak: 'break-word',
                                fontSize: 'clamp(12px, 2.5vw, 16px)',
                                textAlign: 'center',
                                maxWidth: '0',
                                overflow: 'hidden',
                                wordWrap: 'break-word',
                                whiteSpace: 'normal'
                              }}>{l.company}</td>
                              <td style={{ 
                                ...style, 
                                padding: 'clamp(8px, 2vw, 14px) clamp(6px, 1.5vw, 12px)', 
                                border: 'none',
                                fontSize: 'clamp(12px, 2.5vw, 16px)',
                                textAlign: 'center',
                                maxWidth: '0',
                                overflow: 'hidden',
                                wordWrap: 'break-word',
                                whiteSpace: 'normal'
                              }}>
                                {l.socialType && l.socialLink ? (
                                  <>
                                    <a href={l.socialLink} target="_blank" rel="noopener noreferrer">
                                      <button id="tb" style={{ 
                                        padding: 'clamp(3px, 1vw, 4px) clamp(8px, 2vw, 14px)', 
                                        borderRadius: 'clamp(6px, 1.5vw, 8px)', 
                                        background: 'transparent', 
                                        color: style.color, 
                                        border: `2px solid ${style.color}`, 
                                        fontWeight: style.fontWeight, 
                                        fontSize: 'clamp(12px, 2.5vw, 16px)', 
                                        cursor: 'pointer', 
                                        textTransform: 'capitalize',
                                        opacity: 1,
                                        minHeight: '32px',
                                        minWidth: '60px'
                                      }}>{l.socialType}</button>
                                    </a>
                                  </>
                                ) : ''}
                              </td>
                              <td style={{ 
                                ...style, 
                                padding: 'clamp(8px, 2vw, 14px) clamp(6px, 1.5vw, 12px)', 
                                border: 'none', 
                                wordBreak: 'break-all',
                                fontSize: 'clamp(12px, 2.5vw, 16px)',
                                textAlign: 'center',
                                maxWidth: '0',
                                overflow: 'hidden',
                                wordWrap: 'break-word',
                                whiteSpace: 'normal'
                              }}>{l.email}</td>
                              <td style={{ 
                                ...style, 
                                padding: 'clamp(8px, 2vw, 14px) clamp(6px, 1.5vw, 12px)', 
                                border: 'none', 
                                wordBreak: 'break-word',
                                fontSize: 'clamp(12px, 2.5vw, 16px)',
                                textAlign: 'center',
                                maxWidth: '0',
                                overflow: 'hidden',
                                wordWrap: 'break-word',
                                whiteSpace: 'normal'
                              }}>{l.phone}</td>
                              <td style={{ 
                                ...style, 
                                padding: 'clamp(8px, 2vw, 14px) clamp(6px, 1.5vw, 12px)', 
                                border: 'none', 
                                wordBreak: 'break-word',
                                fontSize: 'clamp(12px, 2.5vw, 16px)',
                                textAlign: 'center',
                                maxWidth: '0',
                                overflow: 'hidden',
                                wordWrap: 'break-word',
                                whiteSpace: 'normal'
                              }}>{l.industry}</td>
                              {selectedCategory === 'Local Contractors' && (
                                <td style={{ 
                                  ...style, 
                                  padding: 'clamp(8px, 2vw, 14px) clamp(6px, 1.5vw, 12px)', 
                                  border: 'none', 
                                  wordBreak: 'break-word',
                                  fontSize: 'clamp(12px, 2.5vw, 16px)',
                                  textAlign: 'center',
                                  maxWidth: '0',
                                  overflow: 'hidden',
                                  wordWrap: 'break-word',
                                  whiteSpace: 'normal'
                                }}>
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

          {/* Course Cards Section - Anchor for Corporate Training Courses navigation */}
          <div id="utotalscard" ref={serviceCardsRef} style={{ position: 'relative' }}>
            {/* Anchor div for navbar navigation - ensures course cards appear from start */}
            <div id="fcourse-anchor" style={{ position: 'absolute', top: '-100px', visibility: 'hidden', height: '0', width: '0' }}></div>
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
