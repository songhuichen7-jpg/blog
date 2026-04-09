import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "background": "#faf9f7",
        "surface": "#faf9f7",
        "surface-bright": "#faf9f7",
        "surface-dim": "#d6dbd7",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f4f1",
        "surface-container": "#edeeeb",
        "surface-container-high": "#e6e9e6",
        "surface-container-highest": "#e0e3e0",
        "surface-variant": "#e0e3e0",
        "surface-tint": "#5f5e5e",
        "on-surface": "#2f3331",
        "on-surface-variant": "#5c605d",
        "outline": "#777c79",
        "outline-variant": "#afb3b0",
        "primary": "#5f5e5e",
        "primary-dim": "#535252",
        "primary-container": "#e4e2e1",
        "on-primary": "#faf7f6",
        "secondary": "#526358",
        "secondary-dim": "#46574c",
        "secondary-container": "#d4e7d9",
        "secondary-fixed": "#d4e7d9",
        "on-secondary-fixed": "#324339",
        "tertiary": "#4e6173",
        "tertiary-container": "#cde2f8",
        "error": "#9f403d",
      },
      fontFamily: {
        headline: ["var(--font-noto-serif)", "var(--font-noto-serif-sc)", "serif"],
        body: ["var(--font-manrope)", "sans-serif"],
        label: ["var(--font-manrope)", "sans-serif"],
      },
      boxShadow: {
        ambient: "0 10px 40px rgba(47, 51, 49, 0.05)",
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "9999px",
      },
      letterSpacing: {
        editorial: "-0.02em",
      },
      animation: {
        "fade-up": "fadeUp 600ms ease-out both",
      },
      keyframes: {
        fadeUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(16px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#5c605d",
            maxWidth: "none",
            lineHeight: "1.75",
            p: {
              marginTop: "0",
              marginBottom: "1.5rem",
            },
            a: {
              color: "#5f5e5e",
              textDecoration: "underline",
              textUnderlineOffset: "0.28em",
              fontWeight: "600",
            },
            strong: {
              color: "#2f3331",
            },
            h2: {
              color: "#2f3331",
              fontFamily: "var(--font-noto-serif), var(--font-noto-serif-sc), serif",
              fontWeight: "700",
              fontSize: "2rem",
              lineHeight: "1.25",
              marginTop: "3rem",
              marginBottom: "1.5rem",
            },
            h3: {
              color: "#2f3331",
              fontFamily: "var(--font-noto-serif), var(--font-noto-serif-sc), serif",
              fontWeight: "700",
            },
            blockquote: {
              borderLeftWidth: "3px",
              borderLeftColor: "#afb3b0",
              fontFamily: "var(--font-noto-serif), var(--font-noto-serif-sc), serif",
              fontStyle: "italic",
              fontSize: "1.15rem",
              lineHeight: "1.6",
              color: "#5f5e5e",
              paddingTop: "0.5rem",
              paddingBottom: "0.5rem",
              paddingLeft: "1.5rem",
            },
            img: {
              borderRadius: "0.75rem",
            },
            ul: {
              paddingLeft: "1.2rem",
            },
            ol: {
              paddingLeft: "1.2rem",
            },
            code: {
              color: "#2f3331",
              backgroundColor: "rgba(237, 238, 235, 0.9)",
              borderRadius: "0.25rem",
              padding: "0.15rem 0.4rem",
              fontWeight: "500",
            },
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
          },
        },
      },
    },
  },
  plugins: [forms, typography],
};

export default config;
