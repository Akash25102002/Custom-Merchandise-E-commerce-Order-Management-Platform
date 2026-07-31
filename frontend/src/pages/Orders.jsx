import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, Clock, ShieldCheck, ChevronDown, ChevronUp, Shirt, ExternalLink, Sparkles } from 'lucide-react';
import api from '../services/api';

const WORKFLOW_STEPS = [
  'Pending',
  'Payment Confirmed',
  'Production',
  'Quality Check',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/orders/my-orders');
      const orderList = res.data?.orders || [];
      setOrders(orderList);
      if (orderList.length > 0) {
        setExpandedOrderId(orderList[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch customer orders:', err);
      setError('Failed to load order history.');
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status) => {
    const idx = WORKFLOW_STEPS.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Custom Orders</h1>
          <p className="text-slate-500 text-xs mt-1">Track live printing and production workflow stages</p>
        </div>
        <button
          onClick={fetchOrders}
          className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-xl shadow-xs transition-colors"
        >
          Refresh Orders
        </button>
      </div>

      {loading && (
        <div className="space-y-4 mt-8">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="h-10 bg-slate-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="mt-8 text-center p-8 bg-red-50 rounded-2xl border border-red-200 max-w-md mx-auto">
          <p className="text-sm font-semibold text-red-800">{error}</p>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="mt-12 text-center py-16 bg-white rounded-2xl border border-slate-200 max-w-md mx-auto p-8">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No orders placed yet</h3>
          <p className="text-slate-500 text-xs mt-1">Create your custom merchandise design to place your first order.</p>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="space-y-6 mt-8">
          {orders.map((order) => {
            const currentStepIdx = getStepIndex(order.orderStatus);
            const isExpanded = expandedOrderId === order._id;

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all"
              >
                {/* Header Summary Bar */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-extrabold text-slate-900 text-base">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                          order.orderStatus === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.orderStatus === 'Cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {order.items?.length} item(s)
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-right">
                      <p className="text-base font-extrabold text-slate-900">
                        ${order.totalAmount?.toFixed(2)}
                      </p>
                      <p className="text-[11px] text-emerald-700 font-semibold font-mono">
                        {order.trackingId}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="p-6 pt-0 border-t border-slate-100 space-y-8">
                    {/* Live Order Workflow Engine Stepper */}
                    <div className="pt-6">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" /> Order Workflow Timeline
                      </h4>

                      <div className="relative">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-4 left-0 right-0 h-1 bg-slate-200 z-0"></div>

                        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 relative z-10">
                          {WORKFLOW_STEPS.map((stepName, index) => {
                            const isPassed = index <= currentStepIdx;
                            const isCurrent = index === currentStepIdx;

                            return (
                              <div key={stepName} className="flex flex-col items-center text-center">
                                <div
                                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 ${
                                    isCurrent
                                      ? 'bg-slate-900 text-white border-slate-900 ring-4 ring-slate-100 scale-110'
                                      : isPassed
                                      ? 'bg-emerald-600 text-white border-emerald-600'
                                      : 'bg-white text-slate-400 border-slate-200'
                                  }`}
                                >
                                  {isPassed ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                                </div>
                                <span
                                  className={`text-[11px] font-semibold mt-2 ${
                                    isCurrent ? 'text-slate-900 font-bold' : isPassed ? 'text-slate-700' : 'text-slate-400'
                                  }`}
                                >
                                  {stepName}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Ordered Items Table */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Customized Items
                      </h4>
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="p-4 flex items-center justify-between gap-4 text-xs">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-12 h-12 rounded-lg border border-slate-200 flex items-center justify-center shrink-0"
                                style={{ backgroundColor: item.customization?.colorHex || '#FFFFFF' }}
                              >
                                <Shirt className="w-6 h-6 text-slate-800 opacity-40" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{item.name}</p>
                                <p className="text-[11px] text-slate-500">
                                  Color: <span className="font-medium text-slate-700">{item.customization?.color}</span> • Size: <span className="font-medium text-slate-700">{item.customization?.size}</span> • Print: <span className="font-medium text-slate-700 capitalize">{item.customization?.printArea}</span>
                                </p>
                                {item.customization?.customText && (
                                  <p className="text-[11px] text-slate-600 italic">
                                    "{item.customization.customText}"
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-slate-900">${item.totalPrice?.toFixed(2)}</p>
                              <p className="text-[10px] text-slate-400">{item.quantity} × ${item.unitPrice?.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Log Timeline */}
                    {order.statusHistory?.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" /> Audit Log & Timestamps
                        </h4>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                          {order.statusHistory.map((log, lIdx) => (
                            <div key={lIdx} className="flex justify-between items-center text-slate-600">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                                <span className="font-bold text-slate-800">{log.status}</span>
                                {log.note && <span className="text-slate-500">— {log.note}</span>}
                              </div>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {new Date(log.updatedAt).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
