import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCatName, setNewCatName] = useState('');
  const [adding, setAdding] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api('/categories');
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setAdding(true);
    try {
      await api('/categories', {
        method: 'POST',
        body: { name: newCatName.trim() }
      });
      setNewCatName('');
      loadCategories();
    } catch (err) {
      alert(err.message || 'Failed to add category');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (cat) => {
    if (cat.isPermanent) {
      alert('Permanent categories cannot be deleted.');
      return;
    }
    if (!window.confirm(`Delete custom category "${cat.name}"?`)) return;

    try {
      await api(`/categories/${cat._id}`, { method: 'DELETE' });
      loadCategories();
    } catch (err) {
      alert(err.message || 'Failed to delete category');
    }
  };

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-sparq-darkmaroon mb-2">Product Categories</h1>
      <p className="text-xs text-gray-500 mb-6">
        Standard permanent categories are locked. You can create additional custom categories below.
      </p>

      {/* Add Category Form */}
      <form onSubmit={handleAddCategory} className="bg-white p-4 rounded-lg border border-gray-200 mb-6 flex gap-3 items-center">
        <input
          type="text"
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          placeholder="New Category Name (e.g. Deluxe Sky Shots)"
          className="flex-1 px-3 py-2 text-xs border rounded focus:outline-none focus:border-sparq-gold"
        />
        <button
          type="submit"
          disabled={adding || !newCatName.trim()}
          className="px-4 py-2 bg-sparq-maroon text-white text-xs font-bold rounded hover:bg-sparq-darkmaroon disabled:opacity-50"
        >
          {adding ? 'Adding...' : '+ Add Category'}
        </button>
      </form>

      {error ? (
        <div className="bg-red-50 p-6 rounded text-center border border-red-200">
          <p className="text-xs text-red-700 mb-3">{error}</p>
          <button onClick={loadCategories} className="bg-sparq-maroon text-white text-xs px-3 py-1.5 rounded">Retry</button>
        </div>
      ) : loading ? (
        <div className="bg-white p-8 rounded text-center text-xs text-gray-500">Loading categories...</div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-semibold">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Category Name</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Type</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((c, idx) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="p-3 text-gray-400 font-mono">{idx + 1}</td>
                  <td className="p-3 font-semibold text-gray-800">{c.name}</td>
                  <td className="p-3 font-mono text-gray-500">{c.slug}</td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      c.isPermanent ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                    }`}>
                      {c.isPermanent ? 'Permanent' : 'Custom'}
                    </span>
                  </td>
                  <td className="p-3">
                    {c.isPermanent ? (
                      <span className="text-gray-400 text-xs">—</span>
                    ) : (
                      <button
                        onClick={() => handleDelete(c)}
                        className="text-red-600 hover:underline font-semibold"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}