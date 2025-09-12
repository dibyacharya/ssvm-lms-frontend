module.exports = {
  content: ["./src/**/*.{js,jsx}"],
   darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#000000",
        secondary: "#FFFFFF",
        tertiary: "#848484",
        accent1:"var(--color-accent1)",
        accent2:"##a3f294"
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
