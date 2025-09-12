import { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from "react-accessible-accordion";
import "react-accessible-accordion/dist/fancy-example.css";
import { Book, CheckSquare, Calendar, Bell } from "lucide-react";

import DashboardSemesterContent from "./DashBoardSemContent";

export default function DashboardSemester({ setActiveSection }) {
  const [showNotification, setShowNotification] = useState(false);

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

      <Accordion allowZeroExpanded preExpanded={["semester-1"]}>
        {/* Semester 1 - Active */}
        <AccordionItem uuid="semester-1">
          <AccordionItemHeading>
            <AccordionItemButton className="dark:bg-gray-400 dark:text-white bg-white p-4 rounded-lg flex justify-between items-center text-xl font-semibold cursor-pointer">
              SEMESTER 1
            </AccordionItemButton>
          </AccordionItemHeading>
          <AccordionItemPanel>
            <DashboardSemesterContent setActiveSection={setActiveSection} />
          </AccordionItemPanel>
        </AccordionItem>

        {/* Disabled Semesters */}
        {["semester-2", "semester-3", "semester-4"].map((sem) => (
          <AccordionItem key={sem} uuid={sem} disabled>
            <AccordionItemHeading>
              <AccordionItemButton className="dark:bg-gray-700 dark:text-white bg-gray-100 p-4 rounded-lg text-xl font-semibold cursor-not-allowed opacity-50">
                {sem.replace("-", " ").toUpperCase()}
              </AccordionItemButton>
            </AccordionItemHeading>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
