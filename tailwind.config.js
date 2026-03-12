/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: '#F7F3EE',
        stone:     '#FDFBF8',
        beige:     '#EDE8DE',
        'warm-border': '#DDD8D0',
        ink:       '#1C1916',
        muted:     '#7A746C',
        forest:    '#2A5A0E',
        'forest-mid': '#3A7A1A',
        'forest-light': '#EAF2E3',
        danger:    '#9B3B3B',
        'danger-light': '#F9EEEE',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
