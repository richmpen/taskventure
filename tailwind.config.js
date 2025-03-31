/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5D5FEF',
          light: '#8A8CF8',
          dark: '#3A3CBE'
        },
        secondary: {
          DEFAULT: '#FFB341',
          light: '#FFCA7A',
          dark: '#E89A29'
        },
        success: '#4CB782',
        danger: '#F87171',
        warning: '#FBBF24',
        info: '#60A5FA',
        background: {
          DEFAULT: '#F8FAFC',
          dark: '#0F172A'
        },
        task: {
          normal: '#CBD5E1',
          active: '#5D5FEF',
          completed: '#4CB782',
          failed: '#F87171'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        heading: ['Poppins', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif']
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      borderRadius: {
        'ios': '12px',
        'ios-lg': '20px'
      },
      boxShadow: {
        'ios': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'ios-md': '0 8px 12px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'ios-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }
    },
  },
  plugins: [
    require('daisyui')
  ],
  daisyui: {
    themes: [
      {
        taskventure: {
          primary: "#5D5FEF",
          secondary: "#FFB341",
          accent: "#4CB782",
          neutral: "#1F2937",
          "base-100": "#F8FAFC",
          info: "#60A5FA",
          success: "#4CB782",
          warning: "#FBBF24",
          error: "#F87171",
        },
        dark: {
          primary: "#8A8CF8",
          secondary: "#FFCA7A",
          accent: "#81E6B8",
          neutral: "#F1F5F9",
          "base-100": "#0F172A",
          info: "#93C5FD",
          success: "#81E6B8",
          warning: "#FCD34D",
          error: "#FCA5A5",
        }
      }
    ],
  }
} 