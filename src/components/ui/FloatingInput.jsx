import React, { useState, useRef } from 'react';

const FloatingInput = ({
  label,
  type = 'text',
  value,
  onChange,
  name,
  icon: Icon,
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const hasValue = value && value.length > 0;
  const isActive = focused || hasValue;

  return (
    <div className={`relative group ${className}`}>
      {/* Glow effect on focus */}
      <div className={`
        absolute -inset-0.5 rounded-xl opacity-0 blur-sm transition-opacity duration-300
        bg-gradient-to-r from-primary-500/20 to-accent-500/20
        ${focused ? 'opacity-100' : 'group-hover:opacity-50'}
      `} />

      <div className="relative">
        {Icon && (
          <div className={`
            absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10
            ${focused ? 'text-primary-600' : 'text-gray-400'}
          `}>
            <Icon size={18} />
          </div>
        )}

        <input
          ref={inputRef}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`
            peer w-full bg-white/80 backdrop-blur-sm
            border border-gray-200 rounded-xl
            text-gray-900 placeholder-transparent
            transition-all duration-300
            ${Icon ? 'pl-12 pr-4' : 'px-4'}
            pt-5 pb-2
            focus:outline-none focus:border-primary-500/50
            focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15),0_0_20px_-5px_rgba(99,102,241,0.3)]
            focus:bg-white
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500/50 focus:border-red-500/50 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]' : ''}
          `}
          placeholder={label}
          {...props}
        />

        {/* Floating label */}
        <label
          onClick={() => inputRef.current?.focus()}
          className={`
            absolute transition-all duration-300 pointer-events-none
            ${Icon ? 'left-12' : 'left-4'}
            ${isActive
              ? 'top-1.5 text-[10px] font-medium'
              : 'top-1/2 -translate-y-1/2 text-sm'
            }
            ${focused ? 'text-primary-600' : 'text-gray-400'}
            ${error ? 'text-red-600' : ''}
          `}
        >
          {label}{required && <span className="text-accent-500 ml-0.5">*</span>}
        </label>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1 animate-fade-in-down">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default FloatingInput;
