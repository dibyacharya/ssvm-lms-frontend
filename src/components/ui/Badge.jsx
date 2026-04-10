import React from 'react';

const Badge = ({
  children,
  variant = 'default',
  size = 'sm',
  pulse = false,
  dot = false,
  className = '',
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-600 border-gray-100',
    primary: 'bg-primary-50 text-primary-600 border-primary-500/20',
    accent: 'bg-accent-50 text-accent-600 border-accent-500/20',
    success: 'bg-emerald-50 text-emerald-600 border-emerald-500/20',
    warning: 'bg-amber-50 text-amber-600 border-amber-500/20',
    danger: 'bg-red-50 text-red-600 border-red-500/20',
    info: 'bg-cyan-50 text-cyan-600 border-cyan-500/20',
  };

  const dotColors = {
    default: 'bg-gray-400',
    primary: 'bg-primary-400 shadow-[0_0_6px_rgba(99,102,241,0.5)]',
    accent: 'bg-accent-400 shadow-[0_0_6px_rgba(249,115,22,0.5)]',
    success: 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]',
    warning: 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]',
    danger: 'bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.5)]',
    info: 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.5)]',
  };

  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span className={`
      inline-flex items-center gap-1.5 font-medium
      rounded-full border
      ${variants[variant]}
      ${sizes[size]}
      ${pulse ? 'badge-pulse' : ''}
      ${className}
    `}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} ${pulse ? 'animate-pulse' : ''}`} />
      )}
      {children}
    </span>
  );
};

/* ── Notification Count Badge ── */
export const CountBadge = ({ count, className = '' }) => {
  if (!count || count <= 0) return null;
  return (
    <span className={`
      absolute -top-1 -right-1
      min-w-[18px] h-[18px]
      flex items-center justify-center
      bg-red-500 text-white text-[10px] font-bold
      rounded-full px-1
      shadow-[0_0_8px_rgba(239,68,68,0.5)]
      animate-scale-in
      ${className}
    `}>
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default Badge;
