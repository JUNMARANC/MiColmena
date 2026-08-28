document.addEventListener(
    "DOMContentLoaded",
    function () {

        const botonesDetalle = (
            document.querySelectorAll(
                ".btn-ver-notificacion"
            )
        );


        const titulo = (
            document.getElementById(
                "centroNotificacionTitulo"
            )
        );

        const mensaje = (
            document.getElementById(
                "centroNotificacionMensaje"
            )
        );

        const tipo = (
            document.getElementById(
                "centroNotificacionTipo"
            )
        );

        const fecha = (
            document.getElementById(
                "centroNotificacionFecha"
            )
        );

        const estado = (
            document.getElementById(
                "centroNotificacionEstado"
            )
        );

        const enlaceModulo = (
            document.getElementById(
                "centroNotificacionUrl"
            )
        );


        botonesDetalle.forEach(
            function (boton) {

                boton.addEventListener(
                    "click",
                    function () {

                        const card = (
                            boton.closest(
                                ".notificacion-card"
                            )
                        );


                        const tituloValor = (
                            boton.dataset.titulo
                        );


                        const mensajeValor = (
                            boton.dataset.mensaje
                        );


                        const tipoValor = (
                            boton.dataset.tipo
                        );


                        const fechaValor = (
                            boton.dataset.fecha
                        );


                        const url = (
                            boton.dataset.url
                        );


                        const leerUrl = (
                            boton.dataset.leerUrl
                        );


                        const estabaLeida = (
                            boton.dataset.leida
                            ===
                            "true"
                        );


                        titulo.textContent = (
                            tituloValor
                        );


                        mensaje.textContent = (
                            mensajeValor
                        );


                        tipo.textContent = (
                            tipoValor
                        );


                        fecha.textContent = (
                            fechaValor
                        );


                        estado.textContent = (
                            estabaLeida
                            ? "Leída"
                            : "No leída"
                        );


                        // ====================================
                        // BOTÓN IR AL MÓDULO
                        // ====================================

                        if (url) {

                            enlaceModulo.href = (
                                url
                            );

                            enlaceModulo.style.display = (
                                "inline-flex"
                            );

                        } else {

                            enlaceModulo.style.display = (
                                "none"
                            );

                        }


                        // ====================================
                        // MARCAR COMO LEÍDA
                        // ====================================

                        if (
                            !estabaLeida
                            &&
                            leerUrl
                        ) {

                            marcarComoLeida(
                                boton,
                                card,
                                leerUrl,
                                estado
                            );

                        }

                    }
                );

            }
        );


// ========================================================
// MODAL ELIMINAR NOTIFICACIÓN
// ========================================================

const botonesEliminar = (
    document.querySelectorAll(
        ".btn-eliminar-notificacion"
    )
);


const modalEliminarElemento = (
    document.getElementById(
        "modalEliminarNotificacion"
    )
);


const btnConfirmarEliminar = (
    document.getElementById(
        "btnConfirmarEliminarNotificacion"
    )
);


const tituloEliminar = (
    document.getElementById(
        "eliminarNotificacionTitulo"
    )
);


const tipoEliminar = (
    document.getElementById(
        "eliminarNotificacionTipo"
    )
);


let formularioEliminarActual = null;


if (
    modalEliminarElemento
    &&
    btnConfirmarEliminar
) {

    const modalEliminar = (
        new bootstrap.Modal(
            modalEliminarElemento
        )
    );


    botonesEliminar.forEach(
        function (boton) {

            boton.addEventListener(
                "click",
                function () {

                    // ========================================
                    // OBTENER FORMULARIO
                    // ========================================

                    formularioEliminarActual = (
                        boton.closest(
                            ".form-eliminar-notificacion"
                        )
                    );


                    // ========================================
                    // DATOS
                    // ========================================

                    const titulo = (
                        boton.dataset.titulo
                        ||
                        "Notificación"
                    );


                    const tipo = (
                        boton.dataset.tipo
                        ||
                        "Notificación"
                    );


                    // ========================================
                    // MOSTRAR DATOS
                    // ========================================

                    if (tituloEliminar) {

                        tituloEliminar.textContent = (
                            titulo
                        );

                    }


                    if (tipoEliminar) {

                        tipoEliminar.textContent = (
                            tipo
                        );

                    }


                    // ========================================
                    // ABRIR MODAL
                    // ========================================

                    modalEliminar.show();

                }
            );

        }
    );


        // ====================================================
        // CONFIRMAR ELIMINACIÓN
        // ====================================================

        btnConfirmarEliminar.addEventListener(
            "click",
            function () {

                if (
                    !formularioEliminarActual
                ) {

                    return;

                }


                // Evitar doble clic
                btnConfirmarEliminar.disabled = true;


                btnConfirmarEliminar.innerHTML = `
                    <span
                        class="spinner-border spinner-border-sm"
                        aria-hidden="true"
                    ></span>

                    Eliminando...
                `;


                formularioEliminarActual.submit();

            }
        );


        // ====================================================
        // RESTABLECER MODAL AL CERRAR
        // ====================================================

        modalEliminarElemento.addEventListener(
            "hidden.bs.modal",
            function () {

                formularioEliminarActual = null;


                btnConfirmarEliminar.disabled = (
                    false
                );


                btnConfirmarEliminar.innerHTML = `
                    <i class="bi bi-trash3"></i>
                    Sí, eliminar
                `;

            }
        );

    }

    }
);



function marcarComoLeida(
    boton,
    card,
    url,
    estadoElemento
) {

    const csrfToken = (
        obtenerCsrfToken()
    );


    fetch(
        url,
        {

            method: "POST",

            headers: {

                "X-CSRFToken":
                    csrfToken,

                "X-Requested-With":
                    "XMLHttpRequest",

            }

        }
    )

    .then(
        function (respuesta) {

            if (!respuesta.ok) {

                throw new Error(
                    "No fue posible marcar la notificación."
                );

            }

            return respuesta.json();

        }
    )

    .then(
        function (datos) {

            if (!datos.ok) {

                return;

            }


            boton.dataset.leida = (
                "true"
            );


            estadoElemento.textContent = (
                "Leída"
            );


            if (card) {

                card.classList.remove(
                    "no-leida"
                );


                const punto = (
                    card.querySelector(
                        ".punto-no-leida"
                    )
                );


                if (punto) {

                    punto.remove();

                }

            }


            actualizarBadgeCampana(
                datos.pendientes
            );

        }
    )

    .catch(
        function (error) {

            console.error(
                error
            );

        }
    );

}



function obtenerCsrfToken() {

    const nombre = (
        "csrftoken="
    );


    const cookies = (
        document.cookie
        .split(";")
    );


    for (
        let cookie
        of cookies
    ) {

        cookie = (
            cookie.trim()
        );


        if (
            cookie.startsWith(
                nombre
            )
        ) {

            return decodeURIComponent(
                cookie.substring(
                    nombre.length
                )
            );

        }

    }


    return "";

}



function actualizarBadgeCampana(
    pendientes
) {

    const badge = (
        document.querySelector(
            ".notification-badge"
        )
        ||
        document.querySelector(
            ".notificaciones-badge"
        )
    );


    if (!badge) {

        return;

    }


    if (
        pendientes > 0
    ) {

        badge.textContent = (
            pendientes
        );

        badge.style.display = "";


    } else {

        badge.textContent = "";

        badge.style.display = "none";

    }

}