import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ fullScreen = false, text = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-canvas/90 backdrop-blur-sm gap-3">
        <Loader2 className="w-10 h-10 text-print-red animate-spin" />
        <p className="text-sm font-bold text-ink tracking-wide">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <Loader2 className="w-8 h-8 text-print-red animate-spin" />
      <p className="text-xs font-semibold text-warm-grey">{text}</p>
    </div>
  );
};

export default Loader;
