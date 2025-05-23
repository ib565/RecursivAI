/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        'cyber-black': '#0f0f12',
        'cyber-dark': '#1a1a22',
        'cyber-gray': '#2a2a35',
        'cyber-neon': '#00ffff',
        'cyber-pink': '#ff00ff',
        'cyber-purple': '#9d4edd',
      },
    },
    fontFamily: {
      // Add custom font families here
      'cyber': ['"Share Tech Mono"', 'monospace'],
      'body': ['"Chakra Petch"', 'sans-serif'],
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}