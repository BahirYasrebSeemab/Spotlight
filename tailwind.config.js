/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
    './Navigation.{js,jsx,ts,tsx}',
  ],
  plugins: [],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      animation: {},
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
      colors: {
        accent: {
          DEFAULT: '#ffffff',
          foreground: '#000000',
        },
        background: '#000000',
        border: '#333333',
        card: {
          DEFAULT: '#1a1a1a',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#7f1d1d',
          foreground: '#f87171',
        },
        foreground: '#ffffff',
        input: '#2a2a2a',
        muted: {
          DEFAULT: '#1a1a1a',
          foreground: '#999999',
        },
        popover: {
          DEFAULT: '#1a1a1a',
          foreground: '#ffffff',
        },
        primary: {
          DEFAULT: '#ffffff',
          foreground: '#000000',
        },
        ring: '#666666',
        secondary: {
          DEFAULT: '#ffffff',
          foreground: '#000000',
        },
      },
      filter: {
        dropShadowDark: 'drop-shadow(0 1px 1px rgb(255 255 255 / 1))',
        dropShadowLight: 'drop-shadow(0 1px 1px rgb(0 0 0 / 1))',
      },
      fontFamily: {
        mono: ['SpaceMono'],
      },
    },
  },
};
