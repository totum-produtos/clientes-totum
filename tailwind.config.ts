import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Airbnb Design System — Rausch
        rausch: {
          DEFAULT: "#ff385c",
          active: "#e00b41",
          disabled: "#ffd1da",
        },
        luxe: "#460479",
        plus: "#92174d",
        ink: "#222222",
        body: "#3f3f3f",
        muted: {
          DEFAULT: "#6a6a6a",
          soft: "#929292",
        },
        hairline: {
          DEFAULT: "#dddddd",
          soft: "#ebebeb",
        },
        "border-strong": "#c1c1c1",
        canvas: "#ffffff",
        "surface-soft": "#f7f7f7",
        "surface-card": "#ffffff",
        "surface-strong": "#f2f2f2",
        "on-primary": "#ffffff",
        "on-dark": "#ffffff",
        "legal-link": "#428bff",
        "star-rating": "#222222",
        scrim: "#000000",
        "error-text": "#c13515",
        "error-text-hover": "#b32505",

        // Semantic status
        success: {
          DEFAULT: "#008a05",
          bg: "#e6f4ea",
          text: "#008a05",
        },
        warning: {
          DEFAULT: "#eaa800",
          bg: "#fef7e0",
          text: "#b38600",
        },
        danger: {
          DEFAULT: "#c13515",
          bg: "#fcece8",
          text: "#c13515",
        },

        // shadcn/ui compatibility
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      fontFamily: {
        cereal: [
          "Inter",
          "Circular",
          "-apple-system",
          "system-ui",
          "Roboto",
          "Helvetica Neue",
          "sans-serif",
        ],
      },
      fontSize: {
        "display-xl": ["28px", { lineHeight: "1.43", fontWeight: "700", letterSpacing: "0" }],
        "display-lg": ["22px", { lineHeight: "1.18", fontWeight: "500", letterSpacing: "-0.44px" }],
        "display-md": ["21px", { lineHeight: "1.43", fontWeight: "700", letterSpacing: "0" }],
        "display-sm": ["20px", { lineHeight: "1.2", fontWeight: "600", letterSpacing: "-0.18px" }],
        "title-md": ["16px", { lineHeight: "1.25", fontWeight: "600", letterSpacing: "0" }],
        "title-sm": ["16px", { lineHeight: "1.25", fontWeight: "500", letterSpacing: "0" }],
        "rating-display": ["64px", { lineHeight: "1.1", fontWeight: "700", letterSpacing: "-1px" }],
        "body-md": ["16px", { lineHeight: "1.5", fontWeight: "400", letterSpacing: "0" }],
        "body-sm": ["14px", { lineHeight: "1.43", fontWeight: "400", letterSpacing: "0" }],
        caption: ["14px", { lineHeight: "1.29", fontWeight: "500", letterSpacing: "0" }],
        "caption-sm": ["13px", { lineHeight: "1.23", fontWeight: "400", letterSpacing: "0" }],
        badge: ["11px", { lineHeight: "1.18", fontWeight: "600", letterSpacing: "0" }],
        "micro-label": ["12px", { lineHeight: "1.33", fontWeight: "700", letterSpacing: "0" }],
        "uppercase-tag": ["8px", { lineHeight: "1.25", fontWeight: "700", letterSpacing: "0.32px" }],
        "button-md": ["16px", { lineHeight: "1.25", fontWeight: "500", letterSpacing: "0" }],
        "button-sm": ["14px", { lineHeight: "1.29", fontWeight: "500", letterSpacing: "0" }],
        link: ["14px", { lineHeight: "1.43", fontWeight: "400", letterSpacing: "0" }],
        "nav-link": ["16px", { lineHeight: "1.25", fontWeight: "600", letterSpacing: "0" }],
      },
      borderRadius: {
        none: "0px",
        xs: "4px",
        sm: "8px",
        md: "14px",
        lg: "20px",
        xl: "32px",
        full: "9999px",
      },
      spacing: {
        xxs: "2px",
        xs: "4px",
        sm: "8px",
        md: "12px",
        base: "16px",
        lg: "24px",
        xl: "32px",
        xxl: "48px",
        section: "64px",
      },
      boxShadow: {
        airbnb: "rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.04) 0 2px 6px 0, rgba(0, 0, 0, 0.1) 0 4px 8px 0",
        "airbnb-hover": "rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.04) 0 2px 6px, rgba(0, 0, 0, 0.1) 0 4px 8px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
