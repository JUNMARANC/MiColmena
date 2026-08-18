document.addEventListener("DOMContentLoaded", function () {

    // =========================================================
    // SELECTOR DE VISTA: TABLA / TARJETAS
    // Módulo Usuarios y Roles
    // =========================================================
    //
    // La tabla y las tarjetas representan los mismos usuarios.
    // Los botones de las tarjetas conservan los mismos data-*
    // que los botones de la tabla, por lo que los modales existentes
    // siguen funcionando sin modificaciones.
    //
    // =========================================================


    // =========================================================
    // ENTRADA ESCALONADA DE FILAS / TARJETAS
    // =========================================================

    function aplicarEntradaEscalonadaUsuarios(
        contenedor,
        selectorHijos,
        retraso
    ) {

        if (!contenedor) {
            return;
        }

        contenedor.querySelectorAll(selectorHijos).forEach(function (hijo, indice) {

            hijo.classList.remove("anim-entrada-lista");

            // Fuerza reflow para poder volver a ejecutar la animación
            void hijo.offsetWidth;

            hijo.style.animationDelay = (indice * retraso) + "ms";

            hijo.classList.add("anim-entrada-lista");
        });
    }


    // =========================================================
    // LOCALSTORAGE
    // =========================================================

    const CLAVE_LOCALSTORAGE = "vistaUsuariosRoles";


    // =========================================================
    // BOTONES
    // =========================================================

    const btnVistaTabla =
        document.getElementById("btnVistaTablaUsuarios");

    const btnVistaTarjetas =
        document.getElementById("btnVistaTarjetasUsuarios");


    // =========================================================
    // CONTENEDORES
    // =========================================================

    const vistaTabla =
        document.getElementById("vistaTablaUsuarios");

    const vistaTarjetas =
        document.getElementById("vistaTarjetasUsuarios");


    // =========================================================
    // VALIDACIÓN
    // =========================================================

    if (
        !btnVistaTabla ||
        !btnVistaTarjetas ||
        !vistaTabla ||
        !vistaTarjetas
    ) {
        return;
    }


    // =========================================================
    // ANIMACIÓN INICIAL
    // =========================================================

    aplicarEntradaEscalonadaUsuarios(
        vistaTabla,
        "tbody tr",
        45
    );

    aplicarEntradaEscalonadaUsuarios(
        vistaTarjetas,
        ".tarjeta-usuario-card",
        70
    );


    // =========================================================
    // ACTIVAR BOTÓN
    // =========================================================

    function activarBoton(botonActivo, botonInactivo) {

        botonActivo.classList.add("activo");

        botonInactivo.classList.remove("activo");
    }


    // =========================================================
    // CAMBIAR VISTA
    // =========================================================

    function mostrarVista(elementoAMostrar, elementoAOcultar) {

        elementoAOcultar.classList.add("vista-saliendo");


        window.setTimeout(function () {

            elementoAOcultar.style.display = "none";

            elementoAOcultar.classList.remove("vista-saliendo");


            // Las tarjetas necesitan display grid
            // mientras que la tabla utiliza block.
            elementoAMostrar.style.display =
                elementoAMostrar.id === "vistaTarjetasUsuarios"
                    ? "grid"
                    : "block";


            elementoAMostrar.classList.add("vista-entrando");


            // =================================================
            // ANIMACIÓN ESCALONADA
            // =================================================

            if (
                elementoAMostrar.id ===
                "vistaTarjetasUsuarios"
            ) {

                aplicarEntradaEscalonadaUsuarios(
                    elementoAMostrar,
                    ".tarjeta-usuario-card",
                    70
                );

            } else {

                aplicarEntradaEscalonadaUsuarios(
                    elementoAMostrar,
                    "tbody tr",
                    45
                );
            }


            // Quitar animación de transición
            window.setTimeout(function () {

                elementoAMostrar.classList.remove(
                    "vista-entrando"
                );

            }, 340);


        }, 180);
    }


    // =========================================================
    // IR A TABLA
    // =========================================================

    function irAVistaTabla() {

        if (
            vistaTabla.style.display !== "none" &&
            !btnVistaTarjetas.classList.contains("activo")
        ) {
            return;
        }


        mostrarVista(
            vistaTabla,
            vistaTarjetas
        );


        activarBoton(
            btnVistaTabla,
            btnVistaTarjetas
        );


        localStorage.setItem(
            CLAVE_LOCALSTORAGE,
            "tabla"
        );
    }


    // =========================================================
    // IR A TARJETAS
    // =========================================================

    function irAVistaTarjetas() {

        if (
            vistaTarjetas.style.display !== "none" &&
            btnVistaTarjetas.classList.contains("activo")
        ) {
            return;
        }


        mostrarVista(
            vistaTarjetas,
            vistaTabla
        );


        activarBoton(
            btnVistaTarjetas,
            btnVistaTabla
        );


        localStorage.setItem(
            CLAVE_LOCALSTORAGE,
            "tarjetas"
        );
    }


    // =========================================================
    // EVENTOS
    // =========================================================

    btnVistaTabla.addEventListener(
        "click",
        irAVistaTabla
    );

    btnVistaTarjetas.addEventListener(
        "click",
        irAVistaTarjetas
    );


    // =========================================================
    // RECUPERAR VISTA GUARDADA
    // =========================================================

    const vistaGuardada =
        localStorage.getItem(CLAVE_LOCALSTORAGE);


    if (vistaGuardada === "tarjetas") {

        vistaTabla.style.display = "none";

        vistaTarjetas.style.display = "grid";

        activarBoton(
            btnVistaTarjetas,
            btnVistaTabla
        );

    } else {

        vistaTabla.style.display = "block";

        vistaTarjetas.style.display = "none";

        activarBoton(
            btnVistaTabla,
            btnVistaTarjetas
        );
    }

});