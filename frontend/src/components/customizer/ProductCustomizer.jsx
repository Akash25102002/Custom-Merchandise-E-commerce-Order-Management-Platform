import React, { useState, useMemo } from 'react';
import { Upload, Type, Palette, ShieldCheck, RefreshCw, Layers, Check } from 'lucide-react';
import { calculateCustomizedPrice } from '../../utils/priceCalculator';

const COLOR_PALETTE = [
  { name: 'Pure White', hex: '#FFFFFF', border: '#E2E8F0' },
  { name: 'Obsidian Black', hex: '#1E293B', border: '#0F172A' },
  { name: 'Navy Blue', hex: '#1E3A8A', border: '#172554' },
  { name: 'Heather Gray', hex: '#64748B', border: '#475569' },
  { name: 'Crimson Red', hex: '#991B1B', border: '#7F1D1D' },
  { name: 'Forest Green', hex: '#14532D', border: '#052E16' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

const FONTS = [
  { label: 'Clean Sans', value: 'Inter, sans-serif' },
  { label: 'Classic Serif', value: 'Georgia, serif' },
  { label: 'Bold Impact', value: 'Impact, sans-serif' },
  { label: 'Monospace', value: 'Courier New, monospace' },
  { label: 'Cursive', value: 'Brush Script MT, cursive' },
];

const ProductCustomizer = ({ product, onAddToCart, initialConfig = null }) => {
  const [selectedColor, setSelectedColor] = useState(initialConfig?.color || COLOR_PALETTE[0]);
  const [selectedSize, setSelectedSize] = useState(initialConfig?.size || 'M');
  const [printArea, setPrintArea] = useState(initialConfig?.printArea || 'front');
  const [customText, setCustomText] = useState(initialConfig?.customText || '');
  const [textFont, setTextFont] = useState(initialConfig?.textFont || FONTS[0].value);
  const [textColor, setTextColor] = useState(initialConfig?.textColor || '#1E293B');
  const [textSize, setTextSize] = useState(initialConfig?.textSize || 24);
  const [textYPos, setTextYPos] = useState(initialConfig?.textYPos || 45); // percentage from top
  
  const [logoUrl, setLogoUrl] = useState(initialConfig?.logoUrl || null);
  const [logoScale, setLogoScale] = useState(initialConfig?.logoScale || 50); // percentage width
  const [quantity, setQuantity] = useState(1);

  // Dynamic price computation
  const priceBreakdown = useMemo(() => {
    return calculateCustomizedPrice({
      basePrice: product?.price || 25,
      size: selectedSize,
      printArea,
      customText,
      logoUrl,
      quantity,
    });
  }, [product?.price, selectedSize, printArea, customText, logoUrl, quantity]);

  // Handle logo image upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
  };

  const handleAddToCart = () => {
    const customizedItem = {
      product: {
        _id: product._id,
        name: product.name,
        image: product.image,
        basePrice: product.price,
      },
      customization: {
        color: selectedColor.name,
        colorHex: selectedColor.hex,
        size: selectedSize,
        printArea,
        customText,
        textFont,
        textColor,
        textSize,
        textYPos,
        logoUrl,
        logoScale,
      },
      unitPrice: priceBreakdown.unitPrice,
      quantity,
      totalPrice: priceBreakdown.totalPrice,
    };
    onAddToCart(customizedItem);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Visual Canvas Mockup (Left 7 Cols) */}
      <div className="lg:col-span-7 bg-slate-100/70 border border-slate-200/80 rounded-2xl p-6 flex flex-col items-center justify-center sticky top-24 min-h-[500px]">
        {/* Mockup Canvas Container */}
        <div className="relative w-full max-w-md aspect-square rounded-xl shadow-inner flex items-center justify-center overflow-hidden transition-colors duration-300" style={{ backgroundColor: selectedColor.hex }}>
          {/* Garment Base Vector Outline / Texture */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
              <path d="M30 10 L40 20 L60 20 L70 10 L90 25 L80 40 L80 90 L20 90 L20 40 L10 25 Z" />
            </svg>
          </div>

          {/* Printable Area Boundary Indicator */}
          <div className="absolute w-[60%] h-[65%] border-2 border-dashed border-slate-400/40 rounded-lg flex flex-col items-center justify-center p-2 pointer-events-none">
            <span className="absolute top-1 text-[10px] uppercase font-mono tracking-wider text-slate-400/70">
              Print Zone ({printArea})
            </span>
          </div>

          {/* Render Custom Logo Artwork */}
          {logoUrl && (
            <div 
              className="absolute z-10 transition-all duration-200"
              style={{
                width: `${logoScale}%`,
                top: `${textYPos - 15}%`,
              }}
            >
              <img src={logoUrl} alt="Custom Logo" className="w-full h-auto object-contain max-h-32 drop-shadow-md mx-auto" />
            </div>
          )}

          {/* Render Custom Text Artwork */}
          {customText && (
            <div 
              className="absolute z-20 w-[55%] text-center break-words transition-all duration-200 px-2 select-none"
              style={{
                top: `${textYPos}%`,
                fontFamily: textFont,
                color: textColor,
                fontSize: `${textSize}px`,
                textShadow: selectedColor.hex === '#FFFFFF' ? 'none' : '0 1px 2px rgba(0,0,0,0.3)',
              }}
            >
              {customText}
            </div>
          )}

          {!customText && !logoUrl && (
            <div className="text-center text-slate-400 text-sm p-4">
              <Type className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Add text or upload a logo to preview your custom design
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between w-full max-w-md text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> High-Density Screen Print
          </span>
          <span className="flex items-center gap-1">
            <Layers className="w-4 h-4 text-slate-600" /> Double-stitched Hem
          </span>
        </div>
      </div>

      {/* Customization Options Control Panel (Right 5 Cols) */}
      <div className="lg:col-span-5 space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{product?.name || 'Custom Apparel'}</h2>
          <p className="text-slate-500 text-sm mt-1">{product?.description || 'Premium heavyweight 100% combed cotton.'}</p>
        </div>

        {/* 1. Color Selector */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            Garment Color: <span className="font-normal text-slate-600">{selectedColor.name}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {COLOR_PALETTE.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${
                  selectedColor.name === color.name ? 'ring-2 ring-slate-900 ring-offset-2 border-slate-900 scale-105' : 'border-slate-300'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              >
                {selectedColor.name === color.name && (
                  <Check className={`w-4 h-4 ${color.hex === '#FFFFFF' ? 'text-slate-900' : 'text-white'}`} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Size Selector */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            Select Size
          </label>
          <div className="grid grid-cols-7 gap-1.5">
            {SIZES.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setSelectedSize(sz)}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                  selectedSize === sz
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
          {['2XL', '3XL'].includes(selectedSize) && (
            <p className="text-xs text-amber-600 mt-1.5 font-medium">+ $3.00 - $5.00 surcharge applies for size {selectedSize}</p>
          )}
        </div>

        {/* 3. Print Position */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            Print Location
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'front', label: 'Front Only' },
              { id: 'back', label: 'Back Only (+$2)' },
              { id: 'both', label: 'Front & Back (+$6)' },
            ].map((pos) => (
              <button
                key={pos.id}
                type="button"
                onClick={() => setPrintArea(pos.id)}
                className={`py-2 px-1 text-xs font-medium rounded-lg border text-center transition-all ${
                  printArea === pos.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {pos.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Custom Text Input */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-sm font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
            <Type className="w-4 h-4 text-slate-600" /> Custom Printed Text (+$3.00)
          </label>
          <input
            type="text"
            placeholder="Type your slogan or name..."
            maxLength={35}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
          />

          {customText && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Font Style</label>
                <select
                  value={textFont}
                  onChange={(e) => setTextFont(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg outline-none"
                >
                  {FONTS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Text Color</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-8 p-0.5 border border-slate-300 rounded-lg cursor-pointer bg-white"
                />
              </div>

              <div className="col-span-2">
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Text Size ({textSize}px)</span>
                  <span>Position ({textYPos}%)</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="range"
                    min="14"
                    max="42"
                    value={textSize}
                    onChange={(e) => setTextSize(Number(e.target.value))}
                    className="w-full accent-slate-900"
                  />
                  <input
                    type="range"
                    min="25"
                    max="70"
                    value={textYPos}
                    onChange={(e) => setTextYPos(Number(e.target.value))}
                    className="w-full accent-slate-900"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5. Custom Logo Upload */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-sm font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-slate-600" /> Upload Logo / Graphic (+$5.00)
          </label>
          
          {!logoUrl ? (
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl cursor-pointer bg-slate-50 transition-colors">
              <Upload className="w-5 h-5 text-slate-400 mb-1" />
              <span className="text-xs text-slate-600 font-medium">Click to upload PNG or JPG</span>
              <span className="text-[11px] text-slate-400">Max size 5MB (Transparent recommended)</span>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          ) : (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={logoUrl} alt="Uploaded logo" className="w-10 h-10 object-contain bg-white rounded border" />
                <div>
                  <p className="text-xs font-semibold text-slate-800">Logo Uploaded</p>
                  <label className="block text-[11px] text-slate-500">Logo Width ({logoScale}%)</label>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    value={logoScale}
                    onChange={(e) => setLogoScale(Number(e.target.value))}
                    className="w-24 accent-slate-900"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 bg-red-50 rounded-md"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* 6. Dynamic Pricing Breakdown & Action */}
        <div className="pt-4 border-t border-slate-200">
          <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Base Price ({product?.name})</span>
              <span className="font-semibold text-slate-900">${priceBreakdown.basePrice.toFixed(2)}</span>
            </div>
            {priceBreakdown.sizeAddon > 0 && (
              <div className="flex justify-between">
                <span>Size Surcharge ({selectedSize})</span>
                <span>+${priceBreakdown.sizeAddon.toFixed(2)}</span>
              </div>
            )}
            {priceBreakdown.printAreaAddon > 0 && (
              <div className="flex justify-between">
                <span>Print Location ({printArea})</span>
                <span>+${priceBreakdown.printAreaAddon.toFixed(2)}</span>
              </div>
            )}
            {priceBreakdown.textAddon > 0 && (
              <div className="flex justify-between">
                <span>Custom Printed Text</span>
                <span>+${priceBreakdown.textAddon.toFixed(2)}</span>
              </div>
            )}
            {priceBreakdown.logoAddon > 0 && (
              <div className="flex justify-between">
                <span>Custom Logo Artwork</span>
                <span>+${priceBreakdown.logoAddon.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
              <span>Unit Price</span>
              <span className="text-base text-slate-900">${priceBreakdown.unitPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center border border-slate-300 rounded-lg">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-slate-600 hover:bg-slate-100 font-bold"
              >
                -
              </button>
              <span className="px-3 py-2 text-sm font-semibold text-slate-800">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 text-slate-600 hover:bg-slate-100 font-bold"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              Add Custom Design (${priceBreakdown.totalPrice.toFixed(2)})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCustomizer;
