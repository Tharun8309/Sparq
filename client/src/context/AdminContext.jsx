import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const res = await api('/auth/admin/me');
      if (res.success && res.data?.admin) {
        setAdmin(res.data.admin);
      } else {
        setAdmin(null);
      }
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (username, password) => {
    const res = await api('/auth/admin/login', {
      method: 'POST',
      body: { username, password }
    });
    if (res.data?.token) {
  localStorage.setItem('sparq_admin_token', res.data.token);
}
    if (res.success) {
      await checkAuth();
    }
    return res;
  };

  const logout = async () => {
    try {
      await api('/auth/admin/logout', { method: 'POST' });
    } finally {
      setAdmin(null);
    }
    localStorage.removeItem('sparq_admin_token');
  };

  return (
    <AdminContext.Provider value={{ admin, isAuthenticated: !!admin, loading, login, logout, refreshAdmin: checkAuth }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
