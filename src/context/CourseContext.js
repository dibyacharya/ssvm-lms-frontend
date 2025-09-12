import React, { createContext, useContext, useState } from "react";

// Initial course data
const initialCourseData = {
  aboutCourse:
    "This is an introductory course in Computer Science that covers fundamental programming concepts, algorithms, and data structures. Students will learn problem-solving approaches, fundamental programming concepts, and the basics of software development. The course includes hands-on coding exercises and practical projects.",

  creditPoints: {
    lecture: 30,
    tutorial: 15,
    practical: 25,
    project: 30,
  },

  learningOutcomes: [
    "LO1: Demonstrate understanding of fundamental programming concepts and principles",
    "LO2: Apply problem-solving techniques to develop algorithmic solutions",
    "LO3: Design and implement basic software applications using modern programming languages",
    "LO4: Analyze and debug programs using professional development tools",
    "LO5: Understand and implement fundamental data structures and algorithms",
  ],

  // New weekly plan data
  weeklyPlan: [
    {
      weekNumber: 1,
      topics: [
        "Weather apps",
        "Digital assistants",
        "Software that analyzes data to optimize a given business function",
      ],
    },
    {
      weekNumber: 2,
      topics: [
        "Weather apps",
        "Digital assistants",
        "Software that analyzes data to optimize a given business function",
      ],
    },
    {
      weekNumber: 3,
      topics: [
        "Weather apps",
        "Digital assistants",
        "Software that analyzes data to optimize a given business function",
      ],
    },
  ],

  // syllabus
  syllabus: [
    {
      moduleNumber: 1,
      moduleTitle: "Introduction to Programming",
      topics: [
        "Basic Programming Concepts",
        "Variables and Data Types",
        "Control Structures",
      ],
    },
    {
      moduleNumber: 2,
      moduleTitle: "Data Structures",
      topics: ["Arrays and Lists", "Stacks and Queues", "Trees and Graphs"],
    },
  ],
  //schedule
  courseSchedule: {
    classStartDate: "",
    classEndDate: "",
    midSemesterExamDate: "",
    endSemesterExamDate: "",
    classDaysAndTimes: [
      {
        day: "Monday",
        time: "6 pm to 7.30 pm",
      },
      {
        day: "Wednesday",
        time: "6 pm to 7.30 pm",
      },
    ],
  },
  //attendance
  attendance: {
    // Structure: { '2025-02-25_18:00': ['student1', 'student2'] }
    sessions: {
      "2025-02-10_18:00": ["student008", "student010"],
      "2025-02-12_18:00": ["student007", "student009", "student010"],
      "2025-02-17_18:00": [
        "student001",
        "student003",
        "student004",
        "student006",
        "student007",
        "student008",
        "student009",
      ],
      "2025-02-19_18:00": [
        "student002",
        "student003",
        "student004",

        "student010",
      ],
      "2025-02-24_18:00": [
        "student001",
        "student002",
        "student003",
        "student005",
        "student007",
        "student009",
        "student010",
      ],
    },
  },
  students: [
    {
      id: "student001",
      rollNo: "CS101",
      name: "John Smith",
      program: "Computer Science",
    },
    {
      id: "student002",
      rollNo: "CS102",
      name: "Emily Johnson",
      program: "Computer Science",
    },
    {
      id: "student003",
      rollNo: "CS103",
      name: "Michael Brown",
      program: "Computer Science",
    },
    {
      id: "student004",
      rollNo: "CS104",
      name: "Sarah Davis",
      program: "Computer Science",
    },
    {
      id: "student005",
      rollNo: "CS105",
      name: "David Wilson",
      program: "Computer Science",
    },
    {
      id: "student006",
      rollNo: "CS106",
      name: "Jessica Martinez",
      program: "Computer Science",
    },
    {
      id: "student007",
      rollNo: "CS107",
      name: "Robert Taylor",
      program: "Computer Science",
    },
    {
      id: "student008",
      rollNo: "CS108",
      name: "Jennifer Anderson",
      program: "Computer Science",
    },
    {
      id: "student009",
      rollNo: "CS109",
      name: "Christopher Thomas",
      program: "Computer Science",
    },
    {
      id: "student010",
      rollNo: "CS110",
      name: "Amanda Jackson",
      program: "Computer Science",
    },
  ],
};

// Create the context
const CourseContext = createContext();

// Create the provider component
export const CourseProvider = ({ children }) => {
  const [courseData, setCourseData] = useState(initialCourseData);

  // Calculate total credit points
  const totalCredits = Object.values(courseData.creditPoints || {}).reduce(
    (acc, curr) => acc + curr,
    0
  );

  // Existing functions
  const updateAboutCourse = (newAboutCourse) => {
    setCourseData((prev) => ({
      ...prev,
      aboutCourse: newAboutCourse,
    }));
  };

  const updateCreditPoints = (type, value) => {
    setCourseData((prev) => ({
      ...prev,
      creditPoints: {
        ...prev.creditPoints,
        [type]: value,
      },
    }));
  };

  const addLearningOutcome = (newOutcome) => {
    setCourseData((prev) => ({
      ...prev,
      learningOutcomes: [...prev.learningOutcomes, newOutcome],
    }));
  };

  const updateLearningOutcome = (index, newOutcome) => {
    setCourseData((prev) => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes.map((outcome, i) =>
        i === index ? newOutcome : outcome
      ),
    }));
  };

  const removeLearningOutcome = (index) => {
    setCourseData((prev) => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes.filter((_, i) => i !== index),
    }));
  };

  // New weekly plan functions
  const addWeek = () => {
    setCourseData((prev) => ({
      ...prev,
      weeklyPlan: [
        ...prev.weeklyPlan,
        {
          weekNumber: prev.weeklyPlan.length + 1,
          topics: [],
        },
      ],
    }));
  };

  const updateWeek = (weekNumber, newTopics) => {
    setCourseData((prev) => ({
      ...prev,
      weeklyPlan: prev.weeklyPlan.map((week) =>
        week.weekNumber === weekNumber ? { ...week, topics: newTopics } : week
      ),
    }));
  };

  const removeWeek = (weekNumber) => {
    setCourseData((prev) => ({
      ...prev,
      weeklyPlan: prev.weeklyPlan
        .filter((week) => week.weekNumber !== weekNumber)
        .map((week, index) => ({
          ...week,
          weekNumber: index + 1,
        })),
    }));
  };

  const reorderWeeks = (startIndex, endIndex) => {
    setCourseData((prev) => {
      const newWeeklyPlan = Array.from(prev.weeklyPlan);
      const [removed] = newWeeklyPlan.splice(startIndex, 1);
      newWeeklyPlan.splice(endIndex, 0, removed);

      // Update week numbers
      return {
        ...prev,
        weeklyPlan: newWeeklyPlan.map((week, index) => ({
          ...week,
          weekNumber: index + 1,
        })),
      };
    });
  };

  // Add a new module
  const addModule = () => {
    setCourseData((prev) => ({
      ...prev,
      syllabus: [
        ...prev.syllabus,
        {
          moduleNumber: prev.syllabus.length + 1,
          moduleTitle: "New Module",
          topics: [],
        },
      ],
    }));
  };

  // Update module title
  const updateModuleTitle = (moduleNumber, newTitle) => {
    setCourseData((prev) => ({
      ...prev,
      syllabus: prev.syllabus.map((module) =>
        module.moduleNumber === moduleNumber
          ? { ...module, moduleTitle: newTitle }
          : module
      ),
    }));
  };

  // Add topic to a module
  const addTopicToModule = (moduleNumber) => {
    setCourseData((prev) => ({
      ...prev,
      syllabus: prev.syllabus.map((module) =>
        module.moduleNumber === moduleNumber
          ? { ...module, topics: [...module.topics, "New Topic"] }
          : module
      ),
    }));
  };

  // Update topic in a module
  const updateTopic = (moduleNumber, topicIndex, newTopic) => {
    setCourseData((prev) => ({
      ...prev,
      syllabus: prev.syllabus.map((module) =>
        module.moduleNumber === moduleNumber
          ? {
              ...module,
              topics: module.topics.map((topic, index) =>
                index === topicIndex ? newTopic : topic
              ),
            }
          : module
      ),
    }));
  };

  // Remove topic from a module
  const removeTopic = (moduleNumber, topicIndex) => {
    setCourseData((prev) => ({
      ...prev,
      syllabus: prev.syllabus.map((module) =>
        module.moduleNumber === moduleNumber
          ? {
              ...module,
              topics: module.topics.filter((_, index) => index !== topicIndex),
            }
          : module
      ),
    }));
  };

  // Remove an entire module
  const removeModule = (moduleNumber) => {
    setCourseData((prev) => ({
      ...prev,
      syllabus: prev.syllabus
        .filter((module) => module.moduleNumber !== moduleNumber)
        .map((module, index) => ({
          ...module,
          moduleNumber: index + 1,
        })),
    }));
  };

  // Reorder modules
  const reorderModules = (startIndex, endIndex) => {
    setCourseData((prev) => {
      const newSyllabus = Array.from(prev.syllabus);
      const [removed] = newSyllabus.splice(startIndex, 1);
      newSyllabus.splice(endIndex, 0, removed);

      return {
        ...prev,
        syllabus: newSyllabus.map((module, index) => ({
          ...module,
          moduleNumber: index + 1,
        })),
      };
    });
  };

  // Update course dates
  const updateCourseDate = (dateType, newDate) => {
    setCourseData((prev) => ({
      ...prev,
      courseSchedule: {
        ...prev.courseSchedule,
        [dateType]: newDate,
      },
    }));
  };

  // Add new class day and time
  const addClassDayAndTime = (newDay, newTime) => {
    setCourseData((prev) => ({
      ...prev,
      courseSchedule: {
        ...prev.courseSchedule,
        classDaysAndTimes: [
          ...prev.courseSchedule.classDaysAndTimes,
          { day: newDay, time: newTime },
        ],
      },
    }));
  };

  // Update existing class day and time
  const updateClassDayAndTime = (index, updatedDay, updatedTime) => {
    setCourseData((prev) => ({
      ...prev,
      courseSchedule: {
        ...prev.courseSchedule,
        classDaysAndTimes: prev.courseSchedule.classDaysAndTimes.map(
          (item, i) =>
            i === index ? { day: updatedDay, time: updatedTime } : item
        ),
      },
    }));
  };

  // Remove class day and time
  const removeClassDayAndTime = (index) => {
    setCourseData((prev) => ({
      ...prev,
      courseSchedule: {
        ...prev.courseSchedule,
        classDaysAndTimes: prev.courseSchedule.classDaysAndTimes.filter(
          (_, i) => i !== index
        ),
      },
    }));
  };

  // Create a new attendance session for a specific date and time
  const createAttendanceSession = (date, time) => {
    const sessionKey = `${date}_${time}`;

    setCourseData((prev) => {
      // Check if the session already exists
      if (prev.attendance.sessions[sessionKey]) {
        return prev; // Session already exists, no change
      }

      return {
        ...prev,
        attendance: {
          ...prev.attendance,
          sessions: {
            ...prev.attendance.sessions,
            [sessionKey]: [],
          },
        },
      };
    });
  };

  // Mark a student as present for a session
  const markStudentPresent = (date, time, studentId) => {
    const sessionKey = `${date}_${time}`;

    setCourseData((prev) => {
      // If session doesn't exist, create it
      if (!prev.attendance.sessions[sessionKey]) {
        return {
          ...prev,
          attendance: {
            ...prev.attendance,
            sessions: {
              ...prev.attendance.sessions,
              [sessionKey]: [studentId],
            },
          },
        };
      }

      // If student is already marked present, no change
      if (prev.attendance.sessions[sessionKey].includes(studentId)) {
        return prev;
      }

      // Add student to the attendance list
      return {
        ...prev,
        attendance: {
          ...prev.attendance,
          sessions: {
            ...prev.attendance.sessions,
            [sessionKey]: [...prev.attendance.sessions[sessionKey], studentId],
          },
        },
      };
    });
  };

  // Mark a student as absent (remove from attendance)
  const markStudentAbsent = (date, time, studentId) => {
    const sessionKey = `${date}_${time}`;

    setCourseData((prev) => {
      // If session doesn't exist, no change
      if (!prev.attendance.sessions[sessionKey]) {
        return prev;
      }

      // Remove student from the attendance list
      return {
        ...prev,
        attendance: {
          ...prev.attendance,
          sessions: {
            ...prev.attendance.sessions,
            [sessionKey]: prev.attendance.sessions[sessionKey].filter(
              (id) => id !== studentId
            ),
          },
        },
      };
    });
  };

  // Get attendance for a specific session
  const getSessionAttendance = (date, time) => {
    const sessionKey = `${date}_${time}`;
    return courseData.attendance.sessions[sessionKey] || [];
  };

  // Remove an entire attendance session
  const removeAttendanceSession = (date, time) => {
    const sessionKey = `${date}_${time}`;

    setCourseData((prev) => {
      const updatedSessions = { ...prev.attendance.sessions };
      delete updatedSessions[sessionKey];

      return {
        ...prev,
        attendance: {
          ...prev.attendance,
          sessions: updatedSessions,
        },
      };
    });
  };

  // Get attendance rate for a specific student
  const getStudentAttendanceRate = (studentId) => {
    const sessions = Object.values(courseData.attendance.sessions);
    const totalSessions = sessions.length;

    if (totalSessions === 0) {
      return 0;
    }

    const attendedSessions = sessions.filter((session) =>
      session.includes(studentId)
    ).length;

    return (attendedSessions / totalSessions) * 100;
  };

  const value = {
    courseData,
    totalCredits,
    setCourseData,
    updateAboutCourse,
    updateCreditPoints,
    addLearningOutcome,
    updateLearningOutcome,
    removeLearningOutcome,
    // Add new weekly plan functions to context
    addWeek,
    updateWeek,
    removeWeek,
    reorderWeeks,
    // new syllabus
    addModule,
    updateModuleTitle,
    addTopicToModule,
    updateTopic,
    removeTopic,
    removeModule,
    reorderModules,
    // schedule
    updateCourseDate,
    addClassDayAndTime,
    updateClassDayAndTime,
    removeClassDayAndTime,
    // attendance
    createAttendanceSession,
    markStudentPresent,
    markStudentAbsent,
    getSessionAttendance,
    removeAttendanceSession,
    getStudentAttendanceRate,
  };

  return (
    <CourseContext.Provider value={value}>{children}</CourseContext.Provider>
  );
};

// Custom hook for using the course context
export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error("useCourse must be used within a CourseProvider");
  }
  return context;
};

export default CourseContext;
