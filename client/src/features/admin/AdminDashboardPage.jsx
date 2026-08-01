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
        <div className="w-10 h-10 border-4 border-print-red border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-warm-grey">Executing MongoDB Aggregation Analytics...</p>
      </div>
    );
  }

  const totalRevenue = stats?.totalRevenue || 0;
  const totalOrders = stats?.totalOrders || 0;
  const totalProducts = stats?.totalProducts || 0;
  const ordersByStatus = stats?.ordersByStatus || {};
  const lowStockProducts = stats?.lowStockProducts || [];

  const maxStatusCount = Math.max(1, ...Object.values(ordersByStatus));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-ink">Fulfillment & Analytics Dashboard</h1>
        <p className="text-sm text-warm-grey">Live aggregate metrics powered by MongoDB pipeline calculations.</p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-warm-grey uppercase">Paid Order Revenue</span>
            <div className="p-2.5 rounded-xl bg-thread-green-light text-thread-green border border-thread-green/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-extrabold text-ink">₹{totalRevenue.toLocaleString()}</p>
            <span className="text-xs font-bold text-thread-green flex items-center gap-0.5">
              Verified <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-warm-grey uppercase">Total Orders</span>
            <div className="p-2.5 rounded-xl bg-warm-grey-subtle text-ink border border-warm-grey-light">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-extrabold text-ink">{totalOrders}</p>
            <span className="text-xs font-bold text-ink">Live Pipeline</span>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-warm-grey uppercase">Active Products</span>
            <div className="p-2.5 rounded-xl bg-warm-grey-subtle text-ink border border-warm-grey-light">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-extrabold text-ink">{totalProducts}</p>
            <span className="text-xs font-bold text-warm-grey font-bold">In Catalog</span>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-warm-grey uppercase">Low Stock Alerts</span>
            <div className="p-2.5 rounded-xl bg-gold-light text-gold-hover border border-gold/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-extrabold text-ink">{lowStockProducts.length}</p>
            <span className="text-xs font-bold text-gold-hover">&lt; 15 units</span>
          </div>
        </Card>
      </div>

      {/* Orders-By-Status Visualization Chart */}
      <div className="bg-white p-8 rounded-3xl border border-warm-grey-light space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-warm-grey-light pb-4">
          <div>
            <h3 className="font-extrabold text-ink text-lg flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-ink" /> Orders Breakdown by Production Stage
            </h3>
            <p className="text-xs text-warm-grey mt-0.5">Real-time status distribution across the 10 strict workflow steps.</p>
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
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-ink">{step}</span>
                  <span className="text-ink font-extrabold">{count} Orders</span>
                </div>
                <div className="w-full bg-canvas rounded-full h-3 overflow-hidden border border-warm-grey-light">
                  <div
                    style={{ width: `${Math.max(percentage, count > 0 ? 5 : 0)}%` }}
                    className="bg-ink h-full rounded-full transition-all duration-500 shadow-sm"
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Low Stock Inventory Alerts Table */}
      <div className="bg-white p-6 rounded-3xl border border-warm-grey-light space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-ink text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-gold-hover" /> Low Stock Inventory Alerts
            </h3>
            <p className="text-xs text-warm-grey mt-0.5">Products with inventory levels below 15 units.</p>
          </div>
          <Link to="/admin/products">
            <Button size="sm" variant="outline">
              Manage Catalog
            </Button>
          </Link>
        </div>

        {lowStockProducts.length === 0 ? (
          <div className="p-8 text-center bg-thread-green-light rounded-2xl border border-thread-green/20 text-xs font-bold text-thread-green flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>All merchandise products have healthy stock levels above threshold.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-ink">
              <thead className="bg-canvas text-xs uppercase font-extrabold text-warm-grey border-b border-warm-grey-light">
                <tr>
                  <th className="px-4 py-3.5">Product & SKU</th>
                  <th className="px-4 py-3.5">Base Price</th>
                  <th className="px-4 py-3.5">Stock Level</th>
                  <th className="px-4 py-3.5 text-right">Quick Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-grey-light">
                {lowStockProducts.map((p) => (
                  <tr key={p._id || p.id} className="hover:bg-canvas">
                    <td className="px-4 py-3.5 font-bold text-ink flex items-center gap-3">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800'}
                        alt={p.name}
                        className="w-9 h-9 rounded-lg object-cover"
                      />
                      <div>
                        <p>{p.name}</p>
                        <span className="text-[10px] text-warm-grey font-mono">{p.sku}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-extrabold text-ink">₹{p.basePrice}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant="gold">{p.stockQuantity ?? 0} units left</Badge>
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
