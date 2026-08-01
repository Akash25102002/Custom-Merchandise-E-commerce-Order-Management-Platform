import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShieldCheck, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';

export const CartPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/cart');
      setCart(res.data.data.cart);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const handleUpdateQuantity = async (itemId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    try {
      const res = await api.put(`/cart/${itemId}`, { quantity: newQty });
      setCart(res.data.data.cart);
    } catch (err) {
      console.error('Failed to update cart item:', err);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const res = await api.delete(`/cart/${itemId}`);
      setCart(res.data.data.cart);
    } catch (err) {
      console.error('Failed to remove cart item:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white p-12 text-center rounded-3xl space-y-4 max-w-lg mx-auto my-12 border border-warm-grey-light shadow-sm">
        <ShoppingBag className="w-12 h-12 text-print-red mx-auto" />
        <h2 className="text-2xl font-extrabold text-ink">Your Shopping Cart</h2>
        <p className="text-xs text-warm-grey">Please sign in to view your customized merchandise items and proceed to checkout.</p>
        <Link to="/login">
          <Button size="lg" variant="primary">Sign In to View Cart</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 gap-3">
        <div className="w-10 h-10 border-4 border-print-red border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-warm-grey">Calculating Cart Totals...</p>
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const tax = cart?.tax || 0;
  const shippingEstimate = cart?.shippingEstimate || 0;
  const grandTotal = cart?.grandTotal || 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-ink">Your Custom Cart</h1>
          <p className="text-xs text-warm-grey">Server-recalculated live totals & customized print specifications.</p>
        </div>
        <Link to="/products" className="inline-flex items-center gap-2 text-xs font-bold text-ink hover:underline">
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl space-y-4 max-w-md mx-auto border border-warm-grey-light shadow-sm">
          <ShoppingBag className="w-12 h-12 text-warm-grey mx-auto" />
          <h3 className="text-xl font-extrabold text-ink">Your Cart is Empty</h3>
          <p className="text-xs text-warm-grey">Explore our catalog and customize T-shirts, hoodies, mugs, and wall art.</p>
          <Link to="/products">
            <Button size="md" icon={Sparkles}>
              Explore Catalog
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => {
              const product = item.product || {};
              return (
                <Card key={item._id || item.id} className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Item Thumbnail & Spec */}
                    <div className="flex items-center gap-4">
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-canvas border border-warm-grey-light shrink-0">
                        <img
                          src={product.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800'}
                          alt={product.name || 'Merchandise Item'}
                          className="w-full h-full object-cover"
                        />
                        {item.designImageUrl && (
                          <div className="absolute bottom-1 right-1 p-1 bg-white/90 rounded-lg border border-warm-grey-light" title="Custom Artwork Attached">
                            <ImageIcon className="w-3 h-3 text-ink" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-extrabold text-ink text-base">{product.name || 'Custom Merchandise'}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-warm-grey">
                          <span className="px-2 py-0.5 rounded-md bg-canvas border border-warm-grey-light text-ink font-bold">
                            Size: {item.size}
                          </span>
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-canvas border border-warm-grey-light text-ink font-bold">
                            <span className="w-2.5 h-2.5 rounded-full border border-warm-grey-light" style={{ backgroundColor: item.color?.hex }}></span>
                            {item.color?.name}
                          </span>
                          <Badge variant="info">{item.printType}</Badge>
                          <Badge variant="neutral">Zone: {item.printLocation}</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Price & Quantity Controls */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-warm-grey-light">
                      <div className="text-right">
                        <span className="text-[10px] text-warm-grey uppercase font-bold">Unit Price</span>
                        <p className="font-extrabold text-ink text-sm">₹{item.unitPrice}</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-canvas border border-warm-grey-light rounded-xl p-1">
                        <button
                          onClick={() => handleUpdateQuantity(item._id || item.id, item.quantity, -1)}
                          className="p-1 rounded-lg text-warm-grey hover:text-ink hover:bg-warm-grey-subtle transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-extrabold text-ink px-2">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item._id || item.id, item.quantity, 1)}
                          className="p-1 rounded-lg text-warm-grey hover:text-ink hover:bg-warm-grey-subtle transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right min-w-[70px]">
                        <span className="text-[10px] text-warm-grey uppercase font-bold">Line Total</span>
                        <p className="font-extrabold text-ink text-base">₹{item.lineTotal}</p>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item._id || item.id)}
                        className="p-2 rounded-xl text-warm-grey hover:text-print-red hover:bg-warm-grey-subtle transition-colors"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Order Summary & Live Recalculations */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-warm-grey-light space-y-6 sticky top-28 shadow-sm">
              <h3 className="font-extrabold text-ink text-lg border-b border-warm-grey-light pb-3">Order Summary</h3>

              <div className="space-y-3 text-sm text-ink font-bold">
                <div className="flex justify-between">
                  <span className="text-warm-grey font-medium">Merchandise Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-grey font-medium">Estimated Tax (18% GST)</span>
                  <span>₹{tax}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-grey font-medium">Delhivery Express Shipping</span>
                  <span className="text-thread-green font-extrabold">
                    {shippingEstimate === 0 ? 'FREE Shipping' : `₹${shippingEstimate}`}
                  </span>
                </div>

                {subtotal > 0 && subtotal < 1500 && (
                  <p className="text-[11px] text-ink font-bold bg-warm-grey-subtle p-2.5 rounded-xl border border-warm-grey-light">
                    Add ₹{1500 - subtotal} more for FREE shipping!
                  </p>
                )}

                <div className="pt-4 border-t border-warm-grey-light flex justify-between items-baseline">
                  <span className="text-base font-extrabold text-ink">Grand Total</span>
                  <span className="text-2xl font-extrabold text-ink">₹{grandTotal}</span>
                </div>
              </div>

              <Button
                onClick={() => navigate('/checkout')}
                variant="primary"
                fullWidth
                size="lg"
                icon={ArrowRight}
              >
                Proceed to Checkout
              </Button>

              <div className="flex items-center justify-center gap-2 text-warm-grey text-xs font-bold pt-2">
                <ShieldCheck className="w-4 h-4 text-thread-green" />
                <span>Verified 256-bit Encrypted Checkout</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
