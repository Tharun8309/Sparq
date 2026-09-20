import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import Pagination from '../components/Pagination';
import ImageUploader from '../components/ImageUploader';
import ConfirmDialog from '../components/ConfirmDialog';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');

  const [form, setForm] = useState({
    name: '',
    category: '',
    brand: 'Sparq',
    actualPrice: '',
    sellingPrice: '',
    shortDescription: '',
    description: '',
    searchTags: '',
    isAvailable: true,
    isFeatured: false
  });

  const [imageUploading, setImageUploading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, productId: null });

  const loadData = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, catRes] = await Promise.all([
        api(`/products?page=${page}&limit=12`),
        api('/categories')
      ]);
      setProducts(Array.isArray(prodRes.data?.items) ? prodRes.data.items : []);
      setPagination(prodRes.data?.pagination || { page: 1, pages: 1, total: 0 });
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
    } catch (err) {
      setError(err.message || 'Unable to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setSelectedFile(null);
    setFilePreview('');
    setForm({
      name: '',
      category: categories[0]?._id || '',
      brand: 'Sparq',
      actualPrice: '',
      sellingPrice: '',
      shortDescription: '',
      description: '',
      searchTags: '',
      isAvailable: true,
      isFeatured: false
    });
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setSelectedFile(null);
    setFilePreview('');
    setForm({
      name: p.name || '',
      category: p.category?._id || p.category || '',
      brand: p.brand || 'Sparq',
      actualPrice: p.actualPrice || '',
      sellingPrice: p.sellingPrice || '',
      shortDescription: p.shortDescription || '',
      description: p.description || '',
      searchTags: Array.isArray(p.searchTags) ? p.searchTags.join(', ') : '',
      isAvailable: p.isAvailable !== false,
      isFeatured: p.isFeatured === true
    });
    setShowModal(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert('Image must be under 4MB');
        return;
      }
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

const handleSave = async (e) => {
    e.preventDefault();

    if (!form.category) {
      alert('Please select a valid category.');
      return;
    }

    const numActual = Number(form.actualPrice);
    const numSelling = Number(form.sellingPrice);

    if (isNaN(numActual) || isNaN(numSelling)) {
      alert('Please enter valid numeric prices.');
      return;
    }

    if (numSelling > numActual) {
      alert('Selling price cannot exceed actual price (MRP).');
      return;
    }

    try {
      if (editingProduct) {
        // Edit flow sends clean JSON
        await api(`/admin/products/${editingProduct._id}`, {
          method: 'PUT',
          body: {
            ...form,
            actualPrice: numActual,
            sellingPrice: numSelling
          }
        });
      } else {
        // Create flow sends FormData
        const formData = new FormData();
        formData.append('name', form.name.trim());
        formData.append('category', form.category);
        formData.append('brand', form.brand || 'Sparq');
        formData.append('actualPrice', String(numActual));
        formData.append('sellingPrice', String(numSelling));
        formData.append('shortDescription', form.shortDescription || '');
        formData.append('description', form.description || '');
        formData.append('isAvailable', String(form.isAvailable));
        formData.append('isFeatured', String(form.isFeatured));
        formData.append('searchTags', form.searchTags || '');

        if (selectedFile) {
          formData.append('image', selectedFile);
        }

        await api('/admin/products', {
          method: 'POST',
          body: formData
        });
      }

      setShowModal(false);
      setSelectedFile(null);
      setFilePreview('');
      loadData(pagination.page);
    } catch (err) {
      alert(err.message || 'Failed to save product');
    }
  };

  const handleImageUploadToExisting = async (file) => {
    if (!editingProduct) return;
    setImageUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api(`/admin/products/${editingProduct._id}/images`, {
        method: 'POST',
        body: formData
      });
      setEditingProduct(res.data);
      setProducts(prev => prev.map(p => (p._id === editingProduct._id ? res.data : p)));
    } catch (err) {
      alert(err.message || 'Image upload failed');
    } finally {
      setImageUploading(false);
    }
  };

  const handleImageDelete = async (publicId) => {
    if (!editingProduct) return;
    try {
      const res = await api(`/admin/products/${editingProduct._id}/images`, {
        method: 'DELETE',
        body: { publicId }
      });
      setEditingProduct(res.data);
      setProducts(prev => prev.map(p => (p._id === editingProduct._id ? res.data : p)));
    } catch (err) {
      alert(err.message || 'Failed to delete image');
    }
  };

  const confirmDelete = async () => {
    if (!deleteDialog.productId) return;
    try {
      await api(`/admin/products/${deleteDialog.productId}`, { method: 'DELETE' });
      setDeleteDialog({ isOpen: false, productId: null });
      loadData(pagination.page);
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-2xl font-bold text-sparq-darkmaroon">Products Catalogue</h1>
        <button
          onClick={openCreateModal}
          className="bg-sparq-maroon text-sparq-cream text-xs font-bold px-4 py-2 rounded hover:bg-sparq-darkmaroon border border-sparq-gold/30"
        >
          + Add Product
        </button>
      </div>

      {error ? (
        <div className="bg-red-50 p-6 rounded text-center border border-red-200">
          <p className="text-xs text-red-700 mb-3">{error}</p>
          <button onClick={() => loadData(1)} className="bg-sparq-maroon text-white text-xs px-3 py-1.5 rounded">Retry</button>
        </div>
      ) : loading ? (
        <div className="bg-white p-8 rounded text-center text-xs text-gray-500">Loading products...</div>
      ) : products.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-semibold">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Actual Price</th>
                <th className="p-3">Selling Price</th>
                <th className="p-3">Status</th>
                <th className="p-3">Featured</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(p => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="p-3 font-semibold text-gray-800 flex items-center space-x-2">
                    <img
                      src={p.images?.[0]?.url || '/brand/sparq-logo.svg'}
                      alt=""
                      className="w-10 h-10 object-contain bg-gray-100 rounded border border-gray-200"
                    />
                    <span>{p.name}</span>
                  </td>
                  <td className="p-3">{p.category?.name || 'Uncategorized'}</td>
                  <td className="p-3 text-gray-500">{formatCurrency(p.actualPrice)}</td>
                  <td className="p-3 font-bold text-sparq-maroon">{formatCurrency(p.sellingPrice)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      p.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {p.isAvailable ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="p-3">{p.isFeatured ? '⭐ Yes' : 'No'}</td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => openEditModal(p)} className="text-blue-600 hover:underline">Edit</button>
                    <button
                      onClick={() => setDeleteDialog({ isOpen: true, productId: p._id })}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            onPageChange={(p) => loadData(p)}
          />
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded border border-dashed border-gray-300">
          <p className="text-sm font-semibold text-gray-700">No products added yet.</p>
          <p className="text-xs text-gray-500 mt-1">Click "+ Add Product" above to create your first item.</p>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-xl w-full p-6 border border-sparq-gold shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="font-bold text-sm text-sparq-darkmaroon">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Deluxe Sky Flower Pot"
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Category *</label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full p-2 border rounded bg-white"
                  >
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Brand</label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Actual Price (MRP ₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.actualPrice}
                    onChange={(e) => setForm({ ...form, actualPrice: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.sellingPrice}
                    onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              {/* Upload Image directly while creating */}
              {!editingProduct && (
                <div className="p-3 border border-dashed rounded bg-sparq-offwhite">
                  <label className="block font-semibold mb-1">Upload Product Image (Cloudinary)</label>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileSelect}
                    className="w-full text-xs"
                  />
                  {filePreview && (
                    <div className="mt-2 flex items-center space-x-3">
                      <img src={filePreview} alt="Preview" className="w-16 h-16 object-contain rounded border bg-white p-1" />
                      <span className="text-gray-500 text-[11px]">Ready to upload on save</span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1">Short Description</label>
                <input
                  type="text"
                  value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  placeholder="Single line summary"
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detailed cracker specifications..."
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="flex space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={form.isAvailable}
                    onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                  />
                  <span>Available in Stock</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  />
                  <span>Featured Product</span>
                </label>
              </div>

              {/* Existing Product Images Management (during Edit) */}
              {editingProduct && (
                <div className="pt-4 border-t">
                  <label className="block font-semibold mb-2">Cloudinary Product Images</label>
                  <div className="flex gap-2 flex-wrap mb-3">
                    {editingProduct.images?.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 border rounded p-1">
                        <img src={img.url} alt="" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => handleImageDelete(img.publicId)}
                          className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <ImageUploader onUpload={handleImageUploadToExisting} isUploading={imageUploading} />
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sparq-maroon text-white font-semibold rounded hover:bg-sparq-darkmaroon"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Fireworks Item"
        message="Are you sure you want to delete this product? All images and details will be erased."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, productId: null })}
        confirmText="Delete"
      />
    </div>
  );
}