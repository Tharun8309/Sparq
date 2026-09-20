import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAdmin } from '../context/AdminContext';

export default function AdminAccount() {
  const { admin, logout } = useAdmin();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api('/auth/admin/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword }
      });
      alert(res.data?.message || 'Password changed. Please login again.');
      await logout();
      navigate('/admin/login');
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h1 className="font-serif text-2xl font-bold text-sparq-darkmaroon mb-2">My Account</h1>
      <p className="text-xs text-gray-500 mb-6">Signed in as: <strong>{admin?.username}</strong></p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold mb-1">Current Password</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">New Password (min 8 chars)</label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Confirm New Password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-sparq-maroon text-white font-bold rounded hover:bg-sparq-darkmaroon disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}
