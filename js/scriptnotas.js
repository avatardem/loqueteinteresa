document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const notaId = params.get("id");

    if (notaId) {
        fetch("notas.json")
            .then(response => response.json())
            .then(data => {
                const nota = data.find(a => a.id === notaId);

                if (nota) {
                    const fechaISO = nota.fecha;
                    const fechaObjeto = new Date(fechaISO);
                    
                    // Opciones para formatear la fecha en español
                    const opcionesFecha = { day: '2-digit', month: 'long', year: 'numeric' };
                    const fechaFormateada = fechaObjeto.toLocaleDateString('es-ES', opcionesFecha);

                    document.getElementById("titulo").innerText = nota.titulo;
                    document.getElementById("fecha").innerText = `Escrito el ${fechaFormateada}`;
                    document.getElementById("imagen").src = nota.imagen;

                    // Leer el contenido del .txt
                    fetch(nota.contenido)
                        .then(response => response.text())
                        .then(texto => {
                            document.getElementById("contenido").innerHTML = texto;
                        })
                        .catch(error => console.log("Error cargando el contenido de la nota:", error));
                } else {
                    document.getElementById("titulo").innerText = "Nota no encontrada";
                    document.getElementById("contenido").innerText = "La nota que buscas no existe.";
                }
            })
            .catch(error => console.log("Error cargando nota:", error));
    }
});
