import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaChevronDown,
  FaChevronUp,
  FaDownload,
  FaReceipt,
  FaArrowRight,
} from 'react-icons/fa';

const STATUS_CONFIG = {
  PAID: {
    label: 'Paid',
    icon: FaCheckCircle,
    gradient: 'from-emerald-500 to-teal-500',
    border: 'border-emerald-200 dark:border-emerald-800/30',
    bg: 'bg-emerald-50 dark:bg-emerald-900/10',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    iconBg: 'bg-emerald-100 dark:bg-emerald-500/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    accentBar: 'from-emerald-400 to-teal-500',
  },
  UNPAID: {
    label: 'Pending',
    icon: FaClock,
    gradient: 'from-amber-500 to-orange-500',
    border: 'border-amber-200 dark:border-amber-800/30',
    bg: 'bg-amber-50 dark:bg-amber-900/10',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    iconBg: 'bg-amber-100 dark:bg-amber-500/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    accentBar: 'from-amber-400 to-orange-500',
  },
  OVERDUE: {
    label: 'Overdue',
    icon: FaExclamationTriangle,
    gradient: 'from-red-500 to-rose-500',
    border: 'border-red-200 dark:border-red-800/30',
    bg: 'bg-red-50 dark:bg-red-900/10',
    badge: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
    iconBg: 'bg-red-100 dark:bg-red-500/20',
    iconColor: 'text-red-600 dark:text-red-400',
    accentBar: 'from-red-400 to-rose-500',
  },
  PARTIAL: {
    label: 'Partial',
    icon: FaClock,
    gradient: 'from-blue-500 to-indigo-500',
    border: 'border-blue-200 dark:border-blue-800/30',
    bg: 'bg-blue-50 dark:bg-blue-900/10',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    iconBg: 'bg-blue-100 dark:bg-blue-500/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
    accentBar: 'from-blue-400 to-indigo-500',
  },
};

const FeeTimelineCard = ({ record, index, onDownloadReceipt, onPayNow }) => {
  const [expanded, setExpanded] = useState(false);
  const config = STATUS_CONFIG[record.status] || STATUS_CONFIG.UNPAID;
  const StatusIcon = config.icon;
  const isPending = record.status === 'UNPAID' || record.status === 'OVERDUE' || record.status === 'PARTIAL';

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

  const getDaysUntilDue = () => {
    if (!record.dueDate || record.status === 'PAID') return null;
    const now = new Date();
    const due = new Date(record.dueDate);
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysUntilDue = getDaysUntilDue();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative"
    >
      {/* Timeline connector */}
      {index > 0 && (
        <div className="absolute left-6 -top-4 w-0.5 h-4 bg-gradient-to-b from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800" />
      )}

      <div
        className={`relative bg-white dark:bg-gray-800 border ${config.border} rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg shadow-sm`}
      >
        {/* Top gradient accent */}
        <div className={`h-1 bg-gradient-to-r ${config.accentBar}`} />

        {/* Main content */}
        <div className="p-5">
          <div className="flex items-start justify-between">
            {/* Left: Period info */}
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0`}
              >
                <StatusIcon className={`${config.iconColor} text-lg`} />
              </div>

              <div>
                <h3 className="text-gray-900 dark:text-white font-semibold text-lg">
                  {record.periodLabel || `Period ${record.periodNumber}`}
                </h3>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.badge}`}>
                    <StatusIcon className="text-[10px]" />
                    {config.label}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 text-xs">
                    Due: {formatDate(record.dueDate)}
                  </span>
                </div>
                {daysUntilDue !== null && (
                  <p className={`text-xs mt-1.5 font-medium ${daysUntilDue < 0 ? 'text-red-500 dark:text-red-400' : daysUntilDue <= 7 ? 'text-amber-500 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'}`}>
                    {daysUntilDue < 0
                      ? `${Math.abs(daysUntilDue)} days overdue`
                      : daysUntilDue === 0
                      ? 'Due today'
                      : `${daysUntilDue} days remaining`}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Amount + Pay Button */}
            <div className="text-right flex flex-col items-end gap-2">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(record.totalAmount)}
                </p>
                {record.lateFeeAmount > 0 && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-0.5 font-medium">
                    +{formatCurrency(record.lateFeeAmount)} late fee
                  </p>
                )}
              </div>
              {isPending && onPayNow && (
                <button
                  onClick={() => onPayNow(record)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30"
                >
                  Pay Now
                  <FaArrowRight className="text-[10px]" />
                </button>
              )}
            </div>
          </div>

          {/* Actions row */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
            >
              {expanded ? <FaChevronUp /> : <FaChevronDown />}
              {expanded ? 'Hide' : 'View'} Breakdown
            </button>

            {record.status === 'PAID' && onDownloadReceipt && (
              <button
                onClick={() => onDownloadReceipt(record._id)}
                className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors font-medium"
              >
                <FaDownload />
                Download Receipt
              </button>
            )}
          </div>
        </div>

        {/* Expanded breakdown */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 space-y-2">
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                  {record.amounts?.map((a, i) => (
                    <div
                      key={i}
                      className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                    >
                      <span className="text-gray-600 dark:text-gray-400 text-sm">{a.label}</span>
                      <span className="text-gray-900 dark:text-white text-sm font-medium">
                        {formatCurrency(a.amount)}
                      </span>
                    </div>
                  ))}
                  {record.lateFeeAmount > 0 && (
                    <div className="flex justify-between py-2 border-t border-red-100 dark:border-red-500/20 mt-1">
                      <span className="text-red-500 dark:text-red-400 text-sm">Late Fee Penalty</span>
                      <span className="text-red-500 dark:text-red-400 text-sm font-medium">
                        {formatCurrency(record.lateFeeAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-t border-gray-200 dark:border-gray-600 mt-1">
                    <span className="text-gray-900 dark:text-white font-semibold text-sm">Total</span>
                    <span className="text-gray-900 dark:text-white font-bold text-sm">
                      {formatCurrency(record.totalAmount + (record.lateFeeAmount || 0))}
                    </span>
                  </div>
                </div>

                {record.status === 'PAID' && record.paymentDate && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-400/20 rounded-xl p-3 flex items-center gap-2">
                    <FaReceipt className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                      Paid on {formatDate(record.paymentDate)}
                      {record.receiptNumber && ` | Receipt: ${record.receiptNumber}`}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default FeeTimelineCard;
