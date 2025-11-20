module.exports = {
  content: ["./src/**/*.{js,jsx}"],
   darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#16a34a", // Green-600 - Main brand color
        secondary: "#FFFFFF", // White - Keep for contrast
        tertiary: "#6b7280", // Gray-500 - For text and borders
        accent1:"var(--color-accent1)", // Uses CSS variable (green)
        accent2:"#a3f294" // Light green - Fixed typo (was ##a3f294)
      },
      inset:{
        '2/5':"40%",
      },
      fontFamily: {
        sf: ['"SF Pro Display"'],
      },
    },
  },
  plugins: [],
};
