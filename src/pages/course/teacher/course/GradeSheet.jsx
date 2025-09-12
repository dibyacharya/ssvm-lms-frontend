import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const StudentGradingTable = () => {
  const [students, setStudents] = useState([
    {
      id: 1,
      rollNumber: "2305016",
      name: "AGGARWAL SOUMIL",
      assignment1: 9,
      assignment2: 9,
      quiz1: 8,
      quiz2: 8,
      activity1: 9,
      activity2: 9,
      midSem: 18,
      endSem: 40,
    },
    {
      id: 2,
      rollNumber: "2305347",
      name: "AHUJA AASTHA",
      assignment1: 9,
      assignment2: 9,
      quiz1: 8,
      quiz2: 8,
      activity1: 4,
      activity2: 9,
      midSem: 19,
      endSem: 48,
    },
    {
      id: 3,
      rollNumber: "2305597",
      name: "ROUT ANANYA",
      assignment1: 9,
      assignment2: 8,
      quiz1: 6,
      quiz2: 8,
      activity1: 9,
      activity2: 9,
      midSem: 14,
      endSem: 43,
    },
    {
      id: 4,
      rollNumber: "2305605",
      name: "KANUNGO ARCHI",
      assignment1: 9,
      assignment2: 9,
      quiz1: 8,
      quiz2: 8,
      activity1: 9,
      activity2: 9,
      midSem: 18,
      endSem: 49,
    },
    {
      id: 5,
      rollNumber: "2305606",
      name: "CHANDA ARJU",
      assignment1: 4,
      assignment2: 7,
      quiz1: 8,
      quiz2: 8,
      activity1: 9,
      activity2: 9,
      midSem: 17,
      endSem: 42,
    },
  ]);

  // Function to calculate equivalent quiz (average of quiz1 and quiz2)
  const calculateEquivalentQuiz = (quiz1, quiz2) => {
    return Math.round((quiz1 + quiz2) / 2);
  };

  // Function to calculate equivalent assignment (average of assignment1 and assignment2)
  const calculateEquivalentAssignment = (assignment1, assignment2) => {
    return Math.round((assignment1 + assignment2) / 2);
  };

  // Function to calculate equivalent activity (average of activity1 and activity2)
  const calculateEquivalentActivity = (activity1, activity2) => {
    return Math.round((activity1 + activity2) / 2);
  };

  // Function to calculate total internal marks (sum of equivalentAssignment, equivalentQuiz, equivalentActivity)
  const calculateTotalInternal = (
    equivalentAssignment,
    equivalentQuiz,
    equivalentActivity
  ) => {
    return equivalentAssignment + equivalentQuiz + equivalentActivity;
  };

  // Function to calculate total 50 marks (total internal + mid-term)
  const calculateTotal50 = (totalInternal, midSem) => {
    return totalInternal + midSem;
  };

  // Function to calculate total 100 marks (total 50 + end-term)
  const calculateTotal100 = (total50, endSem) => {
    return total50 + endSem;
  };

  // Function to determine grade based on total 100 marks
  const determineGrade = (total100) => {
    if (total100 >= 90) return "O";
    if (total100 >= 80) return "E";
    if (total100 >= 70) return "A";
    if (total100 >= 60) return "B";
    if (total100 >= 50) return "C";
    if (total100 >= 40) return "D";
    return "F";
  };

  // Handle input change
  const handleInputChange = (id, field, value) => {
    const updatedStudents = students.map((student) => {
      if (student.id === id) {
        return { ...student, [field]: parseInt(value) || 0 };
      }
      return student;
    });
    setStudents(updatedStudents);
  };

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      students.map((student) => {
        const equivalentQuiz = calculateEquivalentQuiz(
          student.quiz1,
          student.quiz2
        );
        const equivalentAssignment = calculateEquivalentAssignment(
          student.assignment1,
          student.assignment2
        );
        const equivalentActivity = calculateEquivalentActivity(
          student.activity1,
          student.activity2
        );
        const totalInternal = calculateTotalInternal(
          equivalentAssignment,
          equivalentQuiz,
          equivalentActivity
        );
        const total50 = calculateTotal50(totalInternal, student.midSem);
        const total100 = calculateTotal100(total50, student.endSem);
        const grade = determineGrade(total100);

        return {
          "Sl.No": student.id,
          "Roll Number": student.rollNumber,
          Name: student.name,
          "Assignment-1 (10 Marks)": student.assignment1,
          "Assignment-2 (10 Marks)": student.assignment2,
          "Equivalent Assignment (Eqv 10 Marks)": equivalentAssignment,
          "Quiz-1 (10 Marks)": student.quiz1,
          "Quiz-2 (10 Marks)": student.quiz2,
          "Equivalent QUIZ (Eqv 10 Marks)": equivalentQuiz,
          "Activity-1 (10 Marks)": student.activity1,
          "Activity-2 (10 Marks)": student.activity2,
          "Activity (Eqv 10 Marks)": equivalentActivity,
          "Total Internal (30 Marks)": totalInternal,
          "Mid-Sem (20 Marks)": student.midSem,
          "Total (50 Marks)": total50,
          "END-SEM (50 Marks)": student.endSem,
          "Total (100 Marks)": total100,
          GRADE: grade,
        };
      })
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Student Grades");
    XLSX.writeFile(workbook, "student_grades.xlsx");
  };

  // Get grade color class
  const getGradeColorClass = (grade) => {
    switch (grade) {
      case "O":
        return "bg-green-500 text-white";
      case "E":
        return "bg-green-300";
      case "A":
        return "bg-yellow-300";
      case "B":
        return "bg-yellow-200";
      case "C":
        return "bg-orange-200";
      case "D":
        return "bg-orange-300";
      default:
        return "bg-red-400 text-white";
    }
  };

  return (
    <div className="relative -top-6 z-10 bg-gray-50">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Grade Sheet</h1>
        <button
          onClick={exportToExcel}
          className="bg-green-600 text-white px-6 py-2 rounded shadow-md hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          <span>Export to Excel</span>
        </button>
      </div>

      <div className="shadow-lg rounded-lg overflow-x-auto border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="sticky top-0 px-4 py-3 bg-gray-100 text-black text-left text-xs font-medium uppercase tracking-wider">
                Sl.No
              </th>
              <th className="sticky top-0 px-4 py-3 bg-gray-100 text-black text-left text-xs font-medium uppercase tracking-wider">
                Roll Number
              </th>
              <th className="sticky top-0 px-4 py-3 bg-gray-100 text-black text-left text-xs font-medium uppercase tracking-wider">
                Name
              </th>

              <th className="sticky top-0 px-4 py-3 bg-gray-100 text-black text-center text-xs font-medium uppercase tracking-wider">
                <div>AssiG-1</div>
                <div className="text-gray-500 text-xs">(10 Marks)</div>
              </th>
              <th className="sticky top-0 px-4 py-3 bg-gray-100 text-black text-center text-xs font-medium uppercase tracking-wider">
                <div>Assig-2</div>
                <div className="text-gray-500 text-xs">(10 Marks)</div>
              </th>

              <th className="sticky top-0 px-4 py-3 bg-green-600 text-white text-center text-xs font-medium uppercase tracking-wider">
                <div>Equiv.</div>
                <div>Assignment</div>
                <div className="text-green-200 text-xs">(10 Marks)</div>
              </th>

              <th className="sticky top-0 px-4 py-3 bg-gray-100 text-black text-center text-xs font-medium uppercase tracking-wider">
                <div>Quiz-1</div>
                <div className="text-gray-500 text-xs">(10 Marks)</div>
              </th>
              <th className="sticky top-0 px-4 py-3 bg-gray-100 text-black text-center text-xs font-medium uppercase tracking-wider">
                <div>Quiz-2</div>
                <div className="text-gray-500 text-xs">(10 Marks)</div>
              </th>

              <th className="sticky top-0 px-4 py-3 bg-green-600 text-white text-center text-xs font-medium uppercase tracking-wider">
                <div>Equiv.</div>
                <div>Quiz</div>
                <div className="text-green-200 text-xs">(10 Marks)</div>
              </th>

              <th className="sticky top-0 px-4 py-3 bg-gray-100 text-black text-center text-xs font-medium uppercase tracking-wider">
                <div>Activity-1</div>
                <div className="text-gray-500 text-xs">(10 Marks)</div>
              </th>
              <th className="sticky top-0 px-4 py-3 bg-gray-100 text-black text-center text-xs font-medium uppercase tracking-wider">
                <div>Activity-2</div>
                <div className="text-gray-500 text-xs">(10 Marks)</div>
              </th>

              <th className="sticky top-0 px-4 py-3 bg-green-600 text-white text-center text-xs font-medium uppercase tracking-wider">
                <div>Equiv</div>
                <div>Activity</div>
                <div className="text-green-200 text-xs">(10 Marks)</div>
              </th>

              <th className="sticky top-0 px-4 py-3 bg-green-600 text-white text-center text-xs font-medium uppercase tracking-wider">
                <div>Total Internal</div>
                <div className="text-green-200 text-xs">(30 Marks)</div>
              </th>

              <th className="sticky top-0 px-4 py-3 bg-gray-100 text-black text-center text-xs font-medium uppercase tracking-wider">
                <div>Mid-Sem</div>
                <div className="text-gray-500 text-xs">(20 Marks)</div>
              </th>

              <th className="sticky top-0 px-4 py-3 bg-green-600 text-white text-center text-xs font-medium uppercase tracking-wider">
                <div>Total</div>
                <div className="text-green-200 text-xs">(50 Marks)</div>
              </th>

              <th className="sticky top-0 px-4 py-3 bg-yellow-500 text-white text-center text-xs font-medium uppercase tracking-wider">
                <div>END-SEM</div>
                <div className="text-yellow-200 text-xs">(50 Marks)</div>
              </th>

              <th className="sticky top-0 px-4 py-3 bg-green-600 text-white text-center text-xs font-medium uppercase tracking-wider">
                <div>Total</div>
                <div className="text-green-200 text-xs">(100 Marks)</div>
              </th>

              <th className="sticky top-0 px-4 py-3 bg-gray-100 text-black text-center text-xs font-medium uppercase tracking-wider">
                <div>GRADE</div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student, index) => {
              const equivalentQuiz = calculateEquivalentQuiz(
                student.quiz1,
                student.quiz2
              );
              const equivalentAssignment = calculateEquivalentAssignment(
                student.assignment1,
                student.assignment2
              );
              const equivalentActivity = calculateEquivalentActivity(
                student.activity1,
                student.activity2
              );
              const totalInternal = calculateTotalInternal(
                equivalentAssignment,
                equivalentQuiz,
                equivalentActivity
              );
              const total50 = calculateTotal50(totalInternal, student.midSem);
              const total100 = calculateTotal100(total50, student.endSem);
              const grade = determineGrade(total100);

              return (
                <tr
                  key={student.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {student.id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {student.rollNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {student.name}
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={student.assignment1}
                      onChange={(e) =>
                        handleInputChange(
                          student.id,
                          "assignment1",
                          e.target.value
                        )
                      }
                      className="w-16 px-2 py-1 text-center border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
                    />
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={student.assignment2}
                      onChange={(e) =>
                        handleInputChange(
                          student.id,
                          "assignment2",
                          e.target.value
                        )
                      }
                      className="w-16 px-2 py-1 text-center border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
                    />
                  </td>

                  <td className="px-4 py-3 text-center bg-green-50 font-medium">
                    {equivalentAssignment}
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={student.quiz1}
                      onChange={(e) =>
                        handleInputChange(student.id, "quiz1", e.target.value)
                      }
                      className="w-16 px-2 py-1 text-center border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
                    />
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={student.quiz2}
                      onChange={(e) =>
                        handleInputChange(student.id, "quiz2", e.target.value)
                      }
                      className="w-16 px-2 py-1 text-center border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
                    />
                  </td>

                  <td className="px-4 py-3 text-center bg-green-50 font-medium">
                    {equivalentQuiz}
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={student.activity1}
                      onChange={(e) =>
                        handleInputChange(
                          student.id,
                          "activity1",
                          e.target.value
                        )
                      }
                      className="w-16 px-2 py-1 text-center border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
                    />
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={student.activity2}
                      onChange={(e) =>
                        handleInputChange(
                          student.id,
                          "activity2",
                          e.target.value
                        )
                      }
                      className="w-16 px-2 py-1 text-center border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
                    />
                  </td>

                  <td className="px-4 py-3 text-center bg-green-50 font-medium">
                    {equivalentActivity}
                  </td>

                  <td className="px-4 py-3 text-center bg-green-50 font-medium">
                    {totalInternal}
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={student.midSem}
                      onChange={(e) =>
                        handleInputChange(student.id, "midSem", e.target.value)
                      }
                      className="w-16 px-2 py-1 text-center border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
                    />
                  </td>

                  <td className="px-4 py-3 text-center bg-green-50 font-medium">
                    {total50}
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={student.endSem}
                      onChange={(e) =>
                        handleInputChange(student.id, "endSem", e.target.value)
                      }
                      className="w-16 px-2 py-1 text-center border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-yellow-50"
                    />
                  </td>

                  <td className="px-4 py-3 text-center bg-green-50 font-bold">
                    {total100}
                  </td>

                  <td
                    className={`px-4 py-3 text-center font-bold ${getGradeColorClass(
                      grade
                    )}`}
                  >
                    {grade}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-white p-4 rounded-lg shadow border border-gray-200">
        <h3 className="text-lg font-semibold mb-3">Grading System</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="flex items-center">
            <div className="w-6 h-6 rounded bg-green-500 mr-2"></div>
            <span>O: ≥90</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 rounded bg-green-300 mr-2"></div>
            <span>E: ≥80</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 rounded bg-yellow-300 mr-2"></div>
            <span>A: ≥70</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 rounded bg-yellow-200 mr-2"></div>
            <span>B: ≥60</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 rounded bg-orange-200 mr-2"></div>
            <span>C: ≥50</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 rounded bg-orange-300 mr-2"></div>
            <span>D: ≥40</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 rounded bg-red-400 mr-2"></div>
            <span>F: &lt;40</span>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>• Editable fields are highlighted with a light green background</p>
        <p>
          • Calculated fields (with green background) are automatically updated
        </p>
      </div>
    </div>
  );
};

export default StudentGradingTable;
