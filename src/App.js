import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import TeacherDashboard from "./pages/TeacherDashboard/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard/StudentDashboard";
import { Toaster } from "react-hot-toast";
import LecturePanel from "./pages/lecture/LecturePanel";
import StudentProfilePage from "./pages/StudentDashboard/Components/ProfileSection";
import CourseManagement from "./pages/course/teacher/CourseManagement";
import AssignmentViewer from "./pages/Assignment/teacher/AssignmentViewer.jsx";
import ActivityViewer from "./pages/Activity/teacher/ActivityViewer.jsx";
import { CourseProvider } from "./context/CourseContext.js";
import EContentViewer from "./pages/Econtent/EcontentViewer.jsx";
import TeacherProfilePage from "./pages/TeacherDashboard/Components/TeacherProfile/TeacherProfilePage.jsx";

import StudentAssignmentSection from "./pages/Assignment/student/ShowAssignment.jsx";
import CourseDetails from "./pages/course/student/CourseDetails.jsx";
import UtilityProvider from "./context/UtilityContext.js";
import TeacherProfileSection from "./pages/TeacherDashboard/Components/TeacherProfile/TeacherProfileSection.jsx";
import StudentProfileSection from "./pages/StudentDashboard/Components/StudentProfileSection.jsx";
import ITS from "./pages/Its/Its.jsx";
import StudentAssignmentSectionCourse from "./pages/Assignment/ShowAssignmentCourse.jsx";
import { MeetingProvider } from "./context/MeetingContext.js";
const App = () => {
   useEffect(() => {
  const theme = localStorage.getItem("theme") || "light";
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}, []);
  return (
    <AuthProvider>
      <UtilityProvider>
        <CourseProvider>
          <MeetingProvider>
          <Router>
            <Layout />
          </Router>
          <Toaster position="top-right" reverseOrder={false} />
          </MeetingProvider>
        </CourseProvider>
      </UtilityProvider>
    </AuthProvider>
  );
};
const Layout = () => {
  const location = useLocation();
  const hideNavbarRoutes = ["/login", "/register"];

  return (
    <div className="min-h-screen dark:bg-gray-900 bg-white">
      {/* Conditionally render Navbar */}
      {/* {!hideNavbarRoutes.includes(location.pathname) && <Navbar />} */}

      <main className="mx-auto">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute roles={["admin"]}>hello admin !!</PrivateRoute>
            }
          />
          <Route
            path="/teacher/dashboard"
            element={
              <PrivateRoute roles={["teacher"]}>
                <TeacherDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/teacher/assignment/:assignmentID"
            element={
              <PrivateRoute roles={["teacher"]}>
                <AssignmentViewer />
              </PrivateRoute>
            }
          />
          <Route
            path="/teacher/activity/:activityID"
            element={
              <PrivateRoute roles={["teacher"]}>
                <ActivityViewer />
              </PrivateRoute>
            }
          />
          <Route
            path="/teacher/econtent/:courseId"
            element={
              <PrivateRoute roles={["teacher"]}>
                <EContentViewer />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/dashboard"
            element={
              <PrivateRoute roles={["student"]}>
                <StudentDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/profile/:studentID"
            element={
              <PrivateRoute roles={["student"]}>
                <StudentProfileSection />
              </PrivateRoute>
            }
          />
          <Route
            path="/teacher/profile/:teacherID"
            element={
              <PrivateRoute roles={["teacher"]}>
                <TeacherProfileSection />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/course/:courseID"
            element={
              <PrivateRoute roles={["student"]}>
                <CourseDetails />
              </PrivateRoute>
            }
          />
           <Route
            path="/its"
            element={
              <PrivateRoute roles={["student"]}>
                <ITS />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/assignment/:courseID/:selectedID"
            element={
              <PrivateRoute roles={["student"]}>
                <StudentAssignmentSectionCourse/>
              </PrivateRoute>
            }
          />

          <Route
            path="/teacher/course/:courseID"
            element={
              <PrivateRoute roles={["teacher"]}>
                <CourseManagement />
              </PrivateRoute>
            }
          />

          <Route
            path="/lectures/:courseID/:selectedID"
            element={
              <PrivateRoute>
                <LecturePanel />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
