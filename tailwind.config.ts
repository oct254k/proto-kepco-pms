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
        primary: '#00a7ea',
      },
      fontFamily: {
        sans: ['"Nanum Gothic"', '돋움', 'dotum', 'Helvetica', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
