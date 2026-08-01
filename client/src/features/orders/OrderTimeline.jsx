import React from 'react';
import { CheckCircle2, Clock, CircleDot, AlertCircle, Ban } from 'lucide-react';

const WORKFLOW_STEPS = [
  'Order Placed',
  'Payment Verified',
  'Design Approved',
  'Printing In Progress',
  'Quality Check',
  'Packed',
  'Shipment Created',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

export const OrderTimeline = ({ currentStatus, statusHistory = [] }) => {
  if (currentStatus === 'Cancelled') {
    return (
      <div className="glass-card p-6 rounded-2xl border border-rose-500/30 bg-rose-500/5 space-y-3">
        <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
          <Ban className="w-5 h-5" />
          <span>Order Cancelled</span>
        </div>
        <p className="text-xs text-slate-400">
          This order was cancelled prior to production printing. If you have questions, please contact customer support.
        </p>
      </div>
    );
  }

  const currentIndex = WORKFLOW_STEPS.indexOf(currentStatus);

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
      <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">
        Merchandise Production & Shipping Timeline
      </h3>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {WORKFLOW_STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isPending = idx > currentIndex;

          // Find history entry if available
          const historyEntry = statusHistory.find((h) => h.status === step);

          return (
            <div key={step} className="relative flex items-start gap-4 group">
              {/* Icon Marker */}
              <div
                className={`absolute -left-[27px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all z-10 ${
                  isCompleted
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : isCurrent
                    ? 'bg-sky-500 text-white ring-4 ring-sky-500/20 animate-pulse'
                    : 'bg-slate-900 text-slate-600 border border-slate-800'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isCurrent ? (
                  <CircleDot className="w-3.5 h-3.5" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                )}
              </div>

              {/* Step Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-sm font-bold transition-colors ${
                      isCompleted
                        ? 'text-slate-200'
                        : isCurrent
                        ? 'text-sky-400 font-extrabold'
                        : 'text-slate-500'
                    }`}
                  >
                    {step}
                  </h4>
                  {historyEntry && (
                    <span className="text-[10px] font-semibold text-slate-500">
                      {new Date(historyEntry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

                {isCurrent && (
                  <p className="text-xs text-sky-400/90 font-medium mt-0.5">
                    Active Stage: {historyEntry?.note || 'In Progress'}
                  </p>
                )}

                {isCompleted && historyEntry?.note && (
                  <p className="text-[11px] text-slate-400 mt-0.5">{historyEntry.note}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
