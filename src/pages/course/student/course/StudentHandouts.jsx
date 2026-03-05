import React, { useState, useEffect } from "react";
import {
  FileText,
  Clock,
  User,
  BookOpen,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { getHandouts } from "../../../../services/handout.service";

const StudentHandouts = () => {
  const { courseID } = useParams();
  const [handouts, setHandouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHandouts = async () => {
      try {
        setLoading(true);
        const data = await getHandouts(courseID);
        setHandouts(data);
      } catch (err) {
        console.error("Failed to fetch handouts:", err);
      } finally {
        setLoading(false);
      }
    };
    if (courseID) fetchHandouts();
  }, [courseID]);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent1"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[400px] bg-gray-50 dark:bg-gray-900 p-4">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl mb-6 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 shadow-lg">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -bottom-6 right-20 w-20 h-20 bg-white/5 rounded-full" />
        <div className="relative z-10 px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Handouts
              </h1>
              <p className="text-emerald-100 text-sm mt-1">
                Class handouts and notes shared by your teacher
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Handouts List */}
      {handouts.length === 0 ? (
        <div className="flex justify-center items-center py-16">
          <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-teal-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              No handouts available yet.
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              Your teacher hasn't shared any handouts for this course yet.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {handouts.map((handout, index) => (
            <div
              key={handout._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all"
            >
              <div className="px-6 py-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white font-bold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {handout.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {handout.createdBy?.name || "Teacher"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(handout.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                    {handout.content && (
                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {handout.content}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentHandouts;
