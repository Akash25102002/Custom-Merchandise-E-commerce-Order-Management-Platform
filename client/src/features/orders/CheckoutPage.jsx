import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, ArrowRight, ArrowLeft, AlertCircle, ShoppingBag } from 'lucide-react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import PaymentModal from '../payments/PaymentModal';
import api from '../../api/axios';

export const CheckoutPage = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loadingCart, setLoadingCart] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Shipping Form State
  const [fullName, setFullName] = useState('Jane Customer');
  const [street, setStreet] = useState('42 Design Studio Avenue');
  const [city, setCity] = useState('Bengaluru');
  const [stateName, setStateName] = useState('Karnataka');
  const [postalCode, setPostalCode] = useState('560001');
  const [phone, setPhone] = useState('+91 98765 43210');

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get('/cart');
        setCart(res.data.data.cart);
      } catch (err) {
        console.error('Failed to load cart for checkout:', err);
      } finally {
        setLoadingCart(false);
      }
    };
    fetchCart();
  }, []);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName || !street || !city || !stateName || !postalCode || !phone) {
      setError('Please fill in all shipping address fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.post('/orders', {
        shippingAddress: {
          fullName,
          street,
          city,
          state: stateName,
          postalCode,
          phone,
          country: 'India',
        },
      });

      const order = res.data.data.order;
      setCreatedOrder(order);
      setIsPaymentModalOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = (updatedOrder) => {
    const orderId = updatedOrder._id || updatedOrder.id;
    navigate(`/orders/${orderId}`);
  };

  if (loadingCart) {
    return (
      <div className="flex flex-col items-center justify-center p-16 gap-3">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-400">Loading Checkout Order Summary...</p>
      </div>
    );
  }

  const items = cart?.items || [];

  if (items.length === 0 && !createdOrder) {
    return (
      <div className="glass-panel p-12 text-center rounded-3xl space-y-4 max-w-md mx-auto my-8">
        <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-xl font-bold text-white">Your Cart is Empty</h3>
        <p className="text-xs text-slate-400">Add customizable merchandise items to your cart before proceeding to checkout.</p>
        <Link to="/products">
          <Button size="md">Browse Catalog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Checkout & Order Review</h1>
          <p className="text-xs text-slate-400">Provide shipping address details and place your merchandise order.</p>
        </div>
        <Link to="/cart" className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Shipping Form Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
              <Truck className="w-5 h-5 text-sky-400" />
              <h2 className="text-lg font-bold text-white">Shipping Address Details</h2>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                required
              />

              <Input
                label="Street Address"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Flat / Building / Street Address"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  required
                />
                <Input
                  label="State"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="State"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Postal Code (PIN)"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="560001"
                  required
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-800">
                <Button type="submit" fullWidth isLoading={isSubmitting} size="lg" icon={ArrowRight}>
                  Place Order & Open Payment Gateway (₹{cart?.grandTotal || 0})
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Items Snapshot Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 sticky top-28">
            <h3 className="font-bold text-white text-lg border-b border-slate-800 pb-3">Items Snapshot</h3>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item._id || item.id} className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                  <img
                    src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800'}
                    alt={item.product?.name}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div className="flex-1 text-xs space-y-0.5">
                    <h4 className="font-bold text-white line-clamp-1">{item.product?.name || 'Custom Product'}</h4>
                    <p className="text-slate-400">
                      {item.size} | {item.color?.name} | Qty: {item.quantity}
                    </p>
                    <p className="text-sky-400 font-semibold">{item.printType} ({item.printLocation})</p>
                  </div>
                  <span className="font-extrabold text-white text-sm">₹{item.lineTotal}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-800 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{cart?.subtotal || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax (18%)</span>
                <span>₹{cart?.tax || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Express Shipping</span>
                <span className="text-emerald-400">{cart?.shippingEstimate === 0 ? 'FREE' : `₹${cart?.shippingEstimate || 0}`}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-white pt-2 border-t border-slate-800">
                <span>Grand Total</span>
                <span className="text-sky-400 text-base">₹{cart?.grandTotal || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      {createdOrder && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          order={createdOrder}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default CheckoutPage;
