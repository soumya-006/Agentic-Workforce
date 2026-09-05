/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#090d16',
        darkCard: '#111827',
        darkBorder: '#1f2937',
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae2fd',
          300: '#7cc8fc',
          400: '#38abf9',
          500: '#0e90eb',
          600: '#0271c7',
          700: '#035a9e',
          800: '#084c83',
          900: '#0c406d',
          950: '#082949',
        }
      }
    },
  },
  plugins: [],
}
