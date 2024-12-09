/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/views/**/*.{js,ts,jsx,tsx}',
    './node_modules/@pancakeswap/uikit/src/components/**/*.{js,ts,jsx,tsx}',
    './node_modules/@pancakeswap/uikit/src/widgets/**/*.{js,ts,jsx,tsx}',
    './node_modules/@pancakeswap/ui-wallets/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'space-grotesk': ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        gray: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          850: '#1c1c1e',
          900: '#18181b',
          950: '#09090b',
        },
        surface: {
          // 'default-background': '#09090b',
          // 'default-container': '#18181b',
          // 'default-container-high': '1c1c1e',
          // 'default-container-highest': '#27272a',
          // 'default-disable': '#3f3f46',
          // 'orange-default': '#f97316',
          // 'orange-overlay': '#f973161a',

          // default: {
          background: '#09090b',
          container: '#18181b',
          'container-high': '#1c1c1e',
          'container-highest': '#27272a',
          disable: '#3f3f46',
          overlay: '#f973161a',
          // },
          orange: '#f97316',
          'orange-overlay': '#f973161a',
          // {
          //   default: '#f97316',
          //   overlay: '#f973161a',
          // },
        },
        'on-surface': {
          // 'default-primary': '#fff',
          // 'default-secondary': '#d4d4d8',
          // 'default-tertiary': '#a1a1aa',
          // 'default-accent': '#f97316',
          // 'default-accent-subtle': '#fb923c',
          // 'default-link': '#0ea5e9',
          // 'orange-default': '#09090b',
          // default: {
          primary: '#fff',
          secondary: '#d4d4d8',
          tertiary: '#a1a1aa',
          accent: '#f97316',
          accentSubtle: '#fb923c',
          link: '#0ea5e9',
          // },
          orange: '#09090b',
          'orange-on-overlay': '#f97316',
          //  {
          //   default: '#09090b',
          //   onOverlay: '#f97316',
          // },
        },
        overlay: {
          'background-dim': '#000000b2',
          'surface-hover-light': '#ffffff1a',
          'surface-hover-dark': '#0000001a',
        },
        storke: '#',
      },
    },
    keyframes: {
      spin: {
        '0%': {
          transform: 'rotate(0deg)',
        },
        '100%': {
          transform: 'rotate(360deg)',
        },
      },
    },
    animation: {
      spin: 'spin 2s linear infinite',
    },
  },
  plugins: [],
}
