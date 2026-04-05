import type { Config } from 'tailwindcss';

const BLACK = '#1a1a1a';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Archivo Black"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      colors: {
        cream: '#FFFDF7',
        brutal: {
          black: BLACK,
          yellow: '#FFE600',
          pink: '#FF3366',
          blue: '#0066FF',
          lime: '#B8FF00',
          lavender: '#C4B5FD',
          peach: '#FFB088',
          mint: '#86EFAC',
        },
      },
      boxShadow: {
        brutal: `4px 4px 0px ${BLACK}`,
        'brutal-sm': `3px 3px 0px ${BLACK}`,
        'brutal-lg': `6px 6px 0px ${BLACK}`,
      },
    },
  },
  plugins: [],
};
export default config;
