import { useState } from "react";

import CoursePage from "./CoursePage";

export default function ClassroomUI() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const courses = [
    { id: 1, name: "Web Development", instructor: "John Doe" },
    { id: 2, name: "Machine Learning", instructor: "Jane Smith" },
    { id: 3, name: "Data Structures", instructor: "Mike Johnson" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Tabs */}

      {/* Main Content */}
      <div className="min-h-screen bg-gray-100 p-6">
        {!selectedCourse ? (
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Classroom Courses</h2>
            <div className="grid gap-4">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className="p-4 bg-white shadow rounded flex justify-between items-center hover:bg-gray-200 transition"
                >
                  <span className="text-lg font-medium">{course.name}</span>
                  <span className="text-sm text-gray-500">
                    Instructor: {course.instructor}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <CoursePage
            course={selectedCourse}
            goBack={() => setSelectedCourse(null)}
          />
        )}
      </div>
    </div>
  );
}
