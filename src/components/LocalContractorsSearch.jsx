import React, { useState, useEffect } from 'react';
import { useLocationService, locationService } from '../services/locationService';
import './LocalContractorsSearch.css';

const LocalContractorsSearch = () => {
  const [searchType, setSearchType] = useState('nearby'); // 'nearby' or 'city'
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [industry, setIndustry] = useState('');
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableCities, setAvailableCities] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  const { 
    getLocalContractors, 
    getNearbyContractors, 
    searchContractors, 
    getAvailableCities,
    updateUserLocation 
  } = useLocationService();

  useEffect(() => {
    loadAvailableCities();
    detectUserLocation();
  }, []);

  const loadAvailableCities = async () => {
    try {
      const cities = await getAvailableCities();
      setAvailableCities(cities);
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  const detectUserLocation = async () => {
    try {
      setLoading(true);
      const response = await updateUserLocation();
      setUserLocation(response.location);
      setCity(response.location.city);
      setState(response.location.state);
      setCountry(response.location.country);
    } catch (error) {
      console.error('Error detecting location:', error);
      setError('Unable to detect your location automatically. Please search by city name.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError('');
      let response;

      if (searchType === 'nearby') {
        response = await getNearbyContractors();
        setContractors(response.contractors);
      } else if (searchType === 'city') {
        if (!city.trim()) {
          setError('Please enter a city name');
          return;
        }
        response = await getLocalContractors(city, state || null, country || null);
        setContractors(response.contractors);
      } else if (searchType === 'advanced') {
        const filters = {};
        if (city) filters.city = city;
        if (state) filters.state = state;
        if (country) filters.country = country;
        if (industry) filters.industry = industry;
        
        response = await searchContractors(filters);
        setContractors(response.contractors);
      }
    } catch (error) {
      setError(error.message || 'Error searching contractors');
      setContractors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCityChange = (e) => {
    const selectedCity = e.target.value;
    setCity(selectedCity);
    
    // Auto-fill state and country if available
    if (selectedCity && availableCities.length > 0) {
      // This is a simplified approach - in a real app you'd have a proper city database
      // with state and country mappings
    }
  };

  return (
    <div className="local-contractors-search">
      <div className="search-header">
        <h2>Find Local Contractors</h2>
        <p>Discover contractors in your area or search by location</p>
      </div>

      <div className="search-controls">
        <div className="search-type-selector">
          <button
            className={`search-type-btn ${searchType === 'nearby' ? 'active' : ''}`}
            onClick={() => setSearchType('nearby')}
          >
            📍 Near Me
          </button>
          <button
            className={`search-type-btn ${searchType === 'city' ? 'active' : ''}`}
            onClick={() => setSearchType('city')}
          >
            🏙️ By City
          </button>
          <button
            className={`search-type-btn ${searchType === 'advanced' ? 'active' : ''}`}
            onClick={() => setSearchType('advanced')}
          >
            🔍 Advanced Search
          </button>
        </div>

        {searchType === 'city' && (
          <div className="city-search">
            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                value={city}
                onChange={handleCityChange}
                placeholder="Enter city name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input
                type="text"
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State (optional)"
              />
            </div>
            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input
                type="text"
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Country (optional)"
              />
            </div>
          </div>
        )}

        {searchType === 'advanced' && (
          <div className="advanced-search">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="adv-city">City</label>
                <input
                  type="text"
                  id="adv-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="adv-state">State</label>
                <input
                  type="text"
                  id="adv-state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                />
              </div>
              <div className="form-group">
                <label htmlFor="adv-country">Country</label>
                <input
                  type="text"
                  id="adv-country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Country"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="industry">Industry</label>
              <input
                type="text"
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., Plumbing, Electrical, Construction"
              />
            </div>
          </div>
        )}

        {searchType === 'nearby' && userLocation && (
          <div className="location-info">
            <p>
              📍 Your location: <strong>{userLocation.city}, {userLocation.state}, {userLocation.country}</strong>
            </p>
            <button 
              className="refresh-location-btn"
              onClick={detectUserLocation}
              disabled={loading}
            >
              🔄 Refresh Location
            </button>
          </div>
        )}

        <button 
          className="search-btn"
          onClick={handleSearch}
          disabled={loading || (searchType === 'city' && !city.trim())}
        >
          {loading ? 'Searching...' : 'Search Contractors'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {contractors.length > 0 && (
        <div className="results-section">
          <h3>Found {contractors.length} contractor(s)</h3>
          <div className="contractors-grid">
            {contractors.map((contractor, index) => (
              <div key={contractor._id || index} className="contractor-card">
                {contractor.imageUrl && (
                  <div className="contractor-image">
                    <img src={contractor.imageUrl} alt={contractor.company} />
                  </div>
                )}
                <div className="contractor-info">
                  <h4>{contractor.company}</h4>
                  <p className="industry">{contractor.industry}</p>
                  <p className="location">
                    📍 {contractor.city}, {contractor.state}, {contractor.country}
                  </p>
                  <p className="description">{contractor.description}</p>
                  <div className="contact-info">
                    <p>📧 {contractor.email}</p>
                    <p>📞 {contractor.phone}</p>
                    {contractor.website && (
                      <p>🌐 <a href={contractor.website} target="_blank" rel="noopener noreferrer">Website</a></p>
                    )}
                  </div>
                  {contractor.package && (
                    <span className={`package-badge ${contractor.package}`}>
                      {contractor.package.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && contractors.length === 0 && searchType !== 'nearby' && (
        <div className="no-results">
          <p>No contractors found. Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default LocalContractorsSearch; 