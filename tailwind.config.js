/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{html,tsx}", "./components/**/*.{html,tsx}"],
  theme: {
    extend: {
      colors: {
        green: "#19AA6E",
        brown: "#402D28",
        "soft-brown": "#BF9E7B",
        beige: "#FFF9F0",
      },
    },
  },
  plugins: [],
};
