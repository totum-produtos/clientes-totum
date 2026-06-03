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
        // Totum Red Theme — dark only. Legacy names are kept as aliases so
        // existing screens inherit the new system without a noisy rewrite.
        rausch: {
          DEFAULT: "#da2128",
          active: "#e3433e",
          disabled: "#4b2026",
        },
        "rausch-light": "#e3433e",
        "totum-secondary": "#077ac7",
        "secondary-purple": "#6b21ef",
        luxe: "#6b21ef",
        plus: "#e3433e",
        ink: "#ffffff",
        body: "#d1cece",
        muted: {
          DEFAULT: "#9ca3af",
          soft: "#9ca3af",
        },
        hairline: {
          DEFAULT: "#1f192a",
          soft: "#1b1728",
        },
        "border-strong": "#1f192a",
        canvas: "#0e0918",
        "navy-deep": "#0e0918",
        "navy-card": "#1b1728",
        "navy-elevated": "#1f192a",
        "surface-soft": "#1b1728",
        "surface-card": "#1b1728",
        "surface-strong": "#1f192a",
        "white-soft": "#d1cece",
        "red-light": "#ef9c9a",
        "on-primary": "#ffffff",
        "on-dark": "#ffffff",
        "legal-link": "#077ac7",
        "star-rating": "#da2128",
        scrim: "#000000",
        "error-text": "#d91616",
        "error-text-hover": "#ef9c9a",

        // Semantic status
        success: {
          DEFAULT: "#35a670",
          bg: "#123527",
          text: "#67d99b",
        },
        warning: {
          DEFAULT: "#eaa800",
          bg: "#3f3212",
          text: "#ffd166",
        },
        danger: {
          DEFAULT: "#d91616",
          bg: "#3a1218",
          text: "#ef9c9a",
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
          "Geomanist",
          "Inter",
          "-apple-system",
          "system-ui",
          "Roboto",
          "Helvetica Neue",
          "sans-serif",
        ],
        display: [
          "Geomanist",
          "Inter",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "SFMono-Regular",
          "Menlo",
          "monospace",
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
        xs: "2px",
        sm: "2px",
        md: "4px",
        lg: "6px",
        xl: "8px",
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
        airbnb: "0 14px 40px rgba(0, 0, 0, 0.28)",
        "airbnb-hover": "0 18px 55px rgba(218, 33, 40, 0.18)",
        brand: "inset 0 1px 1px #ffffff18, 0 16px 50px #08080855",
        red: "0 7px 80px -12px rgba(218, 33, 40, 0.8)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
