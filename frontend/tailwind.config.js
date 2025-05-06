/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          // Primary Colors
          'deep-navy': '#07092F',
          'royal-blue': '#122C86',
          'teal-accent': '#14F1D9',
          'bright-blue': '#3672F8',
          
          // Secondary Colors
          'pink-accent': '#EC6EAD',
          'light-blue': '#3494E6',
          'cyan-blue': '#16BFFD',
          'burgundy': '#CB3066',
          'sky-blue': '#ABDCFF',
          'ocean-blue': '#0396FF',
          'warm-yellow': '#FFE259',
          'coral': '#FF7170',
          'magenta': '#F857A6',
          'red': '#FF5858',
          
          // Neutral Colors
          'off-white': '#F7F9FC',
          'light-gray': '#F0F3FA',
          'border-gray': '#E8EAF2',
          'text-gray': '#5A6282',
          'dark-gray': '#A1A7C4',
          'dark-text': '#07092F',
        },
        backgroundImage: {
          'hero-gradient': 'linear-gradient(45deg, #07092F 0%, #122C86 100%)',
          'accent-gradient': 'linear-gradient(45deg, #14F1D9 0%, #3672F8 100%)',
          'card-gradient-1': 'linear-gradient(45deg, #3494E6 0%, #EC6EAD 100%)',
          'card-gradient-2': 'linear-gradient(45deg, #16BFFD 0%, #CB3066 100%)',
          'card-gradient-3': 'linear-gradient(45deg, #ABDCFF 0%, #0396FF 100%)',
        },
      },
    },
    plugins: [],
  }