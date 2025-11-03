import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from "react-accessible-accordion";
import "react-accessible-accordion/dist/fancy-example.css";
import { Book, CheckSquare, Calendar, Bell } from "lucide-react";
import { getAllStudentCourses } from "../../../services/course.service";
import LoadingSpinner from "../../../utils/LoadingAnimation";

import DashboardSemesterContent from "./DashBoardSemContent";

export default function DashboardSemester({ setActiveSection }) {
  const [showNotification, setShowNotification] = useState(false);
  const [semesterTabs, setSemesterTabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [defaultExpanded, setDefaultExpanded] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getAllStudentCourses();
        
        // Extract unique semNumbers from courses
        const semNumbersWithCourses = [...new Set(data.courses
          .map(course => course.semNumber || course.semester?.semNumber)
          .filter(semNum => semNum != null)
        )].sort((a, b) => a - b);
        
        // Find the maximum semester number (or use a default range like 1-8)
        const maxSemNumber = semNumbersWithCourses.length > 0 
          ? Math.max(...semNumbersWithCourses, 8) // Show at least up to 8, or max if higher
          : 8;
        
        // Create tabs for all semesters from 1 to maxSemNumber
        // All semesters with courses will be marked as accessible and selectable
        const tabs = [];
        for (let i = 1; i <= maxSemNumber; i++) {
          const hasCourses = semNumbersWithCourses.includes(i);
          tabs.push({
            semNumber: i,
            name: `SEMESTER ${i}`,
            accessible: hasCourses
          });
        }
        
        setSemesterTabs(tabs);
        
        // Set default expanded semester to first available semester (one with courses)
        if (semNumbersWithCourses.length > 0) {
          setDefaultExpanded([`semester-${semNumbersWithCourses[0]}`]);
        } else {
          setDefaultExpanded([]);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto p-6 max-w-7xl">
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center my-4">
        <h1 className="text-3xl font-bold dark:text-white text-gray-800">Student Dashboard</h1>
        <button
          onClick={() => setShowNotification(!showNotification)}
          className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Bell className="h-6 w-6 dark:text-white text-gray-600" />
          <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full"></span>
        </button>
      </div>

      {/* Notification Part */}
      {showNotification && (
        <div className="absolute right-4 mt-2 w-80 bg-white rounded-lg shadow-xl border p-4 z-10">
          <h3 className="font-semibold dark:text-white text-gray-800 mb-3">Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Book className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  New course material available
                </p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Accordion allowZeroExpanded preExpanded={defaultExpanded}>
        {semesterTabs.map((semester) => (
          <AccordionItem 
            key={`semester-${semester.semNumber}`} 
            uuid={`semester-${semester.semNumber}`}
            disabled={!semester.accessible}
          >
            <AccordionItemHeading>
              <AccordionItemButton 
                className={
                  semester.accessible
                    ? "dark:bg-gray-400 dark:text-white bg-white p-4 rounded-lg flex justify-between items-center text-xl font-semibold cursor-pointer"
                    : "dark:bg-gray-700 dark:text-white bg-gray-100 p-4 rounded-lg text-xl font-semibold cursor-not-allowed opacity-50"
                }
              >
                {semester.name}
              </AccordionItemButton>
            </AccordionItemHeading>
            {semester.accessible && (
              <AccordionItemPanel>
                <DashboardSemesterContent 
                  setActiveSection={setActiveSection} 
                  semNumber={semester.semNumber}
                />
              </AccordionItemPanel>
            )}
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
