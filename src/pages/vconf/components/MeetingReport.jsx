import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Clock,
  Calendar,
  Users,
  BarChart3,
  HelpCircle,
  MessageCircle,
  Subtitles,
  Printer,
  Video,
  CheckCircle,
  Loader2,
  AlertTriangle,
  ThumbsUp,
} from "lucide-react";
import { getVconfMeetingReport } from "../../../services/vconf.service";

/* ─── Helpers ────────────────────────────────────────────────── */

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(minutes) {
  if (minutes == null) return "—";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function RoleBadge({ role }) {
  const isTeacher =
    role?.toLowerCase() === "teacher" || role?.toLowerCase() === "host";
  return (
    <span
      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
        isTeacher
          ? "bg-blue-100 text-blue-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {role}
    </span>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-5 h-5 text-gray-500" />
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {subtitle && (
        <span className="text-sm text-gray-400 ml-1">{subtitle}</span>
      )}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */

export default function MeetingReport({ meetingId, onClose }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVconfMeetingReport(meetingId);
      setReport(data);
    } catch (err) {
      console.error("Failed to load meeting report:", err);
      setError("Failed to load report. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  /* ── Loading / Error states ─── */

  if (loading) {
    return (
      <Overlay>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-gray-500 text-sm">Loading report...</p>
        </div>
      </Overlay>
    );
  }

  if (error) {
    return (
      <Overlay>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchReport}
            className="px-4 py-2 text-sm font-medium text-gray-900 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </Overlay>
    );
  }

  // Map backend response structure to component variables
  const meeting = report?.summary || {};
  const attendanceData = report?.attendance || {};
  const participants = attendanceData.participants || [];
  const polls = report?.polls || [];
  const qnaData = report?.qna || {};
  const questions = qnaData.questions || [];
  const chatData = report?.chat || {};
  const chatMessages = chatData.messages || [];
  const captionData = report?.captions || {};
  const captions = captionData.entries || [];

  const studentCount = attendanceData.studentCount || participants.filter(
    (a) => a.role?.toLowerCase() === "student"
  ).length;
  const teacherCount = attendanceData.teacherCount || participants.filter(
    (a) =>
      a.role?.toLowerCase() === "teacher" || a.role?.toLowerCase() === "host"
  ).length;

  const answeredCount = qnaData.answeredCount || questions.filter((q) => q.answer || q.status === "answered").length;

  return (
    <Overlay>
      {/* ── Print-friendly styles ── */}
      <style>{`
        @media print {
          .report-overlay-bg { background: transparent !important; }
          .report-close-btn { display: none !important; }
          .report-card { max-height: none !important; overflow: visible !important; box-shadow: none !important; }
          .report-footer-actions { display: none !important; }
        }
      `}</style>

      <div className="report-card bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
        {/* ── Header ── */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Meeting Report</h2>
            {meeting.title && (
              <p className="text-sm text-gray-500 mt-0.5">{meeting.title}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="report-close-btn p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            aria-label="Close report"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* ── Section 1: Summary ── */}
          <section className="bg-gray-50 rounded-xl p-5">
            <SectionHeader icon={Video} title="Summary" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <SummaryItem
                icon={Calendar}
                label="Date"
                value={formatDate(meeting.date || meeting.startedAt)}
              />
              <SummaryItem
                icon={Clock}
                label="Duration"
                value={formatDuration(meeting.durationMinutes)}
              />
              <SummaryItem
                icon={Video}
                label="Mode"
                value={meeting.mode || "—"}
              />
              <SummaryItem
                icon={Users}
                label="Participants"
                value={participants.length}
              />
              <SummaryItem
                icon={CheckCircle}
                label="Status"
                value={meeting.status || "Ended"}
              />
            </div>
          </section>

          {/* ── Section 2: Attendance ── */}
          <section className="bg-gray-50 rounded-xl p-5">
            <SectionHeader
              icon={Users}
              title="Attendance"
              subtitle={`(${participants.length} participants)`}
            />
            {participants.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-200">
                        <th className="pb-2 font-medium">Name</th>
                        <th className="pb-2 font-medium">Role</th>
                        <th className="pb-2 font-medium">Joined At</th>
                        <th className="pb-2 font-medium">Left At</th>
                        <th className="pb-2 font-medium">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {participants.map((a, i) => (
                        <tr key={i} className="text-gray-700">
                          <td className="py-2 font-medium">{a.name}</td>
                          <td className="py-2">
                            <RoleBadge role={a.role} />
                          </td>
                          <td className="py-2">{formatTime(a.joinTime || a.joinedAt)}</td>
                          <td className="py-2">{formatTime(a.leaveTime || a.leftAt)}</td>
                          <td className="py-2">
                            {formatDuration(a.durationSeconds != null ? a.durationSeconds / 60 : a.durationMinutes)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-4 mt-3 text-xs text-gray-500">
                  <span>{studentCount} students</span>
                  <span>{teacherCount} teachers</span>
                  <span>
                    Total duration:{" "}
                    {formatDuration(
                      participants.reduce(
                        (sum, a) => sum + ((a.durationSeconds != null ? a.durationSeconds / 60 : a.durationMinutes) || 0),
                        0
                      )
                    )}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400">No attendance data.</p>
            )}
          </section>

          {/* ── Section 3: Poll Results ── */}
          <section className="bg-gray-50 rounded-xl p-5">
            <SectionHeader
              icon={BarChart3}
              title="Polls"
              subtitle={`(${polls.length} total)`}
            />
            {polls.length > 0 ? (
              <div className="space-y-5">
                {polls.map((poll, pi) => {
                  const totalResponses = (poll.options || []).reduce(
                    (s, o) => s + (o.count || 0),
                    0
                  );
                  return (
                    <div
                      key={pi}
                      className="bg-white rounded-lg p-4 border border-gray-100"
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <p className="font-medium text-gray-800">
                          {poll.question}
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                            {poll.pollType || poll.type || "Poll"}
                          </span>
                          <span className="text-xs text-gray-400">
                            {totalResponses} responses
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {(poll.options || []).map((opt, oi) => {
                          const pct =
                            totalResponses > 0
                              ? Math.round(
                                  ((opt.count || 0) / totalResponses) * 100
                                )
                              : 0;
                          const isCorrect =
                            (poll.pollType || poll.type)?.toLowerCase() === "quiz" && opt.isCorrect;
                          return (
                            <div key={oi} className="flex items-center gap-3">
                              <span
                                className={`text-sm w-40 shrink-0 truncate ${
                                  isCorrect
                                    ? "text-blue-700 font-semibold"
                                    : "text-gray-600"
                                }`}
                              >
                                {opt.text}
                                {isCorrect && " \u2713"}
                              </span>
                              <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    isCorrect ? "bg-blue-400" : "bg-blue-400"
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 w-16 text-right">
                                {pct}% ({opt.count || 0})
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No polls were conducted.</p>
            )}
          </section>

          {/* ── Section 4: Q&A Summary ── */}
          <section className="bg-gray-50 rounded-xl p-5">
            <SectionHeader
              icon={HelpCircle}
              title="Q&A"
              subtitle={`(${questions.length} questions, ${answeredCount} answered)`}
            />
            {questions.length > 0 ? (
              <div className="space-y-3">
                {questions.map((q, qi) => (
                  <div
                    key={qi}
                    className="bg-white rounded-lg p-4 border border-gray-100"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {q.text}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Asked by {q.isAnonymous ? "Anonymous" : (q.askedByName || q.askerName || "Anonymous")}
                          {(q.upvoteCount || q.upvotes || 0) > 0 && (
                            <span className="ml-2 inline-flex items-center gap-0.5">
                              <ThumbsUp className="w-3 h-3" /> {q.upvoteCount || q.upvotes}
                            </span>
                          )}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          q.status === "answered" || q.answer
                            ? "bg-blue-50 text-blue-600"
                            : q.status === "dismissed"
                            ? "bg-red-50 text-red-600"
                            : "bg-yellow-50 text-yellow-600"
                        }`}
                      >
                        {q.status === "answered" || q.answer ? "Answered" : q.status === "dismissed" ? "Dismissed" : "Unanswered"}
                      </span>
                    </div>
                    {q.answer && (
                      <div className="mt-3 pl-3 border-l-2 border-blue-200">
                        <p className="text-sm text-gray-700">{q.answer}</p>
                        {q.answeredBy && (
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <RoleBadge role="Teacher" /> {q.answeredBy}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No questions were asked.</p>
            )}
          </section>

          {/* ── Section 5: Chat Log ── */}
          <section className="bg-gray-50 rounded-xl p-5">
            <SectionHeader
              icon={MessageCircle}
              title="Chat"
              subtitle={`(${chatMessages.length} messages)`}
            />
            {chatMessages.length > 0 ? (
              <div className="max-h-64 overflow-y-auto space-y-1.5 bg-white rounded-lg border border-gray-100 p-3">
                {chatMessages.map((msg, mi) => (
                  <div key={mi} className="flex items-start gap-2 text-sm">
                    <div className="shrink-0 flex items-center gap-1">
                      <span className="font-medium text-gray-700">
                        {msg.senderName}
                      </span>
                      <RoleBadge role={msg.senderRole} />
                    </div>
                    <span className="text-gray-600 flex-1">{msg.content}</span>
                    <span className="text-xs text-gray-400 shrink-0">
                      {formatTime(msg.sentAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No chat messages.</p>
            )}
          </section>

          {/* ── Section 6: Caption Log ── */}
          <section className="bg-gray-50 rounded-xl p-5">
            <SectionHeader
              icon={Subtitles}
              title="Captions"
              subtitle={`(${captions.length} entries)`}
            />
            {captions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-200">
                      <th className="pb-2 font-medium w-24">Time</th>
                      <th className="pb-2 font-medium w-32">Speaker</th>
                      <th className="pb-2 font-medium">Caption</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {captions.map((c, ci) => (
                      <tr key={ci} className="text-gray-700">
                        <td className="py-1.5 text-gray-400">
                          {formatTime(c.timestamp)}
                        </td>
                        <td className="py-1.5 font-medium">{c.speaker}</td>
                        <td className="py-1.5">{c.text}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No captions recorded.</p>
            )}
          </section>
        </div>

        {/* ── Footer ── */}
        <div className="report-footer-actions sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
          <button
            onClick={onClose}
            className="report-close-btn px-4 py-2 text-sm font-medium text-gray-900 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Overlay>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function Overlay({ children }) {
  return (
    <div className="report-overlay-bg fixed inset-0 z-50 bg-gray-50/20 flex items-center justify-center">
      {children}
    </div>
  );
}

function SummaryItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white rounded-lg shadow-sm">
        <Icon className="w-4 h-4 text-blue-500" />
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
