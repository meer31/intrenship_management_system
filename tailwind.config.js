/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#142D4E',
          50: '#F0F4F9',
          100: '#DDE6F1',
          200: '#BDCFE4',
          300: '#93B0D2',
          400: '#5F88BC',
          500: '#3D68A1',
          600: '#2C5183',
          700: '#203E67',
          800: '#183153',
          900: '#142D4E',
          950: '#0C1C33',
        },
        teal: {
          DEFAULT: '#168F88',
          50: '#E8F6F5',
          100: '#C7ECE9',
          200: '#99DBD6',
          300: '#64C3BC',
          400: '#37A9A1',
          500: '#168F88',
          600: '#11746E',
          700: '#0F5C58',
          800: '#114B48',
          900: '#123F3D',
          950: '#052323',
        },
        page: '#F4F7FA',
        card: '#FFFFFF',
        text: {
          primary: '#1E293B',
          secondary: '#64748B',
        },
        border: '#DCE4EC',
        warning: '#D69E36',
        danger: '#D65A5A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(20, 45, 78, 0.05), 0 1px 2px -1px rgba(20, 45, 78, 0.05)',
        'card-hover': '0 4px 12px 0 rgba(20, 45, 78, 0.08), 0 2px 4px -2px rgba(20, 45, 78, 0.04)',
        sidebar: '2px 0 8px 0 rgba(12, 28, 51, 0.15)',
      },
      borderRadius: {
        card: '12px',
      }
    },
  },
  plugins: [],
}
