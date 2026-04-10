import React from 'react';

/* ── Spinner Loader ── */
export const Spinner = ({ size = 'md', color = 'primary', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12', xl: 'w-16 h-16' };
  const colors = {
    primary: 'border-primary-500',
    accent: 'border-accent-500',
    white: 'border-white',
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <div className={`
        w-full h-full rounded-full
        border-2 border-gray-200 ${colors[color]}
        border-t-transparent
        animate-spin
      `} />
    </div>
  );
};

/* ── Orbital Loader (uiverse.io inspired) ── */
export const OrbitalLoader = ({ className = '' }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500 animate-spin" />
      <div className="absolute inset-1 rounded-full border-2 border-transparent border-t-accent-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
      <div className="absolute inset-2.5 rounded-full border-2 border-transparent border-t-primary-600 animate-spin" style={{ animationDuration: '1.5s' }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse" />
      </div>
    </div>
  </div>
);

/* ── Skeleton Loader ── */
export const Skeleton = ({ width, height = 'h-4', rounded = 'rounded-lg', className = '' }) => (
  <div
    className={`
      ${height} ${rounded} ${width || 'w-full'}
      bg-gray-100
      animate-pulse
      ${className}
    `}
  />
);

/* ── Skeleton Card ── */
export const SkeletonCard = ({ className = '' }) => (
  <div className={`glass-card-static p-6 space-y-4 ${className}`}>
    <div className="flex items-center justify-between">
      <Skeleton width="w-24" height="h-3" />
      <Skeleton width="w-12" height="h-12" rounded="rounded-xl" />
    </div>
    <Skeleton width="w-32" height="h-7" />
    <Skeleton width="w-20" height="h-3" />
  </div>
);

/* ── Page Loader ── */
export const PageLoader = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <OrbitalLoader />
    <p className="text-gray-500 text-sm animate-pulse">{message}</p>
  </div>
);

/* ── Default export ── */
const Loader = { Spinner, OrbitalLoader, Skeleton, SkeletonCard, PageLoader };
export default Loader;
