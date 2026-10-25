import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f1f6f2",
          100: "#e1ece4",
          200: "#c3d9c9",
          300: "#9bbfa5",
          400: "#6c9f7b",
          500: "#4a8160",
          600: "#2f6648",
          700: "#1f5238",
          800: "#17402c",
          900: "#0f2d1f",
        },
        cream: { 50: "#fdfbf6", 100: "#faf6ec", 200: "#f2ebd9" },
        ink: { DEFAULT: "#1b2a22", soft: "#4b5c52" },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        display: ["Iowan Old Style", "Palatino Linotype", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,45,31,0.05), 0 6px 20px rgba(15,45,31,0.06)",
      },
      keyframes: {
        rise: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: { rise: "rise 0.35s ease-out both" },
    },
  },
  plugins: [],
};

export default config;
