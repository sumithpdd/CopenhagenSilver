import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        silver: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e8e8e8',
          300: '#d3d3d3',
          400: '#b8b8b8',
          500: '#a0a0a0',
          600: '#808080',
          700: '#606060',
          800: '#404040',
          900: '#1a1a1a',
        },
        sitecore: {
          dark: '#1a1a1a',
          light: '#ffffff',
          accent: '#c9b4cc',
          gold: '#d4af37',
          red: '#EB001A',
        },
      },
      fontFamily: {
        'dm-sans': ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(192, 192, 192, 0.7)' },
          '50%': { boxShadow: '0 0 0 10px rgba(192, 192, 192, 0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
