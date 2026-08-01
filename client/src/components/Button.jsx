import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
  icon: Icon,
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-canvas disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  const variants = {
    primary:
      'bg-print-red hover:bg-print-red-hover text-white shadow-md shadow-print-red/20 focus:ring-print-red',
    secondary:
      'bg-ink hover:bg-black text-canvas border border-ink focus:ring-ink',
    outline:
      'border border-warm-grey/40 text-ink hover:border-ink hover:bg-warm-grey-subtle focus:ring-ink',
    danger:
      'bg-print-red hover:bg-print-red-hover text-white focus:ring-print-red',
    ghost:
      'text-warm-grey hover:text-ink hover:bg-warm-grey-subtle focus:ring-ink',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs font-semibold gap-1.5',
    md: 'px-5 py-2.5 text-sm font-bold gap-2',
    lg: 'px-7 py-3.5 text-base font-extrabold gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;
