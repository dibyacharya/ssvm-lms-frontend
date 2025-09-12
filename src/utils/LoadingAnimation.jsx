import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative">
        {/* Outer spinning circle */}
        <div className="w-16 h-16 rounded-full border-4 border-accent1/20 border-t-accent1 animate-spin"></div>

        {/* Inner pulsing circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 bg-accent1 rounded-full animate-pulse opacity-50"></div>
        </div>
      </div>
      <span className="ml-4 text-lg font-medium text-accent1">
        Loading...
      </span>
    </div>
  );
};

export default LoadingSpinner;
