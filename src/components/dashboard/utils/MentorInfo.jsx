import {
  GraduationCap,
  User,
  BookOpen,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";

const MentorDetails = ({ teacher }) => {
  if (!teacher) {
    return null;
  }

  const hasLinks = teacher.googleScholarLink || teacher.ScopusLink || teacher.LinkenInLink;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md dark:shadow-lg rounded-xl overflow-hidden transition-all border border-gray-100 dark:border-gray-600">
      <button
        className="w-full flex justify-between items-center p-4 bg-gradient-to-r from-white to-gray-200 dark:from-gray-700 dark:to-gray-600 text-black dark:text-white font-semibold text-lg hover:opacity-90 transition-all"
      >
        <div className="flex items-center space-x-2">
          <GraduationCap className="w-5 h-5 text-red-500 dark:text-red-400" />
          <span className="text-lg font-semibold">Mentor Details</span>
        </div>
      </button>
         
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6 space-y-5"
      >
        <div className="flex items-center space-x-3">
          <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{teacher.name || ""}</h2>
        </div>

        {teacher.profTitle && (
          <div className="flex items-center space-x-3">
            <GraduationCap className="w-6 h-6 text-green-600 dark:text-green-400" />
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              {teacher.profTitle}
            </p>
          </div>
        )}

        {teacher.profDesc && (
          <div className="flex items-center space-x-3">
            <BookOpen className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            <p className="text-gray-600 dark:text-gray-300">{teacher.profDesc}</p>
          </div>
        )}

        {hasLinks && (
          <div className="flex items-center space-x-3">
            <Globe className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            <div className="flex space-x-3 flex-wrap">
              {teacher.googleScholarLink && (
                <a
                  href={teacher.googleScholarLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-md text-sm hover:bg-blue-200 dark:hover:bg-blue-800/50 transition transform hover:scale-105 border border-blue-200 dark:border-blue-700"
                >
                  Google Scholar
                </a>
              )}
              {teacher.ScopusLink && (
                <a
                  href={teacher.ScopusLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-md text-sm hover:bg-blue-200 dark:hover:bg-blue-800/50 transition transform hover:scale-105 border border-blue-200 dark:border-blue-700"
                >
                  Scopus
                </a>
              )}
              {teacher.LinkenInLink && (
                <a
                  href={teacher.LinkenInLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-md text-sm hover:bg-blue-200 dark:hover:bg-blue-800/50 transition transform hover:scale-105 border border-blue-200 dark:border-blue-700"
                >
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default function MentorInfo({ teacher }) {
  return (
    <div className="w-full">
      <MentorDetails teacher={teacher} />
    </div>
  );
}