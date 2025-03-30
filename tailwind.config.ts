// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",         // app directory
    "./components/**/*.{ts,tsx}",  // component directory
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        serif: ["var(--font-serif)", "serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#3f4e63",   // muted navy
          light: "#f6f7f9",     // soft off-white
          accent: "#d2a85f",    // gold
        },
      },
      boxShadow: {
        soft: "0 4px 12px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
