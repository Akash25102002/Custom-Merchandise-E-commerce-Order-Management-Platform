import React from 'react';

export const Badge = ({ children, variant = 'neutral', className = '' }) => {
  const variants = {
    neutral: 'bg-warm-grey-subtle text-ink border-warm-grey/30',
    success: 'bg-thread-green-light text-thread-green border-thread-green/30 font-bold',
    warning: 'bg-gold-light text-gold-hover border-gold/40 font-bold',
    danger: 'bg-print-red-light text-print-red border-print-red/30 font-bold',
    info: 'bg-warm-grey-subtle text-ink border-warm-grey/30',
    gold: 'bg-gold-light text-gold-hover border-gold/40 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${variants[variant] || variants.neutral} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
