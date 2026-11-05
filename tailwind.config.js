/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        luxury: {
          bg: "#0A0204",
          surface: "#120306",
          card: "#160408",
          cardHover: "#1F060B",
          border: "rgba(255, 255, 255, 0.04)",
          borderGlow: "transparent",
          gold: "#E5B54F",
          goldLight: "#F6E09E",
          goldMuted: "#B38F2C",
          crimson: "#DC2626",
          crimsonHover: "#B91C1C",
          burgundy: "#3A0713",
          burgundyDark: "#0A0204",
          slate: "#71717A",
        },
        brand: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48", // Primary Giftana/Printed Soul Gift Rose/Red
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "Plus Jakarta Sans", "sans-serif"],
        serif: ["Playfair Display", "Bodoni Moda", "Georgia", "serif"],
        cinzel: ["Cinzel", "serif"],
        logo: ["Bodoni Moda", "Playfair Display", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
}
