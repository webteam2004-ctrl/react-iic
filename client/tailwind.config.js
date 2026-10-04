/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#2E2A8F',
          dark: '#1E1B6B',
          light: '#EEF0FF',
        },
        orange: {
          DEFAULT: '#F39200',
          hover: '#D97706',
          light: '#FFF7ED',
        },
        red: {
          DEFAULT: '#E31E24',
          hover: '#C5171C',
          light: '#FEE2E2',
        },
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}
