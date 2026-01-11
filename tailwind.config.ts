import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#D72C2C",
        "primary-hover": "#B52424",
        "primary-text": "#F2E3C2",
        "secondary-text": "#A9A9B4",
        "background-dark": "#121828",
        "card-dark": "#1A2238",
        "border-dark": "#3A4466",
        coral: "#E86854",
        success: "#4CAF50",
        error: "#D72C2C",
      },
      fontFamily: {
        display: ["Bebas Neue", "sans-serif"],
        body: ["Manrope", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "4px",
        lg: "8px",
        xl: "12px",
        "2xl": "16px",
      },
      backgroundImage: {
        "grain-texture": "url('https://www.transparenttextures.com/patterns/grain.png')",
      },
    },
  },
  plugins: [],
};

export default config;
