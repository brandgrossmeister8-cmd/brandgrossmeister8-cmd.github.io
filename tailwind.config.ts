import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["Tahoma", "Geneva", "Verdana", "sans-serif"],
      },
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
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
        dark: {
          DEFAULT: "hsl(var(--dark))",
          foreground: "hsl(var(--dark-foreground))",
        },
        spectator: {
          DEFAULT: "hsl(var(--spectator-accent))",
          foreground: "hsl(var(--spectator-accent-foreground))",
        },
        track: {
          DEFAULT: "hsl(var(--track))",
          line: "hsl(var(--track-line))",
          surface: "hsl(var(--track-surface))",
        },
        dashboard: {
          DEFAULT: "hsl(var(--dashboard-bg))",
          border: "hsl(var(--dashboard-border))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-speed": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.08)" },
        },
        "car-move": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(var(--move-distance, 0px))" },
        },
        "overtake": {
          "0%": { transform: "translateY(0) scale(1)" },
          "30%": { transform: "translateY(-8px) scale(1.05)" },
          "70%": { transform: "translateY(-4px) scale(1.02)" },
          "100%": { transform: "translateY(0) scale(1)" },
        },
        "flag-wave": {
          "0%, 100%": { transform: "rotate(-5deg)" },
          "50%": { transform: "rotate(5deg)" },
        },
        "engine-rumble": {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-1px) translateY(0.5px)" },
          "50%": { transform: "translateX(1px) translateY(-0.5px)" },
          "75%": { transform: "translateX(-0.5px) translateY(0.5px)" },
        },
        "speed-dash": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "30%": { opacity: "0.6" },
          "100%": { transform: "translateX(300%)", opacity: "0" },
        },
        "traffic-light": {
          "0%": { backgroundColor: "hsl(var(--destructive))" },
          "33%": { backgroundColor: "hsl(var(--spectator-accent))" },
          "66%, 100%": { backgroundColor: "hsl(var(--success))" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-speed": "pulse-speed 0.6s ease-in-out",
        "car-move": "car-move 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "overtake": "overtake 0.6s ease-in-out",
        "flag-wave": "flag-wave 1s ease-in-out infinite",
        "engine-rumble": "engine-rumble 0.1s ease-in-out infinite",
        "speed-dash": "speed-dash 1.5s ease-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
