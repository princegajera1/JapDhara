/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        spiritual: {
          50: '#fffbf0',
          100: '#fef3d6',
          200: '#fce3ab',
          300: '#f9cb76',
          400: '#f5aa42',
          500: '#d4a359', // Primary spiritual gold accent
          600: '#c48b36',
          700: '#9e6727',
          800: '#7f5024',
          900: '#674121',
          950: '#3a210f',
        },
        dark: {
          bg: '#111318',
          card: '#1a1d24',
          border: '#2a2e39',
          hover: '#222631',
          text: '#e6e8ec',
          muted: '#8b92a0',
        },
        light: {
          bg: '#fcfbf7',
          card: '#ffffff',
          border: '#eee9e0',
          hover: '#f5f2ea',
          text: '#1e232d',
          muted: '#707785',
        },
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
      },
      animation: {
        'breathe-slow': 'breathe 4s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.95' },
          '50%': { transform: 'scale(1.06)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.85' },
          '50%': { opacity: '1' },
        },
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)',
        'soft-md': '0 6px 16px -4px rgba(0, 0, 0, 0.08), 0 2px 6px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 12px 24px -6px rgba(0, 0, 0, 0.12), 0 4px 10px -3px rgba(0, 0, 0, 0.06)',
        'glow-accent': '0 0 20px -4px rgba(212, 163, 89, 0.35)',
      },
    },
  },
  plugins: [],
};
