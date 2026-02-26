/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'communication': '#3B82F6',
        'communication-light': '#EFF6FF',
        'customer': '#10B981',
        'customer-light': '#ECFDF5',
        'cognizance': '#8B5CF6',
        'cognizance-light': '#F5F3FF',
        'charisma': '#F59E0B',
        'charisma-light': '#FFFBEB',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
