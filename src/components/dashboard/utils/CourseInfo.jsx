import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, BookOpen, Calendar, Star } from "lucide-react";
import { TfiAgenda } from "react-icons/tfi";

const CourseInfo = ({ course }) => {
  return (
    <div className="w-[50%] bg-gradient-to-br bg-white dark:bg-gray-800 shadow-lg dark:shadow-xl rounded-xl overflow-hidden transition-all border border-gray-100 dark:border-gray-600">
      <button className="w-full flex justify-between items-center p-4 font-semibold text-lg transition-all">
        <div className="flex items-center space-x-2">
          <TfiAgenda className="w-5 h-5 text-green-500 dark:text-green-400" />
          <span className="text-lg font-semibold text-gray-900 dark:text-white">Course Details</span>
        </div>
      </button>

      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6 space-y-6 bg-white dark:bg-gray-800"
      >
        <div className="flex items-start space-x-4">
          <BookOpen className="w-40 h-10 text-indigo-600 dark:text-indigo-400" />
          <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{course.aboutCourse}</p>
        </div>

        <div className="flex items-center space-x-4 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
          <Calendar className="w-7 h-7 text-green-600 dark:text-green-400" />
          <p className="text-gray-800 dark:text-gray-200">
            Semester {course.semester.name} (
            {new Date(course.semester.startDate).toLocaleDateString()} -{" "}
            {new Date(course.semester.endDate).toLocaleDateString()})
          </p>
        </div>

        <div className="flex items-center space-x-4 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
          <Star className="w-7 h-7 text-yellow-500 dark:text-yellow-400" />
          <p className="text-gray-800 dark:text-gray-200 font-medium">
            Credit Points: Lecture ({course.creditPoints.lecture}), Tutorial (
            {course.creditPoints.tutorial}), Practical (
            {course.creditPoints.practical}), Project (
            {course.creditPoints.project})
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Learning Outcomes
          </h3>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 pl-5">
            {course.learningOutcomes.map((outcome, index) => (
              <li key={index} className="leading-relaxed">
                {outcome}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default CourseInfo;