import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const api = axios.create({
  baseURL:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000/api'                   // Local
      : 'https://artvibe-c59j.onrender.com/api',       // Production (Render)
  timeout: 10000,
});


const ImagePath = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5000'
  : 'https://artvibe-c59j.onrender.com';
export { ImagePath };

// Add token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Token added to request:', token.substring(0, 20) + '...');
    } else {
      console.log('⚠️ No token found in localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle authentication errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.config?.url);
    
    if (error.response?.status === 401) {
      console.log('🚫 Authentication failed, redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;