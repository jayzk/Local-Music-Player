import { transform } from 'typescript'

/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      animation: {
        'shake': 'shake 1s ease-out infinite',
        'wave': 'wave 5s linear infinite'
      },
      keyframes: {
        "shake": {
          "0%": {
            transform: 'rotate(0deg)'
          },
          "10%": {
            transform: 'rotate(-15deg)'
          },
          "20%": {
            transform: 'rotate(15deg)'
          },
          "30%": {
            transform: 'rotate(-10deg)'
          },
          "40%": {
            transform: 'rotate(10deg)'
          },
          "50%": {
            transform: 'rotate(-5deg)'
          },
          "60%": {
            transform: 'rotate(5deg)'
          },
          "70%": {
            transform: 'rotate(-3deg)'
          },
          "80%": {
            transform: 'rotate(3deg)'
          },
          "90%": {
            transform: 'rotate(0deg)'
          },
          "100%": {
            transform: 'rotate(0deg)'
          },
        },
        "wave": {
          "0%": {
            transform: 'rotate(0deg)'
          },
          "25%": {
            transform: 'rotate(30deg)'
          },
          "50%": {
            transform: 'rotate(0deg)'
          },
          "75%": {
            transform: 'rotate(-30deg)'
          },
          "100%": {
            transform: 'rotate(0deg)'
          }
        }
      }
    },
  },
  plugins: [
  ],
}

