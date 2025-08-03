/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
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
        'cyber': ['var(--font-share-tech-mono)', 'monospace'],
        'body': ['var(--font-chakra-petch)', 'sans-serif'],
        'serif': ['var(--font-playfair-display)', 'Georgia', 'Times New Roman', 'serif'],
        'merriweather': ['var(--font-merriweather)', 'Georgia', 'Times New Roman', 'serif'],
        'source-serif': ['var(--font-source-serif-4)', 'Times New Roman', 'serif'],
      },
    },
    plugins: [
      require('@tailwindcss/typography'),
    ],
  };