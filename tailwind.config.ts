import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-plex-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        ink: {
          950: "#0a1220",
          900: "#0f1b2e",
          800: "#152438",
          700: "#1c2f47",
          600: "#26405f",
          500: "#33547a",
          400: "#5b7392",
          300: "#8ba0ba",
          200: "#c1cddb",
          100: "#e3e9f0",
          50: "#f3f6f9",
        },
        brand: {
          700: "#0d2f52",
          600: "#123f6c",
          500: "#175184",
          400: "#3d76ab",
        },
        gold: {
          600: "#8a6412",
          500: "#a97d1a",
          400: "#c99a2e",
          300: "#e0b850",
          100: "#faf1dc",
        },
        good: {
          700: "#1b5e3c",
          600: "#227449",
          100: "#e2f3e9",
        },
        warn: {
          700: "#8a5a10",
          600: "#a9711a",
          100: "#faf0dc",
        },
        bad: {
          700: "#8c2a2a",
          600: "#ad3535",
          100: "#fbe6e6",
        },
        canvas: "#f5f6f8",
        panel: "#ffffff",
      },
      boxShadow: {
        panel: "0 1px 2px 0 rgb(15 27 46 / 0.06)",
        popover: "0 8px 24px -4px rgb(15 27 46 / 0.18)",
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "8px",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 150ms ease-out",
        "slide-up": "slide-up 180ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
