import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Logo from './Logo';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

export default function Header() {
  const { cartCount } = useCart();
  const { settings } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors duration-150 ${
      isActive ? 'text-sparq-gold border-b-2 border-sparq-gold pb-1' : 'text-sparq-cream hover:text-sparq-lightgold'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-sparq-darkmaroon border-b border-sparq-gold/30 shadow-md">
      {settings.bannerAlert && (
        <div className="bg-sparq-gold text-sparq-darkmaroon text-xs font-semibold py-1.5 px-4 text-center tracking-wide">
          {settings.bannerAlert}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-3">
            <Logo className="h-12 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink to="/" className={navClass}>Home</NavLink>
            <NavLink to="/products" className={navClass}>Products</NavLink>
            <Link
              to="/cart"
              className="relative bg-sparq-richmaroon text-sparq-cream px-4 py-2 rounded border border-sparq-gold/40 flex items-center space-x-2 hover:bg-sparq-maroon transition-colors"
            >
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="bg-sparq-gold text-sparq-darkmaroon font-bold text-xs rounded-full px-2 py-0.5 ml-1">
                  {cartCount}
                </span>
              )}
            </Link>
            <NavLink to="/admin" className="text-xs tracking-wider text-sparq-gold/80 hover:text-sparq-gold uppercase border border-sparq-gold/30 rounded px-2.5 py-1">
              Admin Portal
            </NavLink>
          </nav>

          {/* Mobile Cart + Menu Toggle */}
          <div className="flex items-center space-x-4 md:hidden">
            <Link
              to="/cart"
              className="relative p-2 bg-sparq-richmaroon text-sparq-gold rounded border border-sparq-gold/30"
              aria-label="View Cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-sparq-gold text-sparq-darkmaroon font-bold text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-sparq-cream hover:text-sparq-gold"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-sparq-gold/20 flex flex-col space-y-3 pb-6">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sparq-cream hover:text-sparq-gold font-medium py-1"
            >
              Home
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sparq-cream hover:text-sparq-gold font-medium py-1"
            >
              Products
            </Link>
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sparq-gold hover:text-sparq-lightgold text-sm font-semibold py-1"
            >
              Admin Login / Dashboard
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
