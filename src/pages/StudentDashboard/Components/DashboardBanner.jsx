import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, BookOpen, ClipboardList, User } from "lucide-react";

const DashboardBanner = ({ icon: Icon, title, subtitle, gradient, rightContent }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const quickActions = [
    { label: "Courses", icon: BookOpen },
    { label: "Schedule", icon: Calendar },
    { label: "Tasks", icon: ClipboardList },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-gray-200 shadow-card"
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600 opacity-30 pointer-events-none" />

      {/* Animated floating gradient orbs */}
      <motion.div
        className="absolute -top-20 -right-20 w-60 h-60 bg-primary-100 rounded-full blur-3xl"
        animate={{
          x: [0, 20, 0],
          y: [0, -15, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-16 left-20 w-48 h-48 bg-accent-50 rounded-full blur-3xl"
        animate={{
          x: [0, -15, 0],
          y: [0, 10, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-10 left-[45%] w-32 h-32 bg-primary-400/10 rounded-full blur-2xl"
        animate={{
          x: [0, 10, 0],
          y: [0, -10, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 px-8 py-8">
        <div className="flex items-center justify-between">
          {/* Left: Avatar + Welcome */}
          <div className="flex items-center gap-5">
            {/* Student Avatar with glow border */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600/30 to-accent-500/20 backdrop-blur-sm flex items-center justify-center shadow-lg ring-2 ring-primary-500/30 ring-offset-2 ring-offset-surface-800/60">
                {Icon ? (
                  <Icon className="w-8 h-8 text-primary-600" />
                ) : (
                  <User className="w-8 h-8 text-primary-600" />
                )}
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-primary-100 blur-md -z-10" />
            </motion.div>

            <div>
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-primary-400 to-accent-500 bg-clip-text text-transparent"
              >
                Welcome back, {title}
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex items-center gap-3 mt-1.5"
              >
                {subtitle && (
                  <p className="text-gray-500 text-sm font-medium">{subtitle}</p>
                )}
                <span className="text-gray-500">|</span>
                <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formattedDate}</span>
                  <span className="text-gray-500 mx-1">-</span>
                  <span className="text-primary-600 font-medium">{formattedTime}</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right: Stats or Quick Actions */}
          <div className="hidden md:flex items-center gap-3">
            {rightContent ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {rightContent}
              </motion.div>
            ) : (
              quickActions.map((action, i) => {
                const ActionIcon = action.icon;
                return (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] backdrop-blur-sm border border-gray-200 text-gray-600 text-sm font-medium hover:bg-white/[0.1] hover:border-primary-500/20 hover:text-gray-900 transition-all duration-300"
                  >
                    <ActionIcon className="w-4 h-4" />
                    {action.label}
                  </motion.button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardBanner;
