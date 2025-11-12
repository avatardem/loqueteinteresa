document.addEventListener("DOMContentLoaded", () => {
    Promise.all([
        fetch("articulos.json").then(r => r.json()),
        fetch("notas.json").then(r => r.json())
    ])
    .then(async ([articulos, notas]) => {

        // --- Artículos principales y secundarios ---
        const articuloPrincipal = articulos[0];
        const articulo2 = articulos[1];
        const articulo1 = notas[0];
        const articulo3 = notas[1];

        const secundarios = [
            { ...articulo1, tipo: "nota" },
            { ...articulo2, tipo: "articulo" },
            { ...articulo3, tipo: "nota" }
        ];

        // --- Función para obtener resumen ---
        async function obtenerResumen(ruta) {
            try {
                const texto = await fetch(ruta).then(r => r.text());
                return texto.substring(0, 200) + "...";
            } catch (e) {
                return "";
            }
        }

        // --- Artículo principal ---
        const resumenPrincipal = await obtenerResumen(articuloPrincipal.contenido);
        const principalContainer = document.getElementById("articulo-principal");

        principalContainer.innerHTML = `
            <a href="articulo.html?id=${articuloPrincipal.id}">
                <img src="${articuloPrincipal.imagen}" alt="${articuloPrincipal.titulo}">
                <h3>${articuloPrincipal.titulo}</h3>
                <p>${resumenPrincipal}</p>
            </a>
        `;

        // --- Artículos secundarios ---
        const secundariosContainer = document.getElementById("articulos-secundarios");

        secundariosContainer.innerHTML = secundarios.map(a => {
            const link = a.tipo === "nota" ? `nota.html?id=${a.id}` : `articulo.html?id=${a.id}`;
            return `
                <a class="articulo-mini" href="${link}">
                    <img src="${a.imagen}" alt="${a.titulo}">
                    <div><h4>${a.titulo}</h4></div>
                </a>
            `;
        }).join("");

    })
    .catch(err => console.error("Error cargando artículos:", err));
});
