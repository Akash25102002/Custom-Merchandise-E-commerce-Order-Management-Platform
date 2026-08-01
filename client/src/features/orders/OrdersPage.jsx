import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Clock, ShoppingBag } from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import api from '../../api/axios';

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.data.data.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 gap-3">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-400">Loading Order History...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Your Orders & Custom Merchandise Trackers</h1>
        <p className="text-sm text-slate-400">View live status updates, production stages, and shipping timelines for your orders.</p>
      </div>

      {orders.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl space-y-4 max-w-md mx-auto my-8">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-400">Design your first custom T-shirt, hoodie, or mug and track its production live.</p>
          <Link to="/products">
            <Button size="md">Explore Products</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((ord) => (
            <Card key={ord._id || ord.id} className="space-y-6">
              {/* Order Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs text-slate-500 uppercase font-semibold">Order Number</span>
                  <h3 className="text-lg font-extrabold text-sky-400">{ord.orderNumber}</h3>
                </div>

                <div>
                  <span className="text-xs text-slate-500 uppercase font-semibold">Date Placed</span>
                  <p className="text-xs font-semibold text-slate-300">
                    {new Date(ord.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <span className="text-xs text-slate-500 uppercase font-semibold">Total Paid</span>
                  <p className="text-base font-extrabold text-white">₹{ord.totalAmount}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      ord.status === 'Delivered'
                        ? 'success'
                        : ord.status === 'Cancelled'
                        ? 'danger'
                        : 'info'
                    }
                  >
                    {ord.status}
                  </Badge>

                  <Link to={`/orders/${ord._id || ord.id}`}>
                    <Button size="sm" icon={ArrowRight}>
                      View Timeline
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Items Brief */}
              <div className="space-y-3">
                {(ord.items || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-800">
                      <img
                        src={item.designImageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 text-xs space-y-0.5">
                      <h4 className="font-bold text-white">{item.name}</h4>
                      <p className="text-slate-400">
                        Size: {item.size} | Color: {item.color?.name} | Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-slate-200 text-sm">₹{item.lineTotal}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
