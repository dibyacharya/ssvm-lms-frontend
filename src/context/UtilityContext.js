import { createContext, useContext, useState, useEffect } from "react";

const UtilityContext = createContext({
  activeSection: "Dashboard",
  currentModuleIndex: 0,
  setCurrentModuleIndex: () => {},
  setActiveSection: () => {},
});

export const useUtilityContext = () => {
  const context = useContext(UtilityContext);
  if (!context) {
    throw new Error("useUtility must be used within a UtilityProvider");
  }
  return context;
};

const UtilityProvider = ({ children }) => {
  // Helper to get user role for keying
  const getRole = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user).role : "student";
  };

  const [activeSection, setActiveSection] = useState(() => {
    const role = getRole();
    return localStorage.getItem(`${role}_activeSection`) || "Dashboard";
  });
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);

  useEffect(() => {
    const role = getRole();
    localStorage.setItem(`${role}_activeSection`, activeSection);
  }, [activeSection]);

  return (
    <UtilityContext.Provider
      value={{
        activeSection,
        setActiveSection,
        currentModuleIndex,
        setCurrentModuleIndex,
      }}
    >
      {children}
    </UtilityContext.Provider>
  );
};

export default UtilityProvider;