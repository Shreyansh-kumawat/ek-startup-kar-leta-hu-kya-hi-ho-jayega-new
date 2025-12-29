// apiClient.js - Updated version
import axios from 'axios';

// ✅ FIXED: Better fallback logic
const getAPIBaseURL = () => {
  // Production URL from Vercel environment
  const prodURL = import.meta.env.VITE_API_BASE_URL;
  
  // Fallback URLs
  const fallbackURL = 'https://threedi-tbs-new.onrender.com/api';
  const devURL = 'http://localhost:5000/api';
  
  // Debug logging
  // console.log('🔍 Environment:', import.meta.env.MODE);
  // console.log('🔍 VITE_API_BASE_URL:', prodURL);
  
  // Return appropriate URL
  if (import.meta.env.PROD && prodURL) {
    // console.log('✅ Using production URL:', prodURL);
    return prodURL;
  } else if (import.meta.env.PROD) {
    // console.log('⚠️ Using fallback URL:', fallbackURL);
    return fallbackURL;
  } else {
    // console.log('🛠️ Using development URL:', devURL);
    return devURL;
  }
};

// Create axios instance
const apiClient = axios.create({
  baseURL: getAPIBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ FIXED: Consistent token key
apiClient.interceptors.request.use(
  (config) => {
    // ✅ Use consistent token key (match with useAuth)
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // console.log('🚀 API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ✅ FIXED: Better error handling
apiClient.interceptors.response.use(
  (response) => {
    // console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });
    
    // ✅ Handle 401 Unauthorized - Clear auth and redirect
    if (error.response?.status === 401) {
      // Clear both possible token keys
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login/register page
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    
    // ✅ Better network error handling
    if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK' || !error.response) {
      console.error('🌐 Network error: Backend might be down');
      error.message = 'Network error: Please check your connection or try again later';
    }
    
    // ✅ Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout: Server took too long to respond';
    }
    
    return Promise.reject(error);
  }
);

// ✅ FIXED: Update helper functions
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token); // ✅ Use 'token' key consistently
    localStorage.removeItem('authToken'); // Remove old key
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('🔑 Auth token set successfully');
  } else {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    delete apiClient.defaults.headers.common['Authorization'];
    console.log('🔓 Auth token cleared');
  }
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  delete apiClient.defaults.headers.common['Authorization'];
  console.log('🧹 All auth data cleared');
};

// ✅ Updated API status check with better endpoint
export const checkAPIStatus = async () => {
  try {
    const response = await apiClient.get('/health');
    return {
      status: 'online',
      data: response.data,
    };
  } catch (error) {
    return {
      status: 'offline',
      error: error.message,
    };
  }
};

// ✅ Get server image URL helper
export const getServerImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // ✅ Environment-based server URL
  const serverURL = import.meta.env.VITE_SERVER_BASE_URL || 
    (import.meta.env.PROD 
      ? 'https://threedi-tbs-new.onrender.com'  
      : 'http://localhost:5000');
  
  // Handle absolute URLs
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Handle relative paths
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  const fullURL = `${serverURL}${cleanPath}`;
  
  // console.log(`🖼️ Image URL: ${imagePath} → ${fullURL}`);
  return fullURL;
};

// ✅ Create FormData helper (for file uploads)
export const createFormData = (data, fileFieldName = 'file') => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    if (data[key] instanceof File) {
      formData.append(fileFieldName, data[key]);
    } else if (Array.isArray(data[key])) {
      data[key].forEach((item, index) => {
        formData.append(`${key}[${index}]`, item);
      });
    } else if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  
  return formData;
};

// ✅ NEW: Generic API request helpers
export const apiGet = async (endpoint, config = {}) => {
  return apiClient.get(endpoint, config);
};

export const apiPost = async (endpoint, data = {}, config = {}) => {
  return apiClient.post(endpoint, data, config);
};

export const apiPut = async (endpoint, data = {}, config = {}) => {
  return apiClient.put(endpoint, data, config);
};

export const apiPatch = async (endpoint, data = {}, config = {}) => {
  return apiClient.patch(endpoint, data, config);
};

export const apiDelete = async (endpoint, config = {}) => {
  return apiClient.delete(endpoint, config);
};

export default apiClient;
