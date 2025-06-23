document.addEventListener("DOMContentLoaded", function () {
  const csvFilePath = "pag1/Recuento de UserKey por LevelName.csv"; // Cambia esto si tu archivo está en otra ubicación

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

      const labels = [];
      const data = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;

        const cols = row.split(",");
        const levelName = cols[headers.indexOf("LevelName")];
        const userKeyCount = parseInt(
          cols[headers.indexOf("Recuento de UserKey")]
        );

        if (levelName && !isNaN(userKeyCount)) {
          labels.push(levelName);
          data.push(userKeyCount);
        }
      }

      // Dibujar gráfica de anillos
      const ctx = document.getElementById("doughnutChart").getContext("2d");
      new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Usuarios por nivel",
              data: data,
              backgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56",
                "#4BC0C0",
                "#9966FF",
              ],
              hoverOffset: 30,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "right",
            },
            title: {
              display: true,
              text: "Distribución de Usuarios por Nivel",
            },
          },
        },
      });
    })
    .catch((error) => {
      console.error("Error al procesar el CSV:", error);
      document.body.innerHTML += `<p style="color:red;">Error: ${error.message}</p>`;
    });
});
