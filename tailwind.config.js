import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-green': '#0E4D41',
        'green': '#35BFA3',
        'light-green': '#E4F2D3',
        'subtle-green': '#F8FCF3',
        'black': '#203430',
        'dark-grey': '#63716E',
        'light-grey': '#A4ACAB',
        'semi-subtle-grey': '#E5E6E6',
        'subtle-grey': '#F7F7F7',
        'white': '#FFFFFF',
        'red': '#E63D4B',
        'subtle-red': '#FAEFF0',
        'yellow': '#F8C947',
        'light-yellow': '#FDF5DF',
        // Keeping previous functional names for backward compatibility if needed, though they match the new values
        'brand-red': '#E63D4B',
        'brand-yellow': '#F8C947', 
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        nunito: ['"Nunito Sans"', 'sans-serif'],
      },
      fontSize:{
        'md': '14px',
      }
    },
  },
  plugins: [
    tailwindcssAnimate
  ],
}
