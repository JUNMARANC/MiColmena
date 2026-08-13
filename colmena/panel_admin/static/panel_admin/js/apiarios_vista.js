document.addEventListener("DOMContentLoaded", function () {

    // =========================================================
    // FIX: mover los modales fuera de los contenedores de vista
    // =========================================================
    //
    // Los modales de Detalle/Editar/Eliminar quedan, por cómo el
    // navegador corrige el HTML de la tabla, anidados dentro del
    // contenedor "#vistaTablaApiarios". Como ese contenedor se
    // oculta con display:none al cambiar a la vista de Tarjetas,
    // los modales quedaban invisibles aunque Bootstrap los abriera.
    //
    // Bootstrap recomienda que los modales sean hijos directos de
    // <body> precisamente para evitar este tipo de problema, así
    // que los reubicamos ahí apenas carga la página.

    document
        .querySelectorAll("#vistaTablaApiarios .modal, #vistaTarjetasApiarios .modal")
        .forEach(function (modal) {
            document.body.appendChild(modal);
        });

    // =========================================================
    // SELECTOR DE VISTA: TABLA / TARJETAS (módulo Apiarios)
    // =========================================================
    //
    // No vuelve a consultar el servidor: la tabla y las tarjetas
    // ya vienen renderizadas ambas desde el mismo template, solo
    // se muestra una u otra con una animación de fundido.
    // La preferencia elegida se recuerda en localStorage para que,
    // al volver a entrar al módulo, se respete la última vista usada.

    const CLAVE_LOCALSTORAGE = "vistaApiarios";

    const btnVistaTabla = document.getElementById("btnVistaTabla");
    const btnVistaTarjetas = document.getElementById("btnVistaTarjetas");

    const vistaTabla = document.getElementById("vistaTablaApiarios");
    const vistaTarjetas = document.getElementById("vistaTarjetasApiarios");

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
                elementoAMostrar.id === "vistaTarjetasApiarios" ? "grid" : "block";

            elementoAMostrar.classList.add("vista-entrando");

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
    // RECORDAR LA ÚLTIMA VISTA ELEGIDA (sin animación al cargar)
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

});document.addEventListener("DOMContentLoaded", function () {

    // =========================================================
    // FIX: mover los modales fuera de los contenedores de vista
    // =========================================================

    document
        .querySelectorAll("#vistaTablaApiarios .modal, #vistaTarjetasApiarios .modal")
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

    function aplicarEntradaEscalonada(contenedor, selectorHijos, retrasoEntreElementos) {

        if (!contenedor) {
            return;
        }

        const hijos = contenedor.querySelectorAll(selectorHijos);

        hijos.forEach(function (hijo, indice) {

            // Reinicia la animación por si ya se había aplicado antes
            hijo.classList.remove("anim-entrada-lista");
            void hijo.offsetWidth; // fuerza reflow para poder re-disparar

            hijo.style.animationDelay = (indice * retrasoEntreElementos) + "ms";
            hijo.classList.add("anim-entrada-lista");
        });
    }

    const vistaTablaEl = document.getElementById("vistaTablaApiarios");
    const vistaTarjetasEl = document.getElementById("vistaTarjetasApiarios");

    // Entrada escalonada inicial (la vista visible al cargar la página)
    aplicarEntradaEscalonada(vistaTablaEl, "tbody tr", 45);
    aplicarEntradaEscalonada(vistaTarjetasEl, ".tarjeta-apiario", 70);


    // =========================================================
    // SELECTOR DE VISTA: TABLA / TARJETAS (módulo Apiarios)
    // =========================================================

    const CLAVE_LOCALSTORAGE = "vistaApiarios";

    const btnVistaTabla = document.getElementById("btnVistaTabla");
    const btnVistaTarjetas = document.getElementById("btnVistaTarjetas");

    const vistaTabla = vistaTablaEl;
    const vistaTarjetas = vistaTarjetasEl;

    if (!btnVistaTabla || !btnVistaTarjetas || !vistaTabla || !vistaTarjetas) {
        return;
    }

    function activarBoton(botonActivo, botonInactivo) {
        botonActivo.classList.add("activo");
        botonInactivo.classList.remove("activo");
    }

    function mostrarVista(elementoAMostrar, elementoAOcultar) {

        elementoAOcultar.classList.add("vista-saliendo");

        window.setTimeout(function () {

            elementoAOcultar.style.display = "none";
            elementoAOcultar.classList.remove("vista-saliendo");

            elementoAMostrar.style.display =
                elementoAMostrar.id === "vistaTarjetasApiarios" ? "grid" : "block";

            elementoAMostrar.classList.add("vista-entrando");

            // Además del fundido general del contenedor, cada fila/tarjeta
            // entra escalonada para que se sienta más dinámico
            if (elementoAMostrar.id === "vistaTarjetasApiarios") {
                aplicarEntradaEscalonada(elementoAMostrar, ".tarjeta-apiario", 70);
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
            return;
        }

        mostrarVista(vistaTabla, vistaTarjetas);
        activarBoton(btnVistaTabla, btnVistaTarjetas);
        localStorage.setItem(CLAVE_LOCALSTORAGE, "tabla");
    }

    function irAVistaTarjetas() {
        if (vistaTarjetas.style.display !== "none" && btnVistaTarjetas.classList.contains("activo")) {
            return;
        }

        mostrarVista(vistaTarjetas, vistaTabla);
        activarBoton(btnVistaTarjetas, btnVistaTabla);
        localStorage.setItem(CLAVE_LOCALSTORAGE, "tarjetas");
    }

    btnVistaTabla.addEventListener("click", irAVistaTabla);
    btnVistaTarjetas.addEventListener("click", irAVistaTarjetas);

    // =========================================================
    // RECORDAR LA ÚLTIMA VISTA ELEGIDA (sin animación de fundido
    // del contenedor, pero sí con la entrada escalonada de hijos)
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