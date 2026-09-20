const API_BASE = '/api';

export async function api(endpoint, options = {}) {
  const { method = 'GET', body, headers = {}, ...customConfig } = options;

  const config = {
    method,
    headers: { ...headers },
    credentials: 'include',
    ...customConfig
  };

  if (body instanceof FormData) {
    // CRITICAL: Delete any manually inherited Content-Type so the browser sets multipart/form-data with boundary
    delete config.headers['Content-Type'];
    config.body = body;
  } else if (body && typeof body === 'object') {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(body);
  } else if (body) {
    config.body = body;
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, config);
  } catch (networkError) {
    throw new Error('Connection lost or reset by server. Check server terminal logs.');
  }

  let data;
  try {
    data = await res.json();
  } catch (parseError) {
    throw new Error(`Server responded with status ${res.status} (non-JSON response).`);
  }

  if (!res.ok || data.success === false) {
    const errorMsg = data?.message || `Request failed with status ${res.status}`;
    const error = new Error(errorMsg);
    error.code = data?.code || 'API_ERROR';
    error.status = res.status;
    throw error;
  }

  return data;
}