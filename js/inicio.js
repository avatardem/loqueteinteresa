document.addEventListener("DOMContentLoaded", () => { 
    Promise.all([
        fetch("articulos.json").then(r => r.json()),
        fetch("notas.json").then(r => r.json())
    ])
    .then(async ([articulos, notas]) => {

        // --- Ordenar por fecha descendente (más reciente primero) ---
        const ordenarPorFecha = arr => arr.sort(
            (a, b) => new Date(b.fecha) - new Date(a.fecha)
        );

        const articulosOrdenados = ordenarPorFecha(articulos);
        const notasOrdenadas = ordenarPorFecha(notas);

        // Tomar los más recientes de cada uno
        const articuloPrincipal = articulosOrdenados[0];  // blockchain principal
        const articulo2 = articulosOrdenados[1];
        const nota1 = notasOrdenadas[0];
        const nota2 = notasOrdenadas[1];

        // Array con secundarios combinados
        const secundarios = [
            { ...nota1, tipo: "nota" },
            { ...articulo2, tipo: "articulo" },
            { ...nota2, tipo: "nota" }
        ];

        // --- Función para obtener resumen desde archivo de texto ---
        async function obtenerResumen(ruta) {
            try {
                const texto = await fetch(ruta).then(r => r.text());
                return texto.substring(0, 200) + "...";
            } catch (e) {
                return "";
            }
        }

        // Cargar resumen del principal
        const resumenPrincipal = await obtenerResumen(articuloPrincipal.contenido);

        // Insertar artículo principal (siempre de blockchain)
        const principalContainer = document.getElementById("articulo-principal");
        principalContainer.innerHTML = `
            <a href="articulo.html?id=${articuloPrincipal.id}">
                <img src="${articuloPrincipal.imagen}" alt="${articuloPrincipal.titulo}">
                <h3>${articuloPrincipal.titulo}</h3>
                <p>${resumenPrincipal}</p>
            </a>
        `;

        // Seleccionar contenedor de secundarios
        const secundariosContainer = document.getElementById("articulos-secundarios");

        // Insertar artículos secundarios con ruta dinámica
        secundariosContainer.innerHTML = secundarios.map(a => `
            <a class="articulo-mini" href="${a.tipo === 'nota' ? 'nota.html' : 'articulo.html'}?id=${a.id}">
                <img src="${a.imagen}" alt="${a.titulo}">
                <div>
                    <h4>${a.titulo}</h4>
                </div>
            </a>
        `).join("");

    })
    .catch(err => console.error("Error cargando artículos:", err));
});
