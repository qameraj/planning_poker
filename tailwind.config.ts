import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light Mode
        light: {
          bg: '#F5F5DC',
          'bg-secondary': '#FAF9F6',
          card: '#FFFFFF',
          'text-primary': '#2F2F2F',
          'text-secondary': '#6B6B6B',
          border: '#E5E5E5',
          accent: '#A3A380',
        },
        // Dark Mode
        dark: {
          bg: '#1E1E1E',
          card: '#2A2A2A',
          'text-primary': '#F5F5DC',
          'text-secondary': '#CFCFCF',
          border: '#3A3A3A',
          accent: '#D6D2B0',
        },
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'soft-md': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 8px 24px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
} satisfies Config;