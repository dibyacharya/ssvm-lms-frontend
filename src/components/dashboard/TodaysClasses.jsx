import { useState, useEffect } from "react";
import { Clock, Video, BookOpen, MapPin, AlertCircle } from "lucide-react";
import { getMyTimetable } from "../../services/timetable.service";

const formatTime = (isoOrTime) => {
  if (!isoOrTime) return "";
  try {
    const d = new Date(isoOrTime);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    }
  } catch {}
  return String(isoOrTime);
};

const isNow = (start, end) => {
  const now = new Date();
  try {
    const s = new Date(start);
    const e = new Date(end);
    return now >= s && now <= e;
  } catch {
    return false;
  }
};

export default function TodaysClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchToday = async () => {
      try {
        setLoading(true);
        const today = new Date();
        const from = today.toISOString().split("T")[0];
        const to = from;
        const res = await getMyTimetable(from, to);
        const entries = Array.isArray(res?.entries) ? res.entries : Array.isArray(res) ? res : [];
        // Sort by start time
        entries.sort((a, b) => {
          const aTime = new Date(a.startTime || a.start || 0).getTime();
          const bTime = new Date(b.startTime || b.start || 0).getTime();
          return aTime - bTime;
        });
        setClasses(entries);
        setError("");
      } catch (err) {
        const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "";
        // Don't show error for 404/empty — just show empty state
        if (err?.response?.status === 404 || msg.includes("not found")) {
          setClasses([]);
          setError("");
        } else {
          setError(msg || "Failed to load today's schedule");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchToday();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-white rounded-xl border border-gray-100 dark:border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          Today's Classes
        </h3>
        <div className="text-center py-6 text-gray-400 text-sm">Loading schedule...</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-white rounded-xl border border-gray-100 dark:border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          Today's Classes
        </h3>
        <span className="text-xs text-gray-400">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
        </span>
      </div>

      {error ? (
        <div className="px-6 py-4 text-sm text-amber-600 dark:text-amber-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      ) : classes.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <BookOpen className="w-10 h-10 text-gray-600 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No classes scheduled for today</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50 dark:divide-gray-700">
          {classes.map((cls, idx) => {
            const startTime = cls.startTime || cls.start;
            const endTime = cls.endTime || cls.end;
            const live = isNow(startTime, endTime);
            const courseName = cls.courseTitle || cls.courseName || cls.title || cls.subject || "Class";
            const courseCode = cls.courseCode || "";
            const room = cls.room || cls.location || cls.venue || "";
            const teacher = cls.teacherName || cls.instructor || "";
            const joinUrl = cls.joinUrl || cls.meetingLink || "";

            return (
              <div
                key={cls._id || idx}
                className={`px-6 py-3 flex items-center gap-4 ${live ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-100/30"} transition-colors`}
              >
                <div className="text-center min-w-[60px]">
                  <div className={`text-sm font-bold ${live ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-600"}`}>
                    {formatTime(startTime)}
                  </div>
                  <div className="text-[10px] text-gray-400">{formatTime(endTime)}</div>
                </div>

                <div className={`w-1 h-10 rounded-full ${live ? "bg-blue-500 animate-pulse" : "bg-gray-200 dark:bg-gray-600"}`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold truncate ${live ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-gray-900"}`}>
                      {courseName}
                    </span>
                    {courseCode && <span className="text-[10px] text-gray-400 font-mono">{courseCode}</span>}
                    {live && <span className="px-1.5 py-0.5 bg-blue-500 text-gray-900 text-[9px] font-bold rounded uppercase">Live</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {teacher && <span>{teacher}</span>}
                    {room && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />
                        {room}
                      </span>
                    )}
                  </div>
                </div>

                {joinUrl && live && (
                  <a
                    href={joinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-gray-900 text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Join
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
