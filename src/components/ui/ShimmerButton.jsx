import React from 'react';

const ShimmerButton = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  ...props
}) => {
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
    xl: 'px-8 py-3.5 text-lg',
  };

  const variants = {
    primary: `
      bg-gradient-to-r from-primary-600 to-primary-500
      text-white font-semibold
      shadow-[0_4px_15px_-3px_rgba(79,70,229,0.4)]
      hover:shadow-[0_8px_25px_-5px_rgba(79,70,229,0.5)]
      hover:from-primary-500 hover:to-primary-500
    `,
    accent: `
      bg-gradient-to-r from-accent-600 to-accent-500
      text-white font-semibold
      shadow-[0_4px_15px_-3px_rgba(249,115,22,0.4)]
      hover:shadow-[0_8px_25px_-5px_rgba(249,115,22,0.5)]
      hover:from-accent-500 hover:to-accent-400
    `,
    gradient: `
      bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500
      bg-[length:200%_100%] animate-gradient-shift
      text-white font-semibold
    `,
    ghost: `
      bg-transparent text-gray-600
      border border-gray-200
      hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-red-500
      text-white font-semibold
      shadow-[0_4px_15px_-3px_rgba(239,68,68,0.4)]
      hover:shadow-[0_8px_25px_-5px_rgba(239,68,68,0.5)]
    `,
    success: `
      bg-gradient-to-r from-emerald-600 to-emerald-500
      text-white font-semibold
      shadow-[0_4px_15px_-3px_rgba(16,185,129,0.4)]
    `,
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        relative overflow-hidden inline-flex items-center justify-center gap-2
        rounded-xl transition-all duration-300
        hover:translate-y-[-1px] active:translate-y-0
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
        ${sizes[size]}
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {/* Shimmer sweep effect */}
      <span className="absolute inset-0 overflow-hidden rounded-xl">
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent group-hover:translate-x-full transition-transform duration-700 hover:translate-x-full" />
      </span>

      {/* Content */}
      <span className="relative flex items-center gap-2">
        {loading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : Icon && iconPosition === 'left' ? (
          <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
        ) : null}
        {children}
        {Icon && iconPosition === 'right' && !loading && (
          <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
        )}
      </span>
    </button>
  );
};

export default ShimmerButton;
