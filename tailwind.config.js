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
        'brown': '#884616',
        'gold': {
          DEFAULT: '#BB8F53',
          50: '#FBF7F2',
          100: '#F6ECD9',
          200: '#ECD2AA',
          300: '#E1B77B',
          400: '#D49D51',
          500: '#BB8F53',
          600: '#A1743E',
          700: '#865A2E',
          800: '#6E4321',
          900: '#552F16',
        },
        'light-gold': '#F1E3D3',
        'subtle-gold': '#FAF6F0',
        'black': '#000000',
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
