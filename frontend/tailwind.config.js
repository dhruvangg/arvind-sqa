/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arvind: {
          50: '#f0f5fa',
          100: '#e1ecf5',
          500: '#134074',
          600: '#0f335c',
          700: '#0b2545',
          800: '#081c33',
          900: '#051221',
        },
      },
    },
  },
  plugins: [],
}
