import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Sparkles, ShoppingBag, Check, ShieldCheck, ArrowLeft, Star, PackageCheck, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import api from '../../api/axios';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const fetchCart = useCartStore((state) => state.fetchCart);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState('L');
  const [selectedPrintType, setSelectedPrintType] = useState('DTF');
  const [printLocation, setPrintLocation] = useState('front');
  const [quantity, setQuantity] = useState(1);
  const [artworkFile, setArtworkFile] = useState(null);
  const [artworkUrl, setArtworkUrl] = useState('');
  const [uploadingArtwork, setUploadingArtwork] = useState(false);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        const p = res.data.data.product;
        setProduct(p);
        setSelectedImage(p.images?.[0] || '');
        setSelectedColor(p.availableColors?.[0] || { name: 'White', hex: '#FFFFFF' });
        setSelectedSize(p.availableSizes?.[0] || 'L');
        setSelectedPrintType(p.printTypes?.[0] || 'DTF');
      } catch (err) {
        console.error('Failed to fetch product detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleArtworkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setArtworkFile(file);
    setUploadingArtwork(true);
    setError('');

    const formData = new FormData();
    formData.append('artwork', file);

    try {
      const res = await api.post('/cart/upload-artwork', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setArtworkUrl(res.data.artworkUrl);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload artwork file.');
    } finally {
      setUploadingArtwork(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }

    setError('');
    setIsAdding(true);

    const formattedColor = typeof selectedColor === 'string' 
      ? { name: selectedColor, hex: '#FFFFFF' }
      : { name: selectedColor?.name || 'White', hex: selectedColor?.hex || '#FFFFFF' };

    try {
      await api.post('/cart', {
        productId: product._id || product.id,
        size: selectedSize,
        color: formattedColor,
        quantity: Number(quantity),
        printType: selectedPrintType,
        printLocation,
        designImageUrl: artworkUrl,
      });

      await fetchCart();
      navigate('/cart');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item to cart. Please check option selections.');
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 gap-3">
        <div className="w-10 h-10 border-4 border-print-red border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-warm-grey">Loading Custom Merchandise Specs...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-white p-12 text-center rounded-3xl space-y-4 border border-warm-grey-light">
        <h3 className="text-xl font-extrabold text-ink">Product Not Found</h3>
        <Link to="/products">
          <Button size="sm">Return to Catalog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Back Button */}
      <Link to="/products" className="inline-flex items-center gap-2 text-xs font-bold text-warm-grey hover:text-ink transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Merchandise Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Gallery & Custom Artwork Preview Overlay */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-warm-grey-light flex items-center justify-center">
            <img
              src={selectedImage || product.images?.[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />

            {/* Custom Artwork Overlay Preview */}
            {artworkUrl && (
              <div className="absolute w-[50%] h-[50%] border-2 border-dashed border-ink rounded-xl flex items-center justify-center p-2 bg-white/60 backdrop-blur-[2px]">
                <img src={artworkUrl} alt="Uploaded Artwork" className="max-w-full max-h-full object-contain drop-shadow-lg" />
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === img ? 'border-ink ring-2 ring-ink/20' : 'border-warm-grey-light hover:border-warm-grey'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Full Customization Form */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-warm-grey-light space-y-6 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="info">SKU: {product.sku}</Badge>
                <span className="flex items-center gap-1 text-xs font-bold text-gold">
                  <Star className="w-4 h-4 fill-gold text-gold" /> {product.ratingsAverage} ({product.ratingsCount} reviews)
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-ink">{product.name}</h1>
              <p className="text-xs text-warm-grey leading-relaxed">{product.description}</p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-print-red-light border border-print-red/30 text-print-red text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Price & Stock */}
            <div className="flex items-baseline justify-between p-4 rounded-2xl bg-canvas border border-warm-grey-light">
              <div>
                <span className="text-xs text-warm-grey uppercase font-bold">Base Price</span>
                <p className="text-3xl font-extrabold text-ink">₹{product.basePrice}</p>
              </div>
              <div className="text-right">
                {product.stockQuantity > 0 ? (
                  <Badge variant="success" className="text-xs py-1 px-3">
                    <PackageCheck className="w-3.5 h-3.5 mr-1" /> {product.stockQuantity} Units In Stock
                  </Badge>
                ) : (
                  <Badge variant="danger">Out of Stock</Badge>
                )}
              </div>
            </div>

            {/* Available Colors */}
            {product.availableColors && product.availableColors.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-ink">
                  Select Color: <span className="text-ink font-bold">{selectedColor?.name}</span>
                </label>
                <div className="flex items-center gap-3">
                  {product.availableColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      style={{ backgroundColor: color.hex }}
                      className={`w-9 h-9 rounded-full border-2 transition-transform flex items-center justify-center ${
                        selectedColor?.name === color.name ? 'border-ink scale-110 ring-2 ring-ink/20' : 'border-warm-grey/30'
                      }`}
                      title={color.name}
                    >
                      {selectedColor?.name === color.name && (
                        <Check className={`w-4 h-4 ${color.hex === '#FFFFFF' ? 'text-ink' : 'text-white'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Available Sizes */}
            {product.availableSizes && product.availableSizes.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-ink">Select Size</label>
                <div className="flex flex-wrap gap-2">
                  {product.availableSizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                        selectedSize === sz
                          ? 'bg-ink text-canvas border-ink shadow-sm'
                          : 'bg-canvas text-ink border-warm-grey-light hover:border-ink'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Print Technique & Print Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-ink">Print Technique</label>
                <select
                  value={selectedPrintType}
                  onChange={(e) => setSelectedPrintType(e.target.value)}
                  className="w-full bg-canvas border border-warm-grey-light rounded-xl px-3 py-2.5 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-ink"
                >
                  {(product.printTypes || ['DTF', 'Screen Printing']).map((pt) => (
                    <option key={pt} value={pt}>
                      {pt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-ink">Print Location</label>
                <select
                  value={printLocation}
                  onChange={(e) => setPrintLocation(e.target.value)}
                  className="w-full bg-canvas border border-warm-grey-light rounded-xl px-3 py-2.5 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-ink"
                >
                  <option value="front">Front Chest</option>
                  <option value="back">Back Center</option>
                  <option value="left-sleeve">Left Sleeve</option>
                  <option value="right-sleeve">Right Sleeve</option>
                  <option value="center">Center Surface</option>
                </select>
              </div>
            </div>

            {/* Customer Artwork File Upload */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-ink">Upload Artwork File (Optional)</label>
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-warm-grey-light hover:border-ink rounded-2xl cursor-pointer bg-canvas transition-colors">
                {uploadingArtwork ? (
                  <span className="text-xs font-bold text-ink">Uploading artwork...</span>
                ) : artworkUrl ? (
                  <div className="flex items-center gap-2 text-xs font-extrabold text-thread-green">
                    <Check className="w-4 h-4" />
                    <span>Artwork Attached Successfully!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-bold text-warm-grey">
                    <Upload className="w-4 h-4 text-ink" />
                    <span>Attach custom logo/artwork (PNG, SVG, JPG)</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleArtworkUpload} className="hidden" />
              </label>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <label className="text-xs font-extrabold uppercase tracking-wider text-ink">Quantity</label>
              <input
                type="number"
                min="1"
                max={product.stockQuantity || 100}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 bg-canvas border border-warm-grey-light rounded-xl px-3 py-2 text-xs font-extrabold text-ink focus:outline-none focus:ring-2 focus:ring-ink"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-warm-grey-light">
              <Button
                onClick={() => navigate(`/customizer?product=${product._id || product.id}`)}
                variant="outline"
                icon={Sparkles}
                size="lg"
              >
                Launch Studio Canvas
              </Button>
              <Button
                onClick={handleAddToCart}
                isLoading={isAdding}
                variant="primary"
                icon={ShoppingBag}
                size="lg"
              >
                Add Customized Item to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
