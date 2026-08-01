import React from 'react';
import { CheckCircle2, CircleDot, Ban } from 'lucide-react';

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
      <div className="p-6 rounded-2xl border border-print-red/30 bg-print-red-light space-y-3">
        <div className="flex items-center gap-2 text-print-red font-extrabold text-base">
          <Ban className="w-5 h-5" />
          <span>Order Cancelled</span>
        </div>
        <p className="text-xs text-warm-grey-dark">
          This order was cancelled prior to production printing. If you have questions, please contact customer support.
        </p>
      </div>
    );
  }

  const currentIndex = WORKFLOW_STEPS.indexOf(currentStatus);

  return (
    <div className="bg-white p-6 rounded-3xl border border-warm-grey-light space-y-6">
      <h3 className="font-extrabold text-ink text-base border-b border-warm-grey-light pb-3">
        Merchandise Production & Shipping Timeline
      </h3>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-warm-grey-light">
        {WORKFLOW_STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          // Find history entry if available
          const historyEntry = statusHistory.find((h) => h.status === step);

          return (
            <div key={step} className="relative flex items-start gap-4 group">
              {/* Icon Marker */}
              <div
                className={`absolute -left-[27px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all z-10 ${
                  isCompleted
                    ? 'bg-thread-green text-white shadow-md'
                    : isCurrent
                    ? 'bg-gold text-white ring-4 ring-gold/20 animate-pulse'
                    : 'bg-warm-grey-subtle text-warm-grey border border-warm-grey-light'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : isCurrent ? (
                  <CircleDot className="w-3.5 h-3.5 text-white" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-warm-grey/50"></div>
                )}
              </div>

              {/* Step Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-sm font-bold transition-colors ${
                      isCompleted
                        ? 'text-thread-green'
                        : isCurrent
                        ? 'text-gold-hover font-extrabold'
                        : 'text-warm-grey'
                    }`}
                  >
                    {step}
                  </h4>
                  {historyEntry && (
                    <span className="text-[10px] font-semibold text-warm-grey">
                      {new Date(historyEntry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

                {isCurrent && (
                  <p className="text-xs text-gold font-bold mt-0.5">
                    Active Stage: {historyEntry?.note || 'In Progress'}
                  </p>
                )}

                {isCompleted && historyEntry?.note && (
                  <p className="text-[11px] text-warm-grey mt-0.5">{historyEntry.note}</p>
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
