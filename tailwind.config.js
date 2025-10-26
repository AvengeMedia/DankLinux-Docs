/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false, // disable Tailwind's reset so it doesn't conflict with Docusaurus
  },
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './docs/**/*.{md,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'], // Docusaurus uses data-theme attribute
  theme: {
    extend: {
      colors: {
        // Material 3 Purple Palette matching Nextra
        'material-purple': {
          50: '#F5F0FF',
          100: '#E9DFFF',
          200: '#D0BCFF', // Primary
          300: '#B794F4',
          400: '#9F7AEA',
          500: '#805AD5',
          600: '#6B46C1',
          700: '#553C9A',
          800: '#44337A',
          900: '#322659',
        },
        'material-primary': {
          50: '#F5F0FF',
          100: '#E9DFFF',
          200: '#D0BCFF',
          300: '#B794F4',
          400: '#9F7AEA',
          500: '#805AD5',
          600: '#6B46C1',
          700: '#553C9A',
          800: '#44337A',
          900: '#322659',
        },
      },
    },
  },
  plugins: [],
};
