module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        darkbg: '#1a0f13',
        cardbg: '#23191c',
        gold: '#facc15',
        velvetgreen: '#14532d',
        royalblue: '#1e3a8a',
        ruby: '#a21d3a',
        textprimary: '#f9fafb',
        textsecondary: '#9ca3af',
      },
      fontFamily: {
        display: ["'Playfair Display'", "'DM Serif Display'", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
}; 