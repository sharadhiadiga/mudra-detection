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
        glow: '0 0 30px rgba(232,122,42,0.45), 0 0 60px rgba(212,175,55,0.2)',
        'glow-gold': '0 0 24px rgba(212,175,55,0.35)',
        'glow-green': '0 0 32px rgba(74,222,128,0.45)',
      },
      backgroundImage: {
        'radial-maroon':
          'radial-gradient(ellipse 100% 80% at 50% 0%, #3d1218 0%, #1a0508 45%, #120304 100%)',
      },
    },
  },
  plugins: [],
};
