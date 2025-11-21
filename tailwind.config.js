/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-volt': '#CCFF00',
        'neon-red': '#FF003C',
        'deep-black': '#050505',
      },
      fontFamily: {
        'tech': ['Rajdhani', 'sans-serif'],
        'poster': ['Anton', 'sans-serif'],
        'display': ['Chakra Petch', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

