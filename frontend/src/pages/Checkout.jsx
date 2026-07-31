import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, Truck, CheckCircle2, Lock, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const Checkout = () => {
  const { cartItems, cartSubtotal, clearCart } = useCart();
  const navigate = useNavigate();

  // Form & Workflow Steps
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Shipping Form State
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
  });

  const [shippingMethod, setShippingMethod] = useState('Standard');
  const [paymentProvider, setPaymentProvider] = useState('Mock Gateway');
  const [createdOrder, setCreatedOrder] = useState(null);

  // Calculate Shipping & Taxes
  let shippingFee = 5.0;
  if (shippingMethod === 'Express') shippingFee = 15.0;
  if (shippingMethod === 'Overnight') shippingFee = 25.0;
  if (cartSubtotal >= 100 && shippingMethod === 'Standard') shippingFee = 0;

  const taxFee = Number((cartSubtotal * 0.08).toFixed(2));
  const totalAmount = Number((cartSubtotal + shippingFee + taxFee).toFixed(2));

  const handleInputChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (!address.fullName || !address.phone || !address.street || !address.city || !address.zipCode) {
      setError('Please fill in all required shipping address fields.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      setError('');

      const orderPayload = {
        items: cartItems,
        shippingAddress: address,
        shippingMethod,
        paymentInfo: {
          provider: paymentProvider,
          status: 'Paid',
          transactionId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
        },
      };

      const res = await api.post('/orders', orderPayload);
      const newOrder = res.data?.order;
      
      setCreatedOrder(newOrder);
      clearCart();
      setStep(3);
    } catch (err) {
      console.error('Order checkout error:', err);
      setError(err.message || 'Failed to process order checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && step !== 3) {
    return (
      <div className="max-w-md mx-auto my-16 text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Your cart is empty</h2>
        <p className="text-xs text-slate-500 mt-2">Add items to your cart before proceeding to checkout.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Checkout Progress Stepper */}
      <div className="max-w-xl mx-auto mb-10">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 -z-10"></div>
          
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${step >= 1 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>
            1. Shipping
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${step >= 2 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>
            2. Payment
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${step >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
            3. Confirmation
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-xl max-w-2xl mx-auto">
          {error}
        </div>
      )}

      {/* Step 1 & Step 2 Layout */}
      {step < 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Checkout Form Area (7 Cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
            {step === 1 && (
              <form onSubmit={handleShippingSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-slate-700" /> Shipping Details
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Enter destination address for custom merchandise delivery</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={address.fullName}
                      onChange={handleInputChange}
                      placeholder="Jane Doe"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={address.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address *</label>
                    <input
                      type="text"
                      name="street"
                      required
                      value={address.street}
                      onChange={handleInputChange}
                      placeholder="123 Printing Studio Way, Suite 400"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={address.city}
                      onChange={handleInputChange}
                      placeholder="Austin"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">State / Province *</label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={address.state}
                      onChange={handleInputChange}
                      placeholder="Texas"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ZIP / Postal Code *</label>
                    <input
                      type="text"
                      name="zipCode"
                      required
                      value={address.zipCode}
                      onChange={handleInputChange}
                      placeholder="78701"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>
                </div>

                {/* Shipping Method Options */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Select Shipping Speed
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'Standard', title: 'Standard Delivery (3-5 Days)', price: cartSubtotal >= 100 ? 'FREE' : '$5.00' },
                      { id: 'Express', title: 'Express Print & Delivery (2 Days)', price: '$15.00' },
                      { id: 'Overnight', title: 'Overnight Rush Air (1 Day)', price: '$25.00' },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        onClick={() => setShippingMethod(opt.id)}
                        className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                          shippingMethod === opt.id
                            ? 'border-slate-900 bg-slate-50 font-semibold'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shippingMethod"
                            checked={shippingMethod === opt.id}
                            onChange={() => setShippingMethod(opt.id)}
                            className="accent-slate-900"
                          />
                          <span className="text-xs text-slate-800">{opt.title}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900">{opt.price}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/cart')}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Cart
                  </button>
                  <button
                    type="submit"
                    className="py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                  >
                    Continue to Payment
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-slate-700" /> Payment Options
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Select your preferred payment gateway</p>
                </div>

                {/* Payment Gateway Options */}
                <div className="space-y-3">
                  {[
                    { id: 'Mock Gateway', label: 'Credit / Debit Card (Simulated Direct Checkout)', icon: Lock },
                    { id: 'Stripe', label: 'Stripe Payment Gateway (Mock Flow)', icon: CreditCard },
                    { id: 'Razorpay', label: 'Razorpay Secure Payment (Mock Flow)', icon: ShieldCheck },
                    { id: 'COD', label: 'Cash / Pay on Delivery', icon: Truck },
                  ].map((gw) => (
                    <label
                      key={gw.id}
                      onClick={() => setPaymentProvider(gw.id)}
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                        paymentProvider === gw.id
                          ? 'border-slate-900 bg-slate-50 font-semibold'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentProvider"
                          checked={paymentProvider === gw.id}
                          onChange={() => setPaymentProvider(gw.id)}
                          className="accent-slate-900"
                        />
                        <gw.icon className="w-4 h-4 text-slate-600" />
                        <span className="text-xs text-slate-800">{gw.label}</span>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Mock Card Preview Fields if Mock Gateway selected */}
                {['Mock Gateway', 'Stripe', 'Razorpay'].includes(paymentProvider) && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                    <p className="font-semibold text-slate-700">Simulated Payment Authorization</p>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        readOnly
                        value="4242 •••• •••• 4242"
                        className="col-span-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-mono"
                      />
                      <input
                        type="text"
                        readOnly
                        value="12/28"
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-mono"
                      />
                      <input
                        type="text"
                        readOnly
                        value="888"
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-mono"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" /> Edit Shipping
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handlePlaceOrder}
                    className="py-3 px-6 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Authorizing Payment...
                      </>
                    ) : (
                      <>
                        Authorize & Place Order (${totalAmount.toFixed(2)})
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Summary Sidebar (5 Cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm pb-2 border-b border-slate-100">
              Order Items ({cartItems.length})
            </h3>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
              {cartItems.map((item) => (
                <div key={item.cartItemId} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.quantity}x</span>
                    <div>
                      <p className="font-semibold text-slate-800 line-clamp-1">{item.product.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {item.customization.color} / {item.customization.size}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">${item.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">${cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping ({shippingMethod})</span>
                <span className="font-semibold text-slate-900">${shippingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span className="font-semibold text-slate-900">${taxFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-sm font-extrabold text-slate-900">
                <span>Total Due</span>
                <span className="text-lg">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Order Confirmation Card */}
      {step === 3 && createdOrder && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
              Payment Confirmed
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-3">Order Received!</h1>
            <p className="text-slate-500 text-xs mt-1">
              Your custom print order has been placed and sent to our production facility.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 text-left border border-slate-200/80 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Order Reference:</span>
              <span className="font-mono font-bold text-slate-900">{createdOrder.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Tracking Number:</span>
              <span className="font-mono font-bold text-emerald-700">{createdOrder.trackingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Payment Provider:</span>
              <span className="font-semibold text-slate-800">{createdOrder.paymentInfo?.provider}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Delivery Address:</span>
              <span className="font-semibold text-slate-800 text-right">
                {createdOrder.shippingAddress?.street}, {createdOrder.shippingAddress?.city}
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-3 border-t border-slate-200 text-sm font-bold text-slate-900">
              <span>Total Paid:</span>
              <span className="text-base text-slate-900">${createdOrder.totalAmount?.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => navigate('/orders')}
              className="py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
            >
              Track Order Status Workflow
            </button>
            <button
              onClick={() => navigate('/')}
              className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
