import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useSettings } from '../context/SettingsContext';

export default function AdminSettings() {
  const { refreshSettings } = useSettings();
  const [form, setForm] = useState({
    shopName: '',
    tagline: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    bannerAlert: ''
  });
  const [loading, setLoading] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api('/settings');
        if (res.data) setForm(res.data);
      } catch (err) {
        alert(err.message || 'Failed to fetch settings');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api('/admin/settings', {
        method: 'PUT',
        body: form
      });
      await refreshSettings();
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update store settings');
    }
  };

  if (loading) return <div className="text-xs text-gray-500">Loading settings...</div>;

  return (
    <div className="max-w-2xl bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h1 className="font-serif text-2xl font-bold text-sparq-darkmaroon mb-6">Store Configuration</h1>

      {savedNotice && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded font-semibold">
          ✓ Store settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold mb-1">Store Name</label>
          <input
            type="text"
            value={form.shopName}
            onChange={(e) => setForm({ ...form, shopName: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Tagline</label>
          <input
            type="text"
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Phone Number</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">WhatsApp Order Number</label>
            <input
              type="text"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value.replace(/\D/g, '') })}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
       
<div>
  <label className="block font-semibold mb-1">Global Courier Min Order Value (₹)</label>
  <input
    type="number"
    min="0"
    value={form.courierMinOrderValue || ''}
    onChange={(e) => setForm({ ...form, courierMinOrderValue: e.target.value })}
    className="w-full p-2 border rounded"
  />
</div>

        <div>
          <label className="block font-semibold mb-1">Support Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Depot Address</label>
          <textarea
            rows={2}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Top Announcement Banner</label>
          <input
            type="text"
            value={form.bannerAlert}
            onChange={(e) => setForm({ ...form, bannerAlert: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-sparq-maroon text-white font-bold rounded hover:bg-sparq-darkmaroon mt-4"
        >
          Save Configuration
        </button>
      </form>
    </div>
  );
}
