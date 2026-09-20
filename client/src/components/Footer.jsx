import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { useSettings } from '../context/SettingsContext';

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="bg-sparq-darkmaroon text-sparq-cream/90 border-t border-sparq-gold/30 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <Logo className="h-10" />
            <p className="text-sm text-sparq-gold font-serif italic">
              {settings.tagline || 'Light Up Every Celebration'}
            </p>
            <p className="text-xs text-sparq-cream/70 leading-relaxed">
              Premium festive fireworks, handcrafted sparklers, and grand celebration combos delivered safely to your doorstep.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-sparq-gold font-semibold tracking-wider text-sm uppercase mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-sparq-gold transition-colors">Home</Link></li>
              <li><Link to="/products" className="hover:text-sparq-gold transition-colors">All Fireworks</Link></li>
              <li><Link to="/cart" className="hover:text-sparq-gold transition-colors">View Cart</Link></li>
              <li><Link to="/admin" className="hover:text-sparq-gold transition-colors">Admin Login</Link></li>
            </ul>
          </div>

          {/* Col 3: Support Info (Phone number hidden to avoid spam calls) */}
          <div>
            <h4 className="text-sparq-gold font-semibold tracking-wider text-sm uppercase mb-4">Celebration Support</h4>
            <ul className="space-y-2 text-xs text-sparq-cream/80">
              <li><span className="text-sparq-gold">Assistance:</span> Direct via WhatsApp ordering</li>
              {settings.email && <li><span className="text-sparq-gold">Email:</span> {settings.email}</li>}
              {settings.address && <li className="mt-2"><span className="text-sparq-gold">Depot:</span> {settings.address}</li>}
            </ul>
          </div>

          {/* Col 4: WhatsApp Ordering */}
          <div>
            <h4 className="text-sparq-gold font-semibold tracking-wider text-sm uppercase mb-4">Celebration Inquiries</h4>
            <p className="text-xs text-sparq-cream/70 mb-4">
              Have questions about your order or celebration boxes? Chat directly with us on WhatsApp.
            </p>
            <a
              href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent('Hello Sparq, I would like to inquire about fireworks.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-sparq-gold text-sparq-darkmaroon font-bold text-xs rounded hover:bg-sparq-lightgold transition-colors"
            >
              Message on WhatsApp
            </a>
          </div>
        </div>

        <div className="border-t border-sparq-gold/20 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-sparq-cream/50">
          <p>© {new Date().getFullYear()} {settings.shopName}. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Crafted for safe and joyous celebrations across India.</p>
        </div>
      </div>
    </footer>
  );
}