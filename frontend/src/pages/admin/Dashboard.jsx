import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Package, ShoppingBag, Shirt, TrendingUp, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    inProduction: 0,
    delivered: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [productsCount, setProductsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [orderRes, prodRes] = await Promise.all([
        api.get('/orders'),
        api.get('/products'),
      ]);

      const orders = orderRes.data?.orders || [];
      const products = prodRes.data?.products || [];

      const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const inProduction = orders.filter((o) => ['Production', 'Quality Check'].includes(o.orderStatus)).length;
      const delivered = orders.filter((o) => o.orderStatus === 'Delivered').length;

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        inProduction,
        delivered,
      });

      setRecentOrders(orders.slice(0, 5));
      setProductsCount(products.length);
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Executive Production Dashboard</h1>
          <p className="text-slate-500 text-xs mt-1">Real-time metrics, printing pipeline stats, and order fulfillment</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
          >
            Manage Orders <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Gross Sales Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            ${stats.totalRevenue.toFixed(2)}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Live Sales Volume
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Custom Orders</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.totalOrders}</p>
          <p className="text-[11px] text-slate-400 font-medium">Across all fulfillment stages</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">In Production / QC</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.inProduction}</p>
          <p className="text-[11px] text-amber-600 font-semibold">Active printing pipeline</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Merchandise SKU</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Shirt className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{productsCount}</p>
          <p className="text-[11px] text-slate-400 font-medium">Base products catalog</p>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Recent Incoming Orders</h3>
          <Link to="/admin/orders" className="text-xs font-semibold text-slate-600 hover:text-slate-900">
            View All Orders &rarr;
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">No recent orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Order #</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((o) => (
                  <tr key={o._id}>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{o.customer?.name || 'Customer'}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">${o.totalAmount?.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                        {o.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
