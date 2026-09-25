/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        app: '#0F1012',
        surface: '#17181C',
        elevated: '#1E2025',
        player: '#090A0B',
        'app-primary': '#F5F5F6',
        'app-secondary': '#B8BBC2',
        'app-muted': '#7C808A',
        accent: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
          soft: 'rgba(245, 158, 11, 0.15)',
        },
        pin: '#F59E0B',
        fav: '#FBBF24',
        heart: '#EF4444',
      },
      borderColor: {
        subtle: 'rgba(255, 255, 255, 0.08)',
        strong: 'rgba(255, 255, 255, 0.16)',
      },
      borderRadius: {
        'card': '14px',
        'slot': '12px',
        'badge': '8px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'slot': '0 4px 20px rgba(0, 0, 0, 0.5)',
      },
      transitionDuration: {
        'crossfade': '220ms',
        'replace': '200ms',
        'control': '140ms',
      },
    },
  },
  plugins: [],
}
