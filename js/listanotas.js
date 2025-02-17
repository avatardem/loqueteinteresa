document.addEventListener("DOMContentLoaded", () => {
    fetch("notas.json")
        .then(response => response.json())
        .then(data => {
            data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            const lista = document.getElementById("lista-notas");
            
            data.forEach(nota => {
                // Crear la card con Bootstrap
                const card = document.createElement("div");
                card.className = "col-md-6 mb-4"; // Tarjetas de 2 columnas en pantallas grandes

                card.innerHTML = `

                        <div class="card shadow-lg">
                            <div class="row g-0">
                                <div class="col-md-8 d-flex align-items-center p-3">
                                    <div>
                                        <h5 class="card-title">
                                            <a href="nota.html?id=${nota.id}"  class="stretched-link" >
                                                ${nota.titulo}
                                            </a>
                                        </h5>
                                        <p class="card-text resumen">Cargando...</p>
                                        <p class="card-text text-muted" style="text-align:right" ><small>${formatearFecha(nota.fecha)}</small></p>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <img src="${nota.imagen}" class="img-fluid rounded-end" alt="${nota.titulo}">
                                </div>
                            </div>
                        </div>

                    `;

                lista.appendChild(card);

                // Cargar resumen desde el .txt
                fetch(nota.contenido)
                    .then(res => res.text())
                    .then(texto => {
                        let resumen = texto.replace(/<[^>]*>/g, "").substring(0, 150) + "..."; // Elimina etiquetas HTML y corta
                        card.querySelector(".resumen").innerText = resumen;
                    })
                    .catch(err => console.log("Error cargando el resumen:", err));
            });
        })
        .catch(error => console.log("Error cargando las notas:", error));

    // Función para formatear la fecha
    function formatearFecha(fechaISO) {
        const fecha = new Date(fechaISO);
        return fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
    }
});