import { useApi } from '../hooks/useApi';
import { API_BASE } from '../config';

const API_BASE_URL = API_BASE;

export const useLocationService = () => {
  const { get, post, put } = useApi();

  // Get contractors in a specific city
  const getLocalContractors = async (city, state = null, country = null) => {
    try {
      let url = `${API_BASE_URL}/api/directory/local/${encodeURIComponent(city)}`;
      const params = new URLSearchParams();
      
      if (state) params.append('state', state);
      if (country) params.append('country', country);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await get(url, 'Finding local contractors...');
      return response;
    } catch (error) {
      console.error('Error getting local contractors:', error);
      throw error;
    }
  };

  // Get contractors near user's current location
  const getNearbyContractors = async () => {
    try {
      const response = await get(`${API_BASE_URL}/api/directory/nearby`, 'Finding contractors near you...');
      return response;
    } catch (error) {
      console.error('Error getting nearby contractors:', error);
      throw error;
    }
  };

  // Search contractors by industry and location
  const searchContractors = async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });
      
      const url = `${API_BASE_URL}/api/directory/search?${params.toString()}`;
      const response = await get(url, 'Searching contractors...');
      return response;
    } catch (error) {
      console.error('Error searching contractors:', error);
      throw error;
    }
  };

  // Get all available cities
  const getAvailableCities = async () => {
    try {
      const response = await get(`${API_BASE_URL}/api/directory/cities`, 'Loading cities...');
      return response;
    } catch (error) {
      console.error('Error getting cities:', error);
      throw error;
    }
  };

  // Update user's location
  const updateUserLocation = async () => {
    try {
      const response = await put(`${API_BASE_URL}/api/auth/update-location`, {}, 'Updating your location...');
      return response;
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  };

  // Get user's current location from browser
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  // Reverse geocode coordinates to get city/state/country
  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_OPENCAGE_API_KEY`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0].components;
        return {
          city: result.city || result.town || result.village,
          state: result.state,
          country: result.country
        };
      }
      
      throw new Error('Unable to reverse geocode coordinates');
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      throw error;
    }
  };

  return {
    getLocalContractors,
    getNearbyContractors,
    searchContractors,
    getAvailableCities,
    updateUserLocation,
    getCurrentLocation,
    reverseGeocode
  };
};

// Standalone functions for use outside of React components
export const locationService = {
  // Get contractors in a specific city
  getLocalContractors: async (city, state = null, country = null) => {
    try {
      let url = `${API_BASE_URL}/api/directory/local/${encodeURIComponent(city)}`;
      const params = new URLSearchParams();
      
      if (state) params.append('state', state);
      if (country) params.append('country', country);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch local contractors');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting local contractors:', error);
      throw error;
    }
  },

  // Get contractors near user's current location
  getNearbyContractors: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/directory/nearby`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch nearby contractors');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting nearby contractors:', error);
      throw error;
    }
  },

  // Search contractors by industry and location
  searchContractors: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });
      
      const url = `${API_BASE_URL}/api/directory/search?${params.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to search contractors');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error searching contractors:', error);
      throw error;
    }
  }
}; 