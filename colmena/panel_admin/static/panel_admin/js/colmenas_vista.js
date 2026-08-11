document.addEventListener("DOMContentLoaded", function () {

    // =========================================================
    // FIX: mover los modales fuera de los contenedores de vista
    // =========================================================
    //
    // Los modales de Detalle/Editar/Eliminar quedan, por cómo el
    // navegador corrige el HTML de la tabla, anidados dentro del
    // contenedor "#vistaTablaColmenas". Como ese contenedor se
    // oculta con display:none al cambiar a la vista de Tarjetas,
    // los modales quedaban invisibles aunque Bootstrap los abriera.
    //
    // Bootstrap recomienda que los modales sean hijos directos de
    // <body> precisamente para evitar este tipo de problema, así
    // que los reubicamos ahí apenas carga la página.

    document
        .querySelectorAll("#vistaTablaColmenas .modal, #vistaTarjetasColmenas .modal")
        .forEach(function (modal) {
            document.body.appendChild(modal);
        });

    // =========================================================
    // ENTRADA ESCALONADA (filas de tabla / tarjetas)
    // =========================================================
    //
    // Anima los hijos directos de un contenedor uno tras otro,
    // en vez de que aparezcan todos de golpe. Se usa tanto al
    // cargar la página como cada vez que se cambia de vista.
    // Reutiliza la clase .anim-entrada-lista (ya definida en
    // estilos_admin.css junto con la de Apiarios).

    function aplicarEntradaEscalonada(contenedor, selectorHijos, retrasoEntreElementos) {

        if (!contenedor) {
            return;
        }

        const hijos = contenedor.querySelectorAll(selectorHijos);

        hijos.forEach(function (hijo, indice) {

            hijo.classList.remove("anim-entrada-lista");
            void hijo.offsetWidth; // fuerza reflow para poder re-disparar

            hijo.style.animationDelay = (indice * retrasoEntreElementos) + "ms";
            hijo.classList.add("anim-entrada-lista");
        });
    }

    const vistaTablaEl = document.getElementById("vistaTablaColmenas");
    const vistaTarjetasEl = document.getElementById("vistaTarjetasColmenas");

    // Entrada escalonada inicial (la vista visible al cargar la página)
    aplicarEntradaEscalonada(vistaTablaEl, "tbody tr", 45);
    aplicarEntradaEscalonada(vistaTarjetasEl, ".tarjeta-colmena", 70);


    // =========================================================
    // SELECTOR DE VISTA: TABLA / TARJETAS (módulo Colmenas)
    // =========================================================
    //
    // No vuelve a consultar el servidor: la tabla y las tarjetas
    // ya vienen renderizadas ambas desde el mismo template, solo
    // se muestra una u otra con una animación de fundido.
    // La preferencia elegida se recuerda en localStorage para que,
    // al volver a entrar al módulo, se respete la última vista usada.

    const CLAVE_LOCALSTORAGE = "vistaColmenas";

    const btnVistaTabla = document.getElementById("btnVistaTabla");
    const btnVistaTarjetas = document.getElementById("btnVistaTarjetas");

    const vistaTabla = vistaTablaEl;
    const vistaTarjetas = vistaTarjetasEl;

    if (!btnVistaTabla || !btnVistaTarjetas || !vistaTabla || !vistaTarjetas) {
        // El módulo actual no tiene el selector de vista, no hacemos nada.
        return;
    }

    function activarBoton(botonActivo, botonInactivo) {
        botonActivo.classList.add("activo");
        botonInactivo.classList.remove("activo");
    }

    function mostrarVista(elementoAMostrar, elementoAOcultar) {

        // 1. El que está visible se desvanece hacia abajo
        elementoAOcultar.classList.add("vista-saliendo");

        window.setTimeout(function () {

            // 2. Se oculta por completo y se limpia la clase de animación
            elementoAOcultar.style.display = "none";
            elementoAOcultar.classList.remove("vista-saliendo");

            // 3. El nuevo aparece con su propia animación de entrada
            elementoAMostrar.style.display =
                elementoAMostrar.id === "vistaTarjetasColmenas" ? "grid" : "block";

            elementoAMostrar.classList.add("vista-entrando");

            // Además del fundido general del contenedor, cada fila/tarjeta
            // entra escalonada para que se sienta más dinámico
            if (elementoAMostrar.id === "vistaTarjetasColmenas") {
                aplicarEntradaEscalonada(elementoAMostrar, ".tarjeta-colmena", 70);
            } else {
                aplicarEntradaEscalonada(elementoAMostrar, "tbody tr", 45);
            }

            window.setTimeout(function () {
                elementoAMostrar.classList.remove("vista-entrando");
            }, 340);

        }, 180);
    }

    function irAVistaTabla() {
        if (vistaTabla.style.display !== "none" && !btnVistaTarjetas.classList.contains("activo")) {
            return; // ya está en tabla
        }

        mostrarVista(vistaTabla, vistaTarjetas);
        activarBoton(btnVistaTabla, btnVistaTarjetas);
        localStorage.setItem(CLAVE_LOCALSTORAGE, "tabla");
    }

    function irAVistaTarjetas() {
        if (vistaTarjetas.style.display !== "none" && btnVistaTarjetas.classList.contains("activo")) {
            return; // ya está en tarjetas
        }

        mostrarVista(vistaTarjetas, vistaTabla);
        activarBoton(btnVistaTarjetas, btnVistaTabla);
        localStorage.setItem(CLAVE_LOCALSTORAGE, "tarjetas");
    }

    btnVistaTabla.addEventListener("click", irAVistaTabla);
    btnVistaTarjetas.addEventListener("click", irAVistaTarjetas);

    // =========================================================
    // RECORDAR LA ÚLTIMA VISTA ELEGIDA
    // =========================================================

    const vistaGuardada = localStorage.getItem(CLAVE_LOCALSTORAGE);

    if (vistaGuardada === "tarjetas") {
        vistaTabla.style.display = "none";
        vistaTarjetas.style.display = "grid";
        activarBoton(btnVistaTarjetas, btnVistaTabla);
    } else {
        vistaTabla.style.display = "block";
        vistaTarjetas.style.display = "none";
        activarBoton(btnVistaTabla, btnVistaTarjetas);
    }

});
