import axios from 'axios';
const origin = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '').replace(/\/$/, '');
export const api = axios.create({
  baseURL: `${origin}/api`,
  timeout: 15000,
  headers: {
    Accept: 'application/json'
  }
});
api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('morocare-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['Accept-Language'] = localStorage.getItem('language') || 'en';
  return config;
});
api.interceptors.response.use(r => r, error => {
  if (error.response?.status === 401 && !error.config.url.endsWith('/login')) {
    sessionStorage.removeItem('morocare-token');
    window.dispatchEvent(new Event('auth-expired'));
  }
  return Promise.reject(error);
});
export function errorText(error, t) {
  if (error.response?.data?.errors?.time) return t('This time is already booked. Choose another time.');
  const status = error.response?.status;
  if (status === 422) return t('Check the form fields and try again.');
  if (status === 403) return t('You do not have access to this action.');
  if (status === 429) return t('Too many requests. Please wait a moment.');
  if (status >= 500) return t('Service temporarily unavailable.');
  return t('Request failed. Please try again.');
}
