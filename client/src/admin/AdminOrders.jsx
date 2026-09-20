import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import Pagination from '../components/Pagination';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api(`/admin/orders?status=${statusFilter}&search=${encodeURIComponent(search)}&page=${page}`);
      // Defensive guard against malformed API payload
      const safeItems = Array.isArray(res.data?.items) ? res.data.items : [];
      setOrders(safeItems);
      setPagination(res.data?.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      setError(err.message || 'Unable to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [statusFilter]);

  const handleStatusUpdate = async (orderId, orderStatus, paymentStatus) => {
    try {
      const res = await api(`/admin/orders/${orderId}/status`, {
        method: 'PUT',
        body: { orderStatus, paymentStatus }
      });
      if (res.success) {
        setOrders(prev => prev.map(o => (o._id === orderId ? { ...o, ...res.data } : o)));
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, ...res.data });
        }
      }
    } catch (err) {
      alert(err.message || 'Status update failed');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-2xl font-bold text-sparq-darkmaroon">Orders Management</h1>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchOrders(1)}
          placeholder="Search by Order #, Name, Phone..."
          className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded focus:border-sparq-gold focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-gray-300 rounded focus:border-sparq-gold focus:outline-none bg-white"
        >
          <option value="ALL">All Statuses</option>
          <option value="NEW">New</option>
          <option value="PAYMENT_PENDING">Payment Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
          <option value="DELIVERED">Delivered</option>
        </select>
        <button
          onClick={() => fetchOrders(1)}
          className="px-4 py-2 bg-sparq-maroon text-white text-xs font-semibold rounded hover:bg-sparq-darkmaroon"
        >
          Filter
        </button>
      </div>

      {/* Defensive Orders Table */}
      {error ? (
        <div className="bg-red-50 p-6 rounded text-center border border-red-200">
          <p className="text-xs text-red-700 mb-3">{error}</p>
          <button onClick={() => fetchOrders(1)} className="bg-sparq-maroon text-white text-xs px-3 py-1.5 rounded">
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="bg-white p-8 rounded text-center text-xs text-gray-500">Loading orders...</div>
      ) : orders.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-semibold">
              <tr>
                <th className="p-3">Order Number</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Pincode</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o) => (
                <tr key={o._id} className="hover:bg-gray-50">
                  <td className="p-3 font-semibold text-sparq-maroon">{o.orderNumber || 'N/A'}</td>
                  <td className="p-3">
                    <p className="font-semibold text-gray-800">{o.customer?.name || 'Customer information unavailable'}</p>
                    <p className="text-[11px] text-gray-500">{o.customer?.phone || 'N/A'}</p>
                  </td>
                  <td className="p-3">{o.customer?.pincode || 'N/A'}</td>
                  <td className="p-3 font-bold">{formatCurrency(o.total)}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded font-semibold text-[10px] bg-gray-100 text-gray-800">
                      {o.orderStatus || 'NEW'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                      o.paymentStatus === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {o.paymentStatus || 'PENDING'}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="text-sparq-maroon font-semibold hover:underline"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            onPageChange={(p) => fetchOrders(p)}
          />
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded border border-dashed border-gray-300">
          <p className="text-sm font-semibold text-gray-700">No orders found</p>
          <p className="text-xs text-gray-500 mt-1">Orders placed by customers will be tracked here.</p>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 border border-sparq-gold shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="font-bold text-sm text-sparq-darkmaroon">Order Details: {selectedOrder.orderNumber}</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-gray-50 p-3 rounded">
                <p><strong>Customer:</strong> {selectedOrder.customer?.name || 'Unavailable'}</p>
                <p><strong>Phone:</strong> {selectedOrder.customer?.phone || 'N/A'}</p>
                <p><strong>Address:</strong> {selectedOrder.customer?.address || 'N/A'}</p>
                <p><strong>Pincode:</strong> {selectedOrder.customer?.pincode || 'N/A'}</p>
                {selectedOrder.customer?.notes && <p><strong>Notes:</strong> {selectedOrder.customer.notes}</p>}
              </div>

              <div>
                <h4 className="font-bold text-gray-700 mb-2">Items Snapshot:</h4>
                <div className="divide-y divide-gray-100 border border-gray-200 rounded">
                  {(selectedOrder.items || []).map((it, idx) => (
                    <div key={idx} className="p-2 flex justify-between">
                      <span>{it.name || 'Unknown Product'} x {it.quantity || 1}</span>
                      <span className="font-semibold">{formatCurrency(it.subtotal || 0)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold text-sm text-sparq-maroon mt-2 px-1">
                  <span>Total:</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-semibold mb-1">Order Status</label>
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => handleStatusUpdate(selectedOrder._id, e.target.value, selectedOrder.paymentStatus)}
                    className="w-full p-1.5 border rounded bg-white"
                  >
                    <option value="NEW">NEW</option>
                    <option value="PAYMENT_PENDING">PAYMENT_PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Payment Status</label>
                  <select
                    value={selectedOrder.paymentStatus}
                    onChange={(e) => handleStatusUpdate(selectedOrder._id, selectedOrder.orderStatus, e.target.value)}
                    className="w-full p-1.5 border rounded bg-white"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
