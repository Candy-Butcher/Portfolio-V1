import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
          keyframes: {
      'text-gradient': {
      '0%,100%': { backgroundPosition: '0% 50%' },
      '50%':     { backgroundPosition: '100% 50%' },
    },
  },
  animation: {
    'text-gradient': 'text-gradient 12s ease infinite',
  },
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      /* ✅ put ALL custom keyframes/animations here (not inside colors) */
      keyframes: {
        // StarBorder sweeps
        "star-movement-bottom": {
          "0%": { transform: "translate(0%, 0%)", opacity: "1" },
          "100%": { transform: "translate(-100%, 0%)", opacity: "0" },
        },
        "star-movement-top": {
          "0%": { transform: "translate(0%, 0%)", opacity: "1" },
          "100%": { transform: "translate(100%, 0%)", opacity: "0" },
        },

        gradient: {
      '0%':   { backgroundPosition: '0% 50%' },
      '50%':  { backgroundPosition: '100% 50%' },
      '100%': { backgroundPosition: '0% 50%' },
    },

        // existing accordion
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "star-movement-bottom": "star-movement-bottom linear infinite alternate",
        "star-movement-top": "star-movement-top linear infinite alternate",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        gradient: 'gradient 8s linear infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
