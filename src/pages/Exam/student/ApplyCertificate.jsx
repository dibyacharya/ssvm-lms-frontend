import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFileAlt, FaSpinner, FaArrowLeft, FaMoneyBillWave,
  FaCheckCircle, FaTimesCircle, FaClock, FaPaperPlane,
  FaRupeeSign, FaDollarSign, FaTimes, FaCopy,
} from "react-icons/fa";
import {
  getAvailableTypes, applyForCertificate,
  confirmPayment, getMyApplications, cancelApplication,
} from "../../../services/certificateApplication.service";

const TYPE_LABELS = {
  bonafide_letter: "Bonafide Letter",
  transcripts: "Transcripts",
  specialization_change: "Specialization Change",
  course_change: "Course Change",
  exam_reappearing: "Exam Re-appearing",
  project_evaluation: "Project Evaluation",
  validation_extension: "Validation Extension",
  degree_application: "Degree Application",
  migration: "Migration Certificate",
  character: "Character Certificate",
  provisional: "Provisional Certificate",
  rank: "Rank Certificate",
};

const TYPE_COLORS = {
  bonafide_letter: "from-blue-500 to-blue-600",
  transcripts: "from-purple-500 to-purple-600",
  specialization_change: "from-orange-500 to-orange-600",
  course_change: "from-teal-500 to-teal-600",
  exam_reappearing: "from-red-500 to-red-600",
  project_evaluation: "from-indigo-500 to-indigo-600",
  validation_extension: "from-yellow-500 to-yellow-600",
  degree_application: "from-green-500 to-green-600",
  migration: "from-pink-500 to-pink-600",
  character: "from-cyan-500 to-cyan-600",
  provisional: "from-emerald-500 to-emerald-600",
  rank: "from-amber-500 to-amber-600",
};

const STATUS_STYLES = {
  draft: { bg: "bg-gray-100", text: "text-gray-600", label: "Draft" },
  payment_pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Payment Pending" },
  submitted: { bg: "bg-blue-100", text: "text-blue-700", label: "Submitted" },
  under_review: { bg: "bg-purple-100", text: "text-purple-700", label: "Under Review" },
  approved: { bg: "bg-green-100", text: "text-green-700", label: "Approved" },
  rejected: { bg: "bg-red-100", text: "text-red-700", label: "Rejected" },
  issued: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Issued" },
  cancelled: { bg: "bg-gray-200", text: "text-gray-500", label: "Cancelled" },
};

const ApplyCertificate = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("apply");
  const [availableTypes, setAvailableTypes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyLoading, setApplyLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Apply form state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [numberOfCopies, setNumberOfCopies] = useState(1);
  const [reason, setReason] = useState("");
  const [subjects, setSubjects] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");

  // Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentApp, setPaymentApp] = useState(null);
  const [paymentId, setPaymentId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Detail modal
  const [detailApp, setDetailApp] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [typesRes, appsRes] = await Promise.all([
        getAvailableTypes().catch(() => ({ data: [] })),
        getMyApplications().catch(() => ({ data: [] })),
      ]);
      setAvailableTypes(typesRes.data || []);
      setApplications(appsRes.data || []);
    } catch {
      showToast("error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApply = async () => {
    if (!selectedType) return;
    setApplyLoading(true);
    try {
      const payload = {
        certificateType: selectedType.type,
        numberOfCopies,
        reason: reason || undefined,
        additionalDetails: additionalDetails || undefined,
      };
      if (selectedType.type === "exam_reappearing" && subjects) {
        payload.subjects = subjects.split(",").map(s => s.trim()).filter(Boolean);
      }
      const res = await applyForCertificate(payload);
      showToast("success", "Application submitted successfully");
      setShowApplyModal(false);
      resetApplyForm();
      fetchData();
      // If payment required, show payment modal
      if (res.data?.status === "payment_pending") {
        setPaymentApp(res.data);
        setShowPaymentModal(true);
      }
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to submit application");
    } finally {
      setApplyLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!paymentApp || !paymentId.trim()) return;
    setPaymentLoading(true);
    try {
      await confirmPayment(paymentApp._id, {
        paymentId: paymentId.trim(),
        paymentMethod,
      });
      showToast("success", "Payment confirmed! Application submitted for review.");
      setShowPaymentModal(false);
      setPaymentApp(null);
      setPaymentId("");
      fetchData();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Payment confirmation failed");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCancel = async (appId) => {
    if (!window.confirm("Are you sure you want to cancel this application?")) return;
    try {
      await cancelApplication(appId);
      showToast("success", "Application cancelled");
      fetchData();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to cancel");
    }
  };

  const resetApplyForm = () => {
    setSelectedType(null);
    setNumberOfCopies(1);
    setReason("");
    setSubjects("");
    setAdditionalDetails("");
  };

  const calcTotalFee = () => {
    if (!selectedType) return 0;
    let base = selectedType.fee || 0;
    if (selectedType.type === "exam_reappearing" && subjects) {
      const count = subjects.split(",").filter(s => s.trim()).length;
      return base * Math.max(count, 1) * numberOfCopies;
    }
    return base * numberOfCopies;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white hover:shadow transition">
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Certificate Applications</h1>
            <p className="text-sm text-gray-500">Apply for certificates and track your requests</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "apply", label: "Apply", icon: FaPaperPlane },
            { key: "my-applications", label: "My Applications", icon: FaFileAlt },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white shadow"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <tab.icon className="text-sm" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Apply Tab — Certificate Types Grid */}
        {activeTab === "apply" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableTypes.map(ct => (
              <div
                key={ct.type}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition cursor-pointer"
                onClick={() => { setSelectedType(ct); setShowApplyModal(true); }}
              >
                <div className={`h-2 bg-gradient-to-r ${TYPE_COLORS[ct.type] || "from-gray-400 to-gray-500"}`} />
                <div className="p-5">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {ct.label || TYPE_LABELS[ct.type] || ct.type}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Processing: ~{ct.processingDays || 7} days
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-lg font-bold text-gray-800">
                      {ct.currency === "INR" ? <FaRupeeSign className="text-sm" /> : <FaDollarSign className="text-sm" />}
                      {ct.fee || 0}
                    </div>
                    {!ct.requiresPayment && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Free</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {availableTypes.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                <FaFileAlt className="text-4xl mx-auto mb-3 text-gray-300" />
                <p>No certificate types available at the moment</p>
              </div>
            )}
          </div>
        )}

        {/* My Applications Tab */}
        {activeTab === "my-applications" && (
          <div className="space-y-4">
            {applications.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <FaFileAlt className="text-4xl mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No applications yet</p>
                <button
                  onClick={() => setActiveTab("apply")}
                  className="mt-3 text-blue-600 text-sm hover:underline"
                >
                  Apply for a certificate
                </button>
              </div>
            )}
            {applications.map(app => {
              const st = STATUS_STYLES[app.status] || STATUS_STYLES.draft;
              return (
                <div
                  key={app._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition cursor-pointer"
                  onClick={() => setDetailApp(app)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800">
                          {app.certificateLabel || TYPE_LABELS[app.certificateType] || app.certificateType}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>
                          {st.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        #{app.applicationNumber} &middot; {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                      {app.numberOfCopies > 1 && (
                        <p className="text-xs text-gray-500 mt-1">
                          <FaCopy className="inline mr-1" />{app.numberOfCopies} copies
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {app.totalFee > 0 && (
                        <p className="text-sm font-bold text-gray-700">
                          {app.feeCurrency === "USD" ? "$" : "₹"}{app.totalFee}
                        </p>
                      )}
                      {app.status === "payment_pending" && (
                        <button
                          onClick={e => { e.stopPropagation(); setPaymentApp(app); setShowPaymentModal(true); }}
                          className="mt-1 text-xs bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600"
                        >
                          <FaMoneyBillWave className="inline mr-1" />Pay Now
                        </button>
                      )}
                      {["draft", "payment_pending", "submitted"].includes(app.status) && (
                        <button
                          onClick={e => { e.stopPropagation(); handleCancel(app._id); }}
                          className="mt-1 ml-2 text-xs text-red-500 hover:text-red-700"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                  {app.rejectionReason && (
                    <div className="mt-3 p-2 bg-red-50 rounded-lg text-xs text-red-600">
                      <strong>Reason:</strong> {app.rejectionReason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {showApplyModal && selectedType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className={`p-5 bg-gradient-to-r ${TYPE_COLORS[selectedType.type] || "from-gray-400 to-gray-500"} rounded-t-2xl`}>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Apply for {selectedType.label || TYPE_LABELS[selectedType.type] || selectedType.type}
                  </h2>
                  <p className="text-white/80 text-sm mt-1">
                    Processing time: ~{selectedType.processingDays || 7} days
                  </p>
                </div>
                <button onClick={() => { setShowApplyModal(false); resetApplyForm(); }} className="text-white/80 hover:text-white">
                  <FaTimes />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {/* Number of copies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Copies</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={numberOfCopies}
                  onChange={e => setNumberOfCopies(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Subjects for exam re-appearing */}
              {selectedType.type === "exam_reappearing" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subjects (comma separated)</label>
                  <input
                    type="text"
                    value={subjects}
                    onChange={e => setSubjects(e.target.value)}
                    placeholder="Math, Physics, Chemistry"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows={2}
                  placeholder="Why do you need this certificate?"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Additional details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details (optional)</label>
                <textarea
                  value={additionalDetails}
                  onChange={e => setAdditionalDetails(e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Fee summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Fee per unit</span>
                  <span className="font-medium">
                    {selectedType.currency === "USD" ? "$" : "₹"}{selectedType.fee || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Copies</span>
                  <span>{numberOfCopies}</span>
                </div>
                {selectedType.type === "exam_reappearing" && subjects && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Subjects</span>
                    <span>{subjects.split(",").filter(s => s.trim()).length}</span>
                  </div>
                )}
                <hr className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>
                    {selectedType.currency === "USD" ? "$" : "₹"}{calcTotalFee()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleApply}
                disabled={applyLoading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {applyLoading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                {applyLoading ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && paymentApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-5 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">Confirm Payment</h2>
                <button onClick={() => { setShowPaymentModal(false); setPaymentApp(null); setPaymentId(""); }} className="text-gray-400 hover:text-gray-600">
                  <FaTimes />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Amount to Pay</p>
                <p className="text-3xl font-bold text-gray-800">
                  {paymentApp.feeCurrency === "USD" ? "$" : "₹"}{paymentApp.totalFee}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  for {paymentApp.certificateLabel || TYPE_LABELS[paymentApp.certificateType] || paymentApp.certificateType}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="online">Online Payment</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="upi">UPI</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction / Payment ID</label>
                <input
                  type="text"
                  value={paymentId}
                  onChange={e => setPaymentId(e.target.value)}
                  placeholder="Enter transaction reference number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleConfirmPayment}
                disabled={paymentLoading || !paymentId.trim()}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {paymentLoading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                {paymentLoading ? "Confirming..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Application Details</h2>
              <button onClick={() => setDetailApp(null)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Application #</span>
                  <p className="font-medium">{detailApp.applicationNumber}</p>
                </div>
                <div>
                  <span className="text-gray-500">Type</span>
                  <p className="font-medium">{detailApp.certificateLabel || TYPE_LABELS[detailApp.certificateType] || detailApp.certificateType}</p>
                </div>
                <div>
                  <span className="text-gray-500">Status</span>
                  <p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${(STATUS_STYLES[detailApp.status] || STATUS_STYLES.draft).bg} ${(STATUS_STYLES[detailApp.status] || STATUS_STYLES.draft).text}`}>
                      {(STATUS_STYLES[detailApp.status] || STATUS_STYLES.draft).label}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Applied On</span>
                  <p className="font-medium">{new Date(detailApp.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Copies</span>
                  <p className="font-medium">{detailApp.numberOfCopies}</p>
                </div>
                <div>
                  <span className="text-gray-500">Total Fee</span>
                  <p className="font-medium">
                    {detailApp.totalFee > 0
                      ? `${detailApp.feeCurrency === "USD" ? "$" : "₹"}${detailApp.totalFee}`
                      : "Free"}
                  </p>
                </div>
              </div>

              {detailApp.paymentStatus && detailApp.totalFee > 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Info</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Payment Status</span>
                      <p className="font-medium capitalize">{detailApp.paymentStatus}</p>
                    </div>
                    {detailApp.paymentId && (
                      <div>
                        <span className="text-gray-500">Transaction ID</span>
                        <p className="font-medium">{detailApp.paymentId}</p>
                      </div>
                    )}
                    {detailApp.paymentMethod && (
                      <div>
                        <span className="text-gray-500">Method</span>
                        <p className="font-medium capitalize">{detailApp.paymentMethod.replace("_", " ")}</p>
                      </div>
                    )}
                    {detailApp.paymentDate && (
                      <div>
                        <span className="text-gray-500">Paid On</span>
                        <p className="font-medium">{new Date(detailApp.paymentDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {detailApp.reason && (
                <div>
                  <span className="text-xs text-gray-500">Reason</span>
                  <p className="text-sm text-gray-700">{detailApp.reason}</p>
                </div>
              )}

              {detailApp.subjects?.length > 0 && (
                <div>
                  <span className="text-xs text-gray-500">Subjects</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {detailApp.subjects.map((s, i) => (
                      <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {detailApp.rejectionReason && (
                <div className="bg-red-50 rounded-lg p-3 text-sm text-red-600">
                  <strong>Rejection Reason:</strong> {detailApp.rejectionReason}
                </div>
              )}

              {detailApp.adminRemarks && (
                <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                  <strong>Admin Remarks:</strong> {detailApp.adminRemarks}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.type === "success" ? <FaCheckCircle className="inline mr-2" /> : <FaTimesCircle className="inline mr-2" />}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default ApplyCertificate;
