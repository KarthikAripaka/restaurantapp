/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff4ed', 100: '#ffe4d4', 200: '#ffc4a3',
          300: '#ff9d68', 400: '#fb842f', 500: '#f7780e',
          600: '#dd5e06', 700: '#b84807', 800: '#93390c', 900: '#782f0e',
        },
        red: {
          50: '#fdeeee', 100: '#fbd6d6', 200: '#f5acac', 300: '#ec7a7a',
          400: '#e2474a', 500: '#e2131c', 600: '#bd0f17', 700: '#950c14', 800: '#710a10', 900: '#4d0709',
        },
        green: {
          50: '#f3f9ed', 100: '#e2f0d4', 200: '#c2e0a6', 300: '#9bce72',
          400: '#79bd49', 500: '#5b9e0f', 600: '#48800c', 700: '#386309', 800: '#2d5008', 900: '#213a06',
        },
        ink: { 950: '#0f0e0d', 900: '#1a1816', 800: '#2a2724', 700: '#403c38', 600: '#5c5752', 500: '#7a746e', 400: '#9b958e', 300: '#bfbab3', 200: '#ddd9d3', 100: '#eeece8' },
        cream: { 50: '#fffdfb', 100: '#fff8f2', 200: '#fef0e4' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Bebas Neue', 'Playfair Display', 'serif'],
      },
      animation: {
        'pulse-fast':  'pulse 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-badge': 'bounce 0.6s ease-in-out',
        'slide-in':    'slideIn 0.3s ease-out',
        'fade-in':     'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideIn: { from: { transform: 'translateX(100%)', opacity: 0 }, to: { transform: 'translateX(0)', opacity: 1 } },
        fadeIn:  { from: { opacity: 0, transform: 'translateY(-8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
      boxShadow: {
        soft: '0 4px 20px rgba(26,24,22,0.06)',
        'soft-lg': '0 12px 40px rgba(26,24,22,0.08)',
      },
    },
  },
  plugins: [],
};
