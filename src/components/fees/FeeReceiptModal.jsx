import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPrint, FaDownload } from 'react-icons/fa';

const FeeReceiptModal = ({ receipt, onClose }) => {
  const printRef = useRef(null);

  if (!receipt) return null;

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
          month: 'long',
          year: 'numeric',
        })
      : '-';

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Fee Receipt - ${receipt.receiptNumber}</title>
          <style>
            body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #1a1a1a; }
            .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 20px; }
            .header h1 { font-size: 24px; color: #2563eb; margin: 0; }
            .header p { color: #666; margin: 5px 0 0; }
            .receipt-num { text-align: center; font-size: 14px; color: #666; margin-bottom: 20px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
            .info-item { font-size: 14px; }
            .info-item label { color: #666; display: block; }
            .info-item span { font-weight: 600; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 10px 12px; border: 1px solid #e5e7eb; text-align: left; font-size: 14px; }
            th { background: #f8fafc; font-weight: 600; }
            .total-row { font-weight: 700; background: #eff6ff; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Fee Receipt</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                title="Print"
              >
                <FaPrint />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Receipt content */}
          <div ref={printRef} className="p-6">
            <div className="header text-center border-b-2 border-blue-600 pb-4 mb-4">
              <h1 className="text-xl font-bold text-blue-600">KIIT University</h1>
              <p className="text-gray-500 text-sm">Fee Payment Receipt</p>
            </div>

            <p className="receipt-num text-center text-sm text-gray-500 mb-4 font-mono">
              Receipt No: <strong>{receipt.receiptNumber}</strong>
            </p>

            <div className="info-grid grid grid-cols-2 gap-3 mb-6 text-sm">
              <div className="info-item">
                <label className="text-gray-500">Student Name</label>
                <span className="font-semibold text-gray-900">{receipt.studentName}</span>
              </div>
              <div className="info-item">
                <label className="text-gray-500">Program</label>
                <span className="font-semibold text-gray-900">{receipt.programName} ({receipt.programCode})</span>
              </div>
              <div className="info-item">
                <label className="text-gray-500">Period</label>
                <span className="font-semibold text-gray-900">{receipt.periodLabel}</span>
              </div>
              <div className="info-item">
                <label className="text-gray-500">Payment Date</label>
                <span className="font-semibold text-gray-900">{formatDate(receipt.paymentDate)}</span>
              </div>
            </div>

            <table className="w-full text-sm border-collapse mb-4">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-2 px-3 border border-gray-200 font-semibold">Component</th>
                  <th className="text-right py-2 px-3 border border-gray-200 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {receipt.amounts?.map((a, i) => (
                  <tr key={i}>
                    <td className="py-2 px-3 border border-gray-200">{a.label}</td>
                    <td className="py-2 px-3 border border-gray-200 text-right">{formatCurrency(a.amount)}</td>
                  </tr>
                ))}
                <tr className="total-row bg-blue-50 font-bold">
                  <td className="py-2 px-3 border border-gray-200">Total Paid</td>
                  <td className="py-2 px-3 border border-gray-200 text-right">{formatCurrency(receipt.amountPaid)}</td>
                </tr>
              </tbody>
            </table>

            {receipt.paymentReference && (
              <p className="text-xs text-gray-500">
                Payment Reference: <strong>{receipt.paymentReference}</strong>
              </p>
            )}

            <div className="footer text-center mt-6 pt-4 border-t border-gray-200 text-xs text-gray-400">
              <p>This is a computer-generated receipt. No signature required.</p>
              <p>KIIT University | fees@kiit.ac.in</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FeeReceiptModal;
