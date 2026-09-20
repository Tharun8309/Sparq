import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import Logo from '../components/Logo';

export default function AdminLogin() {
  const { isAuthenticated, login } = useAdmin();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sparq-cream flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white p-8 rounded-lg border border-sparq-gold/40 shadow-md">
        <div className="text-center mb-6">
          <Logo className="h-10 mx-auto mb-2" />
          <h2 className="font-serif text-lg font-bold text-sparq-darkmaroon">Sparq Administration</h2>
          <p className="text-xs text-gray-500">Sign in to manage festive orders and products</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:border-sparq-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:border-sparq-gold focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-sparq-maroon text-sparq-cream text-xs font-bold rounded hover:bg-sparq-darkmaroon border border-sparq-gold/30 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
