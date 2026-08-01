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
      <div className="bg-white p-8 rounded-3xl border border-warm-grey-light text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-ink flex items-center justify-center text-canvas mx-auto shadow-md">
          <Truck className="w-6 h-6 text-canvas" />
        </div>
        <h1 className="text-3xl font-extrabold text-ink">Public Merchandise Tracker</h1>
        <p className="text-xs text-warm-grey max-w-lg mx-auto">
          Enter your shipment tracking ID or courier AWB number to check real-time delivery status. No login required.
        </p>

        {/* Public Search Input Form */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto flex items-center gap-2 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-warm-grey absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. DELHIVERY987123"
              value={inputTrackingId}
              onChange={(e) => setInputTrackingId(e.target.value)}
              className="w-full bg-canvas border border-warm-grey-light rounded-xl pl-10 pr-4 py-2.5 text-xs text-ink font-bold placeholder-warm-grey/60 focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>
          <Button type="submit" isLoading={loading} variant="primary" size="sm">
            Track Package
          </Button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-print-red-light border border-print-red/30 text-print-red text-xs font-bold text-center">
          {error}
        </div>
      )}

      {/* Shipment Status Card */}
      {trackingData && (
        <div className="space-y-6">
          <Card className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-warm-grey-light">
              <div>
                <span className="text-[10px] text-warm-grey uppercase font-bold">Courier Provider</span>
                <h2 className="text-xl font-extrabold text-ink">{trackingData.courierName}</h2>
                <p className="text-xs text-ink font-mono font-bold mt-0.5">AWB: {trackingData.trackingNumber}</p>
              </div>

              <div>
                <span className="text-[10px] text-warm-grey uppercase font-bold">Estimated Delivery Date</span>
                <p className="text-sm font-extrabold text-thread-green flex items-center gap-1.5 mt-0.5">
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
              <h3 className="font-extrabold text-ink text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-ink" /> Carrier Checkpoint Events
              </h3>

              <div className="space-y-3">
                {(trackingData.trackingTimeline || []).map((evt, idx) => (
                  <div key={idx} className="flex items-start gap-4 bg-canvas p-4 rounded-2xl border border-warm-grey-light">
                    <div className="p-2 rounded-xl bg-thread-green-light text-thread-green shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-ink text-xs">{evt.status}</h4>
                        <span className="text-[10px] text-warm-grey font-bold">
                          {new Date(evt.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-ink font-bold">{evt.location}</p>
                      <p className="text-xs text-warm-grey">{evt.description}</p>
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
