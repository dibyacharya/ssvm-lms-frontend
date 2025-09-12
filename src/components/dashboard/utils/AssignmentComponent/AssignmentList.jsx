import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import AssignmentCard from "./AssignmentCard";
import { useCourse } from "../../../../context/CourseContext";
import { getAllCourseAssignments } from "../../../../services/assignment.service";
import LoadingSpinner from "../../../../utils/LoadingAnimation";

const AssignmentsList = ({setSelectedOption}) => {
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { courseData } = useCourse();
  const { courseID } = useParams();

  // Format date helper function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      const data = await getAllCourseAssignments({ courseID });
      setAssignments(data.assignments);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError("Failed to load assignments. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseID) {
      fetchAssignments();
    }
  }, [courseID]);

  if (isLoading) {
    return (
      <div className="p-4 text-center bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 dark:text-red-400 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg border border-red-200 dark:border-red-800">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 border border-gray-100 dark:border-gray-600">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Assignments</h2>
        <button
          onClick={() => {setSelectedOption("Recorded")}}
          className="text-accent1 dark:text-accent1/40 hover:text-accent1/70 dark:hover:text-ccent1/70 font-medium transition-colors duration-200"
        >
          View All
        </button>
      </div>

      <div className="space-y-4">
        {assignments?.length > 0 ? (
          assignments.map((assignment, index) => (
            <AssignmentCard
              key={assignment._id}
              assignment={assignment}
              studentId={courseData?.student?.id}
              formatDate={formatDate}
              courseID={courseID}
              index={index}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">No assignments available.</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">New assignments will appear here when they are created.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentsList;