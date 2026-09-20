import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  shopName: 'Sparq',
  tagline: 'Light Up Every Celebration',
  phone: '+91 9876543210',
  whatsapp: '919876543210',
  email: 'orders@sparqfireworks.com',
  address: 'Sparq Celebration Depot, Main Ring Road, Bangalore - 560001',
  bannerAlert: 'Festive Bookings Open! Direct Delivery & Courier available across selected pincodes.'
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await api('/settings');
      if (res.success && res.data) {
        setSettings({ ...DEFAULT_SETTINGS, ...res.data });
      }
    } catch (err) {
      console.warn('[Settings] Using fallback default settings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
