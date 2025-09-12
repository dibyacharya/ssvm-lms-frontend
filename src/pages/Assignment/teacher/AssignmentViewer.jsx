import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  History,
  MoreVertical,
  Printer,
  Search,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCourse } from "../../../context/CourseContext";
import {
  getAssignmentById,
  updateAssignmentGrade,
} from "../../../services/assignment.service";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../../../utils/LoadingAnimation";

export default function AssignmentViewer() {
  const { courseData } = useCourse();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sortBy, setSortBy] = useState("all"); // "all", "turned-in", "missing"
  const [studentSubmissions, setStudentSubmissions] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [comment, setComment] = useState("");
  const [grade, setGrade] = useState("");
  const navigate = useNavigate();

  const { assignmentID } = useParams();

  useEffect(() => {
    // Fetch assignment data
    const fetchAssignmentData = async () => {
      if (!assignmentID) return;

      setLoading(true);
      try {
        const response = await getAssignmentById({ assignmentID });

        if (response.success && response.assignment) {
          setAssignment(response.assignment);
        } else {
          console.error("Failed to fetch assignment data:", response);
        }
      } catch (error) {
        console.error("Error fetching assignment data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentData();
  }, [assignmentID]);

  useEffect(() => {
    if (assignment && courseData?.students) {
      // Prepare student submission data by merging courseData.students with assignment.submissions
      const mergedData = courseData.students.map((student) => {
        const submission = assignment.submissions.find(
          (sub) => sub.student === student.id
        );

        return {
          ...student,
          submission: submission || null,
          status: submission ? "Turned in" : "Missing",
        };
      });

      setStudentSubmissions(mergedData);

      // Set the first student as selected by default
      if (mergedData.length > 0) {
        const firstStudent = mergedData[0];
        setSelectedStudent(firstStudent);

        // Set initial grade and comment based on first student's submission
        if (firstStudent.submission) {
          setGrade(firstStudent.submission.grade || "");
          setComment(firstStudent.submission.feedback || "");
        } else {
          setGrade("");
          setComment("");
        }
      }
    }
  }, [assignment, courseData]);

  // Filter students based on sort selection
  const filteredStudents = studentSubmissions.filter((student) => {
    if (sortBy === "turned-in") return student.status === "Turned in";
    if (sortBy === "missing") return student.status === "Missing";
    return true; // return all for "all" option
  });

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);

    // Reset grade and comment fields when switching students
    if (student.submission) {
      setGrade(student.submission.grade || "");
      setComment(student.submission.feedback || "");
    } else {
      setGrade("");
      setComment("");
    }

    // Reset to first page when switching documents
    setCurrentPage(1);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 10, 50));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar - Student List */}
      <div className="w-80 h-[98%] border-r flex flex-col bg-white">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 w-full text-green-600 hover:text-green-900   p-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">
            {assignment?.title || "Assignment"}
          </h2>

          <p className="text-sm text-blue-500 mt-1">
            Due:{" "}
            {assignment?.dueDate
              ? new Date(assignment.dueDate).toLocaleDateString()
              : "N/A"}
          </p>
        </div>

        <div className="p-2 border-b">
          <div className="flex gap-2 text-sm">
            <span className="text-gray-500">Sort by</span>
            <button
              className={`${
                sortBy === "all" ? "text-blue-600" : "hover:text-blue-600"
              }`}
              onClick={() => setSortBy("all")}
            >
              All
            </button>
            <button
              className={`${
                sortBy === "turned-in"
                  ? "text-green-600"
                  : "hover:text-green-600"
              }`}
              onClick={() => setSortBy("turned-in")}
            >
              Turned In
            </button>
            <button
              className={`${
                sortBy === "missing" ? "text-red-600" : "hover:text-red-600"
              }`}
              onClick={() => setSortBy("missing")}
            >
              Missing
            </button>
          </div>
        </div>

        <div className="overflow-auto flex-1">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className={`flex items-center gap-3 p-3 cursor-pointer ${
                selectedStudent?.id === student.id
                  ? "bg-emerald-50"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => handleStudentSelect(student)}
            >
              <div
                className={`h-8 w-8 flex items-center justify-center ${
                  student.status === "Turned in"
                    ? "bg-blue-100 text-green-600"
                    : "bg-gray-100 text-gray-600"
                } rounded-full`}
              >
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {student.rollNo} {student.name}
                </div>
                <div
                  className={`text-sm ${
                    student.status === "Turned in"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {student.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center - PDF Viewer */}
      <div className="flex-1 flex flex-col">
        {selectedStudent ? (
          selectedStudent.submission ? (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 flexjustify-center items-center">
                <iframe
                  src={selectedStudent.submission.submissionFile}
                  className="w-full h-[98%]"
                  style={{
                    zoom: `${zoomLevel}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex justify-center items-center">
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <h3 className="text-lg font-medium mb-1">No Submission</h3>
                <p className="text-gray-500">
                  This student hasn't submitted the assignment yet.
                </p>
              </div>
            </div>
          )
        ) : (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-center">
              <p>Please select a student to view their submission</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Grade & Comments */}
      <div className="w-80 h-[98%] border-l flex flex-col bg-white">
        {selectedStudent && (
          <div className="p-4 space-y-6">
            <div>
              <h3 className="font-medium mb-2">Student Details </h3>
              <div className="text-sm text-gray-500">
                {selectedStudent?.rollNo || ""} {selectedStudent?.name}
              </div>
            </div>

            {selectedStudent.submission && (
              <>
                <div>
                  <h3 className="font-medium mb-2">File Submission</h3>
                  <div className="text-sm text-gray-500 font-semibold">
                    Turned in on{" "}
                    {new Date(
                      selectedStudent.submission.submissionDate
                    ).toLocaleString()}
                  </div>

                  <div className="flex items-center gap-2 mt-2 text-emerald-600 text-sm  p-2 bg-emerald-100  rounded-lg">
                    <FileText className="h-4 w-4" />
                    <span>
                      {selectedStudent.submission.submissionFile
                        .split("/")
                        .pop()}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Grade</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      className="border border-emerald-400 hover:border-emerald-600 p-1 rounded w-20 text-center"
                      placeholder="0"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      min="0"
                      max={assignment.totalPoints}
                    />
                    <span className="text-sm text-gray-500">
                      /{assignment.totalPoints}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Report </h3>
                  <div className="flex flex-col gap-2">
                    <textarea
                      className="border  border-emerald-400 p-2 rounded resize-none hover:border-emerald-600"
                      placeholder="Add private comment..."
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                    <button
                      className={`bg-emerald-600 px-3 py-1 rounded text-white hover:bg-emerald-700 self-end ${
                        saveLoading
                          ? "bg-emerald-600/50 cursor-not-allowed hover:bg-emerald-700/50"
                          : ""
                      } `}
                      disabled={saveLoading}
                      onClick={async () => {
                        if (!selectedStudent?.submission?._id) return;

                        const gradeData = {
                          grade: grade !== "" ? Number(grade) : null,
                          feedback: comment,
                        };

                        try {
                          // Call the API with the correct parameters
                          setSaveLoading(true);
                          const result = await updateAssignmentGrade(
                            assignmentID, // Use the assignment ID from params
                            selectedStudent.submission._id, // Use the submission ID
                            gradeData
                          );

                          if (result.success) {
                            // Refresh the assignment data to get the updated submissions
                            const response = await getAssignmentById({
                              assignmentID,
                            });

                            if (response.success && response.assignment) {
                              setAssignment(response.assignment);

                              // Update student submissions with fresh data
                              const updatedMergedData = courseData.students.map(
                                (student) => {
                                  const updatedSubmission =
                                    response.assignment.submissions.find(
                                      (sub) => sub.student === student.id
                                    );

                                  return {
                                    ...student,
                                    submission: updatedSubmission || null,
                                    status: updatedSubmission
                                      ? "Turned in"
                                      : "Missing",
                                  };
                                }
                              );

                              setStudentSubmissions(updatedMergedData);

                              // Update selected student with fresh data
                              const updatedSelectedStudent =
                                updatedMergedData.find(
                                  (s) => s._id === selectedStudent._id
                                );

                              if (updatedSelectedStudent) {
                                setSelectedStudent(updatedSelectedStudent);
                              }
                            }
                          } else {
                            console.error(
                              "Failed to update grade:",
                              result.error
                            );
                            // Optionally add error feedback to the user here
                          }
                        } catch (error) {
                          console.error("Error updating grade:", error);
                          // Optionally add error feedback to the user here
                        } finally {
                          setSaveLoading(false);
                        }
                      }}
                    >
                      {saveLoading ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </>
            )}

            {!selectedStudent.submission && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Status</h3>
                <div className="p-3 bg-red-50 text-red-700 rounded-md">
                  <p>No submission received</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
