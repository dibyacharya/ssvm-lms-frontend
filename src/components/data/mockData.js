export const users = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "teacher",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "student",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  },
];

export const courses = [
  {
    id: "67ced946336b26a72c266eba",
    title: "Fundamentals of Probability & Statistics.",
    description: "",
    teacherId: "2",
    progress: 45,
    coverImage:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&h=600&fit=crop",
    instructor: "Prof. John Smith",
    available: true,
    present: 65,
    absent: 35,
  },
  {
    id: "67d26e271b4d82a5efc297a2",
    title: "CONCRETE TECHNOLOGY",
    description: "Learn the fundamentals of computer science and programming.",
    teacherId: "1",
    progress: 75,
    coverImage:
      "https://cdn.prod.website-files.com/6320bb946c79f421bd3b702f/635abdd77f2120df035e8f4d_MPC_mixing_concrete.jpeg",
    instructor: "Prof. Ipsita Mohanty",
    available: true,
    present: 70,
    absent: 30,
  },

  {
    id: "67aefa1599e012c6bd6cf995",
    title: "Engineering Materials ",
    description: "Full-stack JavaScript Development",
    teacherId: "1",
    progress: 45,
    coverImage:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60",
    instructor: "Dr. Emily Chen",
    available: true,
    present: 90,
    absent: 10,
  },
  {
    id: "67aefa1599e012c6bd6cf995",
    title: "Fluid Mechanics and Machineries",
    description: "Full-stack JavaScript Development",
    teacherId: "1",
    progress: 45,
    coverImage:
      "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=1200&h=600&fit=crop",
    instructor: "Dr. Emily Chen",
    available: true,
    present: 90,
    absent: 10,
  },
  {
    id: "67aefa1599e012c6bd6cf995",
    title: "Business communication ",
    description: "Full-stack JavaScript Development",
    teacherId: "1",
    progress: 45,
    coverImage:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&h=600&fit=crop",
    instructor: "Dr. Emily Chen",
    available: true,
    sessional: true,
    present: 90,
    absent: 10,
  },
];

export const lectures = [
  {
    id: "1",
    courseId: "1",
    title: "Introduction to Programming",
    content: "Learn the basics of programming concepts.",
    videoUrl: "https://example.com/video1",
    date: "2024-02-15",
  },
  {
    id: "2",
    courseId: "1",
    title: "Variables and Data Types",
    content: "Understanding different types of data in programming.",
    videoUrl: "https://example.com/video2",
    date: "2024-02-17",
  },
];

export const assignments = [
  {
    id: "1",
    courseId: "1",
    title: "Programming Basics Quiz",
    description: "Test your knowledge of basic programming concepts.",
    dueDate: "2024-02-20",
    totalPoints: 100,
    submittedDate: "2024-03-19",
    course: "Advanced Mathematics",
    status: "submitted",
  },
  {
    id: "2",
    courseId: "1",
    title: "First Coding Project",
    description: "Create a simple calculator program.",
    dueDate: "2024-02-25",
    totalPoints: 150,
    course: "Web Development",
    submittedDate: null,
  },
];

export const submissions = [
  {
    id: "1",
    assignmentId: "1",
    studentId: "2",
    submissionDate: "2024-02-19",
    content: "My quiz answers...",
    grade: 85,
    feedback: "Good work! Keep practicing.",
  },
];

export const attendance = [
  {
    id: "1",
    courseId: "1",
    studentId: "2",
    date: "2024-02-15",
    status: "present",
  },
  {
    id: "2",
    courseId: "1",
    studentId: "2",
    date: "2024-02-17",
    status: "absent",
  },
];
export const events = [
  {
    id: 1,
    name: "Two day International Conference on “Utilization of Indigenous Knowledge ...",
    description: "",
    date: "2024-02-13",
    time: "8:00",
    image: "../ICSSR-1024x634.jpg",
    location: "Virtual",
    link: "https://kiit.ac.in/event/two-day-international-conference-on-utilization-of-indigenous-knowledge-of-particularly-vulnerable-tribal-groups-for-an-inclusive-viksit-bharat/",
  },
  {
    id: 2,
    name: "5th International Conference on Management Research",
    description: "",
    date: "2024-03-23",
    time: "16:00",
    image: "../icmr.jpeg",
    location: "Library Room 204",
    link: "https://kiit.ac.in/event/5th-international-conference-on-management-research/",
  },
];

export const eContent = {
  success: true,
  courseId: "67c5b346218632a1be09223b",
  eContent: {
    _id: "67c846b8f13c1a3613970797",
    course: "67c5b346218632a1be09223b",
    modules: [
      {
        moduleNumber: 1,
        moduleTitle: "Introduction to Course",
        link: "http://localhost:4000/api/course/64a6e2b0d7dca1234abcdef/econtent",
        files: [
          {
            fileType: "pdf",
            fileUrl:
              "https://fileuploadbackend.s3.ap-south-1.amazonaws.com/econtent-files/1741178552409-dhamm_Ai_venktesh_doc.pdf",
            fileKey: "econtent-files/1741178552409-dhamm_Ai_venktesh_doc.pdf",
            fileName: "dhamm_Ai_venktesh_doc.pdf",
            uploadDate: "2025-03-05T12:42:37.949Z",
            _id: "67c846bdf13c1a3613970799",
          },
          {
            fileType: "pptx",
            fileUrl: "./Teacher_LMS(2).pptx",
            fileKey: "econtent-files/Teacher_LMS(2).pptx",
            fileName: "Teacher_LMS(2).pptx",
            uploadDate: "2025-03-05T12:42:37.949Z",
            _id: "67c846bdf13c1a3613970799",
          },
        ],
        _id: "67c846bdf13c1a3613970798",
      },
      {
        moduleNumber: 1,
        moduleTitle: "Course Analysis",
        link: "http://localhost:4000/api/course/64a6e2b0d7dca1234abcdef/econtent",
        files: [
          {
            fileType: "pdf",
            fileUrl:
              "https://fileuploadbackend.s3.ap-south-1.amazonaws.com/econtent-files/1741178552409-dhamm_Ai_venktesh_doc.pdf",
            fileKey: "econtent-files/1741178552409-dhamm_Ai_venktesh_doc.pdf",
            fileName: "dhamm_Ai_venktesh_doc.pdf",
            uploadDate: "2025-03-05T12:42:37.949Z",
            _id: "67c846bdf13c1a3613970799",
          },
          {
            fileType: "pdf",
            fileUrl:
              "https://fileuploadbackend.s3.ap-south-1.amazonaws.com/econtent-files/1741178552409-dhamm_Ai_venktesh_doc.pdf",
            fileKey: "econtent-files/1741178552409-dhamm_Ai_venktesh_doc.pdf",
            fileName: "dhamm_Ai_venktesh2_doc.pdf",
            uploadDate: "2025-03-05T12:42:37.949Z",
            _id: "67c846bdf13c1a3613970799",
          },
        ],
        _id: "67c846bdf13c1a3613970798",
      },
      {
        moduleNumber: 2,
        moduleTitle: "Course 2",
        link: [
          "http://localhost:4000/api/course/64a6e2b0d7dca1234abcdef/econtent",
          "http://localhost:4000/api/course/64a6e2b0d7dca1234abcdef/econtent2",
          "http://localhost:4000/api/course/64a6e2b0d7dca1234abcdef/econtent3",
        ],
        files: [
          {
            fileType: "pdf",
            fileUrl:
              "https://fileuploadbackend.s3.ap-south-1.amazonaws.com/econtent-files/1741178552409-dhamm_Ai_venktesh_doc.pdf",
            fileKey: "econtent-files/1741178552409-dhamm_Ai_venktesh_doc.pdf",
            fileName: "dhamm_Ai_venktesh_doc.pdf",
            uploadDate: "2025-03-05T12:42:37.949Z",
            _id: "67c846bdf13c1a3613970799",
          },
          {
            fileType: "pdf",
            fileUrl:
              "https://fileuploadbackend.s3.ap-south-1.amazonaws.com/econtent-files/1741178552409-dhamm_Ai_venktesh_doc.pdf",
            fileKey: "econtent-files/1741178552409-dhamm_Ai_venktesh_doc.pdf",
            fileName: "dhamm_Ai_venktesh2_doc.pdf",
            uploadDate: "2025-03-05T12:42:37.949Z",
            _id: "67c846bdf13c1a3613970799",
          },
        ],
        _id: "67c846bdf13c1a3613970798",
      },
    ],
    createdAt: "2025-03-05T12:42:37.967Z",
    updatedAt: "2025-03-05T12:42:37.967Z",
    __v: 0,
  },
};
