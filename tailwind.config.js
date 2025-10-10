/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Aldine', 'Tiempos', 'Iowan Old Style', 'Apple Garamond', 'Baskerville', 'Times New Roman', 'Droid Serif', 'Times', 'Source Serif Pro', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'serif'],
        sans: ['Source Sans 3', 'sans-serif'],
      },
      colors: {
        success: "#34D399",
        error: "#B45454",
        "gray-2": "#f8fafc",
      },
      boxShadow: {
        three: "0px 1px 5px rgba(0, 0, 0, 0.14)",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
  plugins: [require("./plugin")],
};
