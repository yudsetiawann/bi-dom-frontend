import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  // Sesuaikan dengan URL backend Anda jika berbeda
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Selipkan token ke setiap request secara otomatis
api.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
