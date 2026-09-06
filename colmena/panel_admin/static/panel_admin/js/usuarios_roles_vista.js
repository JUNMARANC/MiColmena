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
        retraso,
        claseAnimacion
    ) {

        if (!contenedor) {
            return;
        }

        const clase = claseAnimacion || "anim-entrada-lista";

        contenedor.querySelectorAll(selectorHijos).forEach(function (hijo, indice) {

            hijo.classList.remove(clase);

            // Fuerza reflow para poder volver a ejecutar la animación
            void hijo.offsetWidth;

            hijo.style.animationDelay = (indice * retraso) + "ms";

            hijo.classList.add(clase);
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
        70,
        "anim-entrada-tarjeta"
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
                    70,
                    "anim-entrada-tarjeta"
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


// =========================================================
// ANIMACIONES ADICIONALES: MODALES DE ADMINISTRADOR
// =========================================================
//
// Bloque independiente para no arriesgar la lógica existente
// del selector de vista. Reutiliza clases ya definidas en
// estilos_admin.css (.anim-entrada-modal, .particula-rafaga-polen),
// igual que en Apicultores, Colmenas y Reportes.

document.addEventListener("DOMContentLoaded", function () {

    // ---------------------------------------------------------
    // ENTRADA ESCALONADA DENTRO DE LOS MODALES GRANDES
    // (Agregar y Editar Administrador)
    // ---------------------------------------------------------

    ["modalAgregarAdministrador", "modalEditarAdministrador"].forEach(function (idModal) {

        const modal = document.getElementById(idModal);

        if (!modal) {
            return;
        }

        modal.addEventListener("shown.bs.modal", function () {

            const cuerpoModal = modal.querySelector(".modal-body");

            if (!cuerpoModal) {
                return;
            }

            cuerpoModal
                .querySelectorAll(".row > div")
                .forEach(function (hijo, indice) {
                    hijo.classList.remove("anim-entrada-modal");
                    void hijo.offsetWidth;
                    hijo.style.animationDelay = (indice * 35) + "ms";
                    hijo.classList.add("anim-entrada-modal");
                });

        });

    });

    // ---------------------------------------------------------
    // RÁFAGA DE POLEN AL GUARDAR
    // ---------------------------------------------------------

    const botonesConPolen = [
        "btnGuardarAdministrador",
        "btnGuardarEdicionAdministrador",
        "btnGuardarPermisos"
    ];

    botonesConPolen.forEach(function (idBoton) {

        const boton = document.getElementById(idBoton);

        if (!boton) {
            return;
        }

        boton.addEventListener("click", function () {

            if (boton.disabled) {
                return;
            }

            const rect = boton.getBoundingClientRect();
            const centroX = rect.left + rect.width / 2;
            const centroY = rect.top + rect.height / 2;
            const CANTIDAD_PARTICULAS = 10;

            for (let i = 0; i < CANTIDAD_PARTICULAS; i++) {

                const angulo = (Math.PI * 2 * i) / CANTIDAD_PARTICULAS;
                const distancia = 40 + Math.random() * 30;
                const dx = Math.cos(angulo) * distancia;
                const dy = Math.sin(angulo) * distancia;

                const particula = document.createElement("span");
                particula.className = "particula-rafaga-polen";
                particula.style.left = centroX + "px";
                particula.style.top = centroY + "px";
                particula.style.setProperty("--dx", dx.toFixed(1) + "px");
                particula.style.setProperty("--dy", dy.toFixed(1) + "px");

                document.body.appendChild(particula);

                window.setTimeout(function () {
                    particula.remove();
                }, 700);

            }

        });

    });

});