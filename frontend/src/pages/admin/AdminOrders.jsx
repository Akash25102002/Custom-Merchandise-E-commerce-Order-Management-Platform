import React, { useState, useEffect } from 'react';
import { Package, CheckCircle2, Clock, Truck, ShieldAlert, ArrowRight, Eye, RefreshCw, Sparkles, Filter, X } from 'lucide-react';
import api from '../../services/api';

const WORKFLOW_SEQUENCE = [
  'Pending',
  'Payment Confirmed',
  'Production',
  'Quality Check',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  
  // Selected Order Modal View
  const [activeOrder, setActiveOrder] = useState(null);
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [selectedStatusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = selectedStatusFilter === 'all' ? '/orders' : `/orders?status=${selectedStatusFilter}`;
      const res = await api.get(url);
      setOrders(res.data?.orders || []);
    } catch (err) {
      console.error('Failed to fetch admin orders:', err);
      setError('Could not load order directory.');
    } finally {
      setLoading(false);
    }
  };

  const getNextStatus = (currentStatus) => {
    const idx = WORKFLOW_SEQUENCE.indexOf(currentStatus);
    if (idx !== -1 && idx < WORKFLOW_SEQUENCE.length - 1) {
      return WORKFLOW_SEQUENCE[idx + 1];
    }
    return null;
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdating(true);
      setActionSuccess('');
      const res = await api.patch(`/orders/${orderId}/status`, {
        status: newStatus,
        note: statusNote || `Order progressed to ${newStatus} by Admin`,
      });

      const updated = res.data?.order;
      setActionSuccess(`Order updated to '${newStatus}' successfully!`);
      setStatusNote('');
      setActiveOrder(updated);

      // Refresh table list
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(err.message || 'Status update failed.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Orders</h1>
          <p className="text-slate-500 text-xs mt-1">Review custom print specs and advance workflow stages</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedStatusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Orders
          </button>
          {WORKFLOW_SEQUENCE.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedStatusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading orders directory...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 text-sm">{error}</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">No orders found for selected filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Order Ref</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Items</th>
                  <th className="px-6 py-3.5">Total Amount</th>
                  <th className="px-6 py-3.5">Workflow Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const nextStatus = getNextStatus(order.orderStatus);

                  return (
                    <tr key={order._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{order.customer?.name || 'Customer'}</p>
                        <p className="text-[10px] text-slate-400">{order.customer?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800">{order.items?.length || 0} items</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        ${order.totalAmount?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            order.orderStatus === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.orderStatus === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {nextStatus && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, nextStatus)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors shadow-xs inline-flex items-center gap-1"
                          >
                            Advance to {nextStatus} <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setActiveOrder(order);
                            setActionSuccess('');
                          }}
                          className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center"
                          title="View Full Spec Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl space-y-6">
            <button
              onClick={() => setActiveOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-2 rounded-full hover:bg-slate-100"
            >
              <X className="w-6 h-6" />
            </button>

            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900 font-mono">{activeOrder.orderNumber}</h2>
                <span className="px-3 py-0.5 bg-slate-100 text-slate-800 rounded-full text-xs font-bold">
                  {activeOrder.orderStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Tracking ID: <span className="font-mono text-slate-800 font-semibold">{activeOrder.trackingId}</span>
              </p>
            </div>

            {actionSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200">
                {actionSuccess}
              </div>
            )}

            {/* Advance Status Controls */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-900 uppercase">Workflow Progression</label>
              <div className="flex flex-wrap items-center gap-2">
                {WORKFLOW_SEQUENCE.map((st) => (
                  <button
                    key={st}
                    disabled={updating || activeOrder.orderStatus === st}
                    onClick={() => handleUpdateStatus(activeOrder._id, st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeOrder.orderStatus === st
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Optional admin log note..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white outline-none"
              />
            </div>

            {/* Custom Print Specifications Breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase">Print Specifications</h3>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {activeOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between gap-4 text-xs bg-white">
                    <div>
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-[11px] text-slate-500">
                        Garment: <span className="font-semibold text-slate-800">{item.customization?.color}</span> | Size: <span className="font-semibold text-slate-800">{item.customization?.size}</span> | Location: <span className="font-semibold text-slate-800 capitalize">{item.customization?.printArea}</span>
                      </p>
                      {item.customization?.customText && (
                        <p className="text-[11px] text-slate-700 mt-1 font-mono bg-slate-100 px-2 py-1 rounded">
                          Printed Text: "{item.customization.customText}" (Font: {item.customization.textFont})
                        </p>
                      )}
                    </div>
                    <span className="font-bold text-slate-900">${item.totalPrice?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
