import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingCart, Package, AlertTriangle, ArrowUpRight, BarChart2, Edit2, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import AdminProductFormModal from './AdminProductFormModal';
import api from '../../api/axios';

const WORKFLOW_ORDER_STEPS = [
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
];

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProductToEdit, setSelectedProductToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard-stats?threshold=15');
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleEditLowStock = (product) => {
    setSelectedProductToEdit(product);
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 gap-3">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-400">Executing MongoDB Aggregation Analytics...</p>
      </div>
    );
  }

  const totalRevenue = stats?.totalRevenue || 0;
  const totalOrders = stats?.totalOrders || 0;
  const totalProducts = stats?.totalProducts || 0;
  const ordersByStatus = stats?.ordersByStatus || {};
  const lowStockProducts = stats?.lowStockProducts || [];

  // Find highest order count for relative bar chart scaling
  const maxStatusCount = Math.max(1, ...Object.values(ordersByStatus));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Fulfillment & Analytics Dashboard</h1>
        <p className="text-sm text-slate-400">Live aggregate metrics powered by MongoDB pipeline calculations.</p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Paid Order Revenue</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-extrabold text-white">₹{totalRevenue.toLocaleString()}</p>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
              Verified <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Orders</span>
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-extrabold text-white">{totalOrders}</p>
            <span className="text-xs font-bold text-sky-400">Live Pipeline</span>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Active Products</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-extrabold text-white">{totalProducts}</p>
            <span className="text-xs font-bold text-indigo-400">In Catalog</span>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Low Stock Alerts</span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-extrabold text-white">{lowStockProducts.length}</p>
            <span className="text-xs font-bold text-rose-400">&lt; 15 units</span>
          </div>
        </Card>
      </div>

      {/* Orders-By-Status Visualization Chart */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-sky-400" /> Orders Breakdown by Production Stage
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time status distribution across the 10 strict workflow steps.</p>
          </div>
          <Badge variant="info">MongoDB Aggregation</Badge>
        </div>

        {/* Visual Bar Chart */}
        <div className="space-y-3 pt-2">
          {WORKFLOW_ORDER_STEPS.map((step) => {
            const count = ordersByStatus[step] || 0;
            const percentage = Math.round((count / maxStatusCount) * 100);

            return (
              <div key={step} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{step}</span>
                  <span className="text-sky-400 font-extrabold">{count} Orders</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800/80">
                  <div
                    style={{ width: `${Math.max(percentage, count > 0 ? 5 : 0)}%` }}
                    className="bg-gradient-to-r from-sky-500 to-indigo-600 h-full rounded-full transition-all duration-500 shadow-md shadow-sky-500/20"
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Low Stock Inventory Alerts Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" /> Low Stock Inventory Alerts
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Products with inventory levels below 15 units.</p>
          </div>
          <Link to="/admin/products">
            <Button size="sm" variant="outline">
              Manage Catalog
            </Button>
          </Link>
        </div>

        {lowStockProducts.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-xs font-semibold text-emerald-400 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>All merchandise products have healthy stock levels above threshold.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Product & SKU</th>
                  <th className="px-4 py-3.5">Base Price</th>
                  <th className="px-4 py-3.5">Stock Level</th>
                  <th className="px-4 py-3.5 text-right">Quick Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {lowStockProducts.map((p) => (
                  <tr key={p._id || p.id} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3.5 font-bold text-white flex items-center gap-3">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800'}
                        alt={p.name}
                        className="w-9 h-9 rounded-lg object-cover"
                      />
                      <div>
                        <p>{p.name}</p>
                        <span className="text-[10px] text-sky-400 font-mono">{p.sku}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-extrabold text-white">₹{p.basePrice}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant="danger">{p.stockQuantity ?? 0} units left</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button size="sm" variant="ghost" onClick={() => handleEditLowStock(p)} icon={Edit2}>
                        Restock
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      <AdminProductFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        productToEdit={selectedProductToEdit}
        onSaveSuccess={fetchDashboardStats}
      />
    </div>
  );
};

export default AdminDashboardPage;
