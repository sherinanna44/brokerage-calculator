import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "media",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#f0f4ff",
          100: "#e0e8ff",
          200: "#c7d5ff",
          400: "#6b7eff",
          500: "#4f60ff",
          600: "#0100f8",
          700: "#0100d9",
          800: "#0100b8",
          900: "#010080",
        },
      },
    },
  },
  plugins: [],
};

export default config;
