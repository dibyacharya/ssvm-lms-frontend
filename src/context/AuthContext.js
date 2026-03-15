import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from "react";
import { getMyProfile } from "../services/profile.service";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  // loading is ONLY true when we have NO cached user (first visit / after logout).
  // If localStorage has a user, render immediately — don't block on network.
  const [loading, setLoading] = useState(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    // Only block render if there's no cached user at all
    return !storedUser || !storedToken;
  });
  const hasRefreshed = useRef(false);

  // Refresh user data from backend on app mount (NON-BLOCKING)
  // This ensures admin-made changes (name, program, batch, etc.) propagate,
  // but the page renders immediately with cached localStorage data.
  useEffect(() => {
    const refreshUserFromBackend = async () => {
      const token = localStorage.getItem("token");
      if (!token || !user || hasRefreshed.current) {
        setLoading(false);
        return;
      }
      hasRefreshed.current = true;
      try {
        // skipAuthRedirect: true — on page refresh, if the backend is slow
        // (cold start) or the token just expired, we don't want the 401
        // interceptor to nuke localStorage and redirect to /login.  We handle
        // the failure gracefully here instead: the stale localStorage user
        // stays in state so the page renders where the user was.
        const profileData = await getMyProfile({ skipAuthRedirect: true });
        if (profileData) {
          setUser((prevUser) => {
            const userCore = profileData.user || {};
            const teacherProfile = profileData.teacherProfile || {};

            const refreshed = {
              ...prevUser,
              // Core user fields
              name: userCore.name || prevUser.name,
              email: userCore.email || prevUser.email,
              mobileNo: userCore.mobileNo || prevUser.mobileNo,
              gender: userCore.gender || prevUser.gender,
              designation: userCore.designation || prevUser.designation,
              profilePhotoUrl: userCore.profilePhotoUrl || prevUser.profilePhotoUrl,
              role: userCore.role || prevUser.role,
              roleKey: userCore.roleKey || prevUser.roleKey,
              isActive: userCore.isActive !== undefined ? userCore.isActive : prevUser.isActive,
              // Academic info (for students)
              academicProfile: userCore.academicProfile || prevUser.academicProfile,
              // Teacher-specific fields
              ...(prevUser.role === "teacher" ? {
                profTitle: teacherProfile.profTitle || prevUser.profTitle || "",
                profDesc: teacherProfile.profDesc || prevUser.profDesc || "",
                googleScholarLink: teacherProfile.googleScholarLink || prevUser.googleScholarLink || "",
                scopusLink: teacherProfile.scopusLink || prevUser.scopusLink || "",
                linkedInLink: teacherProfile.linkedInLink || prevUser.linkedInLink || "",
              } : {}),
            };
            localStorage.setItem("user", JSON.stringify(refreshed));
            return refreshed;
          });
        }
      } catch (error) {
        // If token is expired or invalid, don't crash — user stays on the
        // current page with stale data.  The next real API call will trigger
        // a proper 401 redirect via the interceptor.
        console.warn("AuthContext: Failed to refresh user from backend", error?.message);
      } finally {
        setLoading(false);
      }
    };

    refreshUserFromBackend();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Keep localStorage in sync with user state
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const login = (userData) => {
    setUser(userData.user);
    localStorage.setItem("user", JSON.stringify(userData.user));
    localStorage.setItem("token", userData.token);
    hasRefreshed.current = false; // Allow refresh on next mount
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    hasRefreshed.current = false;
  };

  const updateUser = (updatedUserData) => {
    setUser((prevUser) => {
      const mergedUser = { ...prevUser, ...updatedUserData };
      localStorage.setItem("user", JSON.stringify(mergedUser));
      return mergedUser;
    });
  };

  // Manual refresh — can be called from any component via useAuth().refreshUser()
  const refreshUser = useCallback(async () => {
    try {
      const profileData = await getMyProfile();
      if (profileData) {
        const academicSummary = profileData.academicSummary || {};
        const userCore = profileData.user || {};
        const teacherProfile = profileData.teacherProfile || {};

        setUser((prevUser) => {
          const refreshed = {
            ...prevUser,
            name: userCore.name || prevUser.name,
            email: userCore.email || prevUser.email,
            mobileNo: userCore.mobileNo || prevUser.mobileNo,
            gender: userCore.gender || prevUser.gender,
            designation: userCore.designation || prevUser.designation,
            profilePhotoUrl: userCore.profilePhotoUrl || prevUser.profilePhotoUrl,
            role: userCore.role || prevUser.role,
            roleKey: userCore.roleKey || prevUser.roleKey,
            isActive: userCore.isActive !== undefined ? userCore.isActive : prevUser.isActive,
            academicProfile: userCore.academicProfile || prevUser.academicProfile,
            ...(prevUser.role === "teacher" ? {
              profTitle: teacherProfile.profTitle || prevUser.profTitle || "",
              profDesc: teacherProfile.profDesc || prevUser.profDesc || "",
              googleScholarLink: teacherProfile.googleScholarLink || prevUser.googleScholarLink || "",
              scopusLink: teacherProfile.scopusLink || prevUser.scopusLink || "",
              linkedInLink: teacherProfile.linkedInLink || prevUser.linkedInLink || "",
            } : {}),
          };
          localStorage.setItem("user", JSON.stringify(refreshed));
          return refreshed;
        });
      }
    } catch (error) {
      console.warn("AuthContext: Manual refresh failed", error?.message);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};