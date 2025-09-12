import React from "react";
import { FileText, Calendar, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const AssignmentCard = ({
  assignment,
  studentId,
  formatDate,
  courseID,
  index,
}) => {
  // Check if the assignment has been submitted by this student
  const hasSubmitted = assignment.submissions?.some(
    (sub) => sub.student === studentId
  );

  // Check if the assignment is past due
  const isPastDue = new Date(assignment.dueDate) - new Date() < 0;

  return (
    <div className="bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <FileText className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900">{assignment.title}</h3>
            <p className="text-gray-600 text-sm line-clamp-2 mt-1">
              {String(assignment.description).substring(0, 70) + "..."}
            </p>

            <div className="flex items-center space-x-2 mt-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                Due: {formatDate(assignment.dueDate)}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right flex flex-col items-end">
          {hasSubmitted ? (
            <span className="flex items-center space-x-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              <CheckCircle className="h-3 w-3" />
              <span>Submitted</span>
            </span>
          ) : isPastDue ? (
            <span className="flex items-center space-x-1 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
              <Clock className="h-3 w-3" />
              <span>Past Due</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
              <Clock className="h-3 w-3" />
              <span>Pending</span>
            </span>
          )}

          <p className="text-sm text-gray-500 mt-2">
            {assignment.totalPoints} points
          </p>

          <Link
            to={`/student/assignment/${courseID}/${index}`}
            className="text-green-600 hover:text-green-800 text-sm mt-3 inline-block"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AssignmentCard;
