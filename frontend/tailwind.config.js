/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        maroon: {
          DEFAULT: '#1a0508',
          mid: '#3d1218',
          deep: '#120304',
          card: 'rgba(35, 12, 14, 0.92)',
        },
        gold: {
          DEFAULT: '#d4af37',
          hi: '#e8c96a',
          line: '#9a7b2e',
        },
        glow: '#e87a2a',
        cream: '#f5f0e8',
        success: '#4ade80',
      },
      fontFamily: {
        serif: ['Cinzel', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 15px rgba(232,122,42,0.25), 0 0 30px rgba(212,175,55,0.1)',
        'glow-gold': '0 0 12px rgba(212,175,55,0.15)',
        'glow-green': '0 0 16px rgba(74,222,128,0.22)',
        'glow-hover': '0 0 8px rgba(212,175,55,0.12)',
        'glow-circle': '0 0 18px rgba(212,175,55,0.1)',
      },
      borderRadius: {
        card: '20px',
      },
    },
  },
  plugins: [],
};
