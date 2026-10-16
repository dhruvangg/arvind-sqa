/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Official Arvind Brand Colors (from arvind.com)
        arvind: {
          50: '#fdf2f4',
          100: '#fbe4e8',
          200: '#f7ccd4',
          300: '#f0a3b2',
          400: '#e57187',
          500: '#d44361',
          600: '#bd2848',
          700: '#a51d36', // Official Arvind Crimson Maroon
          800: '#8b1c31',
          900: '#751c2e',
          950: '#420b15',
        },
        'arvind-navy': {
          50: '#f0f5fa',
          100: '#dde9f5',
          200: '#bed5ec',
          300: '#91b8df',
          400: '#5e96cd',
          500: '#3978ba',
          600: '#275ea0',
          700: '#1a3c6b', // Official Arvind Secondary Navy
          800: '#1a3c6b',
          900: '#14294b',
          950: '#0d1a30',
        },
        'arvind-slate': {
          50: '#f6f7f8',
          100: '#edeff1',
          200: '#d8dce0',
          300: '#b7bfc6',
          400: '#929ea7',
          500: '#6b7b84', // Arvind Brand Slate Accent
          600: '#58656d',
          700: '#485259',
          800: '#3e464c',
          900: '#373c41',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
