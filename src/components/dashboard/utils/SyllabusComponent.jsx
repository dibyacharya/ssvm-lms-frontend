import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Book } from "lucide-react";

export default function SyllabusAccordion({ course }) {
  // State to manage the accordion's open/closed status
  const [isOpen, setIsOpen] = useState(true);

  // Safely access the modules array from the new JSON structure
  const modules = course?.syllabus?.modules;

  return (
    <div className="w-full mt-8">
      <div className="border border-gray-200 dark:border-gray-600 rounded-lg shadow-md dark:shadow-lg overflow-hidden bg-white dark:bg-gray-800">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Book className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-lg font-semibold text-gray-800 dark:text-white">Syllabus</span>
          </div>
          {/* Show up/down chevron based on state */}
          {isOpen ? (
            <ChevronUp className="text-gray-600 dark:text-gray-300" />
          ) : (
            <ChevronDown className="text-gray-600 dark:text-gray-300" />
          )}
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.section
              key="content"
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: { opacity: 1, height: "auto" },
                collapsed: { opacity: 0, height: 0 },
              }}
              transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600">
                {/* Check if modules data exists and is not empty */}
                {modules && modules.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                          <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                            Module No.
                          </th>
                          <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                            Title
                          </th>
                          <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Map over the 'modules' array */}
                        {modules.map((module) => (
                          <tr key={module.moduleNumber} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 align-top w-28 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                              {module.moduleNumber}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 align-top font-medium text-gray-800 dark:text-white bg-white dark:bg-gray-800">
                              {module.moduleTitle}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 align-top bg-white dark:bg-gray-800">
                              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                {(Array.isArray(module.topics) && module.topics.length > 0)
                                  ? module.topics.join(" ")
                                  : (module.description || "")}
                              </p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  // Display this message if no syllabus is found
                  <div className="text-center p-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                    <div className="flex flex-col items-center space-y-3">
                      <Book className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                      <p className="text-lg font-medium">No Syllabus Available</p>
                      <p className="text-sm">The syllabus for this course has not been uploaded yet.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}