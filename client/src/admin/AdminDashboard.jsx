import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api('/admin/orders/stats');
      setStats(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) return <div className="p-8 text-center text-xs text-gray-500">Loading metrics...</div>;
  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded border border-red-200 text-center">
        <p className="text-xs text-red-700 mb-3">{error}</p>
        <button onClick={loadStats} className="bg-sparq-maroon text-white text-xs px-3 py-1.5 rounded">Retry</button>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Orders', value: stats?.orders?.total || 0, color: 'text-sparq-maroon' },
    { label: 'New Orders', value: stats?.orders?.new || 0, color: 'text-blue-600' },
    { label: 'Pending Payment', value: stats?.orders?.pendingPayment || 0, color: 'text-orange-600' },
    { label: 'Confirmed Orders', value: stats?.orders?.confirmed || 0, color: 'text-green-600' },
    { label: 'Delivered', value: stats?.orders?.delivered || 0, color: 'text-gray-600' },
    { label: 'Total Products', value: stats?.products?.total || 0, color: 'text-sparq-darkmaroon' },
    { label: 'In Stock Products', value: stats?.products?.available || 0, color: 'text-green-700' },
    { label: 'Featured Products', value: stats?.products?.featured || 0, color: 'text-sparq-gold' }
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-sparq-darkmaroon mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-500">{card.label}</p>
            <p className={`text-2xl font-bold mt-2 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
