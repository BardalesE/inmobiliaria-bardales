/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        terra: {
          DEFAULT: '#C4622D',
          light: '#E07840',
          dark: '#9B4A1F',
        },
        bark: {
          900: '#0F0A04',
          800: '#1C1308',
          700: '#2A1E10',
          600: '#352615',
        },
        sand: {
          DEFAULT: '#FDF6E9',
          muted: '#9A8268',
        }
      },
      fontFamily: {
        display: ['var(--font-bebas)', 'sans-serif'],
        body: ['var(--font-outfit)', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out',
        'pulse-dot': 'pulseDot 1.8s infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.25' },
        }
      }
    },
  },
  plugins: [],
}
