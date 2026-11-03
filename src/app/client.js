import { notify } from './notifications';
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
function mutation(config) {
  const path = config?.url || '';
  return config?.method && config.method !== 'get' && !/\/signals|\/shop\/quote|\/ask-ai/.test(path) && config.feedback !== false;
}
function successMessage(config) {
  const path = config.url;
  if (path === '/login') return 'Signed in successfully.';
  if (path === '/register') return 'Account created successfully.';
  if (path === '/logout') return 'Signed out successfully.';
  if (path === '/user/profile') return 'Profile saved.';
  if (path === '/user/password') return 'Password changed.';
  if (path === '/contact') return 'Message received. Thank you.';
  if (path.includes('/messages')) return 'Message sent.';
  if (path.includes('/shop/products')) return 'Product saved.';
  if (path === '/shop/orders') return 'Order placed successfully.';
  if (path.includes('/shop/orders/')) return 'Order updated.';
  if (path.includes('/doctors')) return config.method === 'post' ? 'Doctor account created.' : config.method === 'delete' ? 'Doctor deactivated.' : 'Doctor updated.';
  if (path.includes('/appointments') || path.includes('/teleconsultations')) return config.method === 'post' ? 'Request sent. Your doctor will review it.' : 'Booking updated.';
  return 'Changes saved.';
}
api.interceptors.response.use(response => {
  if (mutation(response.config)) notify('success', successMessage(response.config));
  return response;
}, error => {
  if (error.response?.status === 401 && !error.config?.url?.endsWith('/login')) {
    const existed = sessionStorage.getItem('morocare-token');
    sessionStorage.removeItem('morocare-token');
    window.dispatchEvent(new Event('auth-expired'));
    if (existed) notify('error', 'Your session expired. Please sign in again.');
  } else if (mutation(error.config)) notify('error', null, error);
  return Promise.reject(error);
});
export function errorText(error, t) {
  if (error.response?.data?.errors?.image || error.response?.data?.errors?.photo) return t('Use a valid JPG, PNG or WebP image up to 2 MB.');
  if (error.response?.data?.errors?.time) return t('This time is already booked. Choose another time.');
  const status = error.response?.status;
  if (status === 422 && error.config?.url === '/login') return t('Email or password is incorrect.');
  if (status === 409 && error.config?.url?.includes('/shop/products')) return t('Product stock changed. Refresh and reopen the product before saving.');
  if (status === 422) return t('Check the form fields and try again.');
  if (status === 403) return t('You do not have access to this action.');
  if (status === 429) return t('Too many requests. Please wait a moment.');
  if (status >= 500) return t('Service temporarily unavailable.');
  return t('Request failed. Please try again.');
}

// Coalesce concurrent identical reads (including React StrictMode and dashboard widgets).
// No completed response is cached: medical/account data is always refreshed.
const pendingReads = new Map();
export function readData(path) {
  const key = `${sessionStorage.getItem('morocare-token') || 'guest'}:${path}`;
  if (!pendingReads.has(key)) {
    pendingReads.set(key, api.get(path).finally(() => pendingReads.delete(key)));
  }
  return pendingReads.get(key);
}
export async function streamChat(payload, onText, signal) {
  const assistantBase = (import.meta.env.VITE_ASSISTANT_API_URL || api.defaults.baseURL).replace(/\/$/, '');
  const response = await fetch(`${assistantBase}/ask-ai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/x-ndjson',
      Authorization: `Bearer ${sessionStorage.getItem('morocare-token') || ''}`
    },
    body: JSON.stringify({
      ...payload,
      stream: true
    }),
    signal
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) {
      sessionStorage.removeItem('morocare-token');
      window.dispatchEvent(new Event('auth-expired'));
    }
    throw {
      response: {
        status: response.status,
        data
      }
    };
  }
  if (response.headers.get('content-type')?.includes('application/json')) {
    const data = await response.json();
    onText(data.reply);
    return data;
  }
  const reader = response.body.getReader(),
    decoder = new TextDecoder();
  let buffer = '',
    reply = '',
    result = null;
  try {
    while (true) {
      const {
        value,
        done
      } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), {
        stream: !done
      });
      let position;
      while ((position = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, position);
        buffer = buffer.slice(position + 1);
        if (!line.trim()) continue;
        const event = JSON.parse(line);
        if (event.type === 'delta') {
          reply += event.content;
          onText(reply);
        }
        if (event.type === 'error') throw {
          response: {
            status: 503,
            data: {
              code: event.code
            }
          }
        };
        if (event.type === 'done') result = {
          reply,
          doctors: event.doctors || []
        };
      }
      if (done) break;
    }
    if (!result) throw new Error('Incomplete response');
    return result;
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
