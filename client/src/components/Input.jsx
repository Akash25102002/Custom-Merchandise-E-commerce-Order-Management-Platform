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
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-slate-400">
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
          className={`w-full bg-slate-900/80 border text-sm text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50 ${
            Icon ? 'pl-10' : 'pl-4'
          } ${
            error
              ? 'border-rose-500/80 focus:border-rose-500'
              : 'border-slate-800 hover:border-slate-700 focus:border-sky-500'
          }`}
          {...props}
        />
      </div>
      {error && <p className="text-xs font-medium text-rose-400">{error}</p>}
    </div>
  );
};

export default Input;
