/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{html,tsx}", "./components/**/*.{html,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#19AA6E",
        secondary: "#402D28",
        tertiary: "#BF9E7B",
        background: "#FFF9F0",
      },
    },
  },
  plugins: [],
};
