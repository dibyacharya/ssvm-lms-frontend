import React from 'react';

const ToggleSwitch = ({
  checked,
  onChange,
  label,
  size = 'md',
  disabled = false,
  color = 'primary',
  className = '',
}) => {
  const sizes = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4', offset: 'translate-x-0.5' },
    md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5', offset: 'translate-x-0.5' },
    lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'translate-x-7', offset: 'translate-x-0.5' },
  };

  const colors = {
    primary: {
      active: 'bg-gradient-to-r from-primary-600 to-primary-500 shadow-[0_0_12px_rgba(99,102,241,0.4)]',
      thumb: 'bg-white shadow-lg',
    },
    accent: {
      active: 'bg-gradient-to-r from-accent-600 to-accent-500 shadow-[0_0_12px_rgba(249,115,22,0.4)]',
      thumb: 'bg-white shadow-lg',
    },
    success: {
      active: 'bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]',
      thumb: 'bg-white shadow-lg',
    },
  };

  const s = sizes[size];
  const c = colors[color] || colors.primary;

  return (
    <label className={`inline-flex items-center gap-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
        />
        {/* Track */}
        <div className={`
          ${s.track} rounded-full
          transition-all duration-300 ease-out
          ${checked ? c.active : 'bg-gray-200 border border-gray-200'}
        `} />
        {/* Thumb */}
        <div className={`
          absolute top-1/2 -translate-y-1/2
          ${s.thumb} rounded-full
          ${c.thumb}
          transition-all duration-300 ease-out
          ${checked ? s.translate : s.offset}
        `}>
          {/* Inner glow when active */}
          {checked && (
            <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" style={{ animationDuration: '2s' }} />
          )}
        </div>
      </div>
      {label && (
        <span className="text-sm font-medium text-gray-600">{label}</span>
      )}
    </label>
  );
};

export default ToggleSwitch;
