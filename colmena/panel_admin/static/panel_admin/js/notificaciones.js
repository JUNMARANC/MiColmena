"use strict";


document.addEventListener(
    "DOMContentLoaded",
    function () {

        inicializarModalNotificaciones();

    }
);


/* ============================================================
   MODAL DE NOTIFICACIONES
============================================================ */

function inicializarModalNotificaciones() {

    const modal =
        document.getElementById(
            "modalDetalleNotificacion"
        );


    if (!modal) {
        return;
    }


    modal.addEventListener(
        "show.bs.modal",
        function (evento) {

            const boton =
                evento.relatedTarget;


            if (!boton) {
                return;
            }


            cargarDetalleNotificacion(
                boton
            );


            marcarNotificacionComoLeida(
                boton
            );

        }
    );

}


/* ============================================================
   CARGAR INFORMACIÓN EN EL MODAL
============================================================ */

function cargarDetalleNotificacion(
    boton
) {

    const titulo =
        boton.dataset.titulo || "Notificación";


    const mensaje =
        boton.dataset.mensaje || "";


    const tipo =
        boton.dataset.tipo || "Sistema";


    const tipoCodigo =
        boton.dataset.tipoCodigo || "sistema";


    const fecha =
        boton.dataset.fecha || "-";


    const url =
        boton.dataset.url || "";


    const tituloModal =
        document.getElementById(
            "tituloModalNotificacion"
        );


    const mensajeModal =
        document.getElementById(
            "mensajeModalNotificacion"
        );


    const tipoModal =
        document.getElementById(
            "tipoModalNotificacion"
        );


    const fechaModal =
        document.getElementById(
            "fechaModalNotificacion"
        );


    const estadoModal =
        document.getElementById(
            "estadoModalNotificacion"
        );


    const botonIr =
        document.getElementById(
            "btnIrNotificacion"
        );


    const contenedorIcono =
        document.getElementById(
            "iconoModalNotificacion"
        );


    const icono =
        document.getElementById(
            "iconoTipoNotificacion"
        );


    if (tituloModal) {

        tituloModal.textContent =
            titulo;

    }


    if (mensajeModal) {

        mensajeModal.textContent =
            mensaje;

    }


    if (tipoModal) {

        tipoModal.textContent =
            tipo;

    }


    if (fechaModal) {

        fechaModal.textContent =
            fecha;

    }


    if (estadoModal) {

        estadoModal.textContent =
            "Leída";

    }


    /* ========================================================
       BOTÓN IR AL MÓDULO
    ======================================================== */

    if (botonIr) {

        if (url) {

            botonIr.href =
                url;


            botonIr.classList.remove(
                "d-none"
            );

        } else {

            botonIr.href =
                "#";


            botonIr.classList.add(
                "d-none"
            );

        }

    }


    actualizarIconoModalNotificacion(
        tipoCodigo,
        contenedorIcono,
        icono
    );

}


/* ============================================================
   ICONO SEGÚN TIPO
============================================================ */

function actualizarIconoModalNotificacion(
    tipo,
    contenedor,
    icono
) {

    if (
        !contenedor ||
        !icono
    ) {
        return;
    }


    const configuracion = {

        incidencia: {
            clase:
                "bi-exclamation-triangle-fill",

            fondo:
                "#fff0e9",

            color:
                "#d5663d"
        },

        mantenimiento: {
            clase:
                "bi-tools",

            fondo:
                "#fff7dd",

            color:
                "#a97813"
        },

        colmena: {
            clase:
                "bi-box-seam-fill",

            fondo:
                "#edf7f0",

            color:
                "#427d61"
        },

        agenda: {
            clase:
                "bi-calendar-event-fill",

            fondo:
                "#edf5ff",

            color:
                "#487ba6"
        },

        seguridad: {
            clase:
                "bi-shield-exclamation",

            fondo:
                "#fff0f0",

            color:
                "#bd4545"
        },

        sistema: {
            clase:
                "bi-bell-fill",

            fondo:
                "#edf7f0",

            color:
                "#5f9781"
        }

    };


    const datos =
        configuracion[tipo] ||
        configuracion.sistema;


    icono.className =
        `bi ${datos.clase}`;


    contenedor.style.background =
        datos.fondo;


    contenedor.style.color =
        datos.color;

}


/* ============================================================
   MARCAR COMO LEÍDA
============================================================ */

async function marcarNotificacionComoLeida(
    boton
) {

    const yaLeida =
        boton.dataset.leida === "1";


    if (yaLeida) {
        return;
    }


    const url =
        boton.dataset.leerUrl;


    if (!url) {
        return;
    }


    try {

        const respuesta =
            await fetch(
                url,
                {
                    method:
                        "POST",

                    headers: {

                        "X-CSRFToken":
                            obtenerCookie(
                                "csrftoken"
                            ),

                        "X-Requested-With":
                            "XMLHttpRequest"

                    }
                }
            );


        if (!respuesta.ok) {

            throw new Error(
                "No fue posible marcar la notificación."
            );

        }


        const datos =
            await respuesta.json();


        if (!datos.ok) {
            return;
        }


        /* ====================================================
           ACTUALIZAR ITEM
        ==================================================== */

        boton.dataset.leida =
            "1";


        boton.classList.remove(
            "notificacion-no-leida"
        );


        const punto =
            boton.querySelector(
                ".notificacion-punto"
            );


        if (punto) {

            punto.remove();

        }


        /* ====================================================
           ACTUALIZAR CONTADOR
        ==================================================== */

        actualizarContadorNotificaciones(
            datos.pendientes
        );


    } catch (error) {

        console.error(
            "ERROR NOTIFICACIÓN:",
            error
        );

    }

}


/* ============================================================
   ACTUALIZAR BADGE
============================================================ */

function actualizarContadorNotificaciones(
    cantidad
) {

    let contador =
        document.getElementById(
            "contadorNotificaciones"
        );


    const texto =
        document.getElementById(
            "textoNotificacionesPendientes"
        );


    const botonCampana =
        document.getElementById(
            "btnNotificaciones"
        );


    cantidad =
        Number(cantidad) || 0;


    /* ========================================================
       BADGE
    ======================================================== */

    if (cantidad <= 0) {

        if (contador) {

            contador.remove();

        }

    } else {

        if (
            !contador &&
            botonCampana
        ) {

            contador =
                document.createElement(
                    "span"
                );


            contador.id =
                "contadorNotificaciones";


            contador.className =
                "notificaciones-contador";


            botonCampana.appendChild(
                contador
            );

        }


        if (contador) {

            contador.textContent =
                cantidad > 99
                    ? "99+"
                    : cantidad;

        }

    }


    /* ========================================================
       TEXTO DEL DROPDOWN
    ======================================================== */

    if (texto) {

        if (cantidad === 0) {

            texto.textContent =
                "No tienes notificaciones nuevas";

        } else if (cantidad === 1) {

            texto.textContent =
                "1 notificación sin leer";

        } else {

            texto.textContent =
                `${cantidad} notificaciones sin leer`;

        }

    }

}


/* ============================================================
   OBTENER COOKIE
============================================================ */

function obtenerCookie(
    nombre
) {

    let valor = null;


    if (
        document.cookie &&
        document.cookie !== ""
    ) {

        const cookies =
            document.cookie.split(
                ";"
            );


        for (
            let i = 0;
            i < cookies.length;
            i++
        ) {

            const cookie =
                cookies[i].trim();


            if (
                cookie.substring(
                    0,
                    nombre.length + 1
                )
                ===
                nombre + "="
            ) {

                valor =
                    decodeURIComponent(
                        cookie.substring(
                            nombre.length + 1
                        )
                    );


                break;

            }

        }

    }


    return valor;

}