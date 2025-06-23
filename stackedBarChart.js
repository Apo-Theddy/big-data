// Función mejorada para el gráfico de barras apiladas
export function initStackedBarChart() {
  const csvFilePath =
    "/pag2/Recuento de BadgeKey por BadgeName y BadgeCategory.csv";
  const ctx = document.getElementById("stackedBarChart").getContext("2d");

  // Mostrar mensaje de carga inicial
  renderLoadingMessage(ctx, "Cargando datos de badges...");

  fetch(csvFilePath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`No se pudo cargar el archivo CSV: ${csvFilePath}`);
      }
      return response.text();
    })
    .then((csvData) => {
      const rows = csvData.split(/\r\n|\n/);
      const headers = rows[0].split(",").map((h) => h.trim());

      // Procesar los datos
      const badgeData = {};
      const categories = new Set();

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;

        const cols = row.split(",");
        if (cols.length < 3) continue;

        const badgeName = cols[headers.indexOf("BadgeName")];
        const badgeCategory = cols[headers.indexOf("BadgeCategory")];
        const badgeCount =
          parseInt(cols[headers.indexOf("Recuento de BadgeKey")]) || 0;

        if (badgeName && badgeCategory) {
          if (!badgeData[badgeName]) {
            badgeData[badgeName] = {};
          }
          badgeData[badgeName][badgeCategory] = badgeCount;
          categories.add(badgeCategory);
        }
      }

      // Preparar los datos para Chart.js
      const badgeNames = Object.keys(badgeData);
      const categoryList = Array.from(categories);

      // Ordenar categorías para consistencia
      categoryList.sort();

      // Crear datasets para cada categoría
      const datasets = categoryList.map((category, index) => {
        const color = getCategoryColor(category, index, categoryList.length);

        return {
          label: category,
          data: badgeNames.map(
            (badgeName) => badgeData[badgeName][category] || 0
          ),
          backgroundColor: color.background,
          borderColor: color.border,
          borderWidth: 2,
          hoverBackgroundColor: color.hover,
          borderRadius: 8,
          borderSkipped: false,
        };
      });

      // Ordenar badges por total
      const sortedBadges = sortBadgesByTotal(
        badgeNames,
        badgeData,
        categoryList
      );

      // Crear el gráfico
      createStackedBarChart(ctx, {
        labels: sortedBadges,
        datasets: datasets,
        categoryList: categoryList,
      });
    })
    .catch((error) => {
      console.error("Error al cargar datos de badges:", error);
      renderErrorMessage(ctx, "Error al cargar datos de badges");
    });
}

// Función mejorada para crear el gráfico de barras apiladas
function createStackedBarChart(ctx, { labels, datasets, categoryList }) {
  return new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "x",
      scales: {
        x: {
          stacked: true,
          grid: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            color: "#e2e8f0",
            font: {
              family: "Inter",
              size: 12,
              weight: "500",
            },
            maxRotation: 45,
            minRotation: 45,
            // SOLUCIÓN MÁS SIMPLE: Eliminar el callback completamente
            // Chart.js mostrará automáticamente los labels correctos
          },
          // Aumentar el espacio entre barras
          categoryPercentage: 0.8,
          barPercentage: 0.95,
        },
        y: {
          stacked: true,
          beginAtZero: true,
          grid: {
            color: "rgba(255, 255, 255, 0.08)",
            drawBorder: false,
          },
          ticks: {
            color: "#e2e8f0",
            font: {
              family: "Inter",
              size: 13,
              weight: "500",
            },
            callback: function (value) {
              return value.toLocaleString();
            },
          },
          title: {
            display: true,
            text: "Cantidad de Badges",
            color: "#e2e8f0",
            font: {
              family: "Inter",
              size: 16,
              weight: "600",
            },
          },
        },
      },
      plugins: {
        legend: {
          position: "top",
          align: "center",
          labels: {
            color: "#e2e8f0",
            font: {
              family: "Inter",
              size: 14,
              weight: "500",
            },
            padding: 20,
            usePointStyle: true,
            pointStyle: "rect",
            boxWidth: 12,
            boxHeight: 12,
          },
          onClick: (e, legendItem, legend) => {
            const index = legendItem.datasetIndex;
            const ci = legend.chart;

            if (ci.isDatasetVisible(index)) {
              ci.hide(index);
              legendItem.hidden = true;
            } else {
              ci.show(index);
              legendItem.hidden = false;
            }
          },
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          titleColor: "#ffffff",
          bodyColor: "#e2e8f0",
          borderColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 1,
          cornerRadius: 12,
          padding: 16,
          displayColors: true,
          usePointStyle: true,
          callbacks: {
            label: function (context) {
              const label = context.dataset.label || "";
              const value = context.raw || 0;
              return ` ${label}: ${value.toLocaleString()}`;
            },
            footer: function (context) {
              const total = context.reduce((sum, item) => sum + item.raw, 0);
              return [`Total: ${total.toLocaleString()}`];
            },
          },
        },
      },
      animation: {
        duration: 1800,
        easing: "easeOutQuart",
      },
      layout: {
        padding: {
          left: 20,
          right: 20,
          top: 20,
          bottom: 60, // Más espacio abajo para los nombres largos
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
    },
  });
}

// Función para ordenar badges por total (corregida)
function sortBadgesByTotal(badgeNames, badgeData, categories) {
  return [...badgeNames].sort((a, b) => {
    const totalA = categories.reduce(
      (sum, cat) => sum + (badgeData[a][cat] || 0),
      0
    );
    const totalB = categories.reduce(
      (sum, cat) => sum + (badgeData[b][cat] || 0),
      0
    );
    return totalB - totalA; // Orden descendente
  });
}

// Función mejorada para obtener colores consistentes por categoría
function getCategoryColor(category, index, totalCategories) {
  const colors = [
    {
      background: "rgba(99, 102, 241, 0.85)",
      border: "rgba(99, 102, 241, 1)",
      hover: "rgba(99, 102, 241, 0.95)",
    },
    {
      background: "rgba(16, 185, 129, 0.85)",
      border: "rgba(16, 185, 129, 1)",
      hover: "rgba(16, 185, 129, 0.95)",
    },
    {
      background: "rgba(245, 158, 11, 0.85)",
      border: "rgba(245, 158, 11, 1)",
      hover: "rgba(245, 158, 11, 0.95)",
    },
    {
      background: "rgba(139, 92, 246, 0.85)",
      border: "rgba(139, 92, 246, 1)",
      hover: "rgba(139, 92, 246, 0.95)",
    },
    {
      background: "rgba(236, 72, 153, 0.85)",
      border: "rgba(236, 72, 153, 1)",
      hover: "rgba(236, 72, 153, 0.95)",
    },
    {
      background: "rgba(6, 182, 212, 0.85)",
      border: "rgba(6, 182, 212, 1)",
      hover: "rgba(6, 182, 212, 0.95)",
    },
    {
      background: "rgba(239, 68, 68, 0.85)",
      border: "rgba(239, 68, 68, 1)",
      hover: "rgba(239, 68, 68, 0.95)",
    },
    {
      background: "rgba(168, 85, 247, 0.85)",
      border: "rgba(168, 85, 247, 1)",
      hover: "rgba(168, 85, 247, 0.95)",
    },
  ];

  // Si hay más categorías que colores predefinidos, generamos colores dinámicos
  if (index >= colors.length) {
    const hue = Math.floor((index * 360) / totalCategories);
    return {
      background: `hsla(${hue}, 70%, 60%, 0.85)`,
      border: `hsl(${hue}, 70%, 55%)`,
      hover: `hsla(${hue}, 70%, 65%, 0.95)`,
    };
  }

  return colors[index % colors.length];
}

// Función para mostrar mensaje de carga
function renderLoadingMessage(ctx, message) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.font = "16px Inter";
  ctx.textAlign = "center";
  ctx.fillText(message, ctx.canvas.width / 2, ctx.canvas.height / 2);
}

// Función para mostrar mensaje de error
function renderErrorMessage(ctx, message) {
  ctx.fillStyle = "rgba(239, 68, 68, 0.8)";
  ctx.font = "16px Inter";
  ctx.textAlign = "center";
  ctx.fillText(message, ctx.canvas.width / 2, ctx.canvas.height / 2);
}

// Inicializar el gráfico cuando se carga la página
document.addEventListener("DOMContentLoaded", function () {
  initStackedBarChart();
});
