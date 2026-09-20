import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function AdminDelivery() {
  const [nearby, setNearby] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [pincode, setPincode] = useState('');
  const [minValue, setMinValue] = useState('1000');
  const [supportsCOD, setSupportsCOD] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const loadNearby = async () => {
    setLoading(true);
    try {
      const res = await api('/admin/delivery/nearby');
      setNearby(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.message || 'Failed to load direct delivery pincodes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNearby();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      alert('Pincode must be 6 digits');
      return;
    }
    try {
      await api('/admin/delivery/nearby', {
        method: 'POST',
        body: { pincode, minimumOrderValue: Number(minValue), isServiceable: true, supportsCOD }
      });
      setPincode('');
      setMinValue('1000');
      setSupportsCOD(true);
      setIsEditing(false);
      loadNearby();
    } catch (err) {
      alert(err.message || 'Failed to save delivery pincode');
    }
  };

  const handleEdit = (item) => {
    setPincode(item.pincode);
    setMinValue(item.minimumOrderValue.toString());
    setSupportsCOD(item.supportsCOD);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Remove direct delivery for pincode ${item.pincode}?`)) return;
    try {
      await api(`/admin/delivery/nearby/${item._id}`, { method: 'DELETE' });
      loadNearby();
    } catch (err) {
      alert(err.message || 'Failed to delete pincode');
    }
  };

  const handleCancelEdit = () => {
    setPincode('');
    setMinValue('1000');
    setSupportsCOD(true);
    setIsEditing(false);
  };

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-sparq-darkmaroon mb-2">Direct Delivery & COD Pincodes</h1>
      <p className="text-xs text-gray-500 mb-6">
        Configure direct depot delivery areas where Cash on Delivery (COD) and custom minimum order values apply.
      </p>

      {/* Add / Update form */}
      <form onSubmit={handleSave} className="bg-white p-4 rounded-lg border border-gray-200 mb-6 flex flex-wrap gap-4 items-end text-xs shadow-sm">
        <div>
          <label className="block font-semibold mb-1">6-Digit Pincode</label>
          <input
            type="text"
            required
            disabled={isEditing}
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="e.g. 562114"
            className="px-3 py-2 border rounded disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Min Order Value (₹)</label>
          <input
            type="number"
            required
            min="0"
            value={minValue}
            onChange={(e) => setMinValue(e.target.value)}
            className="px-3 py-2 border rounded"
          />
        </div>

        <div className="flex items-center space-x-2 pb-2">
          <input
            type="checkbox"
            id="cod-check"
            checked={supportsCOD}
            onChange={(e) => setSupportsCOD(e.target.checked)}
          />
          <label htmlFor="cod-check" className="font-semibold cursor-pointer">Support COD</label>
        </div>

        <div className="flex space-x-2">
          <button type="submit" className="px-4 py-2 bg-sparq-maroon text-white font-bold rounded hover:bg-sparq-darkmaroon transition-colors">
            {isEditing ? 'Update Pincode' : 'Save Direct Pincode'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-3 py-2 bg-gray-200 text-gray-700 font-semibold rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {error ? (
        <div className="bg-red-50 p-4 rounded text-center text-xs text-red-700">{error}</div>
      ) : loading ? (
        <div className="text-xs text-gray-500">Loading direct delivery data...</div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-semibold">
              <tr>
                <th className="p-3">Pincode</th>
                <th className="p-3">Minimum Order</th>
                <th className="p-3">COD Support</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {nearby.map(item => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="p-3 font-bold text-sparq-maroon">{item.pincode}</td>
                  <td className="p-3 font-semibold">₹{item.minimumOrderValue}</td>
                  <td className="p-3">{item.supportsCOD ? '✓ Enabled' : 'Disabled'}</td>
                  <td className="p-3">
                    <span className="bg-green-100 text-green-800 text-[10px] font-semibold px-2 py-0.5 rounded">
                      Active
                    </span>
                  </td>
                  <td className="p-3 space-x-3">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="text-red-600 hover:underline font-semibold"
                    >
                      Delete
                    </button>
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