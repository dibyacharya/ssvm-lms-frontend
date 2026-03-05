import React from "react";

const DashboardBanner = ({ icon: Icon, title, subtitle, gradient, rightContent }) => (
  <div className={`relative overflow-hidden rounded-2xl ${gradient} px-8 py-8 shadow-lg`}>
    {/* Decorative circles */}
    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
    <div className="absolute -bottom-8 right-20 w-24 h-24 bg-white/5 rounded-full" />
    <div className="absolute top-4 left-[40%] w-16 h-16 bg-white/5 rounded-full" />
    <div className="absolute -bottom-6 left-[20%] w-20 h-20 bg-white/5 rounded-full" />

    <div className="relative z-10 flex items-center justify-between">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-white/80 text-sm font-medium mt-1.5">{subtitle}</p>
          )}
        </div>
      </div>
      {rightContent && (
        <div className="hidden md:block">{rightContent}</div>
      )}
    </div>
  </div>
);

export default DashboardBanner;
