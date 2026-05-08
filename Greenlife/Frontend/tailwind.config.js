/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Ajoute cette ligne ici :
  darkMode: 'class', 
  theme: {
    extend: {},
  },
  plugins: [],
}


