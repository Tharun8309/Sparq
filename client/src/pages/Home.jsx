import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useSettings } from '../context/SettingsContext';

// Curated featured categories with curated festive imagery & descriptions
const CURATED_CATEGORIES = [
  {
    key: 'flower-pots',
    name: 'Flower Pots',
    subtext: 'Sparkling Anaar Fountains',
    image: 'https://res.cloudinary.com/dvlwgymp3/image/upload/v1789908927/ChatGPT_Image_Sep_20_2026_06_17_12_PM.png',
    slugQuery: 'flower-pots'
  },
  {
    key: 'ground-spinners',
    name: 'Ground Spinners',
    subtext: 'Whirling Golden Chakkars',
    image: 'https://res.cloudinary.com/dvlwgymp3/image/upload/v1789908928/ChatGPT_Image_Sep_20_2026_06_18_23_PM.png',
    slugQuery: 'ground-spinners'
  },
  {
    key: 'sparklers',
    name: 'Sparklers',
    subtext: 'Dazzling Handheld Sparkles',
    image: 'https://res.cloudinary.com/dvlwgymp3/image/upload/v1789908928/ChatGPT_Image_Sep_20_2026_06_19_20_PM.png',
    slugQuery: 'sparklers'
  },
  {
    key: 'rockets',
    name: 'Sky Rockets',
    subtext: 'High-Altitude Aerial Bursts',
    image: 'https://res.cloudinary.com/dvlwgymp3/image/upload/v1789908928/ChatGPT_Image_Sep_20_2026_06_20_47_PM.png',
    slugQuery: 'rockets'
  },
  {
    key: 'gift-boxes',
    name: 'Gift Boxes & Combos',
    subtext: 'Curated Family Celebration Packs',
    image: 'https://res.cloudinary.com/dvlwgymp3/image/upload/v1789908911/ChatGPT_Image_Sep_20_2026_06_22_41_PM.png',
    slugQuery: 'gift-boxes'
  }
];

export default function Home() {
  const { settings } = useSettings();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delivery check widget state
  const [checkPincode, setCheckPincode] = useState('');
  const [deliveryResult, setDeliveryResult] = useState(null);
  const [checkingDelivery, setCheckingDelivery] = useState(false);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          api('/categories'),
          api('/products?featured=true&limit=8')
        ]);
        setCategories(Array.isArray(catRes.data) ? catRes.data : []);
        setFeaturedProducts(Array.isArray(prodRes.data?.items) ? prodRes.data.items : []);
      } catch (err) {
        console.warn('[Home Data Load Warning]:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handlePincodeCheck = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(checkPincode.trim())) {
      setDeliveryResult({ available: false, reason: 'Enter a valid 6-digit Indian pincode' });
      return;
    }
    setCheckingDelivery(true);
    setDeliveryResult(null);
    try {
      const res = await api(`/delivery/check?pincode=${checkPincode.trim()}`);
      setDeliveryResult(res.data);
    } catch (err) {
      setDeliveryResult({ available: false, reason: err.message });
    } finally {
      setCheckingDelivery(false);
    }
  };

  // Helper to match curated card to actual MongoDB category slug or name
  const resolveTargetCategory = (curated) => {
    const found = categories.find(
      c => c.slug === curated.slugQuery || 
           c.slug?.includes(curated.key) || 
           c.name?.toLowerCase().includes(curated.key.replace('-', ' '))
    );
    return found ? (found.slug || found._id) : curated.slugQuery;
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-sparq-darkmaroon to-sparq-maroon text-sparq-cream py-16 sm:py-24 border-b border-sparq-gold/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block text-sparq-gold text-xs uppercase tracking-widest font-bold mb-3 border border-sparq-gold/40 px-3 py-1 rounded-full">
            Premium Indian Festive Fireworks
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-sparq-cream tracking-tight mb-4">
            Light Up Every Celebration
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-sparq-offwhite/80 mb-8 leading-relaxed">
            Curated sparkling fireworks, traditional ground spinners, and sky-filling aerial beauties. 
            Safe, reliable, and delivered right for your festival moments.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/products"
              className="w-full sm:w-auto px-8 py-3 bg-sparq-gold text-sparq-darkmaroon font-bold text-sm rounded shadow hover:bg-sparq-lightgold transition-colors"
            >
              Explore Catalogue
            </Link>
            <a
              href="#categories"
              className="w-full sm:w-auto px-8 py-3 bg-transparent text-sparq-gold border border-sparq-gold/60 font-bold text-sm rounded hover:bg-sparq-gold/10 transition-colors"
            >
              View Featured Categories
            </a>
          </div>
        </div>
      </section>

      {/* Featured Curated Categories Section with Images */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <span className="text-sparq-gold font-bold text-xs uppercase tracking-widest">Handpicked Celebrations</span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-sparq-darkmaroon mt-1">
            Explore By Category
          </h2>
          <div className="w-16 h-0.5 bg-sparq-gold mx-auto mt-3"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CURATED_CATEGORIES.map((cat) => {
            const resolvedSlug = resolveTargetCategory(cat);
            return (
              <Link
                key={cat.key}
                to={`/products?category=${resolvedSlug}`}
                className="group relative h-64 rounded-xl overflow-hidden border border-sparq-gold/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-end p-6"
              >
                {/* Background Image with Dark Vignette Overlay */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${cat.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sparq-darkmaroon via-sparq-darkmaroon/60 to-transparent" />

                {/* Text Content */}
                <div className="relative z-10">
                  <span className="text-sparq-lightgold text-xs font-semibold tracking-wider uppercase block">
                    {cat.subtext}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-white group-hover:text-sparq-gold transition-colors mt-1">
                    {cat.name}
                  </h3>
                  <div className="flex items-center text-xs font-bold text-sparq-gold mt-3 opacity-90 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                    <span>Explore Products</span>
                    <span className="ml-1.5 text-sm">→</span>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* 6th "View All & Combos" Action Card */}
          <Link
            to="/products"
            className="group relative h-64 rounded-xl overflow-hidden border-2 border-dashed border-sparq-gold/60 bg-sparq-darkmaroon hover:bg-sparq-richmaroon transition-all duration-300 flex flex-col justify-center items-center text-center p-6 shadow-sm hover:shadow-xl"
          >
            <div className="w-14 h-14 rounded-full bg-sparq-richmaroon border border-sparq-gold/40 flex items-center justify-center text-2xl text-sparq-gold mb-3 group-hover:scale-110 transition-transform">
              ✨
            </div>
            <span className="text-sparq-gold text-xs font-semibold uppercase tracking-wider">
              Complete Assortment
            </span>
            <h3 className="font-serif text-2xl font-bold text-white mt-1 group-hover:text-sparq-lightgold transition-colors">
              View All Categories
            </h3>
            <p className="text-xs text-sparq-cream/70 mt-2 max-w-xs">
              Sparklers, Chakkars, Fountains, Garlands, and Celebration Combos
            </p>
            <span className="mt-4 px-4 py-1.5 bg-sparq-gold text-sparq-darkmaroon font-bold text-xs rounded group-hover:bg-sparq-lightgold transition-colors">
              Browse All →
            </span>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-sparq-offwhite py-16 border-y border-sparq-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-sparq-darkmaroon">
                Featured Crackers & Combos
              </h2>
              <p className="text-xs text-gray-600 mt-1">Handpicked celebration essentials</p>
            </div>
            <Link to="/products" className="text-xs font-bold text-sparq-maroon hover:text-sparq-darkmaroon">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="bg-white h-64 rounded animate-pulse border border-gray-200" />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded border border-dashed border-gray-300">
              <p className="text-sm text-gray-600 font-medium">No featured products selected yet.</p>
              <p className="text-xs text-gray-400 mt-1">Real products will appear once added by the store manager.</p>
            </div>
          )}
        </div>
      </section>

      {/* Delivery Check & Why Sparq */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Why Sparq */}
          <div className="space-y-6">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-sparq-darkmaroon">
              Why Celebrate With Sparq?
            </h2>
            <ul className="space-y-4 text-sm text-gray-700">
              <li className="flex items-start space-x-3">
                <span className="text-sparq-gold text-base">✦</span>
                <span><strong>Carefully Selected Quality:</strong> Authentic traditional & modern crackers tested for reliability.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-sparq-gold text-base">✦</span>
                <span><strong>Direct & Courier Coverage:</strong> Express direct delivery in key regions and reliable courier across hundreds of pincodes.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-sparq-gold text-base">✦</span>
                <span><strong>Seamless WhatsApp Checkout:</strong> Transparent cart snapshot with direct WhatsApp coordination.</span>
              </li>
            </ul>
          </div>

          {/* Delivery Pincode Verification */}
          <div className="bg-white p-6 sm:p-8 rounded-lg border border-sparq-gold/40 shadow-sm">
            <h3 className="font-bold text-lg text-sparq-darkmaroon mb-2">Check Delivery Availability</h3>
            <p className="text-xs text-gray-500 mb-4">
              Enter your 6-digit destination pincode to verify delivery options.
            </p>
            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                value={checkPincode}
                onChange={(e) => setCheckPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="e.g. 560001"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-sparq-gold"
              />
              <button
                type="submit"
                disabled={checkingDelivery}
                className="bg-sparq-maroon text-sparq-cream text-xs font-bold px-4 py-2 rounded hover:bg-sparq-darkmaroon transition-colors disabled:opacity-50"
              >
                {checkingDelivery ? 'Checking...' : 'Check'}
              </button>
            </form>

            {deliveryResult && (
              <div className={`mt-4 p-3 rounded text-xs font-semibold ${
                deliveryResult.available ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {deliveryResult.reason}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}