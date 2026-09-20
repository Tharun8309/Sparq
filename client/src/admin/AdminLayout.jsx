import React from 'react';
import { Link, NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import Logo from '../components/Logo';
import AdminErrorBoundary from '../components/AdminErrorBoundary';

export default function AdminLayout() {
  const { admin, isAuthenticated, loading, logout } = useAdmin();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-xs text-gray-500">
        Authenticating Sparq Admin Portal...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const navClass = ({ isActive }) =>
    `px-3 py-2 rounded text-xs font-semibold block transition-colors ${
      isActive
        ? 'bg-sparq-maroon text-sparq-cream'
        : 'text-gray-700 hover:bg-sparq-offwhite hover:text-sparq-darkmaroon'
    }`;

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-sparq-darkmaroon text-sparq-cream border-b border-sparq-gold/30 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Logo className="h-8" />
          <span className="text-sparq-gold font-serif font-bold text-sm tracking-wider uppercase">
            Admin Portal
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs text-sparq-cream/70 hidden sm:inline">User: {admin?.username}</span>
          <button
            onClick={handleLogout}
            className="text-xs bg-sparq-richmaroon hover:bg-red-800 text-sparq-cream px-3 py-1.5 rounded border border-sparq-gold/30"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Navigation Sidebar */}
        <aside className="md:col-span-1 bg-white p-4 rounded-lg border border-gray-200 h-fit space-y-1">
          <NavLink to="/admin" end className={navClass}>Dashboard</NavLink>
          <NavLink to="/admin/orders" className={navClass}>Orders</NavLink>
          <NavLink to="/admin/products" className={navClass}>Products</NavLink>
          <NavLink to="/admin/categories" className={navClass}>Categories</NavLink>
          <NavLink to="/admin/delivery" className={navClass}>Direct Delivery</NavLink>
          <NavLink to="/admin/courier" className={navClass}>Courier Pincodes</NavLink>
          <NavLink to="/admin/settings" className={navClass}>Store Settings</NavLink>
          <NavLink to="/admin/account" className={navClass}>My Account</NavLink>
          <div className="pt-4 border-t border-gray-200 mt-4">
            <Link to="/" target="_blank" className="text-xs text-sparq-maroon font-bold hover:underline block px-3">
              ↗ View Storefront
            </Link>
          </div>
        </aside>

        {/* Content Outlet */}
        <main className="md:col-span-4">
          <AdminErrorBoundary>
            <Outlet />
          </AdminErrorBoundary>
        </main>
      </div>
    </div>
  );
}
