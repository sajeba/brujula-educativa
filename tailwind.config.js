/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        parchment: "#F1ECDD",
        surface: "#FFFFFF",
        ink: "#1E2A45",
        "ink-soft": "#5B6B8C",
        brass: "#B8863B",
        "brass-dark": "#96692A",
        needle: "#A63D40",
        moss: "#4C7A5B",
        line: "#DDD3BC",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["\"IBM Plex Mono\"", "monospace"],
      },
    },
  },
  plugins: [],
};
