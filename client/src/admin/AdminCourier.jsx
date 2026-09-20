import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Pagination from '../components/Pagination';

export default function AdminCourier() {
  const [courierPincodes, setCourierPincodes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Global Courier MOV state
  const [courierMOV, setCourierMOV] = useState(1500);
  const [savingMOV, setSavingMOV] = useState(false);
  const [movSavedMsg, setMovSavedMsg] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await api('/settings');
      if (res.data?.courierMinOrderValue !== undefined) {
        setCourierMOV(res.data.courierMinOrderValue);
      }
    } catch (err) {
      console.warn('Failed to fetch courier MOV:', err.message);
    }
  };

  const fetchCourier = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api(`/admin/delivery/courier?search=${search}&page=${page}&limit=50`);
      setCourierPincodes(Array.isArray(res.data?.items) ? res.data.items : []);
      setPagination(res.data?.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      alert(err.message || 'Failed to load courier pincodes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchCourier(1);
  }, []);

  const handleSaveCourierMOV = async (e) => {
    e.preventDefault();
    setSavingMOV(true);
    try {
      await api('/admin/settings', {
        method: 'PUT',
        body: { courierMinOrderValue: Number(courierMOV) }
      });
      setMovSavedMsg(true);
      setTimeout(() => setMovSavedMsg(false), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update courier minimum order value');
    } finally {
      setSavingMOV(false);
    }
  };

  const toggleStatus = async (item) => {
    try {
      await api('/admin/delivery/courier', {
        method: 'POST',
        body: { pincode: item.pincode, isServiceable: !item.isServiceable }
      });
      fetchCourier(pagination.page);
    } catch (err) {
      alert(err.message || 'Update failed');
    }
  };

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-sparq-darkmaroon mb-2">Courier Delivery Network</h1>
      <p className="text-xs text-gray-500 mb-6">
        Manage your courier destinations and set a single global Minimum Order Value (MOV) for all courier orders.
      </p>

      {/* Global Minimum Order Value Configuration Card */}
      <div className="bg-white p-5 rounded-lg border border-sparq-gold/40 shadow-sm mb-6">
        <h2 className="text-sm font-bold text-sparq-darkmaroon mb-1">Global Courier Minimum Order Value (MOV)</h2>
        <p className="text-xs text-gray-500 mb-4">
          This single threshold automatically applies to <strong>every</strong> serviceable courier pincode.
        </p>

        {movSavedMsg && (
          <div className="mb-3 p-2 bg-green-50 text-green-800 border border-green-200 text-xs rounded font-semibold">
            ✓ Courier minimum order value updated across all pincodes!
          </div>
        )}

        <form onSubmit={handleSaveCourierMOV} className="flex items-center gap-3 max-w-sm">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2 text-xs text-gray-500 font-bold">₹</span>
            <input
              type="number"
              min="0"
              required
              value={courierMOV}
              onChange={(e) => setCourierMOV(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-sparq-gold"
            />
          </div>
          <button
            type="submit"
            disabled={savingMOV}
            className="px-4 py-1.5 bg-sparq-maroon text-white text-xs font-bold rounded hover:bg-sparq-darkmaroon disabled:opacity-50"
          >
            {savingMOV ? 'Saving...' : 'Update MOV'}
          </button>
        </form>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 flex gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchCourier(1)}
          placeholder="Search courier pincode..."
          className="flex-1 px-3 py-2 text-xs border rounded"
        />
        <button
          onClick={() => fetchCourier(1)}
          className="px-4 py-2 bg-sparq-maroon text-white text-xs font-bold rounded"
        >
          Search
        </button>
      </div>

      {loading ? (
        <div className="text-xs text-gray-500">Loading pincodes...</div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-semibold">
              <tr>
                <th className="p-3">Pincode</th>
                <th className="p-3">Applied MOV</th>
                <th className="p-3">Serviceability</th>
                <th className="p-3">Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courierPincodes.map(item => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="p-3 font-mono font-semibold">{item.pincode}</td>
                  <td className="p-3 text-gray-600 font-medium">₹{courierMOV} (Global)</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      item.isServiceable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.isServiceable ? 'Serviceable' : 'Suspended'}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleStatus(item)}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Change Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            onPageChange={(p) => fetchCourier(p)}
          />
        </div>
      )}
    </div>
  );
}