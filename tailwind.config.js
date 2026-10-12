/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          50: "#FAFAFC",
          100: "#F3F3F8",
          200: "#E7E7F0",
        },
        ink: {
          950: "#0E0E1A",
          900: "#15152A",
          800: "#1F1F3B",
          700: "#4B4B6B",
          500: "#6E6E96",
        },
        brand: {
          400: "#8B7CF6",
          500: "#6D5AE6",
          600: "#5741D9",
          700: "#4530B8",
        },
        mint: {
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
        },
        coral: {
          400: "#FB7185",
          500: "#F43F5E",
          600: "#E11D48",
        },
      },
      fontFamily: {
        display: ["'Manrope'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(14,14,26,0.04), 0 8px 24px -12px rgba(14,14,26,0.10)",
        glow: "0 0 0 1px rgba(109,90,230,0.12), 0 8px 30px -10px rgba(109,90,230,0.35)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #8B7CF6 0%, #6D5AE6 55%, #5741D9 100%)",
        "hero-glow":
          "radial-gradient(60% 50% at 50% 0%, rgba(139,124,246,0.18) 0%, rgba(139,124,246,0) 70%)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
