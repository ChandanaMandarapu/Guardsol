/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Existing colors (kept for safety, though we will migrate)
        primary: '#00F6FF', // Updated to Neon Blue
        primaryHover: '#00D0D9',

        // Neon Shield Palette
        neon: {
          blue: '#00F6FF',
          purple: '#8B5CF6',
          pink: '#EC4899',
          green: '#00FFAF',
          red: '#FF4D4D',
          yellow: '#FFC800',
        },
        dark: {
          bg: '#05070D',
          card: '#0D111C',
          hover: '#111624',
          border: '#1A2237',
        },
        text: {
          primary: '#E8EBF0',
          secondary: '#98A1B3',
          muted: '#5A6273',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(0, 246, 255, 0.15)',
        'neon-red': '0 0 20px rgba(255, 77, 77, 0.15)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'neon-gradient': 'linear-gradient(90deg, #00F6FF 0%, #00B8D4 100%)',
        'danger-gradient': 'linear-gradient(90deg, #FF4D4D 0%, #D60000 100%)',
      }
    },
  },
  plugins: [],
}