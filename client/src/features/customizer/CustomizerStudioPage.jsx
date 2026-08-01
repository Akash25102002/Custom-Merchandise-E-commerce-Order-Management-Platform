import React, { useState } from 'react';
import { Upload, Type, Move, RefreshCw, ShoppingCart, Sparkles, Image as ImageIcon, Check } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { useCartStore } from '../../store/cartStore';

export const CustomizerStudioPage = () => {
  const addItem = useCartStore((state) => state.addItem);

  const [selectedColor, setSelectedColor] = useState({ name: 'White', hex: '#FFFFFF', mockupUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800' });
  const [selectedSize, setSelectedSize] = useState('L');
  const [customText, setCustomText] = useState('CUSTOM BRAND');
  const [textColor, setTextColor] = useState('#6366F1');
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [artworkPreview, setArtworkPreview] = useState(null);
  const [activeTab, setActiveTab] = useState('text');

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

  const handleAddToCart = () => {
    addItem({
      product: {
        _id: 'prod_1',
        name: 'Premium Unisex Cotton Crewneck T-Shirt',
        category: 't-shirt',
      },
      name: 'Custom Merchandise T-Shirt',
      price: 599,
      quantity: 1,
      color: selectedColor,
      size: selectedSize,
      customization: {
        artworkUrl: artworkPreview,
        artworkType: artworkPreview ? 'uploaded' : 'preset_text',
        textConfig: {
          text: customText,
          color: textColor,
        },
        position: {
          printArea: 'front',
          scale,
          rotate: rotation,
        },
      },
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
      {/* 2D Canvas Mockup Preview Stage */}
      <div className="lg:col-span-7 flex flex-col items-center justify-center glass-panel p-8 rounded-3xl border border-slate-800 relative min-h-[500px]">
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <span className="px-3 py-1 rounded-full bg-slate-900/90 text-slate-300 text-xs font-semibold border border-slate-800">
            Print Zone: Front Chest (10" x 12")
          </span>
        </div>

        {/* Product Base Mockup Image Container */}
        <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center bg-slate-900 border border-slate-800">
          <img
            src={selectedColor.mockupUrl}
            alt="Product Mockup"
            className="w-full h-full object-cover transition-opacity duration-300"
          />

          {/* Interactive Bounding Print Area Overlay */}
          <div className="absolute w-[60%] h-[60%] border-2 border-dashed border-sky-400/60 rounded-lg flex items-center justify-center pointer-events-none p-2">
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
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div>
            <span className="text-xs uppercase tracking-wider text-sky-400 font-bold">Interactive Studio</span>
            <h2 className="text-2xl font-extrabold text-white">Custom Merchandise Builder</h2>
            <p className="text-xs text-slate-400 mt-1">Configure your product variant, upload custom vector artwork or add styled text.</p>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-slate-300">Base Garment Color</label>
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
                    selectedColor.name === color.name ? 'border-sky-400 scale-110 ring-2 ring-sky-500/40' : 'border-slate-700 hover:scale-105'
                  }`}
                  title={color.name}
                >
                  {selectedColor.name === color.name && (
                    <Check className={`w-4 h-4 ${color.hex === '#FFFFFF' ? 'text-slate-900' : 'text-white'}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Size Picker */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-slate-300">Select Size</label>
            <div className="flex items-center gap-2">
              {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedSize === sz
                      ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Design Mode Selector */}
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'text' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Text Mode
            </button>
            <button
              onClick={() => setActiveTab('artwork')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'artwork' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
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
                <label className="text-xs font-semibold text-slate-300 uppercase">Text Color</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-slate-900 border border-slate-800"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 uppercase">Upload Artwork (PNG, SVG, JPG)</label>
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-800 hover:border-sky-500/50 rounded-2xl cursor-pointer bg-slate-900/50 transition-colors">
                <Upload className="w-6 h-6 text-sky-400 mb-2" />
                <span className="text-xs font-semibold text-slate-300">Click to upload design file</span>
                <span className="text-[10px] text-slate-500 mt-1">High resolution PNG with transparent background recommended</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}

          {/* Scale & Rotation Sliders */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
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
                className="w-full accent-sky-500 bg-slate-900 h-2 rounded-lg"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
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
                className="w-full accent-sky-500 bg-slate-900 h-2 rounded-lg"
              />
            </div>
          </div>

          {/* Checkout / Add to Cart CTA */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Total Price</span>
              <p className="text-2xl font-extrabold text-white">₹599</p>
            </div>
            <Button onClick={handleAddToCart} icon={ShoppingCart} size="lg">
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizerStudioPage;
