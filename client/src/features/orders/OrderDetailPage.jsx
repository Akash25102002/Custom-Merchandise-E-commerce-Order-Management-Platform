import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Ban, PackageCheck, Truck, ShieldCheck, CreditCard, ExternalLink, Calendar } from 'lucide-react';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import OrderTimeline from './OrderTimeline';
import PaymentModal from '../payments/PaymentModal';
import api from '../../api/axios';

export const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [shipping, setShipping] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/orders/${id}`);
      const ord = res.data.data.order;
      setOrder(ord);

      if (ord.shippingId) {
        try {
          const shipRes = await api.get(`/shipping/${ord.shippingId}`);
          setShipping(shipRes.data.data);
        } catch (sErr) {
          console.log('No public shipping record yet');
        }
      }
    } catch (err) {
      console.error('Failed to fetch order detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setCancelling(true);
    setError('');

    try {
      const res = await api.patch(`/orders/${id}/cancel`);
      setOrder(res.data.data.order);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  const handlePaymentSuccess = (updatedOrder) => {
    setOrder(updatedOrder);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 gap-3">
        <div className="w-10 h-10 border-4 border-print-red border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-warm-grey">Loading Order Timeline & Details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white p-12 text-center rounded-3xl space-y-4 border border-warm-grey-light">
        <h3 className="text-xl font-extrabold text-ink">Order Not Found</h3>
        <Link to="/orders">
          <Button size="sm">Return to Orders List</Button>
        </Link>
      </div>
    );
  }

  const canCancel = ['Order Placed', 'Payment Verified', 'Design Approved'].includes(order.status);
  const needsPayment = order.status === 'Order Placed';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Back Button */}
      <Link to="/orders" className="inline-flex items-center gap-2 text-xs font-bold text-warm-grey hover:text-ink transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Order History
      </Link>

      {/* Header */}
      <div className="bg-white p-8 rounded-3xl border border-warm-grey-light flex flex-wrap items-center justify-between gap-6 shadow-sm">
        <div>
          <span className="text-xs text-warm-grey uppercase font-bold">Order Reference Number</span>
          <h1 className="text-3xl font-extrabold text-ink">{order.orderNumber}</h1>
          <p className="text-xs text-warm-grey font-medium mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant={
              ['Delivered', 'Payment Verified'].includes(order.status)
                ? 'success'
                : order.status === 'Cancelled'
                ? 'danger'
                : 'gold'
            }
            className="text-sm py-1.5 px-4"
          >
            {order.status}
          </Badge>

          {needsPayment && (
            <Button
              onClick={() => setIsPaymentModalOpen(true)}
              variant="primary"
              size="sm"
              icon={CreditCard}
            >
              Pay Now (₹{order.totalAmount})
            </Button>
          )}

          {canCancel && (
            <Button
              onClick={handleCancelOrder}
              isLoading={cancelling}
              variant="danger"
              size="sm"
              icon={Ban}
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-print-red-light border border-print-red/30 text-print-red text-xs font-bold">
          {error}
        </div>
      )}

      {/* 2-Column Grid: Timeline + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Vertical Timeline */}
        <div className="lg:col-span-7">
          <OrderTimeline currentStatus={order.status} statusHistory={order.statusHistory} />
        </div>

        {/* Right Column: Order Items & Shipping Details */}
        <div className="lg:col-span-5 space-y-6">
          {/* Shipping Courier Specs Card (If Created) */}
          {shipping && (
            <div className="bg-canvas p-6 rounded-3xl border border-warm-grey-light space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-ink text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4" /> Courier Shipment Active
                </h3>
                <Link
                  to={`/track/${shipping.trackingNumber}`}
                  target="_blank"
                  className="text-[11px] font-bold text-ink underline flex items-center gap-1"
                >
                  Public Tracker <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <div className="text-xs text-ink space-y-1">
                <p className="font-extrabold text-ink text-base">{shipping.courierName}</p>
                <p className="font-mono text-ink font-bold">Tracking Number: {shipping.trackingNumber}</p>
                <p className="text-thread-green font-bold flex items-center gap-1 pt-1">
                  <Calendar className="w-3.5 h-3.5" /> Est. Delivery:{' '}
                  {new Date(shipping.estimatedDeliveryDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {/* Shipping Address Card */}
          <div className="bg-white p-6 rounded-3xl border border-warm-grey-light space-y-3 shadow-sm">
            <h3 className="font-extrabold text-ink text-base border-b border-warm-grey-light pb-2 flex items-center gap-2">
              <Truck className="w-4 h-4 text-ink" /> Destination Shipping Address
            </h3>
            <div className="text-xs text-ink space-y-1">
              <p className="font-extrabold text-ink text-sm">{order.shippingAddress?.fullName}</p>
              <p className="text-warm-grey font-medium">{order.shippingAddress?.street}</p>
              <p className="text-warm-grey font-medium">
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
              </p>
              <p className="text-ink font-mono font-bold">Phone: {order.shippingAddress?.phone}</p>
            </div>
          </div>

          {/* Items Snapshot Card */}
          <div className="bg-white p-6 rounded-3xl border border-warm-grey-light space-y-4 shadow-sm">
            <h3 className="font-extrabold text-ink text-base border-b border-warm-grey-light pb-2">Purchased Merchandise</h3>
            <div className="space-y-3">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-canvas p-3 rounded-2xl border border-warm-grey-light">
                  <div className="w-12 h-12 rounded-xl bg-white overflow-hidden shrink-0 border border-warm-grey-light">
                    <img
                      src={item.designImageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 text-xs space-y-0.5">
                    <h4 className="font-extrabold text-ink">{item.name}</h4>
                    <p className="text-warm-grey font-medium">
                      Size: {item.size} | Color: {item.color?.name} | Qty: {item.quantity}
                    </p>
                    <p className="text-ink font-bold">{item.printType} ({item.printLocation})</p>
                  </div>
                  <span className="font-extrabold text-ink text-sm">₹{item.lineTotal}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-warm-grey-light space-y-2 text-xs text-ink font-bold">
              <div className="flex justify-between">
                <span className="text-warm-grey font-medium">Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-grey font-medium">Tax (18% GST)</span>
                <span>₹{order.tax}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-grey font-medium">Shipping</span>
                <span>₹{order.shippingCharge}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-ink pt-2 border-t border-warm-grey-light">
                <span>Total Amount Paid</span>
                <span className="text-ink text-base">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      {order && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          order={order}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default OrderDetailPage;
