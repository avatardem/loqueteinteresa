document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const articuloId = params.get("id");

    if (articuloId) {
        fetch("articulos.json")
            .then(response => response.json())
            .then(data => {
                const articulo = data.find(a => a.id === articuloId);

                if (articulo) {
                    const fechaISO = articulo.fecha;
                    const fechaObjeto = new Date(fechaISO);
                    
                    // Opciones para formatear la fecha en español
                    const opcionesFecha = { day: '2-digit', month: 'long', year: 'numeric' };
                    const fechaFormateada = fechaObjeto.toLocaleDateString('es-ES', opcionesFecha);

                    document.getElementById("titulo").innerText = articulo.titulo;
                    document.getElementById("fecha").innerText = `Escrito el ${fechaFormateada}`;
                    document.getElementById("imagen").src = articulo.imagen;

                    // Leer el contenido del .txt
                    fetch(articulo.contenido)
                        .then(response => response.text())
                        .then(texto => {
                            document.getElementById("contenido").innerHTML = texto;
                        })
                        .catch(error => console.log("Error cargando el contenido del artículo:", error));
                } else {
                    document.getElementById("titulo").innerText = "Artículo no encontrado";
                    document.getElementById("contenido").innerText = "El artículo que buscas no existe.";
                }
            })
            .catch(error => console.log("Error cargando el artículo:", error));
    }
});
