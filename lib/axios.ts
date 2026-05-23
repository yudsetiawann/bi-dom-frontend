import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send HttpOnly session cookie automatically
});

export default api;

/**
 * Initialize CSRF cookie before login.
 * Must be called once before the first POST to /login.
 */
export async function initCsrf(): Promise<void> {
  await axios.get(
    (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace('/api/v1', '') + '/sanctum/csrf-cookie',
    { withCredentials: true },
  );
}
