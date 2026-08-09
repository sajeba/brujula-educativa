/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        parchment: "#F3F1F8",
        surface: "#FFFFFF",
        ink: "#43468C",
        "ink-soft": "#7477AC",
        brass: "#E8962E",
        "brass-dark": "#C97A1B",
        needle: "#A63D40",
        moss: "#4C7A5B",
        line: "#DDD9EC",
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
