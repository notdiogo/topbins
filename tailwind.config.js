/** @type {import('tailwindcss').Config} */

// Colors are CSS-variable RGB triplets (defined in index.css :root) so the whole
// palette can be retuned in one place and components can also read raw vars
// (e.g. rgb(var(--p-diogo))). Alpha utilities (bg-forest/20) keep working via
// the <alpha-value> placeholder.
const v = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Existing utility names, remapped onto the fresh summer tokens.
        parchment: v('--bg'),
        stone:     v('--surface'),
        beige:     v('--surface-2'),
        'warm-border': v('--border'),
        ink:       v('--text'),
        muted:     v('--muted'),
        forest:    v('--accent'),
        'forest-mid': v('--accent-bright'),
        'forest-light': v('--accent-soft'),
        danger:    v('--danger'),
        'danger-light': v('--danger-soft'),
        // Summer highlights + categorical person colors.
        sun:       v('--sun'),
        coral:     v('--coral'),
        magenta:   v('--magenta'),
        'p-diogo': v('--p-diogo'),
        'p-shiv':  v('--p-shiv'),
        'p-mitch': v('--p-mitch'),
      },
      fontFamily: {
        display: ['"Outfit Variable"', 'system-ui', 'sans-serif'],
        serif:   ['"Outfit Variable"', 'system-ui', 'sans-serif'], // legacy font-serif usage adopts the display face
        sans:    ['"Geist Variable"', 'system-ui', 'sans-serif'],
        mono:    ['"Geist Mono Variable"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
