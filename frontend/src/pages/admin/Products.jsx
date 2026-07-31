import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  Trash2, 
  Edit3, 
  Plus, 
  Search, 
  Loader, 
  AlertCircle, 
  CheckCircle,
  HelpCircle,
  PackageOpen
} from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;

      const response = await api.get('/products', { params });
      if (response?.success) {
        setProducts(response.data.products);
      }
    } catch (err) {
      setApiError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories');
      if (response?.success) {
        setCategories(response.data.categories);
      }
    } catch (err) {
      console.error('Failed to load categories');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setApiError('');
    setApiSuccess('');
    try {
      const response = await api.delete(`/products/${id}`);
      if (response?.success) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        setApiSuccess('Product deleted successfully!');
      }
    } catch (err) {
      setApiError(err.message || 'Failed to delete product.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans">Manage Products</h1>
          <p className="mt-1 text-sm text-slate-500">Configure base products, pricing parameters, and stock inventory.</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors w-fit"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Link>
      </div>

      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {apiError}
        </div>
      )}

      {apiSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
          {apiSuccess}
        </div>
      )}

      {/* Filters Board */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, SKU..."
            className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-slate-900 focus:border-slate-900 text-sm shadow-xs"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-slate-900 focus:border-slate-900 text-sm shadow-xs bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex items-center justify-center">
            <Loader className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <div className="mx-auto h-12 w-12 text-slate-400 mb-3 flex items-center justify-center">
              <PackageOpen className="h-10 w-10" />
            </div>
            <p className="font-semibold text-lg">No products found</p>
            <p className="text-sm mt-1">Try clearing filters or click Add Product to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Product Image & Info
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Inventory Stock
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    SKU & Type
                  </th>
                  <th scope="col" className="relative px-6 py-3 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {products.map((product) => {
                  const isLowStock = product.stockQuantity < 5;
                  
                  return (
                    <tr key={product._id} className="hover:bg-slate-50/50">
                      {/* Product Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-[10px] text-slate-400">No Image</span>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{product.name}</div>
                            <div className="text-xs text-slate-500 max-w-xs truncate mt-0.5">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Category */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {product.category?.name || 'General'}
                      </td>
                      
                      {/* Price */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                        ${Number(product.price).toFixed(2)}
                      </td>
                      
                      {/* Stock */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={`text-sm font-medium ${isLowStock ? 'text-red-600 font-semibold' : 'text-slate-950'}`}>
                            {product.stockQuantity} units
                          </span>
                          {isLowStock && (
                            <span className="text-[10px] text-red-500 mt-0.5 font-medium flex items-center">
                              <AlertCircle className="h-3 w-3 mr-0.5 shrink-0" /> Low Stock
                            </span>
                          )}
                        </div>
                      </td>
                      
                      {/* SKU & Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-600 inline-block">
                          {product.SKU}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 font-medium">
                          {product.productType} • {product.printType?.join(', ')}
                        </div>
                      </td>
                      
                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Link
                          to={`/admin/products/edit/${product._id}`}
                          className="text-slate-700 hover:text-slate-900 inline-block p-1.5 rounded hover:bg-slate-100 transition-colors"
                          title="Edit Product"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-900 inline-block p-1.5 rounded hover:bg-red-50 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
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
    </div>
  );
};

export default Products;
