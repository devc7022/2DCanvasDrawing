import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cad: {
          bg: "#0f172a",
          grid: "#1e293b",
          panel: "#1e293b",
          border: "#334155",
          accent: "#38bdf8",
          select: "#f59e0b",
          line: "#60a5fa",
          rect: "#34d399",
          circle: "#a78bfa",
        },
      },
    },
  },
  plugins: [],
};
export default config;
