import React, { Suspense, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import { Toaster } from "react-hot-toast";
import { CourseProvider } from "./context/CourseContext.js";
import UtilityProvider from "./context/UtilityContext.js";
import { MeetingV2Provider } from "./context/MeetingV2Context.js";

// ─── Auth pages (small, loaded eagerly for fast first paint) ───
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPasswordOtp from "./pages/auth/ResetPasswordOtp";

// ─── All other pages: lazy-loaded (code-split into separate chunks) ───
// This reduces main.js from ~3.6MB to ~500KB, dramatically improving load time.
const TeacherDashboard = React.lazy(() => import("./pages/TeacherDashboard/TeacherDashboard"));
const StudentDashboard = React.lazy(() => import("./pages/StudentDashboard/StudentDashboard"));
const LecturePanel = React.lazy(() => import("./pages/lecture/LecturePanel"));
const CourseManagement = React.lazy(() => import("./pages/course/teacher/CourseManagement"));
const CourseDetails = React.lazy(() => import("./pages/course/student/CourseDetails.jsx"));
const AssignmentViewer = React.lazy(() => import("./pages/Assignment/teacher/AssignmentViewer.jsx"));
const TeacherAssignmentGrading = React.lazy(() => import("./pages/Assignment/teacher/TeacherAssignmentGrading.jsx"));
const ActivityViewer = React.lazy(() => import("./pages/Activity/teacher/ActivityViewer.jsx"));
const EContentViewer = React.lazy(() => import("./pages/Econtent/EcontentViewer.jsx"));
const TeacherProfileSection = React.lazy(() => import("./pages/TeacherDashboard/Components/TeacherProfile/TeacherProfileSection.jsx"));
const StudentProfileSection = React.lazy(() => import("./pages/StudentDashboard/Components/StudentProfileSection.jsx"));
const ITS = React.lazy(() => import("./pages/Its/Its.jsx"));
const StudentAssignmentSectionCourse = React.lazy(() => import("./pages/Assignment/ShowAssignmentCourse.jsx"));
const PublicHelpdeskIntake = React.lazy(() => import("./pages/HelpDesk/PublicHelpdeskIntake.jsx"));
const Profile = React.lazy(() => import("./pages/Profile/Profile.jsx"));
const FeeGateWrapper = React.lazy(() => import("./components/fees/FeeGateWrapper"));

// ─── VConf pages (LiveKit only loads when needed) ───
const VconfMeetingRoom = React.lazy(() => import("./pages/vconf/MeetingRoom"));
const VconfSchedule = React.lazy(() => import("./pages/vconf/VconfSchedule"));
const VconfRecordings = React.lazy(() => import("./pages/vconf/VconfRecordings"));
const VconfTranscriptViewer = React.lazy(() => import("./pages/vconf/VconfTranscriptViewer"));

// ─── Exam pages ───
const ExamInterface = React.lazy(() => import("./pages/Exam/student/ExamInterface"));
const ExamLobby = React.lazy(() => import("./pages/Exam/student/ExamLobby"));
const ExamResult = React.lazy(() => import("./pages/Exam/student/ExamResult"));
const TeacherExamList = React.lazy(() => import("./pages/Exam/teacher/ExamList"));
const CreateExam = React.lazy(() => import("./pages/Exam/teacher/CreateExam"));
const ExamDetail = React.lazy(() => import("./pages/Exam/teacher/ExamDetail"));
const ExamGrading = React.lazy(() => import("./pages/Exam/teacher/ExamGrading"));
const LiveProctoringDashboard = React.lazy(() => import("./pages/Exam/teacher/LiveProctoringDashboard"));
const ProctoringReport = React.lazy(() => import("./pages/Exam/teacher/ProctoringReport"));
const QuestionBankManager = React.lazy(() => import("./pages/Exam/teacher/QuestionBankManager"));
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
// Auth-aware catch-all: logged-in → dashboard, not logged-in → login
const AuthRedirect = () => {
  const { user } = useAuth();
  if (user) {
    const dashPath = user.role === "admin" ? "/admin"
      : user.role === "teacher" ? "/teacher/dashboard"
      : "/student/dashboard";
    return <Navigate to={dashPath} replace />;
  }
  return <Navigate to="/login" replace />;
};

const Layout = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const hideNavbarRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];

  // If loading AND no cached user (first visit / after logout), show spinner
  // to prevent route evaluation before auth is resolved.
  if (loading && !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen kiitx-banner-bg"
      style={{ backgroundImage: "url(/loginbg.jpg)" }}
    >
      {/* Conditionally render Navbar */}
      {/* {!hideNavbarRoutes.includes(location.pathname) && <Navbar />} */}

      <main className="mx-auto">
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500" /></div>}>
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
                <FeeGateWrapper>
                  <StudentDashboard />
                </FeeGateWrapper>
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
          {/* ─── Exam Routes (Student) ─── */}
          <Route
            path="/exam/:examId/lobby"
            element={
              <PrivateRoute roles={["student"]}>
                <ExamLobby />
              </PrivateRoute>
            }
          />
          <Route
            path="/exam/:examId/take"
            element={
              <PrivateRoute roles={["student"]}>
                <ExamInterface />
              </PrivateRoute>
            }
          />
          <Route
            path="/exam/:examId/result"
            element={
              <PrivateRoute roles={["student"]}>
                <ExamResult />
              </PrivateRoute>
            }
          />

          {/* ─── Exam Routes (Teacher) ─── */}
          <Route
            path="/teacher/exams/:courseId"
            element={
              <PrivateRoute roles={["teacher"]}>
                <TeacherExamList />
              </PrivateRoute>
            }
          />
          <Route
            path="/teacher/exam/create/:courseId"
            element={
              <PrivateRoute roles={["teacher"]}>
                <CreateExam />
              </PrivateRoute>
            }
          />
          <Route
            path="/teacher/exam/:examId"
            element={
              <PrivateRoute roles={["teacher"]}>
                <ExamDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/teacher/exam/:examId/grade"
            element={
              <PrivateRoute roles={["teacher"]}>
                <ExamGrading />
              </PrivateRoute>
            }
          />
          <Route
            path="/teacher/exam/:examId/live"
            element={
              <PrivateRoute roles={["teacher"]}>
                <LiveProctoringDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/teacher/exam/:examId/proctoring/:studentId"
            element={
              <PrivateRoute roles={["teacher"]}>
                <ProctoringReport />
              </PrivateRoute>
            }
          />
          <Route
            path="/teacher/question-bank/:courseId"
            element={
              <PrivateRoute roles={["teacher"]}>
                <QuestionBankManager />
              </PrivateRoute>
            }
          />

          {/* ─── VConf Routes ─── */}
          <Route
            path="/vconf/meeting/:id"
            element={
              <PrivateRoute roles={["teacher", "student"]}>
                <VconfMeetingRoom />
              </PrivateRoute>
            }
          />
          <Route
            path="/vconf/schedule"
            element={
              <PrivateRoute roles={["teacher"]}>
                <VconfSchedule />
              </PrivateRoute>
            }
          />
          <Route
            path="/vconf/recordings"
            element={
              <PrivateRoute roles={["teacher", "student"]}>
                <VconfRecordings />
              </PrivateRoute>
            }
          />
          <Route
            path="/vconf/recording/:id"
            element={
              <PrivateRoute roles={["teacher", "student"]}>
                <VconfTranscriptViewer />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<AuthRedirect />} />
          <Route path="*" element={<AuthRedirect />} />
        </Routes>
        </Suspense>
      </main>
    </div>
  );
};

export default App;
