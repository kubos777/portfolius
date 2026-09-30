/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0B0F19', // Deep dark blue-black
          card: 'rgba(17, 24, 39, 0.7)', // Translucent card background
        },
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          500: '#8b5cf6', // Violet
          600: '#7c3aed',
          700: '#6d28d9',
        },
        accent: {
          cyan: '#06b6d4', // Vibrant Cyan
          indigo: '#6366f1', // Sleek Indigo
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'pulse-subtle': 'pulse-subtle 4s ease-in-out infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'pulse-subtle': {
          '0%, 100%': {
            opacity: '0.4',
            transform: 'scale(1)'
          },
          '50%': {
            opacity: '0.6',
            transform: 'scale(1.05)'
          }
        }
      }
    },
  },
  plugins: [],
}
