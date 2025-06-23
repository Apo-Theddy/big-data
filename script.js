// Configuración de Tailwind
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        primary: "#6366f1",
        "primary-dark": "#4f46e5",
        secondary: "#06b6d4",
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        "bg-primary": "#0f0f23",
        "bg-secondary": "#1a1a3e",
      },
      animation: {
        "fade-in-up": "fadeInUp 1s ease-out",
        "fade-in-up-delay": "fadeInUp 1s ease-out 0.2s both",
        "spin-slow": "spin 1s linear infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(30px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
};

// main.js
import { initTable } from "./tableManager.js";
import { initDoughnutChart } from "./doughnutChart.js";
import { initStackedBarChart } from "./stackedBarChart.js";

document.addEventListener("DOMContentLoaded", () => {
  initTable();
  initDoughnutChart();
  initStackedBarChart();
});
