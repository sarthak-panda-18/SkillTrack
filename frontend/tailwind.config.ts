import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './providers/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        condensed: ['var(--font-condensed)', 'sans-serif'],
      },
      colors: {
        background: '#000000',
        foreground: '#FFFFFF',
        surface: {
          DEFAULT: '#0A0A0A',
          secondary: '#111111',
          hover: '#171717',
        },
        yellow: {
          DEFAULT: '#FFD400',
          hover: '#FFE033',
          glow: 'rgba(255, 212, 0, 0.4)',
        },
        card: {
          DEFAULT: '#0A0A0A',
          foreground: '#FFFFFF',
        },
        popover: {
          DEFAULT: '#0A0A0A',
          foreground: '#FFFFFF',
        },
        primary: {
          DEFAULT: '#FFD400',
          foreground: '#000000',
        },
        secondary: {
          DEFAULT: '#111111',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#171717',
          foreground: '#A3A3A3',
        },
        accent: {
          DEFAULT: '#FFD400',
          foreground: '#000000',
        },
        destructive: {
          DEFAULT: '#7F1D1D',
          foreground: '#FFFFFF',
        },
        border: 'rgba(255, 255, 255, 0.10)',
        'border-yellow': 'rgba(255, 212, 0, 0.35)',
        input: 'rgba(255, 255, 255, 0.15)',
        ring: '#FFD400',
      },
      borderRadius: {
        lg: '4px',
        md: '2px',
        sm: '1px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(255, 212, 0, 0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(255, 212, 0, 0.6)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
      },
    },
  },
  plugins: [],
};

export default config;

