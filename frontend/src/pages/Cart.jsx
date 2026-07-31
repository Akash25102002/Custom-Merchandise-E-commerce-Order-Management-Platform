import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowLeft, ArrowRight, Shirt, Tag, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartSubtotal } = useCart();
  const navigate = useNavigate();

  const shippingEstimate = cartSubtotal >= 100 ? 0 : 5.0;
  const taxEstimate = Number((cartSubtotal * 0.08).toFixed(2));
  const grandTotal = Number((cartSubtotal + shippingEstimate + taxEstimate).toFixed(2));

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
          <ShoppingBag className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Your Cart is Empty</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
          Explore our customizable merchandise catalog and create your custom apparel, hoodies, or mugs.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Shirt className="w-4 h-4 text-amber-400" /> Browse Merchandise
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Shopping Cart</h1>
          <p className="text-slate-500 text-xs mt-1">Review your customized print orders before checkout</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 items-start">
        {/* Cart Itemized List (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.cartItemId}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              {/* Product Visual Mockup Thumbnail */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div
                  className="w-20 h-20 rounded-xl flex items-center justify-center relative overflow-hidden border border-slate-200 shrink-0"
                  style={{ backgroundColor: item.customization?.colorHex || '#FFFFFF' }}
                >
                  <Shirt className="w-10 h-10 opacity-30 text-slate-900" />
                  {item.customization?.customText && (
                    <span
                      className="absolute inset-x-1 text-[9px] font-bold text-center truncate pointer-events-none"
                      style={{
                        color: item.customization.textColor || '#000',
                        fontFamily: item.customization.textFont,
                      }}
                    >
                      {item.customization.customText}
                    </span>
                  )}
                </div>

                {/* Customization Metadata Details */}
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm">{item.product.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                      Color: {item.customization.color}
                    </span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">
                      Size: {item.customization.size}
                    </span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded font-medium capitalize">
                      Print: {item.customization.printArea}
                    </span>
                  </div>

                  {item.customization.customText && (
                    <p className="text-xs text-slate-600 italic">
                      "Text: {item.customization.customText}"
                    </p>
                  )}
                  {item.customization.logoUrl && (
                    <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Custom Logo Included
                    </p>
                  )}
                </div>
              </div>

              {/* Quantity Controls & Pricing */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {/* Qty Selector */}
                <div className="flex items-center border border-slate-300 rounded-lg">
                  <button
                    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-bold text-slate-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-sm"
                  >
                    +
                  </button>
                </div>

                {/* Item Total Price */}
                <div className="text-right min-w-[80px]">
                  <p className="text-sm font-extrabold text-slate-900">
                    ${item.totalPrice.toFixed(2)}
                  </p>
                  <p className="text-[11px] text-slate-400">${item.unitPrice.toFixed(2)} each</p>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => removeFromCart(item.cartItemId)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="pt-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Card (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4 sticky top-24">
          <h2 className="text-lg font-extrabold text-slate-900 pb-3 border-b border-slate-100">
            Order Summary
          </h2>

          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal ({cartItems.length} items)</span>
              <span className="font-semibold text-slate-900">${cartSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Shipping</span>
              <span className="font-semibold text-slate-900">
                {shippingEstimate === 0 ? (
                  <span className="text-emerald-600 font-bold">FREE (Over $100)</span>
                ) : (
                  `$${shippingEstimate.toFixed(2)}`
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax (8%)</span>
              <span className="font-semibold text-slate-900">${taxEstimate.toFixed(2)}</span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">Total Amount</span>
              <span className="text-xl font-extrabold text-slate-900">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mt-4"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 text-[11px] text-slate-500 space-y-1">
            <p className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Secure SSL Encrypted Checkout
            </p>
            <p className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" /> Dynamic Vector Print Guarantee
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
