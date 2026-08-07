/*SIDEBAR */
const sidebarAdmin = document.getElementById("sidebarAdmin");
const btnCollapseSidebar = document.getElementById("btnCollapseSidebar");
const btnMobileSidebar = document.getElementById("btnMobileSidebar");
const overlaySidebar = document.getElementById("overlaySidebar");

if (btnCollapseSidebar && sidebarAdmin) {
    btnCollapseSidebar.addEventListener("click", () => {
        sidebarAdmin.classList.toggle("collapsed");
    });
}

if (btnMobileSidebar && sidebarAdmin && overlaySidebar) {
    btnMobileSidebar.addEventListener("click", () => {
        sidebarAdmin.classList.add("mobile-active");
        overlaySidebar.classList.add("active");
    });

    overlaySidebar.addEventListener("click", () => {
        sidebarAdmin.classList.remove("mobile-active");
        overlaySidebar.classList.remove("active");
    });
}

/*mantenimientos */

document.addEventListener("DOMContentLoaded", function () {

    const radios = document.querySelectorAll(".tipo-mantenimiento-radio");
    const campoApiario = document.getElementById("campoApiarioMantenimiento");
    const campoColmena = document.getElementById("campoColmenaMantenimiento");

    if (!radios.length || !campoApiario || !campoColmena) {
        return;
    }

    radios.forEach(function (radio) {
        radio.addEventListener("change", function () {

            if (this.value === "Apiario") {
                campoApiario.classList.remove("d-none");
                campoColmena.classList.add("d-none");
            }

            if (this.value === "Colmena") {
                campoColmena.classList.remove("d-none");
                campoApiario.classList.add("d-none");
            }

        });
    });

});

/*Modal agregar mantenimiento */

document.addEventListener("DOMContentLoaded", function () {
    const responsable = document.getElementById("responsableMantenimiento");
    const apiario = document.getElementById("apiarioMantenimiento");
    const colmena = document.getElementById("colmenaMantenimiento");
    const campoColmena = document.getElementById("campoColmenaMantenimiento");
    const radios = document.querySelectorAll(".alcance-mantenimiento-radio");

    if (!responsable || !apiario || !colmena || !campoColmena || !radios.length) {
        return;
    }

    function obtenerAlcance() {
        const seleccionado = document.querySelector(".alcance-mantenimiento-radio:checked");
        return seleccionado ? seleccionado.value : "";
    }

    function filtrarApiarios() {
        const idResponsable = responsable.value;

        apiario.value = "";
        colmena.value = "";
        campoColmena.classList.add("d-none");

        Array.from(apiario.options).forEach(function (option) {
            if (!option.value) {
                option.hidden = false;
                return;
            }

            option.hidden = option.dataset.apicultor !== idResponsable;
        });
    }

    function filtrarColmenas() {
        const idApiario = apiario.value;
        const alcance = obtenerAlcance();

        colmena.value = "";

        if (alcance === "Colmena" && idApiario) {
            campoColmena.classList.remove("d-none");

            Array.from(colmena.options).forEach(function (option) {
                if (!option.value) {
                    option.hidden = false;
                    return;
                }

                option.hidden = option.dataset.apiario !== idApiario;
            });
        } else {
            campoColmena.classList.add("d-none");
        }
    }

    responsable.addEventListener("change", filtrarApiarios);
    apiario.addEventListener("change", filtrarColmenas);

    radios.forEach(function (radio) {
        radio.addEventListener("change", filtrarColmenas);
    });
});

/*Filtro de Mantenimientos */

document.addEventListener("DOMContentLoaded", function () {
    const filtroApiario = document.getElementById("filtroApiario");
    const filtroColmena = document.getElementById("filtroColmena");

    if (!filtroApiario || !filtroColmena) {
        return;
    }

    function filtrarColmenasPorApiario() {
        const idApiario = filtroApiario.value;
        const colmenaSeleccionada = filtroColmena.value;

        Array.from(filtroColmena.options).forEach(function (option) {
            if (!option.value) {
                option.hidden = false;
                return;
            }

            if (!idApiario) {
                option.hidden = false;
            } else {
                option.hidden = option.dataset.apiario !== idApiario;
            }
        });

        const opcionActual = filtroColmena.options[filtroColmena.selectedIndex];

        if (opcionActual && opcionActual.hidden) {
            filtroColmena.value = "";
        }
    }

    filtroApiario.addEventListener("change", filtrarColmenasPorApiario);

    filtrarColmenasPorApiario();
});

/* Selector de vista Tabla/Tarjetas — Mantenimientos */

document.addEventListener("DOMContentLoaded", function () {

    // Igual que en apiarios/colmenas: los modales quedan anidados
    // dentro de la vista de tabla por cómo el navegador corrige el
    // HTML, así que se reubican como hijos directos de <body>.
    document
        .querySelectorAll("#vistaTablaMantenimientos .modal, #vistaTarjetasMantenimientos .modal")
        .forEach(function (modal) {
            document.body.appendChild(modal);
        });

    const CLAVE_LOCALSTORAGE = "vistaMantenimientos";

    const btnVistaTabla = document.getElementById("btnVistaTabla");
    const btnVistaTarjetas = document.getElementById("btnVistaTarjetas");

    const vistaTabla = document.getElementById("vistaTablaMantenimientos");
    const vistaTarjetas = document.getElementById("vistaTarjetasMantenimientos");

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
                elementoAMostrar.id === "vistaTarjetasMantenimientos" ? "grid" : "block";

            elementoAMostrar.classList.add("vista-entrando");

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

/* JS DE INCIDENCIAS */

/* Selector de vista Tabla/Tarjetas — Incidencias */

document.addEventListener("DOMContentLoaded", function () {

    document
        .querySelectorAll("#vistaTablaIncidencias .modal, #vistaTarjetasIncidencias .modal")
        .forEach(function (modal) {
            document.body.appendChild(modal);
        });

    const CLAVE_LOCALSTORAGE = "vistaIncidencias";

    const btnVistaTabla = document.getElementById("btnVistaTabla");
    const btnVistaTarjetas = document.getElementById("btnVistaTarjetas");

    const vistaTabla = document.getElementById("vistaTablaIncidencias");
    const vistaTarjetas = document.getElementById("vistaTarjetasIncidencias");

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
                elementoAMostrar.id === "vistaTarjetasIncidencias" ? "grid" : "block";

            elementoAMostrar.classList.add("vista-entrando");

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

document.addEventListener("DOMContentLoaded", function () {

    function mostrarCamposEntidad(selector) {
        const formulario = selector.dataset.formulario;
        const entidad = selector.value;

        const campoApicultor = document.querySelector(
            `.campo-apicultor-${formulario}`
        );

        const campoApiario = document.querySelector(
            `.campo-apiario-${formulario}`
        );

        const campoColmena = document.querySelector(
            `.campo-colmena-${formulario}`
        );

        if (campoApicultor) {
            campoApicultor.style.display =
                entidad === "Apicultor" ? "block" : "none";
        }

        if (campoApiario) {
            campoApiario.style.display =
                entidad === "Apiario" || entidad === "Colmena"
                    ? "block"
                    : "none";
        }

        if (campoColmena) {
            campoColmena.style.display =
                entidad === "Colmena" ? "block" : "none";
        }
    }

    function filtrarColmenas(apiarioSelect) {
        const formulario = apiarioSelect.dataset.formulario;
        const apiarioId = apiarioSelect.value;

        const colmenaSelect = document.querySelector(
            `.selector-colmena-${formulario}`
        );

        if (!colmenaSelect) {
            return;
        }

        const opciones = colmenaSelect.querySelectorAll(
            "option[data-apiario]"
        );

        opciones.forEach(function (opcion) {
            const corresponde =
                !apiarioId ||
                opcion.dataset.apiario === apiarioId;

            opcion.hidden = !corresponde;
            opcion.disabled = !corresponde;
        });

        const opcionSeleccionada =
            colmenaSelect.options[colmenaSelect.selectedIndex];

        if (
            opcionSeleccionada &&
            opcionSeleccionada.dataset.apiario &&
            opcionSeleccionada.dataset.apiario !== apiarioId
        ) {
            colmenaSelect.value = "";
        }
    }

    document
        .querySelectorAll(".selector-entidad")
        .forEach(function (selector) {

            mostrarCamposEntidad(selector);

            selector.addEventListener("change", function () {
                mostrarCamposEntidad(this);
            });
        });

    document
        .querySelectorAll(".selector-apiario")
        .forEach(function (selector) {

            filtrarColmenas(selector);

            selector.addEventListener("change", function () {
                filtrarColmenas(this);
            });
        });

    // Filtros superiores
    const filtroEntidad = document.getElementById("filtroEntidad");
    const filtroApicultor = document.querySelector(".filtro-apicultor");
    const filtroApiario = document.querySelector(".filtro-apiario");
    const filtroColmena = document.querySelector(".filtro-colmena");

    function actualizarFiltrosEntidad() {
        if (!filtroEntidad) {
            return;
        }

        const entidad = filtroEntidad.value;

        if (filtroApicultor) {
            filtroApicultor.style.display =
                entidad === "Apicultor" ? "block" : "none";
        }

        if (filtroApiario) {
            filtroApiario.style.display =
                entidad === "Apiario" || entidad === "Colmena"
                    ? "block"
                    : "none";
        }

        if (filtroColmena) {
            filtroColmena.style.display =
                entidad === "Colmena" ? "block" : "none";
        }
    }

    if (filtroEntidad) {
        filtroEntidad.addEventListener(
            "change",
            actualizarFiltrosEntidad
        );
    }

    // Filtrar las colmenas del filtro superior
    const filtroApiarioSelect =
        document.getElementById("filtroApiario");

    const filtroColmenaSelect =
        document.getElementById("filtroColmena");

    function actualizarColmenasFiltro() {
        if (!filtroApiarioSelect || !filtroColmenaSelect) {
            return;
        }

        const apiarioId = filtroApiarioSelect.value;

        const opciones = filtroColmenaSelect.querySelectorAll(
            "option[data-apiario]"
        );

        opciones.forEach(function (opcion) {
            const corresponde =
                !apiarioId ||
                opcion.dataset.apiario === apiarioId;

            opcion.hidden = !corresponde;
            opcion.disabled = !corresponde;
        });

        const seleccionada =
            filtroColmenaSelect.options[
                filtroColmenaSelect.selectedIndex
            ];

        if (
            seleccionada &&
            seleccionada.dataset.apiario &&
            seleccionada.dataset.apiario !== apiarioId
        ) {
            filtroColmenaSelect.value = "";
        }
    }

    if (filtroApiarioSelect) {
        filtroApiarioSelect.addEventListener(
            "change",
            actualizarColmenasFiltro
        );

        actualizarColmenasFiltro();
    }
});