import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaClipboardList, FaCheckCircle, FaTimesCircle, FaIdCard,
  FaSpinner, FaCalendarAlt, FaBookOpen, FaExclamationTriangle,
  FaDownload, FaUndo, FaArrowLeft,
} from "react-icons/fa";
import {
  getOpenRegistrationPeriods, registerForExam,
  getMyRegistrations, getMyAdmitCard, withdrawRegistration,
} from "../../../services/examRegistration.service";
import { getStudentAllExams } from "../../../services/exam.service";

const STATUS_STYLES = {
  registered: { bg: "bg-blue-100", text: "text-blue-700", label: "Registered" },
  confirmed: { bg: "bg-green-100", text: "text-green-700", label: "Confirmed" },
  rejected: { bg: "bg-red-100", text: "text-red-700", label: "Rejected" },
  withdrawn: { bg: "bg-gray-100", text: "text-gray-600", label: "Withdrawn" },
  debarred: { bg: "bg-red-200", text: "text-red-800", label: "Debarred" },
};

const ExamRegistration = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("registrations");
  const [registrations, setRegistrations] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registerLoading, setRegisterLoading] = useState(null);
  const [admitCard, setAdmitCard] = useState(null);
  const [showAdmitCard, setShowAdmitCard] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [regRes, periodRes, examRes] = await Promise.all([
        getMyRegistrations(),
        getOpenRegistrationPeriods().catch(() => ({ periods: [] })),
        getStudentAllExams().catch(() => ({ exams: [] })),
      ]);
      setRegistrations(regRes.registrations || []);
      setPeriods(periodRes.periods || []);
      setExams(examRes.exams || []);
    } catch {
      showToast("error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRegister = async (examId, periodId) => {
    setRegisterLoading(examId);
    try {
      await registerForExam({ examId, registrationPeriodId: periodId || undefined });
      showToast("success", "Successfully registered for exam");
      fetchData();
    } catch (err) {
      showToast("error", err.response?.data?.error || "Registration failed");
    } finally {
      setRegisterLoading(null);
    }
  };

  const handleWithdraw = async (regId) => {
    if (!window.confirm("Are you sure you want to withdraw?")) return;
    try {
      await withdrawRegistration(regId);
      showToast("success", "Registration withdrawn");
      fetchData();
    } catch (err) {
      showToast("error", err.response?.data?.error || "Failed to withdraw");
    }
  };

  const handleViewAdmitCard = async (regId) => {
    try {
      const res = await getMyAdmitCard(regId);
      setAdmitCard(res.admitCard);
      setShowAdmitCard(true);
    } catch {
      showToast("error", "Admit card not available yet");
    }
  };

  const handlePrintAdmitCard = () => {
    window.print();
  };

  const registeredExamIds = registrations.map((r) => r.exam?._id || r.exam);

  // Available exams = exams not yet registered
  const availableExams = exams.filter(
    (e) => !registeredExamIds.includes(e._id) && ["scheduled", "live"].includes(e.status)
  );

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";
  const formatDateTime = (d) =>
    d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <FaSpinner className="animate-spin text-3xl text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100">
          <FaArrowLeft className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Registration</h1>
          <p className="text-sm text-gray-500">Register for upcoming exams and download admit cards</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { key: "registrations", label: "My Registrations", icon: FaClipboardList },
          { key: "register", label: "Register for Exam", icon: FaCalendarAlt },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 ${
              activeTab === key
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon /> {label}
          </button>
        ))}
      </div>

      {/* ═══ My Registrations ═══ */}
      {activeTab === "registrations" && (
        <div className="space-y-4">
          {registrations.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <FaClipboardList className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No exam registrations yet</p>
              <button
                onClick={() => setActiveTab("register")}
                className="mt-3 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Register for an Exam
              </button>
            </div>
          ) : (
            registrations.map((reg) => {
              const st = STATUS_STYLES[reg.status] || STATUS_STYLES.registered;
              return (
                <div key={reg._id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{reg.exam?.title || "Exam"}</h3>
                      <p className="text-sm text-gray-500">
                        {reg.course?.code} - {reg.course?.name} | {reg.exam?.examType === "mid_term" ? "Mid Term" : reg.exam?.examType === "end_term" ? "End Term" : reg.exam?.examType}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>
                      {st.label}
                    </span>
                  </div>

                  {/* Exam Schedule */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt className="text-gray-400" /> {formatDateTime(reg.exam?.scheduledStartTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaBookOpen className="text-gray-400" /> {reg.exam?.duration} min
                    </span>
                  </div>

                  {/* Eligibility Info */}
                  <div className="flex flex-wrap gap-3 text-xs">
                    <span className={`flex items-center gap-1 ${reg.eligibility?.feesPaid ? "text-green-700" : "text-red-600"}`}>
                      {reg.eligibility?.feesPaid ? <FaCheckCircle /> : <FaTimesCircle />} Fees
                    </span>
                    <span className={`flex items-center gap-1 ${reg.eligibility?.attendanceMet ? "text-green-700" : "text-red-600"}`}>
                      {reg.eligibility?.attendanceMet ? <FaCheckCircle /> : <FaTimesCircle />} Attendance ({reg.eligibility?.attendancePercentage || 0}%)
                    </span>
                  </div>

                  {/* Rejection reason */}
                  {reg.status === "rejected" && reg.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                      <FaExclamationTriangle className="inline mr-1" /> {reg.rejectionReason}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    {reg.admitCardIssued && (
                      <button
                        onClick={() => handleViewAdmitCard(reg._id)}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        <FaIdCard /> View Admit Card
                      </button>
                    )}
                    {["registered"].includes(reg.status) && !reg.admitCardIssued && (
                      <button
                        onClick={() => handleWithdraw(reg._id)}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        <FaUndo /> Withdraw
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══ Register for Exam ═══ */}
      {activeTab === "register" && (
        <div className="space-y-4">
          {/* Open registration periods */}
          {periods.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-800">Open Registration Periods</h2>
              {periods.map((p) => (
                <div key={p._id} className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h3 className="font-semibold text-blue-800">{p.title}</h3>
                  <p className="text-sm text-blue-600">
                    {formatDate(p.registrationStartDate)} — {formatDate(p.registrationEndDate)}
                  </p>
                  {p.instructions && (
                    <p className="text-sm text-blue-700 mt-1">{p.instructions}</p>
                  )}
                  {p.courses?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {p.courses.map((c) => (
                        <span key={c._id} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                          {c.code}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Available Exams */}
          <h2 className="text-lg font-semibold text-gray-800">Available Exams</h2>
          {availableExams.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <FaCalendarAlt className="text-3xl text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No exams available for registration</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableExams.map((exam) => (
                <div key={exam._id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{exam.title}</h3>
                    <p className="text-sm text-gray-500">
                      {exam.examType === "mid_term" ? "Mid Term" : exam.examType === "end_term" ? "End Term" : exam.examType} | {formatDateTime(exam.scheduledStartTime)} | {exam.duration} min
                    </p>
                  </div>
                  <button
                    onClick={() => handleRegister(exam._id)}
                    disabled={registerLoading === exam._id}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {registerLoading === exam._id ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaClipboardList />
                    )}
                    Register
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ Admit Card Modal ═══ */}
      {showAdmitCard && admitCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden print:shadow-none print:rounded-none">
            {/* Admit Card Header */}
            <div className="bg-indigo-700 text-white p-6 text-center print:bg-indigo-700">
              <h2 className="text-xl font-bold">ADMIT CARD</h2>
              <p className="text-indigo-200 text-sm mt-1">{admitCard.admitCardNumber}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block text-xs">Student Name</span>
                  <span className="font-semibold text-gray-900">{admitCard.studentName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Roll Number</span>
                  <span className="font-semibold text-gray-900">{admitCard.rollNumber}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Program</span>
                  <span className="font-medium text-gray-800">{admitCard.programName || "-"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Batch</span>
                  <span className="font-medium text-gray-800">{admitCard.batchName || "-"}</span>
                </div>
              </div>

              <hr className="border-gray-200" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block text-xs">Exam</span>
                  <span className="font-semibold text-gray-900">{admitCard.examTitle}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Course</span>
                  <span className="font-medium text-gray-800">{admitCard.courseCode} - {admitCard.courseName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Date & Time</span>
                  <span className="font-medium text-gray-800">{formatDateTime(admitCard.examDate)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Duration</span>
                  <span className="font-medium text-gray-800">{admitCard.duration} min</span>
                </div>
              </div>

              {(admitCard.seatNumber || admitCard.examCenter || admitCard.examRoom) && (
                <>
                  <hr className="border-gray-200" />
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {admitCard.seatNumber && (
                      <div>
                        <span className="text-gray-500 block text-xs">Seat No</span>
                        <span className="font-bold text-lg text-indigo-700">{admitCard.seatNumber}</span>
                      </div>
                    )}
                    {admitCard.examCenter && (
                      <div>
                        <span className="text-gray-500 block text-xs">Center</span>
                        <span className="font-medium text-gray-800">{admitCard.examCenter}</span>
                      </div>
                    )}
                    {admitCard.examRoom && (
                      <div>
                        <span className="text-gray-500 block text-xs">Room</span>
                        <span className="font-medium text-gray-800">{admitCard.examRoom}</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 text-center">
                Issued on: {formatDate(admitCard.issuedAt)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200 print:hidden">
              <button
                onClick={() => setShowAdmitCard(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={handlePrintAdmitCard}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <FaDownload /> Print / Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 rounded-lg border px-4 py-3 text-sm shadow-lg ${
          toast.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default ExamRegistration;
