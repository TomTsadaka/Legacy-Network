import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5B8FB9',
          50: '#e8f3f8',
          100: '#d1e7f1',
          200: '#a3cfe3',
          300: '#75b7d5',
          400: '#5B8FB9',
          500: '#4a7a9e',
          600: '#3a617d',
          700: '#2b495d',
          800: '#1b303e',
          900: '#0c181f',
        },
        cream: {
          DEFAULT: '#F5E6D3',
          50: '#fffbf7',
          100: '#fef7ef',
          200: '#fcefd8',
          300: '#F5E6D3',
          400: '#edd8b8',
          500: '#e5ca9d',
        },
        peach: '#FFB084',
      },
      fontFamily: {
        serif: ['Merriweather', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
