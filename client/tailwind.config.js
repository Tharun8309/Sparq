/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sparq: {
          maroon: '#4A0E17',
          darkmaroon: '#2B060B',
          richmaroon: '#641320',
          gold: '#E5B869',
          lightgold: '#F4D89A',
          darkgold: '#B8860B',
          cream: '#FCF9F2',
          offwhite: '#F4EFE6',
          redaccent: '#B91C1C'
        }
      }
    },
  },
  plugins: [],
}