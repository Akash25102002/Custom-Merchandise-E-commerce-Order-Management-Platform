import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Power, Search, Package, Sparkles } from 'lucide-react';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import AdminProductFormModal from './AdminProductFormModal';
import api from '../../api/axios';

export const AdminProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', { params: { search, limit: 50 } });
      setProducts(res.data.data.products || []);
    } catch (err) {
      console.error('Failed to fetch admin product list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleCreateNew = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleSoftDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate (soft-delete) this merchandise product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to deactivate product.');
      }
    }
  };

  const handleToggleActive = async (product) => {
    try {
      await api.put(`/products/${product._id || product.id}`, {
        isActive: !product.isActive,
      });
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle active status.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Merchandise Product Management</h1>
          <p className="text-sm text-slate-400">Configure base products, manage inventory stock, and print area specifications.</p>
        </div>
        <Button onClick={handleCreateNew} icon={Plus}>
          Add Base Product
        </Button>
      </div>

      {/* Search & Actions Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search catalog by SKU or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          />
        </div>
        <span className="text-xs text-slate-400 font-semibold">{products.length} Products Registered</span>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading Product Catalog Table...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Item & SKU</th>
                  <th className="px-6 py-4">Base Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.map((p) => (
                  <tr key={p._id || p.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800'}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-800 bg-slate-900"
                        />
                        <div>
                          <p className="font-bold text-slate-100">{p.name}</p>
                          <span className="text-[10px] text-sky-400 font-mono">{p.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-white">₹{p.basePrice}</td>
                    <td className="px-6 py-4 font-semibold text-slate-300">{p.stockQuantity ?? 100} units</td>
                    <td className="px-6 py-4">
                      <Badge variant={p.isActive !== false ? 'success' : 'danger'}>
                        {p.isActive !== false ? 'Active Catalog' : 'Soft Deleted'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(p)}
                          className={`p-2 rounded-xl border transition-colors ${
                            p.isActive !== false
                              ? 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
                              : 'text-slate-500 border-slate-800 hover:bg-slate-900'
                          }`}
                          title="Toggle Active Status"
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-2 rounded-xl text-sky-400 border border-sky-500/20 hover:bg-sky-500/10 transition-colors"
                          title="Edit Product Specs"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSoftDelete(p._id || p.id)}
                          className="p-2 rounded-xl text-rose-400 border border-rose-500/20 hover:bg-rose-500/10 transition-colors"
                          title="Soft Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      <AdminProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={productToEdit}
        onSaveSuccess={fetchProducts}
      />
    </div>
  );
};

export default AdminProductListPage;
