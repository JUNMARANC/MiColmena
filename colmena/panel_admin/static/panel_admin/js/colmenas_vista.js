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

    const vistaTabla = document.getElementById("vistaTablaColmenas");
    const vistaTarjetas = document.getElementById("vistaTarjetasColmenas");

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

});