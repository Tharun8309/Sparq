import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const selectedCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api('/categories');
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.warn('[Categories load error]:', err.message);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: currentPage,
          limit: 16,
          sort: currentSort
        });
        if (selectedCategory) params.append('category', selectedCategory);
        if (searchQuery) params.append('search', searchQuery);

        const res = await api(`/products?${params.toString()}`);
        setProducts(Array.isArray(res.data?.items) ? res.data.items : []);
        setPagination(res.data?.pagination || { page: 1, pages: 1, total: 0 });
      } catch (err) {
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [selectedCategory, searchQuery, currentSort, currentPage]);

  const updateFilters = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-sparq-darkmaroon">Fireworks Catalogue</h1>
        <p className="text-xs text-gray-600 mt-1">Light up every festival with authentic crackers</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-lg border border-sparq-gold/30 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Search</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => updateFilters('search', e.target.value)}
            placeholder="Search crackers..."
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:border-sparq-gold focus:outline-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => updateFilters('category', e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:border-sparq-gold focus:outline-none bg-white"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c._id} value={c.slug || c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Sorting */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Sort By</label>
          <select
            value={currentSort}
            onChange={(e) => updateFilters('sort', e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:border-sparq-gold focus:outline-none bg-white"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
          </select>
        </div>
      </div>

      {/* Content Rendering */}
      {error ? (
        <div className="bg-red-50 p-6 rounded text-center border border-red-200">
          <p className="text-xs text-red-700 mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-sparq-maroon text-white text-xs px-3 py-1.5 rounded"
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <div key={n} className="bg-white h-64 rounded animate-pulse border border-gray-200" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {products.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            onPageChange={(nextPage) => {
              const p = new URLSearchParams(searchParams);
              p.set('page', nextPage);
              setSearchParams(p);
            }}
          />
        </>
      ) : (
        <div className="bg-white p-12 text-center rounded border border-dashed border-gray-300">
          <h3 className="font-semibold text-sparq-darkmaroon text-sm">No products found</h3>
          <p className="text-xs text-gray-500 mt-1">Try adjusting your category or search filter.</p>
        </div>
      )}
    </div>
  );
}
