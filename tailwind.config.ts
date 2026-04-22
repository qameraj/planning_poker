/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // 🌞 LIGHT MODE
        'light-bg': '#F5F5DC',
        'light-secondary': '#FAF9F6',
        'light-card': '#FFFFFF',
        'light-text-primary': '#2F2F2F',
        'light-text-secondary': '#6B6B6B',
        'light-border': '#E5E5E5',
        'light-accent': '#A3A380',

        // 🌙 DARK MODE
        'dark-bg': '#1E1E1E',
        'dark-card': '#2A2A2A',
        'dark-text-primary': '#F5F5DC',
        'dark-text-secondary': '#CFCFCF',
        'dark-border': '#3A3A3A',
        'dark-accent': '#D6D2B0',
      },

      boxShadow: {
        soft: '0 4px 12px rgba(0,0,0,0.05)',
      },

      borderRadius: {
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
};