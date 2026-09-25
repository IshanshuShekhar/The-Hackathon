/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        educaro: {
          main: '#F5F5EF',
          secondary: '#E8ECE5',
          card: '#EEF1EB',
          icon: '#E5EDF0',
          primary: '#344653',
          muted: '#71808A',
          accent: '#718C9B',
          border: '#DCE2DC',
          btn: '#5F7D8B',
          btnHover: '#4e6773',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
