/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['BeFit Slim', 'Noto Emoji', 'sans-serif'],
      },
      colors: {
        'brand-blue': '#007db5', // For hover links and upload button
      }
    },
  },
  plugins: [],
}
