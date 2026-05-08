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
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          '"Apple SD Gothic Neo"',
          '"Malgun Gothic"',
          '"Segoe UI"',
          '"Noto Sans KR"',
          '"Nanum Gothic"',
          '돋움',
          'dotum',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};

export default config;
