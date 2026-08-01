import React, { useState, useEffect } from 'react';
import { Filter, Eye, ArrowRight, ShieldCheck, Clock, CheckCircle, AlertTriangle, Truck } from 'lucide-react';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import OrderTimeline from '../orders/OrderTimeline';
import api from '../../api/axios';

const WORKFLOW_STEPS = [
  'Order Placed',
  'Payment Verified',
  'Design Approved',
  'Printing In Progress',
  'Quality Check',
  'Packed',
  'Shipment Created',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

const ALLOWED_TRANSITIONS_MAP = {
  'Order Placed': ['Payment Verified', 'Cancelled'],
  'Payment Verified': ['Design Approved', 'Cancelled'],
  'Design Approved': ['Printing In Progress', 'Cancelled'],
  'Printing In Progress': ['Quality Check'],
  'Quality Check': ['Packed'],
  'Packed': ['Shipment Created'],
  'Shipment Created': ['Shipped'],
  'Shipped': ['Out for Delivery'],
  'Out for Delivery': ['Delivered'],
  'Delivered': [],
  'Cancelled': [],
};

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedStatusFilter) params.status = selectedStatusFilter;
      const res = await api.get('/orders', { params });
      setOrders(res.data.data.orders || []);
    } catch (err) {
      console.error('Failed to fetch admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatusFilter]);

  const handleOpenDetail = async (order) => {
    try {
      const res = await api.get(`/orders/${order._id || order.id}`);
      setSelectedOrder(res.data.data.order);
      setIsDetailModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (orderId, nextStatus) => {
    if (!nextStatus) return;
    setUpdating(true);
    setError('');

    try {
      if (nextStatus === 'Shipment Created') {
        // Must use shipping create endpoint
        await api.post('/shipping/create', { orderId });
      } else {
        await api.patch(`/orders/${orderId}/status`, {
          status: nextStatus,
          note: statusNote || `Transitioned to ${nextStatus} by Admin`,
        });
      }

      if (selectedOrder) {
        const res = await api.get(`/orders/${orderId}`);
        setSelectedOrder(res.data.data.order);
      }
      setStatusNote('');
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid status transition!');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Order Fulfillment Control Center</h1>
          <p className="text-sm text-slate-400">Enforce strict production workflow transitions and monitor customer order pipelines.</p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-sky-400" />
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          >
            <option value="">All Statuses</option>
            {WORKFLOW_STEPS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading Fulfillment Pipeline...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No orders found matching filter criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Order Number</th>
                  <th className="px-6 py-4">Placed Date</th>
                  <th className="px-6 py-4">Items Count</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Current Stage</th>
                  <th className="px-6 py-4">Strict Next Action</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.map((ord) => {
                  const validNextSteps = ALLOWED_TRANSITIONS_MAP[ord.status] || [];
                  const isPacked = ord.status === 'Packed';
                  return (
                    <tr key={ord._id || ord.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-sky-400">{ord.orderNumber}</td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-300">
                        {ord.items?.length || 0} items
                      </td>
                      <td className="px-6 py-4 font-extrabold text-white">₹{ord.totalAmount}</td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            ord.status === 'Delivered'
                              ? 'success'
                              : ord.status === 'Cancelled'
                              ? 'danger'
                              : 'info'
                          }
                        >
                          {ord.status}
                        </Badge>
                      </td>

                      {/* Strict Next Status Selector */}
                      <td className="px-6 py-4">
                        {isPacked ? (
                          <button
                            onClick={() => handleUpdateStatus(ord._id || ord.id, 'Shipment Created')}
                            className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-500/20"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Create Shipment</span>
                          </button>
                        ) : validNextSteps.length > 0 ? (
                          <select
                            onChange={(e) => handleUpdateStatus(ord._id || ord.id, e.target.value)}
                            defaultValue=""
                            className="bg-slate-900 border border-sky-500/40 text-xs font-bold text-sky-400 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                          >
                            <option value="" disabled>
                              Move to Next Step...
                            </option>
                            {validNextSteps.map((ns) => (
                              <option key={ns} value={ns} className="text-slate-100 bg-slate-950">
                                👉 {ns}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-500 italic">
                            Terminal State ({ord.status})
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenDetail(ord)}
                          className="p-2 rounded-xl text-sky-400 border border-sky-500/20 hover:bg-sky-500/10 transition-colors"
                          title="View Full Order Timeline"
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

      {/* Order Detail & Timeline Modal */}
      {selectedOrder && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Fulfillment Detail: ${selectedOrder.orderNumber}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Timeline */}
              <OrderTimeline currentStatus={selectedOrder.status} statusHistory={selectedOrder.statusHistory} />

              {/* Specs & Address */}
              <div className="space-y-4">
                <div className="glass-card p-4 rounded-2xl space-y-2 text-xs">
                  <h4 className="font-bold text-white text-sm border-b border-slate-800 pb-1">Customer Address</h4>
                  <p className="text-slate-200 font-semibold">{selectedOrder.shippingAddress?.fullName}</p>
                  <p className="text-slate-400">{selectedOrder.shippingAddress?.street}</p>
                  <p className="text-slate-400">
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.postalCode}
                  </p>
                  <p className="text-sky-400">Phone: {selectedOrder.shippingAddress?.phone}</p>
                </div>

                {selectedOrder.shippingId && (
                  <div className="glass-card p-4 rounded-2xl space-y-1 border-sky-500/30 bg-sky-500/5">
                    <h4 className="font-bold text-sky-400 text-xs flex items-center gap-1.5">
                      <Truck className="w-4 h-4" /> Courier Shipment AWB
                    </h4>
                    <p className="text-xs font-mono font-bold text-white">{selectedOrder.shippingId}</p>
                    <Link
                      to={`/track/${selectedOrder.shippingId}`}
                      target="_blank"
                      className="inline-block text-[11px] font-bold text-sky-400 hover:underline pt-1"
                    >
                      View Public Tracking Page ↗
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminOrdersPage;
