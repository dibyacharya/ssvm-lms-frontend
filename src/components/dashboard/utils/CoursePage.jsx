import { useState } from "react";
import { Menu } from "@headlessui/react";
import { Plus, Share2, MoreVertical } from "lucide-react";
import AllAssignments from "../../../pages/Assignment/teacher/AllAssignments";

export default function CoursePage({ course, goBack }) {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="w-full text-right">
        <button onClick={goBack} className="mb-4 text-blue-600 hover:underline">
          ← Back to Courses
        </button>
      </div>

      <div className="border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex space-x-4 max-w-md">
            {["Stream", "Classwork", "People", "Grades"].map((tab) => (
              <button
                key={tab}
                className="py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>
      <AllAssignments course={course} />
    </div>
  );
}
