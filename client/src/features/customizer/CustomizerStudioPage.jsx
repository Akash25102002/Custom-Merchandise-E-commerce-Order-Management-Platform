import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Upload, Type, Move, RefreshCw, ShoppingCart, Sparkles, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import api from '../../api/axios';

export const CustomizerStudioPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('product') || 'prod_1';

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addItem = useCartStore((state) => state.addItem);

  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState({ name: 'White', hex: '#FFFFFF', mockupUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800' });
  const [selectedSize, setSelectedSize] = useState('L');
  const [customText, setCustomText] = useState('CUSTOM BRAND');
  const [textColor, setTextColor] = useState('#1C1B1A');
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [artworkPreview, setArtworkPreview] = useState(null);
  const [activeTab, setActiveTab] = useState('text');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${productId}`);
        if (res.data?.data?.product) {
          const p = res.data.data.product;
          setProduct(p);
          if (p.availableColors?.[0]) {
            setSelectedColor(p.availableColors[0]);
          }
          if (p.availableSizes?.[0]) {
            setSelectedSize(p.availableSizes[0]);
          }
        }
      } catch (err) {
        console.log('Using default merchandise customizer specs');
      }
    };
    fetchProduct();
  }, [productId]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setArtworkPreview(reader.result);
        setActiveTab('artwork');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/customizer?product=${productId}` } } });
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await addItem({
        productId: product?._id || product?.id || productId,
        size: selectedSize,
        color: {
          name: selectedColor.name || 'White',
          hex: selectedColor.hex || '#FFFFFF',
        },
        quantity: 1,
        printType: product?.printTypes?.[0] || 'DTF',
        printLocation: 'front',
        designImageUrl: artworkPreview || '',
      });

      navigate('/cart');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add customized item to cart.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
      {/* 2D Canvas Mockup Preview Stage */}
      <div className="lg:col-span-7 flex flex-col items-center justify-center bg-white p-8 rounded-3xl border border-warm-grey-light relative min-h-[500px] shadow-sm">
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <span className="px-3 py-1 rounded-full bg-canvas text-ink text-xs font-bold border border-warm-grey-light">
            Print Zone: Front Chest (10" x 12")
          </span>
        </div>

        {/* Product Base Mockup Image Container */}
        <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-lg flex items-center justify-center bg-canvas border border-warm-grey-light">
          <img
            src={selectedColor.mockupUrl}
            alt="Product Mockup"
            className="w-full h-full object-cover transition-opacity duration-300"
          />

          {/* Interactive Bounding Print Area Overlay */}
          <div className="absolute w-[60%] h-[60%] border-2 border-dashed border-ink/40 rounded-lg flex items-center justify-center pointer-events-none p-2">
            {/* Custom Artwork Overlay */}
            {artworkPreview ? (
              <img
                src={artworkPreview}
                alt="Uploaded Artwork"
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                }}
                className="max-w-full max-h-full object-contain drop-shadow-md transition-transform"
              />
            ) : (
              <span
                style={{
                  color: textColor,
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                }}
                className="font-extrabold text-2xl tracking-widest uppercase transition-transform drop-shadow-md select-none text-center"
              >
                {customText || 'YOUR LOGO HERE'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Control Configuration Panel */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-warm-grey-light space-y-6 shadow-sm">
          <div>
            <span className="text-xs uppercase tracking-wider text-warm-grey font-bold">Interactive Studio</span>
            <h2 className="text-2xl font-extrabold text-ink">Custom Merchandise Builder</h2>
            <p className="text-xs text-warm-grey mt-1">Configure your product variant, upload custom vector artwork or add styled text.</p>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase text-ink">Base Garment Color</label>
            <div className="flex items-center gap-3">
              {[
                { name: 'White', hex: '#FFFFFF', mockupUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800' },
                { name: 'Charcoal Black', hex: '#1E1E1E', mockupUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800' },
                { name: 'Navy Blue', hex: '#1B2A4A', mockupUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800' },
              ].map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color)}
                  style={{ backgroundColor: color.hex }}
                  className={`w-9 h-9 rounded-full border-2 transition-transform flex items-center justify-center ${
                    selectedColor.name === color.name ? 'border-ink scale-110 ring-2 ring-ink/20' : 'border-warm-grey/30 hover:scale-105'
                  }`}
                  title={color.name}
                >
                  {selectedColor.name === color.name && (
                    <Check className={`w-4 h-4 ${color.hex === '#FFFFFF' ? 'text-ink' : 'text-white'}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Size Picker */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase text-ink">Select Size</label>
            <div className="flex items-center gap-2">
              {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
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

          {/* Design Mode Selector */}
          <div className="flex rounded-xl bg-canvas p-1 border border-warm-grey-light">
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'text' ? 'bg-ink text-canvas shadow-sm' : 'text-warm-grey hover:text-ink'
              }`}
            >
              Text Mode
            </button>
            <button
              onClick={() => setActiveTab('artwork')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'artwork' ? 'bg-ink text-canvas shadow-sm' : 'text-warm-grey hover:text-ink'
              }`}
            >
              Artwork File Mode
            </button>
          </div>

          {/* Input Controls */}
          {activeTab === 'text' ? (
            <div className="space-y-3">
              <Input
                label="Custom Print Text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Enter text to print..."
              />
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-ink uppercase">Text Color</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-canvas border border-warm-grey-light"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-xs font-extrabold text-ink uppercase">Upload Artwork (PNG, SVG, JPG)</label>
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-warm-grey-light hover:border-ink rounded-2xl cursor-pointer bg-canvas transition-colors">
                <Upload className="w-6 h-6 text-ink mb-2" />
                <span className="text-xs font-bold text-ink">Click to upload design file</span>
                <span className="text-[10px] text-warm-grey mt-1">High resolution PNG with transparent background recommended</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}

          {/* Scale & Rotation Sliders */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold text-ink mb-1">
                <span>Artwork Scale</span>
                <span>{Math.round(scale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full accent-ink bg-canvas h-2 rounded-lg"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold text-ink mb-1">
                <span>Rotation</span>
                <span>{rotation}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="5"
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value))}
                className="w-full accent-ink bg-canvas h-2 rounded-lg"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-print-red-light border border-print-red/30 text-print-red text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Checkout / Add to Cart CTA */}
          <div className="pt-4 border-t border-warm-grey-light flex items-center justify-between gap-4">
            <div>
              <span className="text-xs text-warm-grey uppercase font-bold">Total Price</span>
              <p className="text-2xl font-extrabold text-ink">₹{product?.basePrice || 599}</p>
            </div>
            <Button onClick={handleAddToCart} isLoading={isSubmitting} variant="primary" icon={ShoppingCart} size="lg">
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizerStudioPage;
