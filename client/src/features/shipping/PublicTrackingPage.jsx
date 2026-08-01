import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search, Truck, Clock, Calendar, CheckCircle2, MapPin, Package, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import api from '../../api/axios';

export const PublicTrackingPage = () => {
  const { trackingId: urlTrackingId } = useParams();

  const [inputTrackingId, setInputTrackingId] = useState(urlTrackingId || 'DELHIVERY987123');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTracking = async (idToFetch) => {
    if (!idToFetch) return;
    setLoading(true);
    setError('');

    try {
      const res = await api.get(`/shipping/${idToFetch}`);
      setTrackingData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'No active shipment found with that tracking number.');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlTrackingId) {
      fetchTracking(urlTrackingId);
    } else {
      // Fetch default sample tracking info
      fetchTracking('DELHIVERY987123');
    }
  }, [urlTrackingId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!inputTrackingId.trim()) return;
    fetchTracking(inputTrackingId.trim());
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn py-4">
      {/* Header */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-sky-500/25">
          <Truck className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">Public Merchandise Tracker</h1>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Enter your shipment tracking ID or courier AWB number to check real-time delivery status. No login required.
        </p>

        {/* Public Search Input Form */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto flex items-center gap-2 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. DELHIVERY987123"
              value={inputTrackingId}
              onChange={(e) => setInputTrackingId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            />
          </div>
          <Button type="submit" isLoading={loading} size="sm">
            Track Package
          </Button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold text-center">
          {error}
        </div>
      )}

      {/* Shipment Status Card */}
      {trackingData && (
        <div className="space-y-6">
          <Card className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Courier Provider</span>
                <h2 className="text-xl font-extrabold text-white">{trackingData.courierName}</h2>
                <p className="text-xs text-sky-400 font-mono font-bold mt-0.5">AWB: {trackingData.trackingNumber}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Estimated Delivery Date</span>
                <p className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(trackingData.estimatedDeliveryDate).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div>
                <Badge variant="info" className="text-xs py-1.5 px-3">
                  Status: {trackingData.status}
                </Badge>
              </div>
            </div>

            {/* Courier Tracking Timeline */}
            <div className="space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-400" /> Carrier Checkpoint Events
              </h3>

              <div className="space-y-3">
                {(trackingData.trackingTimeline || []).map((evt, idx) => (
                  <div key={idx} className="flex items-start gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
                    <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-200 text-xs">{evt.status}</h4>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {new Date(evt.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-sky-400 font-semibold">{evt.location}</p>
                      <p className="text-xs text-slate-400">{evt.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PublicTrackingPage;
