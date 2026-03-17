import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaArrowLeft,
  FaRedoAlt,
  FaReceipt,
} from 'react-icons/fa';
import { getPaymentStatus } from '../services/fee.service';

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef(null);
  const pollCountRef = useRef(0);

  const urlStatus = searchParams.get('status');
  const recordId = searchParams.get('recordId');
  const message = searchParams.get('message');

  useEffect(() => {
    const fetchStatus = async () => {
      if (!recordId) {
        setLoading(false);
        return;
      }

      try {
        const data = await getPaymentStatus(recordId);
        setStatusData(data);

        // If still INITIATED, poll every 3s for up to 30s
        if (data.gatewayStatus === 'INITIATED' && pollCountRef.current < 10) {
          pollRef.current = setTimeout(() => {
            pollCountRef.current += 1;
            fetchStatus();
          }, 3000);
        }
      } catch (err) {
        console.error('Failed to fetch payment status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();

    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [recordId]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const isSuccess =
    urlStatus === 'success' ||
    statusData?.gatewayStatus === 'SUCCESS' ||
    statusData?.status === 'PAID';

  const isAborted = urlStatus === 'aborted' || statusData?.gatewayStatus === 'ABORTED';
  const isFailure =
    urlStatus === 'failure' ||
    urlStatus === 'error' ||
    statusData?.gatewayStatus === 'FAILURE' ||
    statusData?.gatewayStatus === 'INVALID';

  const isPending =
    !isSuccess && !isAborted && !isFailure && statusData?.gatewayStatus === 'INITIATED';

  const getStatusConfig = () => {
    if (isSuccess)
      return {
        icon: FaCheckCircle,
        title: 'Payment Successful!',
        subtitle: 'Your payment has been received and verified.',
        gradient: 'from-emerald-500 to-teal-600',
        iconColor: 'text-emerald-500',
        bgAccent: 'bg-emerald-50 dark:bg-emerald-900/20',
        borderAccent: 'border-emerald-200 dark:border-emerald-700',
      };
    if (isAborted)
      return {
        icon: FaExclamationTriangle,
        title: 'Payment Cancelled',
        subtitle: 'You cancelled the payment. No amount has been deducted.',
        gradient: 'from-amber-500 to-orange-600',
        iconColor: 'text-amber-500',
        bgAccent: 'bg-amber-50 dark:bg-amber-900/20',
        borderAccent: 'border-amber-200 dark:border-amber-700',
      };
    if (isFailure)
      return {
        icon: FaTimesCircle,
        title: 'Payment Failed',
        subtitle: message ? decodeURIComponent(message) : 'Your payment could not be processed.',
        gradient: 'from-red-500 to-rose-600',
        iconColor: 'text-red-500',
        bgAccent: 'bg-red-50 dark:bg-red-900/20',
        borderAccent: 'border-red-200 dark:border-red-700',
      };
    // Pending / processing
    return {
      icon: FaSpinner,
      title: 'Processing Payment...',
      subtitle: 'Please wait while we verify your payment.',
      gradient: 'from-blue-500 to-indigo-600',
      iconColor: 'text-blue-500',
      bgAccent: 'bg-blue-50 dark:bg-blue-900/20',
      borderAccent: 'border-blue-200 dark:border-blue-700',
    };
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  if (loading && !statusData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <FaSpinner className="animate-spin text-4xl text-indigo-500 mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Verifying payment status...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        {/* Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Top gradient bar */}
          <div className={`h-2 bg-gradient-to-r ${config.gradient}`} />

          {/* Icon + Title */}
          <div className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <StatusIcon
                className={`${config.iconColor} text-6xl mx-auto mb-4 ${
                  isPending ? 'animate-spin' : ''
                }`}
              />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {config.title}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              {config.subtitle}
            </p>
          </div>

          {/* Details */}
          {statusData && (
            <div className={`mx-6 mb-6 ${config.bgAccent} ${config.borderAccent} border rounded-xl p-4 space-y-3`}>
              {statusData.periodLabel && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Period</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {statusData.periodLabel}
                  </span>
                </div>
              )}
              {isSuccess && statusData.amountPaid > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Amount Paid</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(statusData.amountPaid)}
                  </span>
                </div>
              )}
              {statusData.transactionId && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Transaction ID</span>
                  <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                    {statusData.transactionId}
                  </span>
                </div>
              )}
              {statusData.receiptNumber && isSuccess && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Receipt No.</span>
                  <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                    {statusData.receiptNumber}
                  </span>
                </div>
              )}
              {statusData.paymentDate && isSuccess && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Date</span>
                  <span className="text-gray-700 dark:text-gray-300 text-xs">
                    {new Date(statusData.paymentDate).toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="p-6 pt-0 space-y-3">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
            >
              <FaArrowLeft />
              Back to Fees Dashboard
            </button>

            {(isFailure || isAborted) && (
              <button
                onClick={() => navigate('/student/dashboard')}
                className="w-full py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
              >
                <FaRedoAlt />
                Try Again
              </button>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
          For payment queries, contact{' '}
          <span className="text-indigo-500">accounts@kiit.ac.in</span>
        </p>
      </motion.div>
    </div>
  );
};

export default PaymentStatus;
