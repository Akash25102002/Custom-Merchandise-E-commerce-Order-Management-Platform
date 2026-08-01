import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Sparkles, Star, ChevronLeft, ChevronRight, SlidersHorizontal, Shirt } from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import api from '../../api/axios';

export const ProductListingPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPrintType, setSelectedPrintType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const printTypesList = ['Screen Printing', 'DTF', 'Sublimation', 'Embroidery', 'UV Printing'];

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 8,
        sortBy,
      };
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedPrintType) params.printType = selectedPrintType;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const res = await api.get('/products', { params });
      setProducts(res.data.data.products || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory, selectedPrintType, minPrice, maxPrice, sortBy, page]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedPrintType('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setPage(1);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white p-8 rounded-3xl border border-warm-grey-light flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 text-center md:text-left z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warm-grey-subtle text-ink text-xs font-bold border border-warm-grey-light">
            <Sparkles className="w-3.5 h-3.5 text-ink" /> Custom Merchandise Studio Catalog
          </span>
          <h1 className="text-3xl font-extrabold text-ink tracking-tight">Browse Garments & Apparel</h1>
          <p className="text-xs text-warm-grey max-w-xl">
            Select any garment or print base to launch our live merchandise customizer studio.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-80 relative z-10">
          <Search className="w-4 h-4 text-warm-grey absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search catalog..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-canvas border border-warm-grey-light rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink placeholder-warm-grey/60 focus:outline-none focus:ring-2 focus:ring-ink"
          />
        </div>
      </div>

      {/* Control Bar: Filter Toggle & Sort */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-warm-grey-light shadow-sm">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-canvas border border-warm-grey-light text-ink hover:border-ink text-xs font-bold transition-all"
        >
          <SlidersHorizontal className="w-4 h-4 text-ink" />
          <span>Filters {selectedCategory || selectedPrintType ? '(Active)' : ''}</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-warm-grey">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-canvas border border-warm-grey-light text-xs font-bold text-ink rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ink cursor-pointer"
          >
            <option value="newest">Newest Additions</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Main Content Layout with Optional Filter Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className={`space-y-6 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white p-6 rounded-3xl border border-warm-grey-light space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-warm-grey-light pb-4">
              <h3 className="font-extrabold text-ink text-sm flex items-center gap-2">
                <Filter className="w-4 h-4 text-ink" /> Filter Catalog
              </h3>
              <button onClick={clearFilters} className="text-[11px] font-bold text-warm-grey hover:text-ink underline">
                Clear All
              </button>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-warm-grey">Category</label>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === '' ? 'bg-ink text-canvas' : 'text-warm-grey hover:text-ink hover:bg-warm-grey-subtle'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c._id || c.id}
                    onClick={() => setSelectedCategory(c._id || c.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedCategory === (c._id || c.id) ? 'bg-ink text-canvas' : 'text-warm-grey hover:text-ink hover:bg-warm-grey-subtle'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Print Technology */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-warm-grey">Print Technique</label>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedPrintType('')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedPrintType === '' ? 'bg-ink text-canvas' : 'text-warm-grey hover:text-ink hover:bg-warm-grey-subtle'
                  }`}
                >
                  All Print Methods
                </button>
                {printTypesList.map((pt) => (
                  <button
                    key={pt}
                    onClick={() => setSelectedPrintType(pt)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedPrintType === pt ? 'bg-ink text-canvas' : 'text-warm-grey hover:text-ink hover:bg-warm-grey-subtle'
                    }`}
                  >
                    {pt}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-warm-grey">Price Range (₹)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-canvas border border-warm-grey-light rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-ink"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-canvas border border-warm-grey-light rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-ink"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 h-80 animate-pulse border border-warm-grey-light"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-warm-grey-light">
              <Shirt className="w-10 h-10 text-warm-grey mx-auto" />
              <h3 className="font-extrabold text-ink text-lg">No Products Found</h3>
              <p className="text-xs text-warm-grey">Try adjusting your filters or search term to discover products.</p>
              <Button size="sm" onClick={clearFilters}>
                Reset Search Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <Card key={p._id || p.id} className="flex flex-col justify-between group">
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden aspect-square bg-canvas border border-warm-grey-light">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800'}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                        <span className="px-2 py-0.5 rounded-lg bg-white/90 text-[10px] font-bold text-ink border border-warm-grey-light">
                          {p.sku || 'MERCH-001'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-warm-grey">
                        <span className="flex items-center gap-1 text-gold font-bold">
                          <Star className="w-3.5 h-3.5 fill-gold text-gold" /> {p.ratingsAverage || 4.5}
                        </span>
                        <span className="text-[10px] text-warm-grey font-semibold">Stock: {p.stockQuantity ?? 100}</span>
                      </div>
                      <Link to={`/products/${p._id || p.id}`}>
                        <h3 className="font-extrabold text-ink text-base hover:text-print-red transition-colors line-clamp-1">
                          {p.name}
                        </h3>
                      </Link>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-warm-grey-light flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-warm-grey uppercase font-bold">Base Price</span>
                      <p className="text-lg font-extrabold text-ink">₹{p.basePrice}</p>
                    </div>
                    <Link to={`/customizer?product=${p._id || p.id}`}>
                      <Button size="sm" icon={Sparkles}>
                        Customize
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="p-2 rounded-xl bg-white border border-warm-grey-light text-ink hover:border-ink disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold text-ink">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="p-2 rounded-xl bg-white border border-warm-grey-light text-ink hover:border-ink disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListingPage;
