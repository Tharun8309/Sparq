// client/src/services/api.js
const BACKEND_URL = import.meta.env.VITE_API_URL || '';
// If VITE_API_URL is "https://sparq-api.vercel.app", it calls "https://sparq-api.vercel.app/api"
const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

export async function api(endpoint, options = {}) {
  const { method = 'GET', body, headers = {}, ...customConfig } = options;

  const config = {
    method,
    headers: { ...headers },
    credentials: 'include', // Needed so auth cookies pass to the backend Vercel URL
    ...customConfig
  };

  if (body instanceof FormData) {
    delete config.headers['Content-Type'];
    config.body = body;
  } else if (body && typeof body === 'object') {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(body);
  } else if (body) {
    config.body = body;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await res.json();

  if (!res.ok || data.success === false) {
    const err = new Error(data?.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }

  return data;
}