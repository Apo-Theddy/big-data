export function initTable() {
  const csvFilePath = "./pag1/data.csv";
  const tableBody = document.getElementById("tableBody");
  const pageInfo = document.getElementById("pageInfo");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const gotoPageInput = document.getElementById("gotoPage");
  const gotoBtn = document.getElementById("gotoBtn");

  const filterLocation = document.getElementById("filterLocation");
  const sortDownVotes = document.getElementById("sortDownVotes");
  const sortUpVotes = document.getElementById("sortUpVotes");

  let allData = [];
  let filteredData = [];
  let currentPage = 1;
  const rowsPerPage = 10;

  // Cargar CSV
  fetch(csvFilePath)
    .then((response) => {
      if (!response.ok) throw new Error("No se pudo cargar el archivo CSV");
      return response.text();
    })
    .then((csvData) => {
      const rows = csvData.split(/\r\n|\n/);
      const headers = rows[0].split(",").map((h) => h.trim());

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;

        const cols = row.split(",");
        const rowData = {};
        headers.forEach((header, index) => {
          rowData[header] = cols[index] ? cols[index].trim() : "";
        });
        allData.push(rowData);
      }

      applyFiltersAndSort();
    })
    .catch((error) => {
      console.error("Error:", error);
      tableBody.innerHTML = `<tr><td colspan="3" class="text-center text-danger p-8"><i class="fas fa-exclamation-triangle"></i> ${error.message}</td></tr>`;
    });

  // Aplicar filtro y ordenamiento
  function applyFiltersAndSort() {
    let result = [...allData];

    // Filtro por texto
    const locationFilter = filterLocation.value.toLowerCase();
    if (locationFilter) {
      result = result.filter((row) =>
        row.Location.toLowerCase().includes(locationFilter)
      );
    }

    // Ordenamiento DownVotes
    const downOrder = sortDownVotes.value;
    if (downOrder) {
      result.sort((a, b) => {
        const valA = parseInt(a["Recuento de DownVotes"]) || 0;
        const valB = parseInt(b["Recuento de DownVotes"]) || 0;
        return downOrder === "asc" ? valA - valB : valB - valA;
      });
    }

    // Ordenamiento UpVotes
    const upOrder = sortUpVotes.value;
    if (upOrder) {
      result.sort((a, b) => {
        const valA = parseInt(a["Recuento de UpVotes"]) || 0;
        const valB = parseInt(b["Recuento de UpVotes"]) || 0;
        return upOrder === "asc" ? valA - valB : valB - valA;
      });
    }

    filteredData = result;
    currentPage = 1;
    showPage(currentPage);
  }

  // Mostrar página actual
  function showPage(page) {
    tableBody.innerHTML = "";

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    if (page < 1 || page > totalPages) return;

    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = filteredData.slice(start, end);

    if (pageData.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="3" class="px-6 py-8 text-center text-slate-400">
            No se encontraron resultados
          </td>
        </tr>
      `;
    } else {
      pageData.forEach((row) => {
        const tr = document.createElement("tr");
        tr.className = "transition-all duration-200 hover:bg-white/5";

        const downVotes = parseInt(row["Recuento de DownVotes"]) || 0;
        const upVotes = parseInt(row["Recuento de UpVotes"]) || 0;

        tr.innerHTML = `
          <td class="px-6 py-4 border-b border-white/5 text-sm text-white">
            <i class="fas fa-map-marker-alt text-secondary mr-2"></i>${row.Location}
          </td>
          <td class="px-6 py-4 border-b border-white/5 text-sm text-white">
            <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-danger/10 text-danger border border-danger/20">
              <i class="fas fa-thumbs-down"></i> ${downVotes}
            </span>
          </td>
          <td class="px-6 py-4 border-b border-white/5 text-sm text-white">
            <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-success/10 text-success border border-success/20">
              <i class="fas fa-thumbs-up"></i> ${upVotes}
            </span>
          </td>
        `;
        tableBody.appendChild(tr);
      });
    }

    updatePaginationControls();
  }

  // Actualizar botones y texto de página
  function updatePaginationControls() {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || filteredData.length === 0;
    gotoPageInput.max = totalPages;
    gotoPageInput.min = 1;
    gotoPageInput.value = currentPage;
  }

  // Eventos de filtros y ordenamiento
  [filterLocation, sortDownVotes, sortUpVotes].forEach((input) => {
    input.addEventListener("change", () => {
      applyFiltersAndSort();
    });

    if (input.type === "text") {
      input.addEventListener("input", () => {
        applyFiltersAndSort();
      });
    }
  });

  // Evento del botón "Ir"
  gotoBtn.addEventListener("click", () => {
    const desiredPage = parseInt(gotoPageInput.value);
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    if (desiredPage && desiredPage >= 1 && desiredPage <= totalPages) {
      currentPage = desiredPage;
      showPage(currentPage);
    } else {
      alert(`Por favor ingresa una página válida entre 1 y ${totalPages}`);
    }
  });

  // Evento para presionar Enter en el input de página
  gotoPageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      gotoBtn.click();
    }
  });

  // Eventos de navegación
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      showPage(currentPage);
    }
  });

  nextBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      showPage(currentPage);
    }
  });

  // Inicializar controles
  updatePaginationControls();
}
