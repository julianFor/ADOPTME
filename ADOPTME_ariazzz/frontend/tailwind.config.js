/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'footer-wave': "url('/src/assets/images/footer-wave.svg')",
      },
    },
  },
  plugins: [],
}
