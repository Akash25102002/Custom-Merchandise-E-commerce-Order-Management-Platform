import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Sparkles, Shirt, Tag, ShoppingBag, X } from 'lucide-react';
import api from '../services/api';
import ProductCustomizer from '../components/customizer/ProductCustomizer';
import { useCart } from '../context/CartContext';

const Storefront = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal customizer state
  const [activeCustomizerProduct, setActiveCustomizerProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/products/categories'),
      ]);

      setProducts(prodRes.data?.products || []);
      setCategories(catRes.data?.categories || []);
    } catch (err) {
      console.error('Failed to fetch storefront data:', err);
      setError('Could not load products. Please check server connectivity.');
    } finally {
      setLoading(false);
    }
  };

  // Filter & Sort Products
  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      prod.category === selectedCategory ||
      prod.category?._id === selectedCategory;
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const handleCustomizationAdd = (customizedItem) => {
    addToCart(customizedItem);
    setActiveCustomizerProduct(null);
    setToastMessage(`Added "${customizedItem.product.name}" with custom design to cart!`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in border border-slate-700">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Header Section */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-amber-400">
            <Sparkles className="w-3.5 h-3.5" /> High-Quality Custom Studio Printing
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Design & Print Custom Merchandise
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
            Create personalized apparel, hoodies, mugs, and corporate gear with real-time live preview, custom text styling, and logo uploads.
          </p>
        </div>
      </div>

      {/* Main Catalog Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Controls Bar: Search, Category Tabs, Sorting */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-slate-50/50"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-medium text-slate-600">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-semibold text-slate-800 bg-slate-100 border-none rounded-lg px-3 py-2 outline-none cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat._id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 border border-slate-200 space-y-4 animate-pulse">
                <div className="w-full aspect-square bg-slate-200 rounded-xl"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                <div className="h-9 bg-slate-200 rounded-xl w-full pt-2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="mt-12 text-center p-8 bg-red-50 rounded-2xl border border-red-200 max-w-md mx-auto">
            <p className="text-sm font-semibold text-red-800">{error}</p>
            <button
              onClick={fetchInitialData}
              className="mt-4 px-4 py-2 bg-red-900 text-white text-xs font-semibold rounded-xl hover:bg-red-800 transition-colors"
            >
              Retry Loading
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="mt-16 text-center py-16 bg-white rounded-2xl border border-slate-200 max-w-lg mx-auto p-8">
            <Shirt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No merchandise found</h3>
            <p className="text-slate-500 text-xs mt-1">Try resetting your category filters or search queries.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Image & Badge Header */}
                  <div className="relative aspect-square bg-slate-100 overflow-hidden flex items-center justify-center p-4">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Shirt className="w-20 h-20 text-slate-300" />
                    )}
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-800 border border-slate-200/60 shadow-xs flex items-center gap-1">
                      <Tag className="w-3 h-3 text-slate-500" />
                      {product.category?.name || 'Apparel'}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-2">
                    <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-amber-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px]">
                      {product.description || 'Custom customizable premium merchandise.'}
                    </p>
                    <div className="flex items-baseline gap-1.5 pt-1">
                      <span className="text-xs text-slate-400 font-medium">Starts from</span>
                      <span className="text-lg font-extrabold text-slate-900">
                        ${Number(product.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => setActiveCustomizerProduct(product)}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" /> Customize Design
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Customizer Modal */}
      {activeCustomizerProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl w-full p-6 sm:p-8 relative max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl">
            <button
              onClick={() => setActiveCustomizerProduct(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500" /> Customize {activeCustomizerProduct.name}
            </h2>

            <ProductCustomizer
              product={activeCustomizerProduct}
              onAddToCart={handleCustomizationAdd}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Storefront;
