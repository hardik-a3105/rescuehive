/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0B1220",
        surface: "#111827",
        card: "#1E293B",
        border: "#243244",
        primary: {
          DEFAULT: "#2563EB",
          hover: "#3B76F0",
          muted: "#1D4ED8",
        },
        live: "#06B6D4",
        success: "#22C55E",
        warning: "#F59E0B",
        critical: "#EF4444",
        muted: "#94A3B8",
        "muted-foreground": "#64748B",
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glow-live": "0 0 12px rgba(6, 182, 212, 0.5)",
        "glow-critical": "0 0 12px rgba(239, 68, 68, 0.5)",
      },
      keyframes: {
        pulseRing: {
          "0%": { transform: "scale(0.8)", opacity: "0.8" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        heartbeat: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
        },
        slideInRight: {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-500px 0" },
          "100%": { backgroundPosition: "500px 0" },
        },
      },
      animation: {
        pulseRing: "pulseRing 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        heartbeat: "heartbeat 1.4s ease-in-out infinite",
        slideInRight: "slideInRight 0.25s ease-out",
        shimmer: "shimmer 1.8s infinite linear",
      },
    },
  },
  plugins: [],
};
