/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette sampled from the official DFC logo (red D, orange F, green C)
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
        ink: { 950: '#0f0e0d', 900: '#1a1816', 800: '#2a2724', 700: '#403c38', 600: '#5c5752', 500: '#7a746e' },
        cream: { 50: '#fffdfb', 100: '#fff8f2', 200: '#fef0e4' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        display: ['Bebas Neue', 'Playfair Display', 'serif'],
      },
      animation: {
        'float':           'float 4s ease-in-out infinite',
        'float-slow':      'float 7s ease-in-out infinite',
        'float-delayed':   'float 5s ease-in-out 1.5s infinite',
        'slide-up':        'slideUp 0.6s ease-out',
        'fade-in':         'fadeIn 0.5s ease-out',
        'cart-bounce':     'cartBounce 0.4s ease-out',
        'fly':             'fly 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'gradient-x':      'gradientX 6s ease infinite',
        'marquee':         'marquee 28s linear infinite',
        'marquee-slow':    'marquee 44s linear infinite',
        'counter':         'counterUp 1.2s ease-out forwards',
        'orb-drift':       'orbDrift 12s ease-in-out infinite',
        'orb-drift-r':     'orbDriftR 16s ease-in-out infinite',
        'shimmer':         'shimmer 1.5s infinite',
        'pulse-glow':      'pulseGlow 2.4s ease-in-out infinite',
        'slide-right':     'slideRight 0.5s ease-out forwards',
        'zoom-in':         'zoomIn 0.6s ease-out forwards',
        'logo-breathe':    'logoBreathe 3.5s ease-in-out infinite',
      },
      keyframes: {
        float:    { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-12px)' } },
        slideUp:  { from: { opacity: 0, transform: 'translateY(28px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideRight: { from: { opacity: 0, transform: 'translateX(-24px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        zoomIn:   { from: { opacity: 0, transform: 'scale(0.92)' }, to: { opacity: 1, transform: 'scale(1)' } },
        fadeIn:   { from: { opacity: 0 }, to: { opacity: 1 } },
        cartBounce: { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.3)' } },
        fly: {
          '0%': { opacity: 1, transform: 'scale(1)' },
          '60%': { opacity: 0.8 },
          '100%': { opacity: 0, transform: 'scale(0.2)' },
        },
        gradientX: {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%':     { backgroundPosition: '100% 50%' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 8px 30px rgba(226,19,28,0.18), 0 0 0 rgba(247,120,14,0)' },
          '50%':     { boxShadow: '0 8px 40px rgba(226,19,28,0.3), 0 0 30px rgba(247,120,14,0.15)' },
        },
        counterUp: {
          from: { opacity: 0, transform: 'translateY(16px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        orbDrift: {
          '0%,100%': { transform: 'translate(0, 0) scale(1)' },
          '33%':     { transform: 'translate(50px, -60px) scale(1.15)' },
          '66%':     { transform: 'translate(-30px, 50px) scale(0.9)' },
        },
        orbDriftR: {
          '0%,100%': { transform: 'translate(0, 0) scale(1)' },
          '33%':     { transform: 'translate(-60px, 40px) scale(1.1)' },
          '66%':     { transform: 'translate(40px, -50px) scale(0.95)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        logoBreathe: {
          '0%,100%': { filter: 'drop-shadow(0 6px 18px rgba(226,19,28,0.25)) drop-shadow(0 0 0px rgba(247,120,14,0))' },
          '50%':     { filter: 'drop-shadow(0 10px 28px rgba(226,19,28,0.35)) drop-shadow(0 0 22px rgba(247,120,14,0.3))' },
        },
      },
      backgroundImage: {
        'tricolor-gradient': 'linear-gradient(135deg, #e2131c 0%, #f7780e 50%, #5b9e0f 100%)',
        'red-orange':        'linear-gradient(135deg, #e2131c 0%, #f7780e 100%)',
        'orange-green':      'linear-gradient(135deg, #f7780e 0%, #5b9e0f 100%)',
        'radial-glow':       'radial-gradient(circle at 50% 0%, rgba(247,120,14,0.10), transparent 60%)',
      },
      boxShadow: {
        'soft':      '0 4px 20px rgba(26,24,22,0.06)',
        'soft-lg':   '0 12px 40px rgba(26,24,22,0.08)',
        'red-glow':  '0 8px 30px rgba(226,19,28,0.18)',
        'orange-glow': '0 8px 30px rgba(247,120,14,0.18)',
        'green-glow':  '0 8px 30px rgba(91,158,15,0.18)',
      },
    },
  },
  plugins: [],
};
