export function initDoughnutChart() {
  const csvFilePath = "./pag1/Recuento de UserKey por LevelName.csv";
  const ctx = document.getElementById("doughnutChart").getContext("2d");

  // Variable para mantener referencia del gráfico
  let chartInstance = null;

  // Mostrar mensaje de carga inicial con animación
  renderLoadingMessage(ctx, "Cargando datos de usuarios...");

  fetch(csvFilePath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`No se pudo cargar el archivo CSV: ${csvFilePath}`);
      }
      return response.text();
    })
    .then((csvData) => {
      const processedData = processCSVData(csvData);

      if (processedData.labels.length === 0) {
        throw new Error("No se encontraron datos válidos en el archivo");
      }

      // Destruir gráfico anterior si existe
      if (chartInstance) {
        chartInstance.destroy();
      }

      // Crear nuevo gráfico
      chartInstance = createDoughnutChart(ctx, processedData);

      // Añadir listeners para responsive behavior
      addResizeListener(chartInstance);
    })
    .catch((error) => {
      console.error("Error al cargar datos de niveles:", error);
      renderErrorMessage(ctx, "Error al cargar datos de usuarios");
    });
}

// Función mejorada para procesar datos CSV
function processCSVData(csvData) {
  const rows = csvData.split(/\r\n|\n/);
  const headers = rows[0].split(",").map((h) => h.trim());

  const labels = [];
  const data = [];
  let totalUsers = 0;

  // Validar headers
  const levelNameIndex = headers.indexOf("LevelName");
  const userKeyIndex = headers.indexOf("Recuento de UserKey");

  if (levelNameIndex === -1 || userKeyIndex === -1) {
    throw new Error("Headers requeridos no encontrados en el CSV");
  }

  // Procesar datos con mejor validación
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i].trim();
    if (!row) continue;

    const cols = row.split(",").map((col) => col.trim());
    const levelName = cols[levelNameIndex];
    const userKeyCount = parseInt(cols[userKeyIndex]);

    if (levelName && !isNaN(userKeyCount) && userKeyCount > 0) {
      labels.push(levelName);
      data.push(userKeyCount);
      totalUsers += userKeyCount;
    }
  }

  // Ordenar datos de mayor a menor
  const sortedData = sortDataByValue(labels, data);

  return {
    labels: sortedData.sortedLabels,
    data: sortedData.sortedValues,
    total: totalUsers,
  };
}

function createDoughnutChart(ctx, { labels, data, total }) {
  // Configuración de colores mejorada
  const colors = generateAdvancedGradientColors(data.length);

  return new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      color: "#ffffff", // Changed to white
      datasets: [
        {
          label: "Usuarios por nivel",
          data: data,
          backgroundColor: colors.backgrounds,
          borderColor: colors.borders,
          borderWidth: 2,
          hoverOffset: 25,
          hoverBorderWidth: 4,
          hoverBorderColor: "rgba(255, 255, 255, 0.9)",
          hoverBackgroundColor: colors.hovers,
          cutout: "65%",
          radius: "90%",
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1.2,
      devicePixelRatio: window.devicePixelRatio || 1,
      plugins: {
        legend: {
          position: "right",
          align: "start",
          maxWidth: 300,
          labels: {
            color: "#ffffff", // Changed to white

            font: {
              family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              size: 13,
              weight: "500",
            },
            padding: 15,
            usePointStyle: true,
            pointStyle: "circle",
            boxWidth: 10,
            boxHeight: 10,
            generateLabels: function (chart) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels.map((label, i) => {
                  const value = data.datasets[0].data[i];
                  const percentage = ((value / total) * 100).toFixed(1);
                  const bgColor = data.datasets[0].backgroundColor[i];

                  return {
                    text: `${label}: ${value.toLocaleString()} (${percentage}%)`,
                    fillStyle: bgColor,
                    strokeStyle: data.datasets[0].borderColor[i],
                    lineWidth: 2,
                    hidden: isNaN(value) || value === 0,
                    index: i,
                  };
                });
              }
              return [];
            },
          },
          onClick: function (e, legendItem, legend) {
            const index = legendItem.index;
            const chart = legend.chart;

            if (chart && chart.getDatasetMeta) {
              const meta = chart.getDatasetMeta(0);
              if (meta && meta.data && meta.data[index]) {
                // Toggle visibility con animación suave
                meta.data[index].hidden = !meta.data[index].hidden;
                chart.update("active");

                // Actualizar tooltips
                setTimeout(() => {
                  if (chart.options && chart.options.plugins) {
                    chart.options.plugins.centerText = { display: true };
                    chart.update("none");
                  }
                }, 100);
              }
            }
          },
        },
        title: {
          display: true,
          color: "#ffffff",
          font: {
            family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            size: 20,
            weight: "700",
          },
          padding: {
            bottom: 35,
          },
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.98)",
          titleColor: "#ffffff",
          bodyColor: "#e2e8f0",
          borderColor: "rgba(59, 130, 246, 0.5)",
          borderWidth: 1,
          cornerRadius: 12,
          padding: 16,
          displayColors: true,
          usePointStyle: true,
          titleFont: {
            size: 14,
            weight: "600",
          },
          bodyFont: {
            size: 13,
          },
          callbacks: {
            title: function (context) {
              return `Nivel: ${context[0].label}`;
            },
            label: function (context) {
              const percentage = ((context.raw / total) * 100).toFixed(1);
              return ` Usuarios: ${context.raw.toLocaleString()} (${percentage}%)`;
            },
            afterLabel: function (context) {
              const rank = data.indexOf(context.raw) + 1;
              return `Ranking: #${rank}`;
            },
            footer: function (context) {
              const visibleTotal = getVisibleTotal(context[0].chart);
              return [
                `Total visible: ${visibleTotal.toLocaleString()}`,
                `Total general: ${total.toLocaleString()}`,
              ];
            },
          },
        },
        datalabels: {
          display: function (context) {
            const value = context.dataset.data[context.dataIndex];
            const percentage = (value / total) * 100;
            // Mostrar solo si es mayor al 3% y no está oculto
            return (
              percentage > 3 &&
              !context.chart.getDatasetMeta(0).data[context.dataIndex].hidden
            );
          },
          color: "#ffffff",
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: "bold",
          },
          formatter: (value, context) => {
            const percentage = ((value / total) * 100).toFixed(1);
            return `${percentage}%`;
          },
          anchor: "center",
          align: "center",
          offset: 0,
          clip: false,
          backgroundColor: function (context) {
            return context.dataset.backgroundColor[context.dataIndex] + "40";
          },
          borderColor: function (context) {
            return context.dataset.backgroundColor[context.dataIndex];
          },
          borderRadius: 6,
          borderWidth: 1,
          padding: 4,
        },
      },
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 2000,
        easing: "easeOutCubic",
        onProgress: function (animation) {
          // Efecto de progreso suave - removido para evitar conflictos
        },
        onComplete: function (animation) {
          // Añadir texto central al completar animación
          const chart = animation.chart;
          if (chart && chart.options) {
            chart.options.plugins.centerText = { display: true };
            chart.update("none");
          }
        },
      },
      layout: {
        padding: {
          top: 25,
          bottom: 25,
          left: 25,
          right: 25,
        },
      },
      onHover: (event, chartElement) => {
        event.native.target.style.cursor = chartElement[0]
          ? "pointer"
          : "default";

        // Efecto hover en el canvas
        if (chartElement[0]) {
          event.chart.canvas.style.filter = "brightness(1.1)";
        } else {
          event.chart.canvas.style.filter = "brightness(1)";
        }
      },
      onClick: (event, elements) => {
        if (elements.length > 0) {
          const chart = event.chart;
          const { index } = elements[0];

          if (chart && chart.toggleDataVisibility) {
            // Animación de click con feedback visual
            chart.toggleDataVisibility(index);
            chart.update("active");

            // Actualizar estadísticas centrales
            setTimeout(() => {
              if (chart.options && chart.options.plugins) {
                chart.options.plugins.centerText = { display: true };
                chart.update("none");
              }
            }, 100);

            // Efecto de vibración sutil
            if (chart.canvas) {
              chart.canvas.style.transform = "scale(1.02)";
              chart.canvas.style.transition = "transform 0.15s ease";
              setTimeout(() => {
                chart.canvas.style.transform = "scale(1)";
                setTimeout(() => {
                  chart.canvas.style.transition = "";
                }, 150);
              }, 150);
            }
          }
        }
      },
    },
    plugins: [
      ChartDataLabels,
      {
        // Plugin personalizado para texto central
        id: "centerText",
        afterDraw: function (chart) {
          if (chart.config.options.plugins.centerText?.display !== false) {
            drawCenterText(chart, total);
          }
        },
      },
    ],
  });
}

// Funciones auxiliares mejoradas

function sortDataByValue(labels, values) {
  const combined = labels.map((label, i) => ({
    label,
    value: values[i],
  }));

  combined.sort((a, b) => b.value - a.value);

  return {
    sortedLabels: combined.map((item) => item.label),
    sortedValues: combined.map((item) => item.value),
  };
}

function generateAdvancedGradientColors(count) {
  const baseColors = [
    { bg: "#6366f1", border: "#4f46e5", hover: "#7c3aed" },
    { bg: "#06b6d4", border: "#0891b2", hover: "#0284c7" },
    { bg: "#10b981", border: "#059669", hover: "#047857" },
    { bg: "#f59e0b", border: "#d97706", hover: "#b45309" },
    { bg: "#ef4444", border: "#dc2626", hover: "#b91c1c" },
    { bg: "#8b5cf6", border: "#7c3aed", hover: "#6d28d9" },
    { bg: "#f97316", border: "#ea580c", hover: "#c2410c" },
    { bg: "#14b8a6", border: "#0d9488", hover: "#0f766e" },
    { bg: "#ec4899", border: "#db2777", hover: "#be185d" },
  ];

  const backgrounds = [];
  const borders = [];
  const hovers = [];

  for (let i = 0; i < count; i++) {
    if (i < baseColors.length) {
      backgrounds.push(baseColors[i].bg);
      borders.push(baseColors[i].border);
      hovers.push(baseColors[i].hover);
    } else {
      const hue = ((i * 360) / count) % 360;
      const saturation = 70 + (i % 3) * 10;
      const lightness = 55 + (i % 2) * 10;

      backgrounds.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
      borders.push(`hsl(${hue}, ${saturation}%, ${lightness - 10}%)`);
      hovers.push(`hsl(${hue}, ${saturation}%, ${lightness + 10}%)`);
    }
  }

  return { backgrounds, borders, hovers };
}

function getVisibleTotal(chart) {
  try {
    const meta = chart.getDatasetMeta(0);
    let visibleTotal = 0;

    if (
      chart.data &&
      chart.data.datasets &&
      chart.data.datasets[0] &&
      chart.data.datasets[0].data
    ) {
      chart.data.datasets[0].data.forEach((value, index) => {
        if (meta && meta.data && meta.data[index] && !meta.data[index].hidden) {
          visibleTotal += value;
        }
      });
    }

    return visibleTotal;
  } catch (error) {
    console.warn("Error calculating visible total:", error);
    return 0;
  }
}

function drawCenterText(chart, total) {
  try {
    if (!chart || !chart.ctx || !chart.chartArea) return;

    const ctx = chart.ctx;
    const centerX =
      chart.chartArea.left + (chart.chartArea.right - chart.chartArea.left) / 2;
    const centerY =
      chart.chartArea.top + (chart.chartArea.bottom - chart.chartArea.top) / 2;

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Total principal
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px Inter, sans-serif";
    ctx.fillText(total.toLocaleString(), centerX, centerY - 10);

    // Etiqueta
    ctx.fillStyle = "#94a3b8";
    ctx.font = "14px Inter, sans-serif";
    ctx.fillText("Total Usuarios", centerX, centerY + 15);

    ctx.restore();
  } catch (error) {
    console.warn("Error drawing center text:", error);
  }
}

function updateCenterText(chart, total) {
  try {
    if (chart && chart.options && chart.options.plugins) {
      chart.options.plugins.centerText = { display: true };
      chart.update("none");
    }
  } catch (error) {
    console.warn("Error updating center text:", error);
  }
}

function addResizeListener(chart) {
  let resizeTimeout;

  const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      try {
        if (chart && !chart.destroyed && chart.resize) {
          chart.resize();
        }
      } catch (error) {
        console.warn("Error during chart resize:", error);
      }
    }, 250);
  };

  window.addEventListener("resize", handleResize);

  // Limpiar listener cuando el gráfico se destruya
  const originalDestroy = chart.destroy;
  chart.destroy = function () {
    window.removeEventListener("resize", handleResize);
    if (originalDestroy) {
      originalDestroy.call(this);
    }
  };
}

// Funciones de estado mejoradas
function renderLoadingMessage(ctx, message) {
  try {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Fondo semi-transparente
    ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Spinner animado simple (sin recursión)
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;

    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY - 20, 15, 0, Math.PI * 1.5);
    ctx.stroke();

    // Texto
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "16px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(message, centerX, centerY + 20);
  } catch (error) {
    console.warn("Error rendering loading message:", error);
  }
}

function renderErrorMessage(ctx, message) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Fondo de error
  ctx.fillStyle = "rgba(239, 68, 68, 0.1)";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Icono de error
  const centerX = ctx.canvas.width / 2;
  const centerY = ctx.canvas.height / 2;

  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(centerX, centerY - 20, 15, 0, Math.PI * 2);
  ctx.moveTo(centerX - 7, centerY - 27);
  ctx.lineTo(centerX + 7, centerY - 13);
  ctx.moveTo(centerX + 7, centerY - 27);
  ctx.lineTo(centerX - 7, centerY - 13);
  ctx.stroke();

  // Texto de error
  ctx.fillStyle = "#ef4444";
  ctx.font = "bold 16px Inter";
  ctx.textAlign = "center";
  ctx.fillText(message, centerX, centerY + 20);
}
