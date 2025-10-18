const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        // primary: a calm blue for accents and buttons
        primary: {
          DEFAULT: '#2563eb', // blue-600
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb'
        },
        // accent: subtle teal/green for positive actions
        accent: {
          DEFAULT: '#059669', // emerald-600
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669'
        },
        // keep gray palette consistent
        muted: colors.slate
      },
      boxShadow: {
        'soft': '0 6px 18px rgba(15, 23, 42, 0.06)'
      }
    }
  },
  plugins: []
}
