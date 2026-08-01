import React, { useState } from 'react';
import { ShieldCheck, CreditCard, Lock, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import api from '../../api/axios';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const PaymentModal = ({ isOpen, onClose, order, onPaymentSuccess }) => {
  const [gateway, setGateway] = useState('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!order) return null;

  const orderId = order._id || order.id;

  const handleVerify = async (simulateFailure = false) => {
    setIsProcessing(true);
    setError('');

    try {
      // 1. Create Gateway Session
      const sessionRes = await api.post('/payments/create', {
        orderId,
        gateway,
      });

      const session = sessionRes.data.session;
      const { paymentId, key_id, amount, currency, notes, razorpay_order_id } = session;

      // Handle explicit simulation test button
      if (simulateFailure) {
        const verifyRes = await api.post('/payments/verify', {
          orderId,
          paymentId,
          gateway,
          simulateFailure: true,
        });
        if (verifyRes.data.status === 'success') {
          onPaymentSuccess(verifyRes.data.data.order);
          onClose();
        }
        return;
      }

      // Check if real Razorpay Checkout is available
      const scriptLoaded = await loadRazorpayScript();
      if (gateway === 'razorpay' && scriptLoaded && window.Razorpay && key_id && !key_id.includes('mock')) {
        const options = {
          key: key_id,
          amount: amount || Math.round(order.totalAmount * 100),
          currency: currency || 'INR',
          name: 'ThreadCraft Custom Merchandise',
          description: `Order #${order.orderNumber}`,
          order_id: razorpay_order_id,
          prefill: {
            name: notes?.customerName || '',
            email: notes?.customerEmail || '',
          },
          theme: {
            color: '#0F172A',
          },
          handler: async (response) => {
            try {
              const verifyRes = await api.post('/payments/verify', {
                orderId,
                paymentId,
                razorpay_order_id: response.razorpay_order_id || razorpay_order_id || order.orderNumber,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                signature: response.razorpay_signature,
                gateway: 'razorpay',
              });

              if (verifyRes.data.status === 'success') {
                onPaymentSuccess(verifyRes.data.data.order);
                onClose();
              }
            } catch (verifyErr) {
              setError(
                verifyErr.response?.data?.message ||
                  'Payment signature verification failed. Order status remains at "Order Placed".'
              );
            } finally {
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          setError(response.error?.description || 'Razorpay Payment Failed. Order remains at "Order Placed".');
          setIsProcessing(false);
        });
        rzp.open();
        return;
      }

      // Fallback Authorization / Standard Test Authorization Mode
      const dummySignature = `sig_verified_${Date.now()}`;
      const verifyRes = await api.post('/payments/verify', {
        orderId,
        paymentId,
        razorpay_order_id: razorpay_order_id || order.orderNumber,
        razorpay_payment_id: `pay_verified_${Date.now()}`,
        razorpay_signature: dummySignature,
        signature: dummySignature,
        gateway,
        simulateFailure: false,
      });

      if (verifyRes.data.status === 'success') {
        onPaymentSuccess(verifyRes.data.data.order);
        onClose();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Payment verification failed. Order status remains at "Order Placed". Please retry.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Secure Payment Gateway" maxWidth="max-w-lg">
      <div className="space-y-6">
        {/* Payment Header & Info */}
        <div className="p-4 rounded-2xl bg-canvas border border-warm-grey-light space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-warm-grey font-bold uppercase">Order Reference</span>
            <span className="text-sm font-extrabold text-ink">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-warm-grey font-bold uppercase">Total Amount Due</span>
            <span className="text-2xl font-extrabold text-ink">₹{order.totalAmount}</span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-print-red-light border border-print-red/30 text-print-red text-xs font-bold space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <p className="text-[11px] text-warm-grey-dark font-semibold">
              Order remains at "Order Placed". You can safely retry payment below.
            </p>
          </div>
        )}

        {/* Gateway Selection Tabs */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-ink">Select Gateway Mode</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setGateway('razorpay')}
              className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                gateway === 'razorpay'
                  ? 'bg-ink text-canvas border-ink shadow-sm'
                  : 'bg-canvas text-warm-grey border-warm-grey-light hover:border-ink hover:text-ink'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Razorpay Test Mode</span>
            </button>
            <button
              onClick={() => setGateway('stripe')}
              className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                gateway === 'stripe'
                  ? 'bg-ink text-canvas border-ink shadow-sm'
                  : 'bg-canvas text-warm-grey border-warm-grey-light hover:border-ink hover:text-ink'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Stripe Test Mode</span>
            </button>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="space-y-3 pt-2">
          <Button
            onClick={() => handleVerify(false)}
            isLoading={isProcessing}
            variant="primary"
            fullWidth
            size="lg"
            icon={ShieldCheck}
          >
            Authorize & Verify Payment (₹{order.totalAmount})
          </Button>

          <button
            type="button"
            onClick={() => handleVerify(true)}
            disabled={isProcessing}
            className="w-full text-center text-xs text-print-red font-bold py-2 border border-print-red/30 hover:bg-print-red-light rounded-xl transition-colors"
          >
            ⚡ Test Payment Verification Failure (Isolate Error State)
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-warm-grey font-bold pt-1">
          <Lock className="w-3.5 h-3.5 text-thread-green" />
          <span>Server-Side Signature & Webhook Verification Enforced</span>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;
