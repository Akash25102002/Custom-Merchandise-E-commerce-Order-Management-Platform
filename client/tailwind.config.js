/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#1C1B1A',
        canvas: '#FAF7F2',
        'print-red': {
          DEFAULT: '#C9432B',
          hover: '#b23720',
          light: '#fdf2f0',
        },
        'thread-green': {
          DEFAULT: '#2F5D50',
          hover: '#264b41',
          light: '#f0f6f4',
        },
        gold: {
          DEFAULT: '#E8A33D',
          hover: '#d4912c',
          light: '#fdf7ee',
        },
        'warm-grey': {
          DEFAULT: '#6B6862',
          light: '#e8e6e2',
          subtle: '#f4f3f0',
          dark: '#45433f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
