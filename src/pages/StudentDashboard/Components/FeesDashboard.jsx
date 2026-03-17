import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaRupeeSign,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaGraduationCap,
  FaInfoCircle,
  FaUniversity,
  FaCopy,
  FaCheck,
  FaTimes,
  FaQrcode,
} from 'react-icons/fa';
import { getMyFees, getReceipt } from '../../../services/fee.service';
import FeeProgressRing from '../../../components/fees/FeeProgressRing';
import FeeTimelineCard from '../../../components/fees/FeeTimelineCard';
import FeeReceiptModal from '../../../components/fees/FeeReceiptModal';

const STAT_CARDS = [
  {
    key: 'totalFees',
    label: 'TOTAL FEES',
    icon: FaRupeeSign,
    gradient: 'from-blue-500 to-indigo-600',
    lightBorder: 'border-blue-100',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    valueColor: 'text-blue-700',
  },
  {
    key: 'totalPaid',
    label: 'TOTAL PAID',
    icon: FaCheckCircle,
    gradient: 'from-emerald-500 to-teal-600',
    lightBorder: 'border-emerald-100',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    valueColor: 'text-emerald-700',
  },
  {
    key: 'totalPending',
    label: 'PENDING',
    icon: FaClock,
    gradient: 'from-amber-500 to-orange-600',
    lightBorder: 'border-amber-100',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    valueColor: 'text-amber-700',
  },
  {
    key: 'totalOverdue',
    label: 'OVERDUE',
    icon: FaExclamationTriangle,
    gradient: 'from-red-500 to-rose-600',
    lightBorder: 'border-red-100',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    valueColor: 'text-red-700',
  },
];

// Payment info modal component
const PaymentModal = ({ record, onClose, formatCurrency }) => {
  const [copied, setCopied] = useState('');

  const paymentDetails = {
    bankName: 'State Bank of India',
    accountName: 'KIIT Extension School',
    accountNumber: '39876543210',
    ifscCode: 'SBIN0001234',
    upiId: 'kiitfees@sbi',
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(''), 2000);
  };

  const totalDue = (record.totalAmount || 0) + (record.lateFeeAmount || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white"
          >
            <FaTimes />
          </button>
          <h3 className="text-lg font-bold">Pay {record.periodLabel}</h3>
          <p className="text-white/70 text-sm mt-1">Complete payment using the details below</p>
          <div className="mt-3 bg-white/20 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between">
            <span className="text-sm text-white/80">Amount Due</span>
            <span className="text-xl font-bold">{formatCurrency(totalDue)}</span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* UPI Section */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <FaQrcode className="text-purple-600" />
              <h4 className="font-semibold text-purple-800 dark:text-purple-300 text-sm">Pay via UPI</h4>
            </div>
            <div className="flex items-center justify-between bg-white dark:bg-gray-700 rounded-lg px-3 py-2">
              <span className="text-sm font-mono text-gray-800 dark:text-gray-200">{paymentDetails.upiId}</span>
              <button
                onClick={() => handleCopy(paymentDetails.upiId, 'upi')}
                className="text-purple-600 hover:text-purple-700 ml-2"
              >
                {copied === 'upi' ? <FaCheck className="text-emerald-500" /> : <FaCopy />}
              </button>
            </div>
          </div>

          {/* Bank Transfer Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <FaUniversity className="text-blue-600" />
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm">Bank Transfer (NEFT/RTGS)</h4>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Bank', value: paymentDetails.bankName, key: 'bank' },
                { label: 'A/C Name', value: paymentDetails.accountName, key: 'name' },
                { label: 'A/C Number', value: paymentDetails.accountNumber, key: 'acc' },
                { label: 'IFSC Code', value: paymentDetails.ifscCode, key: 'ifsc' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between bg-white dark:bg-gray-700 rounded-lg px-3 py-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400">{item.label}</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.value}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(item.value, item.key)}
                    className="text-blue-600 hover:text-blue-700 ml-2"
                  >
                    {copied === item.key ? <FaCheck className="text-emerald-500" /> : <FaCopy className="text-xs" />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3">
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              <strong>Important:</strong> After payment, share the transaction ID / screenshot with the accounts department.
              Your payment will be verified and marked as paid within 24-48 hours.
            </p>
          </div>

          {/* Contact */}
          <div className="text-center text-xs text-gray-400 pt-2">
            For queries: <span className="text-indigo-600 dark:text-indigo-400 font-medium">accounts@kiit.ac.in</span> |
            <span className="text-indigo-600 dark:text-indigo-400 font-medium"> +91 674-2725-113</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Fee Progress Pipe component
const FeeProgressPipe = ({ summary, formatCurrency }) => {
  const total = summary?.totalFees || 1;
  const paid = summary?.totalPaid || 0;
  const overdue = summary?.totalOverdue || 0;
  const pending = Math.max(0, total - paid - overdue);

  const paidPct = (paid / total) * 100;
  const overduePct = (overdue / total) * 100;
  const pendingPct = (pending / total) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm"
    >
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Fee Payment Progress</h3>

      {/* The pipe / stacked bar */}
      <div className="relative h-8 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden flex">
        {paidPct > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${paidPct}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
            className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full relative group"
          >
            {paidPct > 12 && (
              <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                {Math.round(paidPct)}% Paid
              </span>
            )}
          </motion.div>
        )}
        {pendingPct > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pendingPct}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.8 }}
            className="bg-gradient-to-r from-amber-300 to-amber-400 h-full relative"
          >
            {pendingPct > 12 && (
              <span className="absolute inset-0 flex items-center justify-center text-amber-900 text-xs font-bold">
                {Math.round(pendingPct)}% Pending
              </span>
            )}
          </motion.div>
        )}
        {overduePct > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overduePct}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 1.1 }}
            className="bg-gradient-to-r from-red-400 to-red-500 h-full relative"
          >
            {overduePct > 12 && (
              <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                {Math.round(overduePct)}% Overdue
              </span>
            )}
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Paid</span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(paid)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Pending</span>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{formatCurrency(pending)}</span>
          </div>
          {overdue > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Overdue</span>
              <span className="text-xs font-bold text-red-700 dark:text-red-400">{formatCurrency(overdue)}</span>
            </div>
          )}
        </div>
        <span className="text-xs text-gray-500">
          Total: <span className="font-bold text-gray-800 dark:text-gray-200">{formatCurrency(total)}</span>
        </span>
      </div>
    </motion.div>
  );
};

const FeesDashboard = () => {
  const [feesData, setFeesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [payingRecord, setPayingRecord] = useState(null);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        setLoading(true);
        const data = await getMyFees();
        setFeesData(data);
      } catch (err) {
        setError('Failed to load fee information');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  const handleDownloadReceipt = async (recordId) => {
    try {
      const data = await getReceipt(recordId);
      setReceipt(data.receipt);
    } catch (err) {
      console.error('Failed to fetch receipt:', err);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading fee information...</p>
        </div>
      </div>
    );
  }

  if (error || !feesData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-sm">
          <FaExclamationTriangle className="text-amber-500 text-3xl mx-auto" />
          <p className="text-gray-600 dark:text-gray-300 text-sm">{error || 'No fee information available'}</p>
          {!feesData?.records?.length && (
            <p className="text-gray-400 dark:text-gray-500 text-xs">Your fee structure has not been set up yet.</p>
          )}
        </div>
      </div>
    );
  }

  const { program, summary, records } = feesData;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl p-6 shadow-lg shadow-indigo-500/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-20 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />

          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <FaRupeeSign className="text-white text-lg" />
                </div>
                Fees & Payments
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <FaGraduationCap className="text-white/70 text-sm" />
                <span className="text-white/70 text-sm">
                  {program?.name} ({program?.code})
                </span>
              </div>
            </div>

            {summary?.totalCount > 0 && (
              <div className="bg-white rounded-2xl p-2 shadow-md">
                <FeeProgressRing
                  paid={summary?.paidCount || 0}
                  total={summary?.totalCount}
                  size={100}
                  strokeWidth={8}
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map((card, idx) => {
            const Icon = card.icon;
            const value = summary?.[card.key] || 0;
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`relative overflow-hidden bg-white dark:bg-gray-800 border ${card.lightBorder} dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300`}
              >
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${card.gradient} opacity-[0.06] rounded-bl-full`} />
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center mb-3`}>
                    <Icon className={`${card.iconColor} text-lg`} />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">{card.label}</p>
                  <p className={`text-xl font-bold ${card.valueColor} dark:text-white mt-1`}>{formatCurrency(value)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Fee Progress Pipe */}
        {summary?.totalFees > 0 && (
          <FeeProgressPipe summary={summary} formatCurrency={formatCurrency} />
        )}

        {/* Late Fee Banner */}
        {summary?.totalLateFees > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-2xl p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <FaExclamationTriangle className="text-red-500 dark:text-red-400" />
            </div>
            <div>
              <p className="text-red-700 dark:text-red-300 font-medium text-sm">
                Late Fee Accumulated: {formatCurrency(summary.totalLateFees)}
              </p>
              <p className="text-red-500/70 dark:text-red-400/60 text-xs mt-0.5">
                Please clear your dues to avoid further penalties
              </p>
            </div>
          </motion.div>
        )}

        {/* Fee Timeline */}
        <div className="space-y-3">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2"
          >
            <span className="w-1 h-5 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
            Payment Timeline
          </motion.h2>

          <div className="space-y-4">
            {records?.length > 0 ? (
              records.map((record, idx) => (
                <FeeTimelineCard
                  key={record._id}
                  record={record}
                  index={idx}
                  onDownloadReceipt={handleDownloadReceipt}
                  onPayNow={(rec) => setPayingRecord(rec)}
                />
              ))
            ) : (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center shadow-sm">
                <p className="text-gray-500 dark:text-gray-400 text-sm">No fee records available yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Fee Structure Info */}
        {feesData.feeStructure && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
              <FaInfoCircle className="text-indigo-400" />
              Fee Structure Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-gray-400 dark:text-gray-500">Structure</span>
                <p className="text-gray-800 dark:text-gray-200 font-medium mt-0.5">{feesData.feeStructure.name}</p>
              </div>
              <div>
                <span className="text-gray-400 dark:text-gray-500">Late Fee Rate</span>
                <p className="text-gray-800 dark:text-gray-200 font-medium mt-0.5">
                  {feesData.feeStructure.lateFeeConfig?.enabled
                    ? `${feesData.feeStructure.lateFeeConfig.ratePerMonth}% / month`
                    : 'Not applicable'}
                </p>
              </div>
              <div>
                <span className="text-gray-400 dark:text-gray-500">Grace Period</span>
                <p className="text-gray-800 dark:text-gray-200 font-medium mt-0.5">
                  {feesData.feeStructure.lateFeeConfig?.gracePeriodDays || 0} days
                </p>
              </div>
              <div>
                <span className="text-gray-400 dark:text-gray-500">Components</span>
                <p className="text-gray-800 dark:text-gray-200 font-medium mt-0.5">
                  {feesData.feeStructure.feeComponents?.map((c) => c.label).join(', ') || '-'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Receipt Modal */}
      {receipt && (
        <FeeReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />
      )}

      {/* Payment Modal */}
      <AnimatePresence>
        {payingRecord && (
          <PaymentModal
            record={payingRecord}
            onClose={() => setPayingRecord(null)}
            formatCurrency={formatCurrency}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeesDashboard;
