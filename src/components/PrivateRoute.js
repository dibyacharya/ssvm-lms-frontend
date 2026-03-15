import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Still loading auth state AND no cached user yet (first visit / after logout).
  // Show a lightweight spinner instead of redirecting to /login prematurely.
  if (loading && !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500" />
      </div>
    );
  }

  // No user at all (loading finished, localStorage was empty) → login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User exists but wrong role → root (which redirects to /login)
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
export default PrivateRoute;
