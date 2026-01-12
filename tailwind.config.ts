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
        // Primary Colors (Style Guide v1.1.0)
        primary: "#D72C2C",
        "primary-hover": "#B52424",
        "primary-active": "#8A1A1F",
        "primary-text": "#F2E3C2",

        // Secondary Colors
        "secondary-text": "#A9A9B4",
        "pale-yellow": "#F9E3BA",

        // Background Colors
        "background-dark": "#121828",
        "background-deeper": "#0A0F28",
        "card-dark": "#1A2238",
        "border-dark": "#3A4466",

        // Accent Colors
        coral: "#E86854",
        "gradient-gold": "#F4C430",

        // Semantic Colors
        success: "#4CAF50",
        warning: "#FFC107",
        error: "#D8232A",
        info: "#2196F3",
      },
      fontFamily: {
        display: ["var(--font-bebas-neue)", "Bebas Neue", "sans-serif"],
        body: ["var(--font-manrope)", "Manrope", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Rubik", "monospace"],
      },
      fontSize: {
        // Typography Scale from Style Guide
        "display-xl": ["96px", { lineHeight: "1.0", letterSpacing: "0.02em" }],
        "display-lg": ["72px", { lineHeight: "1.1", letterSpacing: "0.02em" }],
        "h1": ["48px", { lineHeight: "1.2", letterSpacing: "0.01em" }],
        "h2": ["36px", { lineHeight: "1.3", letterSpacing: "0em" }],
        "h3": ["28px", { lineHeight: "1.4", letterSpacing: "-0.01em" }],
        "h4": ["24px", { lineHeight: "1.4", letterSpacing: "-0.01em" }],
        "h5": ["20px", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
        "h6": ["16px", { lineHeight: "1.5", letterSpacing: "0em" }],
        "body-lg": ["18px", { lineHeight: "1.6" }],
        "body": ["16px", { lineHeight: "1.6" }],
        "body-sm": ["14px", { lineHeight: "1.6" }],
        "caption": ["12px", { lineHeight: "1.5", letterSpacing: "0.02em" }],
        "overline": ["12px", { lineHeight: "1.5", letterSpacing: "0.1em" }],
      },
      spacing: {
        // Spacing Scale (4px base)
        "xs": "4px",
        "sm": "8px",
        "md": "12px",
        "lg": "24px",
        "xl": "32px",
        "2xl": "48px",
        "3xl": "64px",
        "4xl": "96px",
        "5xl": "128px",
      },
      borderRadius: {
        none: "0px",
        DEFAULT: "4px",
        md: "8px",
        lg: "8px",
        xl: "12px",
        "2xl": "16px",
        full: "9999px",
      },
      boxShadow: {
        // Shadow Scale from Style Guide
        "sm": "0 1px 2px 0 rgba(10, 15, 40, 0.05)",
        DEFAULT: "0 1px 3px 0 rgba(10, 15, 40, 0.1), 0 1px 2px 0 rgba(10, 15, 40, 0.06)",
        "md": "0 4px 6px -1px rgba(10, 15, 40, 0.1), 0 2px 4px -1px rgba(10, 15, 40, 0.06)",
        "lg": "0 10px 15px -3px rgba(10, 15, 40, 0.1), 0 4px 6px -2px rgba(10, 15, 40, 0.05)",
        "xl": "0 20px 25px -5px rgba(10, 15, 40, 0.1), 0 10px 10px -5px rgba(10, 15, 40, 0.04)",
        "2xl": "0 25px 50px -12px rgba(10, 15, 40, 0.25)",
        // Custom Glows
        "rocket": "0 4px 14px 0 rgba(215, 44, 44, 0.3)",
        "cosmic": "0 8px 24px 0 rgba(232, 104, 84, 0.2)",
      },
      backgroundImage: {
        "grain-texture": "url('https://www.transparenttextures.com/patterns/subtle-white-feathers.png')",
      },
      animation: {
        "fade-in": "fadeIn 500ms ease-out",
        "slide-in-right": "slideInRight 400ms ease-out",
        "scale-in": "scaleIn 300ms ease-out",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      transitionDuration: {
        instant: "100ms",
        fast: "200ms",
        normal: "300ms",
        slow: "500ms",
        slower: "700ms",
      },
    },
  },
  plugins: [],
};

export default config;
