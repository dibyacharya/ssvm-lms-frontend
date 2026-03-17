import React from 'react';
import { motion } from 'framer-motion';
import { FaLock, FaExclamationTriangle, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

const FeeLockScreen = ({ lockedPeriods = [] }) => {
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '-';

  const totalDue = lockedPeriods.reduce(
    (sum, p) => sum + (p.totalAmount || 0) + (p.lateFeeAmount || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-auto">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />

      {/* Animated orbs */}
      <motion.div
        className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg mx-4"
      >
        {/* Glassmorphism card */}
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-red-500 via-amber-500 to-red-500" />

          <div className="p-8 space-y-6">
            {/* Lock icon */}
            <div className="flex justify-center">
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="relative"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                  <FaLock className="text-white text-3xl" />
                </div>
                <motion.div
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <FaExclamationTriangle className="text-white text-xs" />
                </motion.div>
              </motion.div>
            </div>

            {/* Title */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-white">LMS Access Restricted</h1>
              <p className="text-white/60 text-sm leading-relaxed">
                Your access to the Learning Management System has been temporarily restricted
                due to outstanding fee payments.
              </p>
            </div>

            {/* Amount due */}
            <motion.div
              className="bg-white/5 border border-white/10 rounded-2xl p-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Total Amount Due</p>
              <motion.p
                className="text-3xl font-bold bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {formatCurrency(totalDue)}
              </motion.p>
            </motion.div>

            {/* Overdue periods */}
            <div className="space-y-2">
              <p className="text-white/50 text-xs uppercase tracking-wider">Overdue Periods</p>
              {lockedPeriods.map((period, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                >
                  <div>
                    <p className="text-white text-sm font-medium">{period.periodLabel || `Period ${period.periodNumber}`}</p>
                    <p className="text-white/40 text-xs">Due: {formatDate(period.dueDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 text-sm font-semibold">{formatCurrency(period.totalAmount)}</p>
                    {period.lateFeeAmount > 0 && (
                      <p className="text-amber-400/80 text-xs">+{formatCurrency(period.lateFeeAmount)} late fee</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Contact info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-400/20 rounded-xl p-4 space-y-3"
            >
              <p className="text-white/70 text-sm font-medium">Contact Administration</p>
              <p className="text-white/50 text-xs leading-relaxed">
                Please clear your outstanding dues to regain access.
                Contact the fee office for payment assistance.
              </p>
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-indigo-300">
                  <FaEnvelope className="text-xs" />
                  fees@kiit.ac.in
                </span>
                <span className="flex items-center gap-1.5 text-indigo-300">
                  <FaPhoneAlt className="text-xs" />
                  +91-XXXXXXXXXX
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FeeLockScreen;
