import React, { Suspense, useEffect } from "react";
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
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPasswordOtp from "./pages/auth/ResetPasswordOtp";
import TeacherDashboard from "./pages/TeacherDashboard/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard/StudentDashboard";
import { Toaster } from "react-hot-toast";
import LecturePanel from "./pages/lecture/LecturePanel";
import StudentProfilePage from "./pages/StudentDashboard/Components/ProfileSection";
import CourseManagement from "./pages/course/teacher/CourseManagement";
import AssignmentViewer from "./pages/Assignment/teacher/AssignmentViewer.jsx";
import TeacherAssignmentGrading from "./pages/Assignment/teacher/TeacherAssignmentGrading.jsx";
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
import { MeetingV2Provider } from "./context/MeetingV2Context.js";
import PublicHelpdeskIntake from "./pages/HelpDesk/PublicHelpdeskIntake.jsx";
import Profile from "./pages/Profile/Profile.jsx";

// ─── VConf pages (lazy-loaded — LiveKit only loads when needed) ───
const VconfMeetingRoom = React.lazy(() => import("./pages/vconf/MeetingRoom"));
const VconfSchedule = React.lazy(() => import("./pages/vconf/VconfSchedule"));
const VconfRecordings = React.lazy(() => import("./pages/vconf/VconfRecordings"));
const VconfTranscripts = React.lazy(() => import("./pages/vconf/VconfTranscripts"));
const VconfTranscriptViewer = React.lazy(() => import("./pages/vconf/VconfTranscriptViewer"));
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
          <MeetingV2Provider>
          <Router>
            <Layout />
          </Router>
          <Toaster position="top-right" reverseOrder={false} />
          </MeetingV2Provider>
        </CourseProvider>
      </UtilityProvider>
    </AuthProvider>
  );
};
const Layout = () => {
  const location = useLocation();
  const hideNavbarRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];

  return (
    <div
      className="min-h-screen kiitx-banner-bg"
      style={{ backgroundImage: "url(/loginbg.jpg)" }}
    >
      {/* Conditionally render Navbar */}
      {/* {!hideNavbarRoutes.includes(location.pathname) && <Navbar />} */}

      <main className="mx-auto">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPasswordOtp />} />
          <Route path="/helpdesk" element={<PublicHelpdeskIntake />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute roles={["student", "teacher"]}>
                <Profile />
              </PrivateRoute>
            }
          />
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
            path="/teacher/assignment/:assignmentId/grade"
            element={
              <PrivateRoute roles={["teacher"]}>
                <TeacherAssignmentGrading />
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
          {/* ─── VConf Routes (lazy-loaded) ─── */}
          <Route
            path="/vconf/meeting/:id"
            element={
              <PrivateRoute roles={["teacher", "student"]}>
                <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" /></div>}>
                  <VconfMeetingRoom />
                </Suspense>
              </PrivateRoute>
            }
          />
          <Route
            path="/vconf/schedule"
            element={
              <PrivateRoute roles={["teacher"]}>
                <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
                  <VconfSchedule />
                </Suspense>
              </PrivateRoute>
            }
          />
          <Route
            path="/vconf/recordings"
            element={
              <PrivateRoute roles={["teacher", "student"]}>
                <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
                  <VconfRecordings />
                </Suspense>
              </PrivateRoute>
            }
          />
          <Route
            path="/vconf/transcripts"
            element={
              <PrivateRoute roles={["teacher", "student"]}>
                <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
                  <VconfTranscripts />
                </Suspense>
              </PrivateRoute>
            }
          />
          <Route
            path="/vconf/recording/:id"
            element={
              <PrivateRoute roles={["teacher", "student"]}>
                <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
                  <VconfTranscriptViewer />
                </Suspense>
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
