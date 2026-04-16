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
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        primary: "#18181B",
        "primary-foreground": "#FAFAFA",
        secondary: "#3F3F46",
        accent: "#2563EB",
        background: "#FAFAFA",
        foreground: "#09090B",
        muted: "#71717A",
        "muted-foreground": "#A1A1AA",
        border: "#E4E4E7",
        card: "#FFFFFF",
      },
      boxShadow: {
        soft: "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)",
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#3F3F46",
            maxWidth: "none",
            lineHeight: "1.75",
            p: {
              marginTop: "0",
              marginBottom: "1.5rem",
            },
            a: {
              color: "#2563EB",
              textDecoration: "underline",
              textUnderlineOffset: "0.25em",
              fontWeight: "500",
            },
            strong: {
              color: "#18181B",
            },
            h2: {
              color: "#18181B",
              fontWeight: "600",
              fontSize: "1.5rem",
              lineHeight: "1.3",
              marginTop: "2.5rem",
              marginBottom: "1rem",
            },
            h3: {
              color: "#18181B",
              fontWeight: "600",
            },
            blockquote: {
              borderLeftWidth: "2px",
              borderLeftColor: "#E4E4E7",
              fontStyle: "normal",
              color: "#3F3F46",
              paddingTop: "0.25rem",
              paddingBottom: "0.25rem",
              paddingLeft: "1.25rem",
            },
            img: {
              borderRadius: "0.5rem",
            },
            ul: {
              paddingLeft: "1.2rem",
            },
            ol: {
              paddingLeft: "1.2rem",
            },
            code: {
              color: "#18181B",
              backgroundColor: "#F4F4F5",
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
