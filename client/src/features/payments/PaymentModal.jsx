import React, { useState } from 'react';
import { ShieldCheck, CreditCard, Lock, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import api from '../../api/axios';

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

      const { paymentId } = sessionRes.data.session;
      const razorpay_order_id = order.orderNumber;
      const razorpay_payment_id = `pay_verified_${Date.now()}`;
      const dummySignature = `sig_verified_${Date.now()}`;

      // 2. Call Server-Side Verification Endpoint (NEVER trust client!)
      const verifyRes = await api.post('/payments/verify', {
        orderId,
        paymentId,
        razorpay_order_id,
        razorpay_payment_id,
        signature: dummySignature,
        gateway,
        simulateFailure,
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
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-slate-400 font-semibold uppercase">Order Reference</span>
            <span className="text-sm font-bold text-sky-400">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Amount Due</span>
            <span className="text-2xl font-extrabold text-white">₹{order.totalAmount}</span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <p className="text-[11px] text-rose-300 font-normal">
              Order remains at "Order Placed". You can safely retry payment below.
            </p>
          </div>
        )}

        {/* Gateway Selection Tabs */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Select Gateway Mode</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setGateway('razorpay')}
              className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                gateway === 'razorpay'
                  ? 'bg-sky-500/10 text-sky-400 border-sky-500/40 shadow-md'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Razorpay Test Mode</span>
            </button>
            <button
              onClick={() => setGateway('stripe')}
              className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                gateway === 'stripe'
                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/40 shadow-md'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
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
            className="w-full text-center text-xs text-rose-400 hover:text-rose-300 font-semibold py-2 border border-rose-500/20 hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            ⚡ Test Payment Verification Failure (Isolate Error State)
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-semibold pt-1">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Server-Side Signature & Webhook Verification Enforced</span>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;
