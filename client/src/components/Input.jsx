import React from 'react';

export const Input = ({
  label,
  error,
  icon: Icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider text-ink">
          {label} {required && <span className="text-print-red">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-warm-grey">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full bg-white border text-sm text-ink placeholder-warm-grey/60 rounded-xl px-4 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ink ${
            Icon ? 'pl-10' : 'pl-4'
          } ${
            error
              ? 'border-print-red focus:border-print-red focus:ring-print-red'
              : 'border-warm-grey/30 hover:border-warm-grey focus:border-ink'
          }`}
          {...props}
        />
      </div>
      {error && <p className="text-xs font-bold text-print-red">{error}</p>}
    </div>
  );
};

export default Input;
