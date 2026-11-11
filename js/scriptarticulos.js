
document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const articuloId = params.get("id");

    // Función para crear o actualizar etiquetas META
    function actualizarMeta(nombre, contenido, atributo = "name") {
        let meta = document.querySelector(`meta[${atributo}="${nombre}"]`);

        if (!meta) {
            meta = document.createElement("meta");
            meta.setAttribute(atributo, nombre);
            document.head.appendChild(meta);
        }

        meta.setAttribute("content", contenido);
    }

    // Función para crear o actualizar enlaces del HEAD
    function actualizarLink(rel, href) {
        let link = document.querySelector(`link[rel="${rel}"]`);

        if (!link) {
            link = document.createElement("link");
            link.setAttribute("rel", rel);
            document.head.appendChild(link);
        }

        link.setAttribute("href", href);
    }

    if (articuloId) {
        fetch("articulos.json")
            .then(response => {
                if (!response.ok) {
                    throw new Error("No se pudo cargar articulos.json");
                }
                return response.json();
            })
            .then(data => {

                const articulo = data.find(a => a.id === articuloId);

                if (articulo) {

                    // TÍTULO SEO
                    const tituloSEO = articulo.seo_title || articulo.titulo;
                    document.title = tituloSEO + " | LoQueTeInteresa";

                    // META DESCRIPCIÓN
                    const descripcion = articulo.descripcion ||
                        "Conocé las últimas noticias y artículos de LoQueTeInteresa.";

                    actualizarMeta("description", descripcion);

                    // OPEN GRAPH: FACEBOOK, WHATSAPP Y OTRAS REDES
                    actualizarMeta("og:title", tituloSEO, "property");
                    actualizarMeta("og:description", descripcion, "property");
                    actualizarMeta("og:image", new URL(articulo.imagen, window.location.href).href, "property");
                    actualizarMeta("og:url", window.location.href, "property");
                    actualizarMeta("og:type", "article", "property");

                    // TWITTER / X
                    actualizarMeta("twitter:card", "summary_large_image");
                    actualizarMeta("twitter:title", tituloSEO);
                    actualizarMeta("twitter:description", descripcion);
                    actualizarMeta("twitter:image", new URL(articulo.imagen, window.location.href).href);

                    // URL CANÓNICA
                    const urlCanonica = window.location.origin +
                        window.location.pathname +
                        "?id=" + encodeURIComponent(articulo.id);

                    actualizarLink("canonical", urlCanonica);

                    // FECHA: evitar problemas de zona horaria
                    const partesFecha = articulo.fecha.split("-");
                    const fechaObjeto = new Date(
                        Number(partesFecha[0]),
                        Number(partesFecha[1]) - 1,
                        Number(partesFecha[2])
                    );

                    const opcionesFecha = {
                        day: "2-digit",
                        month: "long",
                        year: "numeric"
                    };

                    const fechaFormateada = fechaObjeto.toLocaleDateString(
                        "es-AR",
                        opcionesFecha
                    );

                    // CARGAR DATOS VISIBLES
                    document.getElementById("titulo").innerText = articulo.titulo;
                    document.getElementById("fecha").innerText =
                        `Escrito el ${fechaFormateada}`;

                    document.getElementById("imagen").src = articulo.imagen;
                    document.getElementById("imagen").alt = articulo.titulo;

                    // CARGAR CONTENIDO DEL ARTÍCULO
                    fetch(articulo.contenido)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error("No se pudo cargar el contenido");
                            }
                            return response.text();
                        })
                        .then(texto => {
                            document.getElementById("contenido").innerHTML = texto;
                        })
                        .catch(error => {
                            console.error("Error cargando el contenido:", error);
                        });

                } else {
                    document.getElementById("titulo").innerText =
                        "Artículo no encontrado";

                    document.getElementById("contenido").innerText =
                        "El artículo que buscas no existe.";
                }
            })
            .catch(error => {
                console.error("Error cargando el artículo:", error);
            });
    }
});
