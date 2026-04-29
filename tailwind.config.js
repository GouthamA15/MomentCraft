/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/templates/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#a62c2b",
          DEFAULT: "#800000",
          dark: "#5a0000",
        },
        gold: {
          light: "#ffea70",
          DEFAULT: "#d4af37",
          dark: "#aa8b2b",
        },
        ivory: {
          light: "#ffffff",
          DEFAULT: "#fffff0",
          dark: "#f0e6d2",
        },
        accent: {
          green: "#2d5a27",
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Noto Serif Telugu"', "Georgia", "serif"],
        sans: ["Inter", '"Noto Sans Telugu"', "system-ui", "sans-serif"],
        cursive: ['"Great Vibes"', "cursive"],
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(to right, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C)",
        "mandala-pattern":
          "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2h2v2h20v2H22v2.5h18v2H22v18h-2V22.5H0v-2h20z' fill='%23d4af37' fill-opacity='0.15' fill-rule='evenodd'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
