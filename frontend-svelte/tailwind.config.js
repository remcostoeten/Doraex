/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617'
        }
      },
      backgroundColor: {
        'dark-primary': '#0f172a',
        'dark-secondary': '#1e293b',
        'dark-tertiary': '#334155',
        'light-primary': '#fefefe',
        'light-secondary': '#f8fafc',
        'light-tertiary': '#f1f5f9'
      },
      textColor: {
        'dark-primary': '#f8fafc',
        'dark-secondary': '#cbd5e1',
        'dark-tertiary': '#94a3b8',
        'light-primary': '#0f172a',
        'light-secondary': '#475569',
        'light-tertiary': '#64748b'
      },
      borderColor: {
        'dark-primary': '#334155',
        'dark-secondary': '#475569',
        'light-primary': '#e2e8f0',
        'light-secondary': '#cbd5e1'
      }
    }
  },
  plugins: []
};
