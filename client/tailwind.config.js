/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors");
module.exports = {
  content: ["./src/*.jsx"],
  theme: {
    extend: {
      colors: {
        transparent: "transparent",
        current: "currentColor",
        prussianBlue: "#13293dff",
        lapisLazuli: "#006494ff",
        cerulean: "#247ba0ff",
        celestialBlue: "#1b98e0ff",
        aliceBlue: "#e8f1f2ff",
        white: "#fff",
      },
      animation: {
        background: 'bg_animate 3s ease infinite',
      },
      keyframes: {
        bg_animate: {
          '0%, 100%': {
            'background-size': '180% 180%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '180% 180%',
            'background-position': 'right center',
          },
        },
      },
    },
  },
  plugins: [],
};
