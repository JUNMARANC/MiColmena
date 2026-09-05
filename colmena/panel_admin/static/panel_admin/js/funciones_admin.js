/*SIDEBAR */
const sidebarAdmin = document.getElementById("sidebarAdmin");
const btnCollapseSidebar = document.getElementById("btnCollapseSidebar");
const btnMobileSidebar = document.getElementById("btnMobileSidebar");
const overlaySidebar = document.getElementById("overlaySidebar");

const CLAVE_SIDEBAR_COLAPSADO = "sidebarColapsado";

if (btnCollapseSidebar && sidebarAdmin) {

    // Refleja en el botón el estado ya aplicado al cargar la página
    // (el estado inicial lo aplica un script embebido en base_admin.html
    // antes de que se pinte el sidebar, para evitar el "parpadeo").
    btnCollapseSidebar.setAttribute(
        "aria-expanded",
        sidebarAdmin.classList.contains("collapsed") ? "false" : "true"
    );

    btnCollapseSidebar.addEventListener("click", () => {
        const colapsado = sidebarAdmin.classList.toggle("collapsed");

        btnCollapseSidebar.setAttribute("aria-expanded", colapsado ? "false" : "true");

        // pequeño "golpe" en el botón para reforzar la animación del clic
        btnCollapseSidebar.classList.remove("btn-collapse-clic");
        void btnCollapseSidebar.offsetWidth; // fuerza reinicio de la animación
        btnCollapseSidebar.classList.add("btn-collapse-clic");

        try {
            localStorage.setItem(CLAVE_SIDEBAR_COLAPSADO, colapsado ? "1" : "0");
        } catch (error) {
            // localStorage no disponible (navegación privada, etc.): no rompe nada
        }
    });
}
 
/* AVISO DE SCROLL EN EL MENÚ DEL SIDEBAR
   Cuando el menú no cabe completo en pantallas más chicas,
   muestra una flechita abajo para avisar que hay más íconos. */
const sidebarMenu = document.getElementById("sidebarMenu");
const sidebarMenuScrollHint = document.getElementById("sidebarMenuScrollHint");

if (sidebarMenu && sidebarMenuScrollHint) {

    const actualizarAvisoScrollSidebar = () => {
        // Cuánto falta por scrollear hacia abajo
        const faltantePorAbajo =
            sidebarMenu.scrollHeight -
            sidebarMenu.clientHeight -
            sidebarMenu.scrollTop;

        sidebarMenuScrollHint.classList.toggle(
            "visible",
            faltantePorAbajo > 6
        );
    };

    // Revisa al cargar, al hacer scroll y si cambia el tamaño de la ventana
    actualizarAvisoScrollSidebar();
    sidebarMenu.addEventListener("scroll", actualizarAvisoScrollSidebar);
    window.addEventListener("resize", actualizarAvisoScrollSidebar);

    // Revisa también si el sidebar se colapsa/expande o cambia su alto
    if (typeof ResizeObserver !== "undefined") {
        const observadorSidebarMenu = new ResizeObserver(
            actualizarAvisoScrollSidebar
        );
        observadorSidebarMenu.observe(sidebarMenu);
    }

    // Al hacer clic en la flecha, baja un poco el menú
    sidebarMenuScrollHint.addEventListener("click", () => {
        sidebarMenu.scrollBy({ top: 140, behavior: "smooth" });
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

/* CAMPANA DE NOTIFICACIONES */
(function () {
    var btnNotificaciones = document.getElementById("btnNotificaciones");
    var contador = document.getElementById("contadorNotificaciones");

    if (btnNotificaciones && contador) {
        btnNotificaciones.classList.add("campana-activa");
    }
})();

/* EASTER EGG DEL LOGO: aletea rápido y suelta polen si el mouse se queda encima */
(function () {
    var logo = document.querySelector(".logo-circle");
    if (!logo) return;

    var prefiereMenosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefiereMenosMovimiento) return;

    var temporizador = null;

    function lanzarParticulaPolen() {
        var rect = logo.getBoundingClientRect();
        var particula = document.createElement("span");
        particula.className = "estela-polen";
        particula.style.left = (rect.left + rect.width / 2 + (Math.random() * 20 - 10)) + "px";
        particula.style.top = (rect.top + rect.height / 2) + "px";

        document.body.appendChild(particula);

        particula.addEventListener("animationend", function () {
            particula.remove();
        });
    }

    logo.addEventListener("mouseenter", function () {
        temporizador = setTimeout(function () {
            logo.classList.add("aleteo-rapido");

            for (var i = 0; i < 5; i++) {
                setTimeout(lanzarParticulaPolen, i * 90);
            }
        }, 1200);
    });

    logo.addEventListener("mouseleave", function () {
        clearTimeout(temporizador);
        logo.classList.remove("aleteo-rapido");
    });
})();

/* =========================================================
   RASTRO DE POLEN AL MOVER EL CURSOR
   (global: aplica en todo el panel, no solo en el logo)
   ========================================================= */
(function () {
    var prefiereMenosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefiereMenosMovimiento) return;

    var ultimoDisparo = 0;
    var INTERVALO_MINIMO_MS = 45;

    document.addEventListener("mousemove", function (evento) {
        var ahora = Date.now();
        if (ahora - ultimoDisparo < INTERVALO_MINIMO_MS) return;
        ultimoDisparo = ahora;

        var particula = document.createElement("span");
        particula.className = "estela-polen";
        particula.style.left = evento.clientX + "px";
        particula.style.top = evento.clientY + "px";

        document.body.appendChild(particula);

        window.setTimeout(function () {
            particula.remove();
        }, 700);
    });
})();

/* =========================================================
   TOOLTIPS DE LOS BADGES DE ESTADO
   (global: cualquier [data-bs-toggle="tooltip"] del panel)
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
    if (typeof bootstrap === "undefined" || !bootstrap.Tooltip) return;

    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (elemento) {
        new bootstrap.Tooltip(elemento);
    });
});

/* =========================================================
   BARRA DE CARGA AL NAVEGAR ENTRE PÁGINAS
   ========================================================= */
(function () {
    var barra = document.getElementById("barraCargaAdmin");
    if (!barra) return;

    var prefiereMenosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function iniciarCarga() {
        barra.style.transition = "none";
        barra.style.width = "0%";
        barra.style.opacity = "1";
        void barra.offsetWidth; // fuerza reinicio antes de animar

        if (prefiereMenosMovimiento) {
            barra.style.width = "80%";
            return;
        }

        barra.style.transition = "width 4s cubic-bezier(.1,.6,.2,1)";
        barra.style.width = "80%";
    }

    function terminarCarga() {
        barra.style.transition = "width .25s ease";
        barra.style.width = "100%";

        setTimeout(function () {
            barra.style.transition = "opacity .3s ease";
            barra.style.opacity = "0";

            setTimeout(function () {
                barra.style.width = "0%";
            }, 300);
        }, 180);
    }

    window.addEventListener("load", terminarCarga);

    document.addEventListener("click", function (evento) {
        var enlace = evento.target.closest("a[href]");
        if (!enlace) return;
        if (enlace.target === "_blank") return;
        if (enlace.hasAttribute("download")) return;
        if (evento.ctrlKey || evento.metaKey || evento.shiftKey) return;

        var href = enlace.getAttribute("href");
        if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

        iniciarCarga();
    });

    document.addEventListener("submit", function (evento) {
        if (evento.defaultPrevented) return;
        iniciarCarga();
    });
})();
 


/* ==========================================================
   ==========================================================
   MÓDULO MANTENIMIENTOS
   PANEL ADMINISTRADOR
   ==========================================================
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {


    /* ======================================================
       ======================================================
       1. MODAL AGREGAR MANTENIMIENTO
       ======================================================
       ====================================================== */

    const modalAgregarMantenimiento =
        document.getElementById(
            "modalAgregarMantenimiento"
        );


    if (modalAgregarMantenimiento) {


        /* ==================================================
           ELEMENTOS
        ================================================== */

        const responsable =
            modalAgregarMantenimiento.querySelector(
                "#responsableMantenimiento"
            );


        const apiario =
            modalAgregarMantenimiento.querySelector(
                "#apiarioMantenimiento"
            );


        const colmena =
            modalAgregarMantenimiento.querySelector(
                "#colmenaMantenimiento"
            );


        const campoColmena =
            modalAgregarMantenimiento.querySelector(
                "#campoColmenaMantenimiento"
            );


        const radiosAlcance =
            modalAgregarMantenimiento.querySelectorAll(
                ".alcance-mantenimiento-radio"
            );


        /* ==================================================
           OBTENER ALCANCE SELECCIONADO
        ================================================== */

        function obtenerAlcanceMantenimiento() {

            const seleccionado =
                modalAgregarMantenimiento.querySelector(
                    ".alcance-mantenimiento-radio:checked"
                );


            return seleccionado
                ? seleccionado.value
                : "";
        }


        /* ==================================================
           FILTRAR APIARIOS POR RESPONSABLE
        ================================================== */

        function filtrarApiariosPorResponsable() {

            if (
                !responsable
                ||
                !apiario
            ) {
                return;
            }


            const idResponsable =
                responsable.value;


            /* ==============================================
               LIMPIAR SELECCIONES
            ============================================== */

            apiario.value = "";


            if (colmena) {
                colmena.value = "";
            }


            if (campoColmena) {
                campoColmena.classList.add(
                    "d-none"
                );
            }


            /* ==============================================
               FILTRAR OPCIONES
            ============================================== */

            Array.from(
                apiario.options
            ).forEach(function (opcion) {


                /* ==========================================
                   OPCIÓN PLACEHOLDER
                ========================================== */

                if (!opcion.value) {

                    opcion.hidden = false;

                    opcion.disabled = false;

                    return;
                }


                /* ==========================================
                   SI NO HAY RESPONSABLE
                   NO MOSTRAMOS APIARIOS
                ========================================== */

                if (!idResponsable) {

                    opcion.hidden = true;

                    opcion.disabled = true;

                    return;
                }


                /* ==========================================
                   MOSTRAR SOLO APIARIOS DEL APICULTOR
                ========================================== */

                const corresponde =
                    opcion.dataset.apicultor
                    ===
                    idResponsable;


                opcion.hidden =
                    !corresponde;


                opcion.disabled =
                    !corresponde;

            });


            /* ==============================================
               ACTUALIZAR COLMENAS
            ============================================== */

            filtrarColmenasPorApiario();

        }


        /* ==================================================
           FILTRAR COLMENAS POR APIARIO
        ================================================== */

        function filtrarColmenasPorApiario() {

            if (
                !apiario
                ||
                !colmena
                ||
                !campoColmena
            ) {
                return;
            }


            const idApiario =
                apiario.value;


            const alcance =
                obtenerAlcanceMantenimiento();


            /* ==============================================
               SI EL ALCANCE ES APIARIO
            ============================================== */

            if (
                alcance !== "Colmena"
            ) {

                campoColmena.classList.add(
                    "d-none"
                );


                colmena.required =
                    false;


                colmena.value =
                    "";


                return;
            }


            /* ==============================================
               SI TODAVÍA NO HAY APIARIO
            ============================================== */

            if (!idApiario) {

                campoColmena.classList.add(
                    "d-none"
                );


                colmena.required =
                    false;


                colmena.value =
                    "";


                return;
            }


            /* ==============================================
               MOSTRAR SELECT DE COLMENA
            ============================================== */

            campoColmena.classList.remove(
                "d-none"
            );


            colmena.required =
                true;


            /* ==============================================
               FILTRAR OPCIONES
            ============================================== */

            Array.from(
                colmena.options
            ).forEach(function (opcion) {


                /* ==========================================
                   PLACEHOLDER
                ========================================== */

                if (!opcion.value) {

                    opcion.hidden =
                        false;


                    opcion.disabled =
                        false;


                    return;
                }


                /* ==========================================
                   COLMENAS DEL APIARIO
                ========================================== */

                const corresponde =
                    opcion.dataset.apiario
                    ===
                    idApiario;


                const estaInactiva =
                    opcion.dataset.inactiva
                    ===
                    "1";


                opcion.hidden =
                    !corresponde;


                opcion.disabled =
                    !corresponde
                    ||
                    estaInactiva;

            });


            /* ==============================================
               VALIDAR SELECCIÓN ACTUAL
            ============================================== */

            const opcionActual =
                colmena.options[
                    colmena.selectedIndex
                ];


            if (
                opcionActual
                &&
                opcionActual.value
                &&
                (
                    opcionActual.dataset.apiario
                    !==
                    idApiario

                    ||

                    opcionActual.dataset.inactiva
                    ===
                    "1"
                )
            ) {

                colmena.value =
                    "";

            }

        }


        /* ==================================================
           CAMBIO DE RESPONSABLE
        ================================================== */

        if (responsable) {

            responsable.addEventListener(
                "change",
                function () {

                    filtrarApiariosPorResponsable();

                }
            );

        }


        /* ==================================================
           CAMBIO DE APIARIO
        ================================================== */

        if (apiario) {

            apiario.addEventListener(
                "change",
                function () {

                    if (colmena) {
                        colmena.value = "";
                    }


                    filtrarColmenasPorApiario();

                }
            );

        }


        /* ==================================================
           CAMBIO DE ALCANCE
        ================================================== */

        radiosAlcance.forEach(
            function (radio) {

                radio.addEventListener(
                    "change",
                    function () {

                        if (colmena) {
                            colmena.value = "";
                        }


                        filtrarColmenasPorApiario();

                    }
                );

            }
        );


        /* ==================================================
           ESTADO INICIAL
        ================================================== */

        filtrarApiariosPorResponsable();

        filtrarColmenasPorApiario();

    }



    /* ======================================================
       ======================================================
       2. FILTRO SUPERIOR
       APIARIO -> COLMENA
       ======================================================
       ====================================================== */

    const filtroApiario =
        document.getElementById(
            "filtroApiario"
        );


    const filtroColmena =
        document.getElementById(
            "filtroColmena"
        );


    if (
        filtroApiario
        &&
        filtroColmena
    ) {


        /* ==================================================
           FILTRAR COLMENAS
        ================================================== */

        function filtrarColmenasFiltro() {

            const idApiario =
                filtroApiario.value;


            Array.from(
                filtroColmena.options
            ).forEach(function (opcion) {


                /* ==========================================
                   PLACEHOLDER
                ========================================== */

                if (!opcion.value) {

                    opcion.hidden =
                        false;


                    opcion.disabled =
                        false;


                    return;
                }


                /* ==========================================
                   SIN APIARIO:
                   MOSTRAR TODAS LAS COLMENAS
                ========================================== */

                if (!idApiario) {

                    opcion.hidden =
                        false;


                    opcion.disabled =
                        false;


                    return;
                }


                /* ==========================================
                   FILTRAR POR APIARIO
                ========================================== */

                const corresponde =
                    opcion.dataset.apiario
                    ===
                    idApiario;


                opcion.hidden =
                    !corresponde;


                opcion.disabled =
                    !corresponde;

            });


            /* ==============================================
               VALIDAR OPCIÓN SELECCIONADA
            ============================================== */

            const opcionActual =
                filtroColmena.options[
                    filtroColmena.selectedIndex
                ];


            if (
                opcionActual
                &&
                opcionActual.value
                &&
                opcionActual.hidden
            ) {

                filtroColmena.value =
                    "";

            }

        }


        /* ==================================================
           EVENTO
        ================================================== */

        filtroApiario.addEventListener(
            "change",
            function () {

                filtrarColmenasFiltro();

            }
        );


        /* ==================================================
           ESTADO INICIAL
        ================================================== */

        filtrarColmenasFiltro();

    }



    /* ======================================================
       ======================================================
       3. SELECTOR DE VISTA
       TABLA / TARJETAS
       ======================================================
       ====================================================== */

    const btnVistaTabla =
        document.getElementById(
            "btnVistaTabla"
        );


    const btnVistaTarjetas =
        document.getElementById(
            "btnVistaTarjetas"
        );


    const vistaTabla =
        document.getElementById(
            "vistaTablaMantenimientos"
        );


    const vistaTarjetas =
        document.getElementById(
            "vistaTarjetasMantenimientos"
        );


    /* ======================================================
       SOLO EJECUTAR SI EXISTEN LAS DOS VISTAS
    ====================================================== */

    if (
        btnVistaTabla
        &&
        btnVistaTarjetas
        &&
        vistaTabla
        &&
        vistaTarjetas
    ) {


        /* ==================================================
           CONFIGURACIÓN
        ================================================== */

        const CLAVE_LOCALSTORAGE =
            "vistaMantenimientos";


        /* ==================================================
           ANIMACIÓN ESCALONADA
        ================================================== */

        function aplicarEntradaEscalonadaMantenimientos(
            contenedor,
            selectorHijos,
            retraso,
            claseAnimacion
        ) {

            if (!contenedor) {
                return;
            }


            const clase =
                claseAnimacion
                ||
                "anim-entrada-lista";


            contenedor
                .querySelectorAll(
                    selectorHijos
                )
                .forEach(
                    function (
                        hijo,
                        indice
                    ) {

                        hijo.classList.remove(
                            clase
                        );


                        void hijo.offsetWidth;


                        hijo.style.animationDelay =
                            (
                                indice
                                *
                                retraso
                            )
                            +
                            "ms";


                        hijo.classList.add(
                            clase
                        );

                    }
                );

        }


        /* ==================================================
           ACTIVAR BOTÓN
        ================================================== */

        function activarBoton(
            activo,
            inactivo
        ) {

            activo.classList.add(
                "activo"
            );


            inactivo.classList.remove(
                "activo"
            );

        }


        /* ==================================================
           GUARDAR VISTA
        ================================================== */

        function guardarVista(
            vista
        ) {

            try {

                localStorage.setItem(
                    CLAVE_LOCALSTORAGE,
                    vista
                );

            } catch (error) {

                /*
                 * localStorage puede no estar disponible.
                 * No debe romper el módulo.
                 */

            }

        }


        /* ==================================================
           LEER VISTA
        ================================================== */

        function obtenerVistaGuardada() {

            try {

                return localStorage.getItem(
                    CLAVE_LOCALSTORAGE
                );

            } catch (error) {

                return null;

            }

        }


        /* ==================================================
           MOSTRAR TABLA
        ================================================== */

        function mostrarTabla(
            animar = true
        ) {

            vistaTarjetas.style.display =
                "none";


            vistaTabla.style.display =
                "block";


            activarBoton(
                btnVistaTabla,
                btnVistaTarjetas
            );


            if (animar) {

                vistaTabla.classList.add(
                    "vista-entrando"
                );


                aplicarEntradaEscalonadaMantenimientos(
                    vistaTabla,
                    "tbody tr",
                    45,
                    "anim-entrada-lista"
                );


                window.setTimeout(
                    function () {

                        vistaTabla.classList.remove(
                            "vista-entrando"
                        );

                    },
                    340
                );

            }


            guardarVista(
                "tabla"
            );

        }


        /* ==================================================
           MOSTRAR TARJETAS
        ================================================== */

        function mostrarTarjetas(
            animar = true
        ) {

            vistaTabla.style.display =
                "none";


            vistaTarjetas.style.display =
                "grid";


            activarBoton(
                btnVistaTarjetas,
                btnVistaTabla
            );


            if (animar) {

                vistaTarjetas.classList.add(
                    "vista-entrando"
                );


                aplicarEntradaEscalonadaMantenimientos(
                    vistaTarjetas,
                    ".tarjeta-mantenimiento",
                    70,
                    "anim-entrada-tarjeta"
                );


                window.setTimeout(
                    function () {

                        vistaTarjetas.classList.remove(
                            "vista-entrando"
                        );

                    },
                    340
                );

            }


            guardarVista(
                "tarjetas"
            );

        }


        /* ==================================================
           EVENTO TABLA
        ================================================== */

        btnVistaTabla.addEventListener(
            "click",
            function () {

                if (
                    btnVistaTabla
                    .classList
                    .contains(
                        "activo"
                    )
                ) {
                    return;
                }


                mostrarTabla(
                    true
                );

            }
        );


        /* ==================================================
           EVENTO TARJETAS
        ================================================== */

        btnVistaTarjetas.addEventListener(
            "click",
            function () {

                if (
                    btnVistaTarjetas
                    .classList
                    .contains(
                        "activo"
                    )
                ) {
                    return;
                }


                mostrarTarjetas(
                    true
                );

            }
        );


        /* ==================================================
           VISTA INICIAL
        ================================================== */

        const vistaGuardada =
            obtenerVistaGuardada();


        if (
            vistaGuardada
            ===
            "tarjetas"
        ) {

            mostrarTarjetas(
                false
            );


            aplicarEntradaEscalonadaMantenimientos(
                vistaTarjetas,
                ".tarjeta-mantenimiento",
                70,
                "anim-entrada-tarjeta"
            );

        } else {

            mostrarTabla(
                false
            );


            aplicarEntradaEscalonadaMantenimientos(
                vistaTabla,
                "tbody tr",
                45,
                "anim-entrada-lista"
            );

        }

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
 
    // NUEVO: entrada escalonada de filas/tarjetas
    function aplicarEntradaEscalonadaIncidencias(contenedor, selectorHijos, retraso) {
        if (!contenedor) return;
 
        contenedor.querySelectorAll(selectorHijos).forEach(function (hijo, indice) {
            hijo.classList.remove("anim-entrada-lista");
            void hijo.offsetWidth;
            hijo.style.animationDelay = (indice * retraso) + "ms";
            hijo.classList.add("anim-entrada-lista");
        });
    }
 
    const CLAVE_LOCALSTORAGE = "vistaIncidencias";
 
    const btnVistaTabla = document.getElementById("btnVistaTabla");
    const btnVistaTarjetas = document.getElementById("btnVistaTarjetas");
 
    const vistaTabla = document.getElementById("vistaTablaIncidencias");
    const vistaTarjetas = document.getElementById("vistaTarjetasIncidencias");
 
    if (!btnVistaTabla || !btnVistaTarjetas || !vistaTabla || !vistaTarjetas) {
        return;
    }
 
    // NUEVO: entrada escalonada al cargar la página
    aplicarEntradaEscalonadaIncidencias(vistaTabla, "tbody tr", 45);
    aplicarEntradaEscalonadaIncidencias(vistaTarjetas, ".tarjeta-incidencia", 70);
 
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
 
            // NUEVO: entrada escalonada al cambiar de vista
            if (elementoAMostrar.id === "vistaTarjetasIncidencias") {
                aplicarEntradaEscalonadaIncidencias(elementoAMostrar, ".tarjeta-incidencia", 70);
            } else {
                aplicarEntradaEscalonadaIncidencias(elementoAMostrar, "tbody tr", 45);
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
 
        // Cada campo condicional se marca required SOLO cuando está
        // visible; si no, se limpia required y el valor, para que no
        // quede un campo oculto bloqueando el envío del formulario.
        if (campoApicultor) {
            const mostrar = entidad === "Apicultor";
            campoApicultor.style.display = mostrar ? "block" : "none";
 
            const selectApicultor = campoApicultor.querySelector("select");
            if (selectApicultor) {
                selectApicultor.required = mostrar;
                if (!mostrar) selectApicultor.value = "";
            }
        }
 
        if (campoApiario) {
            const mostrar = entidad === "Apiario" || entidad === "Colmena";
            campoApiario.style.display = mostrar ? "block" : "none";
 
            const selectApiario = campoApiario.querySelector("select");
            if (selectApiario) {
                selectApiario.required = mostrar;
                if (!mostrar) selectApiario.value = "";
            }
        }
 
        if (campoColmena) {
            const mostrar = entidad === "Colmena";
            campoColmena.style.display = mostrar ? "block" : "none";
 
            const selectColmena = campoColmena.querySelector("select");
            if (selectColmena) {
                selectColmena.required = mostrar;
                if (!mostrar) selectColmena.value = "";
            }
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
                !apiarioId
                ||
                opcion.dataset.apiario
                ===
                apiarioId;


            const estaInactiva =
                opcion.dataset.inactiva
                ===
                "1";


            const esActual =
                opcion.dataset.esActual
                ===
                "1";


            opcion.hidden =
                !corresponde;


            opcion.disabled =
                !corresponde
                ||
                (
                    estaInactiva
                    &&
                    !esActual
                );
        });


        const opcionSeleccionada =
            colmenaSelect.options[
                colmenaSelect.selectedIndex
            ];


        if (
            opcionSeleccionada
            &&
            opcionSeleccionada.value
            &&
            (
                (
                    opcionSeleccionada.dataset.apiario
                    &&
                    opcionSeleccionada.dataset.apiario
                    !==
                    apiarioId
                )

                ||

                (
                    opcionSeleccionada.dataset.inactiva
                    ===
                    "1"

                    &&

                    opcionSeleccionada.dataset.esActual
                    !==
                    "1"
                )
            )
        ) {

            colmenaSelect.value =
                "";

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
 
/* ==========================================================
   ==========================================================
   VALIDACIONES - MÓDULO DE MANTENIMIENTOS
   PANEL ADMINISTRADOR
   ==========================================================
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {


    /* ======================================================
       CONFIGURACIÓN GENERAL
    ====================================================== */

    const MAX_EVIDENCIAS_MANTENIMIENTO = 6;

    const MAX_TAMANO_MB = 5;

    const MAX_TAMANO_BYTES =
        MAX_TAMANO_MB
        *
        1024
        *
        1024;


    const TIPOS_IMAGEN_VALIDOS = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    const EXTENSIONES_VALIDAS = [
        "jpg",
        "jpeg",
        "png",
        "webp"
    ];



    /* ======================================================
       UTILIDAD:
       MOSTRAR MENSAJE
    ====================================================== */

    /* ======================================================
    VENTANA EMERGENTE DE VALIDACIÓN
    ====================================================== */

    function mostrarErrorMantenimiento(
        mensaje,
        titulo = "Revisa la información"
    ) {

        /* ==================================================
        BUSCAR MODAL EXISTENTE
        ================================================== */

        let modal =
            document.getElementById(
                "modalValidacionMantenimiento"
            );


        /* ==================================================
        CREAR MODAL SI TODAVÍA NO EXISTE
        ================================================== */

        if (!modal) {

            modal =
                document.createElement(
                    "div"
                );


            modal.id =
                "modalValidacionMantenimiento";


            modal.className =
                "modal fade";


            modal.tabIndex =
                -1;


            modal.setAttribute(
                "aria-hidden",
                "true"
            );


            modal.innerHTML = `
                <div class="modal-dialog modal-dialog-centered">

                    <div
                        class="
                            modal-content
                            border-0
                            shadow
                            rounded-4
                        "
                    >

                        <!-- =====================================
                            ENCABEZADO
                        ====================================== -->

                        <div
                            class="
                                modal-header
                                border-0
                                modal-validacion-mantenimiento-header
                            "
                        >

                            <div
                                class="
                                    d-flex
                                    align-items-center
                                    gap-3
                                "
                            >

                                <div
                                    class="
                                        modal-validacion-mantenimiento-icono
                                    "
                                >

                                    <i
                                        class="
                                            bi
                                            bi-exclamation-triangle-fill
                                        "
                                    ></i>

                                </div>


                                <div>

                                    <h5
                                        class="
                                            modal-title
                                            fw-bold
                                            mb-1
                                        "
                                    >
                                        ${titulo}
                                    </h5>


                                    <small
                                        class="
                                            text-muted
                                        "
                                    >
                                        Hay un detalle que debes corregir.
                                    </small>

                                </div>

                            </div>


                            <button
                                type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Cerrar"
                            ></button>

                        </div>


                        <!-- =====================================
                            CONTENIDO
                        ====================================== -->

                        <div
                            class="
                                modal-body
                                modal-validacion-mantenimiento-body
                            "
                        >

                            <div
                                class="
                                    modal-validacion-mantenimiento-aviso
                                "
                            >

                                <i
                                    class="
                                        bi
                                        bi-info-circle-fill
                                    "
                                ></i>


                                <p
                                    id="mensajeValidacionMantenimiento"
                                    class="mb-0"
                                ></p>

                            </div>

                        </div>


                        <!-- =====================================
                            FOOTER
                        ====================================== -->

                        <div
                            class="
                                modal-footer
                                border-0
                            "
                        >

                            <button
                                type="button"
                                class="
                                    btn
                                    btn-success
                                    px-4
                                    rounded-3
                                "
                                data-bs-dismiss="modal"
                            >

                                <i
                                    class="
                                        bi
                                        bi-check-lg
                                        me-1
                                    "
                                ></i>

                                Entendido

                            </button>

                        </div>

                    </div>

                </div>
            `;


            document.body.appendChild(
                modal
            );

        }


        /* ==================================================
        MENSAJE
        ================================================== */

        const mensajeElemento =
            modal.querySelector(
                "#mensajeValidacionMantenimiento"
            );


        if (mensajeElemento) {

            mensajeElemento.textContent =
                mensaje;

        }


        /* ==================================================
        MOSTRAR CON BOOTSTRAP
        ================================================== */

        if (
            typeof bootstrap
            !==
            "undefined"
            &&
            bootstrap.Modal
        ) {

            const instancia =
                bootstrap.Modal.getOrCreateInstance(
                    modal
                );


            instancia.show();

        }

    }



    /* ======================================================
       UTILIDAD:
       OBTENER EXTENSIÓN
    ====================================================== */

    function obtenerExtensionArchivo(
        nombre
    ) {

        if (!nombre) {
            return "";
        }


        const partes =
            nombre
            .toLowerCase()
            .split(".");


        if (
            partes.length
            <
            2
        ) {
            return "";
        }


        return partes[
            partes.length - 1
        ];

    }



    /* ======================================================
       UTILIDAD:
       VALIDAR UNA IMAGEN
    ====================================================== */

    function validarArchivoImagen(
        archivo
    ) {


        /* ==================================================
           ARCHIVO VACÍO
        ================================================== */

        if (!archivo) {

            return (
                "No se pudo leer una de las fotografías "
                +
                "seleccionadas."
            );

        }


        /* ==================================================
           ARCHIVO SIN CONTENIDO
        ================================================== */

        if (
            archivo.size
            <=
            0
        ) {

            return (
                `La imagen "${archivo.name}" está vacía.`
            );

        }


        /* ==================================================
           TAMAÑO
        ================================================== */

        if (
            archivo.size
            >
            MAX_TAMANO_BYTES
        ) {

            return (
                `La imagen "${archivo.name}" supera `
                +
                `el límite de ${MAX_TAMANO_MB} MB.`
            );

        }


        /* ==================================================
           FORMATO
        ================================================== */

        const extension =
            obtenerExtensionArchivo(
                archivo.name
            );


        const tipoMime =
            archivo.type
            ?
            archivo.type.toLowerCase()
            :
            "";


        const extensionValida =
            EXTENSIONES_VALIDAS.includes(
                extension
            );


        const mimeValido =
            !tipoMime
            ||
            TIPOS_IMAGEN_VALIDOS.includes(
                tipoMime
            );


        if (
            !extensionValida
            ||
            !mimeValido
        ) {

            return (
                `La imagen "${archivo.name}" tiene un `
                +
                "formato no permitido. "
                +
                "Utiliza JPG, JPEG, PNG o WEBP."
            );

        }


        return null;

    }



    /* ======================================================
       UTILIDAD:
       OBTENER INPUTS DE EVIDENCIAS
    ====================================================== */

    function obtenerInputsEvidencias(
        formulario
    ) {

        return Array.from(
            formulario.querySelectorAll(
                'input[type="file"][name="evidencias_antes"], '
                +
                'input[type="file"][name="evidencias_durante"], '
                +
                'input[type="file"][name="evidencias_despues"]'
            )
        );

    }



    /* ======================================================
       UTILIDAD:
       OBTENER TODOS LOS ARCHIVOS NUEVOS
    ====================================================== */

    function obtenerArchivosSeleccionados(
        formulario
    ) {

        const archivos = [];


        obtenerInputsEvidencias(
            formulario
        ).forEach(
            function (input) {

                Array.from(
                    input.files || []
                ).forEach(
                    function (archivo) {

                        archivos.push({
                            archivo: archivo,
                            input: input
                        });

                    }
                );

            }
        );


        return archivos;

    }



    /* ======================================================
       UTILIDAD:
       LIMPIAR ERRORES DE LOS INPUT FILE
    ====================================================== */

    function limpiarErroresEvidencias(
        formulario
    ) {

        obtenerInputsEvidencias(
            formulario
        ).forEach(
            function (input) {

                input.classList.remove(
                    "is-invalid"
                );

            }
        );

    }



    /* ======================================================
       UTILIDAD:
       CONTAR EVIDENCIAS EXISTENTES
       SOLO EN MODAL EDITAR
    ====================================================== */

    function contarEvidenciasExistentes(
        formulario
    ) {

        const modal =
            formulario.closest(
                ".modal-editar-mantenimiento"
            );


        if (!modal) {
            return 0;
        }


        return modal.querySelectorAll(
            ".mantenimiento-evidencia-item"
        ).length;

    }



    /* ======================================================
       VALIDAR TODAS LAS EVIDENCIAS DEL FORMULARIO
    ====================================================== */

    function validarEvidenciasFormulario(
        formulario
    ) {

        limpiarErroresEvidencias(
            formulario
        );


        const elementosArchivo =
            obtenerArchivosSeleccionados(
                formulario
            );


        const cantidadNuevas =
            elementosArchivo.length;


        const cantidadExistentes =
            contarEvidenciasExistentes(
                formulario
            );


        const cantidadTotal =
            cantidadExistentes
            +
            cantidadNuevas;


        /* ==================================================
           MÁXIMO 6 FOTOS
        ================================================== */

        if (
            cantidadTotal
            >
            MAX_EVIDENCIAS_MANTENIMIENTO
        ) {

            const disponibles =
                Math.max(
                    0,
                    MAX_EVIDENCIAS_MANTENIMIENTO
                    -
                    cantidadExistentes
                );


            obtenerInputsEvidencias(
                formulario
            ).forEach(
                function (input) {

                    if (
                        input.files
                        &&
                        input.files.length
                    ) {

                        input.classList.add(
                            "is-invalid"
                        );

                    }

                }
            );


            return {
                valido: false,

                mensaje:
                    "Un mantenimiento puede tener un máximo de "
                    +
                    `${MAX_EVIDENCIAS_MANTENIMIENTO} fotografías `
                    +
                    "en total.\n\n"
                    +
                    `Actualmente hay ${cantidadExistentes} `
                    +
                    "fotografía(s) guardada(s).\n"
                    +
                    `Puedes agregar máximo ${disponibles} más.`
            };

        }



        /* ==================================================
           VALIDAR CADA ARCHIVO
        ================================================== */

        for (
            const elemento
            of
            elementosArchivo
        ) {

            const error =
                validarArchivoImagen(
                    elemento.archivo
                );


            if (error) {

                elemento.input.classList.add(
                    "is-invalid"
                );


                return {
                    valido: false,
                    mensaje: error
                };

            }

        }



        /* ==================================================
           ARCHIVOS DUPLICADOS
        ================================================== */

        const archivosVistos =
            new Set();


        for (
            const elemento
            of
            elementosArchivo
        ) {

            const archivo =
                elemento.archivo;


            const clave =
                archivo.name.toLowerCase()
                +
                "|"
                +
                archivo.size
                +
                "|"
                +
                archivo.lastModified;


            if (
                archivosVistos.has(
                    clave
                )
            ) {

                elemento.input.classList.add(
                    "is-invalid"
                );


                return {

                    valido: false,

                    mensaje:
                        `La fotografía "${archivo.name}" `
                        +
                        "fue seleccionada más de una vez."

                };

            }


            archivosVistos.add(
                clave
            );

        }


        return {
            valido: true,
            mensaje: ""
        };

    }



    /* ======================================================
       ======================================================
       1. VALIDACIÓN EN EDITAR:
       APIARIO / COLMENA
       ======================================================
       ====================================================== */

    document
        .querySelectorAll(
            ".modal-editar-mantenimiento"
        )
        .forEach(
            function (modal) {


                const entidad =
                    modal.querySelector(
                        ".entidad-editar"
                    );


                const apiario =
                    modal.querySelector(
                        ".apiario-editar"
                    );


                const colmena =
                    modal.querySelector(
                        ".colmena-editar"
                    );


                const campoColmena =
                    colmena
                    ?
                    colmena.closest(
                        ".col-md-6"
                    )
                    :
                    null;


                if (
                    !entidad
                    ||
                    !apiario
                    ||
                    !colmena
                ) {
                    return;
                }



                /* ==========================================
                   ACTUALIZAR COLMENAS
                ========================================== */

                function actualizarEntidadEditar() {

                    const idApiario =
                        apiario.value;


                    const esColmena =
                        entidad.value
                        ===
                        "Colmena";


                    /* ======================================
                       MOSTRAR / OCULTAR
                    ====================================== */

                    if (campoColmena) {

                        campoColmena.classList.toggle(
                            "d-none",
                            !esColmena
                        );

                    }


                    colmena.required =
                        esColmena;


                    /* ======================================
                       SI ES APIARIO
                    ====================================== */

                    if (!esColmena) {

                        colmena.value =
                            "";

                        return;

                    }


                    /* ======================================
                       FILTRAR COLMENAS
                    ====================================== */

                    Array.from(
                        colmena.options
                    ).forEach(
                        function (opcion) {


                            if (!opcion.value) {

                                opcion.hidden =
                                    false;

                                opcion.disabled =
                                    false;

                                return;

                            }


                            const corresponde =
                                opcion.dataset.apiario
                                ===
                                idApiario;


                            const estaInactiva =
                                opcion.dataset.inactiva
                                ===
                                "1";


                            const esActual =
                                opcion.dataset.esActual
                                ===
                                "1";


                            opcion.hidden =
                                !corresponde;


                            opcion.disabled =
                                !corresponde
                                ||
                                (
                                    estaInactiva
                                    &&
                                    !esActual
                                );

                        }
                    );


                    /* ======================================
                       VALIDAR SELECCIÓN ACTUAL
                    ====================================== */

                    const seleccionada =
                        colmena.options[
                            colmena.selectedIndex
                        ];


                    if (
                        seleccionada
                        &&
                        seleccionada.value
                        &&
                        (
                            seleccionada.dataset.apiario
                            !==
                            idApiario

                            ||

                            (
                                seleccionada.dataset.inactiva
                                ===
                                "1"

                                &&

                                seleccionada.dataset.esActual
                                !==
                                "1"
                            )
                        )
                    ) {

                        colmena.value =
                            "";

                    }

                }


                entidad.addEventListener(
                    "change",
                    actualizarEntidadEditar
                );


                apiario.addEventListener(
                    "change",
                    function () {

                        colmena.value =
                            "";


                        actualizarEntidadEditar();

                    }
                );


                actualizarEntidadEditar();

            }
        );



    /* ======================================================
       ======================================================
       2. VALIDAR TEXTOS VACÍOS
       ======================================================
       ====================================================== */

    document
        .querySelectorAll(
            ".form-mantenimiento"
        )
        .forEach(
            function (formulario) {


                formulario.addEventListener(
                    "submit",
                    function (evento) {


                        let valido =
                            true;


                        formulario
                            .querySelectorAll(
                                'input[type="text"][required], '
                                +
                                'textarea[required]'
                            )
                            .forEach(
                                function (campo) {


                                    campo.value =
                                        campo.value.trim();


                                    if (
                                        campo.value
                                        ===
                                        ""
                                    ) {

                                        valido =
                                            false;


                                        campo.classList.add(
                                            "is-invalid"
                                        );

                                    } else {

                                        campo.classList.remove(
                                            "is-invalid"
                                        );

                                    }

                                }
                            );


                        if (!valido) {

                            evento.preventDefault();


                            mostrarErrorMantenimiento(
                                "Completa correctamente los campos obligatorios."
                            );

                        }

                    }
                );

            }
        );



    /* ======================================================
       ======================================================
       3. VALIDACIONES DE FECHAS
       ======================================================
       ====================================================== */


    /* ======================================================
       OBTENER FECHA LOCAL YYYY-MM-DD
    ====================================================== */

    function hoyComoTexto() {

        const ahora =
            new Date();


        const anio =
            ahora.getFullYear();


        const mes =
            String(
                ahora.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const dia =
            String(
                ahora.getDate()
            ).padStart(
                2,
                "0"
            );


        return (
            `${anio}-${mes}-${dia}`
        );

    }


    const hoyTexto =
        hoyComoTexto();



    /* ======================================================
       3.1 AGREGAR:
       NO PERMITIR FECHAS ANTERIORES A HOY
    ====================================================== */

    const modalAgregar =
        document.getElementById(
            "modalAgregarMantenimiento"
        );


    const formAgregar =
        modalAgregar
        ?
        modalAgregar.querySelector(
            "form"
        )
        :
        null;


    const fechaAgregar =
        formAgregar
        ?
        formAgregar.querySelector(
            'input[name="fecha_ejecucion"]'
        )
        :
        null;


    if (
        formAgregar
        &&
        fechaAgregar
    ) {


        fechaAgregar.min =
            hoyTexto;


        formAgregar.addEventListener(
            "submit",
            function (evento) {


                if (
                    !fechaAgregar.value
                    ||
                    fechaAgregar.value
                    <
                    hoyTexto
                ) {

                    evento.preventDefault();


                    fechaAgregar.classList.add(
                        "is-invalid"
                    );


                    mostrarErrorMantenimiento(
                        "La fecha programada no puede ser anterior a hoy."
                    );


                    return;

                }


                fechaAgregar.classList.remove(
                    "is-invalid"
                );

            }
        );

    }



    /* ======================================================
       3.2 EDITAR:
       CONTROLAR FECHA ORIGINAL
    ====================================================== */

    document
        .querySelectorAll(
            ".modal-editar-mantenimiento"
        )
        .forEach(
            function (modal) {


                const formulario =
                    modal.querySelector(
                        "form"
                    );


                const fecha =
                    modal.querySelector(
                        ".fecha-editar"
                    );


                if (
                    !formulario
                    ||
                    !fecha
                ) {
                    return;
                }


                const valorOriginal =
                    fecha.value;


                if (!valorOriginal) {
                    return;
                }


                const yaVencido =
                    valorOriginal
                    <
                    hoyTexto;


                /* ==========================================
                   FECHA YA VENCIDA
                ========================================== */

                if (yaVencido) {

                    fecha.readOnly =
                        true;


                    fecha.classList.add(
                        "bg-light"
                    );


                    fecha.title =
                        "Esta fecha ya venció y no puede modificarse.";

                } else {

                    fecha.min =
                        hoyTexto;

                }



                /* ==========================================
                   VALIDAR AL ENVIAR
                ========================================== */

                formulario.addEventListener(
                    "submit",
                    function (evento) {


                        let bloquear =
                            false;


                        let mensaje =
                            "";


                        /* ==================================
                           YA VENCIDO
                        ================================== */

                        if (yaVencido) {

                            if (
                                fecha.value
                                !==
                                valorOriginal
                            ) {

                                bloquear =
                                    true;


                                mensaje =
                                    "Esta fecha ya venció y no puede modificarse.";

                            }

                        }


                        /* ==================================
                           FECHA AÚN VÁLIDA
                        ================================== */

                        else {

                            if (
                                !fecha.value
                                ||
                                fecha.value
                                <
                                hoyTexto
                            ) {

                                bloquear =
                                    true;


                                mensaje =
                                    "La fecha programada no puede ser anterior a hoy.";

                            }

                        }


                        if (bloquear) {

                            evento.preventDefault();


                            fecha.classList.add(
                                "is-invalid"
                            );


                            mostrarErrorMantenimiento(
                                mensaje
                            );


                        } else {

                            fecha.classList.remove(
                                "is-invalid"
                            );

                        }

                    }
                );

            }
        );



    /* ======================================================
       ======================================================
       4. VALIDACIONES DE EVIDENCIAS
       ANTES / DURANTE / DESPUÉS
       ======================================================
       ====================================================== */

    document
        .querySelectorAll(
            ".form-mantenimiento"
        )
        .forEach(
            function (formulario) {


                const inputs =
                    obtenerInputsEvidencias(
                        formulario
                    );


                if (!inputs.length) {
                    return;
                }



                /* ==========================================
                   VALIDAR AL SELECCIONAR ARCHIVOS
                ========================================== */

                inputs.forEach(
                    function (input) {


                        input.addEventListener(
                            "change",
                            function () {


                                const resultado =
                                    validarEvidenciasFormulario(
                                        formulario
                                    );


                                if (
                                    !resultado.valido
                                ) {

                                    mostrarErrorMantenimiento(
                                        resultado.mensaje
                                    );

                                }

                            }
                        );

                    }
                );



                /* ==========================================
                   VALIDACIÓN DEFINITIVA ANTES DEL SUBMIT
                ========================================== */

                formulario.addEventListener(
                    "submit",
                    function (evento) {


                        const resultado =
                            validarEvidenciasFormulario(
                                formulario
                            );


                        if (
                            !resultado.valido
                        ) {

                            evento.preventDefault();


                            mostrarErrorMantenimiento(
                                resultado.mensaje
                            );

                        }

                    }
                );

            }
        );



    /* ======================================================
       ======================================================
       5. VALIDACIÓN EXTRA:
       APIARIO / COLMENA ANTES DE EDITAR
       ======================================================
       ====================================================== */

    document
        .querySelectorAll(
            ".modal-editar-mantenimiento"
        )
        .forEach(
            function (modal) {


                const formulario =
                    modal.querySelector(
                        "form"
                    );


                const entidad =
                    modal.querySelector(
                        ".entidad-editar"
                    );


                const apiario =
                    modal.querySelector(
                        ".apiario-editar"
                    );


                const colmena =
                    modal.querySelector(
                        ".colmena-editar"
                    );


                if (
                    !formulario
                    ||
                    !entidad
                    ||
                    !apiario
                    ||
                    !colmena
                ) {
                    return;
                }


                formulario.addEventListener(
                    "submit",
                    function (evento) {


                        /* ==================================
                           APIARIO OBLIGATORIO
                        ================================== */

                        if (!apiario.value) {

                            evento.preventDefault();


                            apiario.classList.add(
                                "is-invalid"
                            );


                            mostrarErrorMantenimiento(
                                "Debes seleccionar un apiario."
                            );


                            return;

                        }


                        apiario.classList.remove(
                            "is-invalid"
                        );


                        /* ==================================
                           SI ES COLMENA
                        ================================== */

                        if (
                            entidad.value
                            ===
                            "Colmena"
                        ) {


                            if (!colmena.value) {

                                evento.preventDefault();


                                colmena.classList.add(
                                    "is-invalid"
                                );


                                mostrarErrorMantenimiento(
                                    "Debes seleccionar una colmena."
                                );


                                return;

                            }


                            const opcion =
                                colmena.options[
                                    colmena.selectedIndex
                                ];


                            if (
                                opcion
                                &&
                                opcion.dataset.apiario
                                !==
                                apiario.value
                            ) {

                                evento.preventDefault();


                                colmena.classList.add(
                                    "is-invalid"
                                );


                                mostrarErrorMantenimiento(
                                    "La colmena seleccionada no pertenece al apiario indicado."
                                );


                                return;

                            }


                            colmena.classList.remove(
                                "is-invalid"
                            );

                        }

                    }
                );

            }
        );


});


/* ==========================================================
   FIN VALIDACIONES - MÓDULO MANTENIMIENTOS
========================================================== */



/* ==========================================================
   VALIDACIONES NUEVAS - MÓDULO DE INCIDENCIAS
   ========================================================== */

/* ==========================================================
   RESPONSABLE DE LA INCIDENCIA
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const regexResponsable =
            /^(?=.*[A-Za-zÁÉÍÓÚÜÑáéíóúüñ])[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;


        document
            .querySelectorAll(
                ".responsable-incidencia"
            )
            .forEach(
                function (campo) {

                    const mensaje =
                        campo
                            .closest(".col-md-4")
                            ?.querySelector(
                                ".mensaje-responsable-incidencia"
                            );


                    function validarResponsable() {

                        const valor =
                            campo.value.trim();


                        campo.setCustomValidity("");

                        campo.classList.remove(
                            "is-valid",
                            "is-invalid"
                        );


                        if (mensaje) {

                            mensaje.classList.add(
                                "d-none"
                            );

                            mensaje.classList.remove(
                                "text-success",
                                "text-danger"
                            );

                            mensaje.textContent =
                                "";

                        }


                        /*
                         * Responsable es opcional.
                         */
                        if (!valor) {
                            return true;
                        }


                        if (valor.length < 2) {

                            campo.setCustomValidity(
                                "El responsable debe tener al menos 2 caracteres."
                            );

                            campo.classList.add(
                                "is-invalid"
                            );


                            mostrarMensaje(
                                "El responsable debe tener al menos 2 caracteres.",
                                false
                            );

                            return false;

                        }


                        if (valor.length > 150) {

                            campo.setCustomValidity(
                                "El responsable no puede superar los 150 caracteres."
                            );

                            campo.classList.add(
                                "is-invalid"
                            );


                            mostrarMensaje(
                                "El responsable no puede superar los 150 caracteres.",
                                false
                            );

                            return false;

                        }


                        if (
                            !regexResponsable.test(
                                valor
                            )
                        ) {

                            campo.setCustomValidity(
                                "Ingresa un nombre válido para el responsable."
                            );

                            campo.classList.add(
                                "is-invalid"
                            );


                            mostrarMensaje(
                                (
                                    "El responsable solo puede contener "
                                    +
                                    "letras, espacios, apóstrofes y guiones."
                                ),
                                false
                            );

                            return false;

                        }


                        campo.setCustomValidity("");

                        campo.classList.add(
                            "is-valid"
                        );


                        mostrarMensaje(
                            "Responsable válido.",
                            true
                        );


                        return true;

                    }


                    function mostrarMensaje(
                        texto,
                        valido
                    ) {

                        if (!mensaje) {
                            return;
                        }


                        mensaje.textContent =
                            texto;


                        mensaje.classList.remove(
                            "d-none",
                            "text-success",
                            "text-danger"
                        );


                        mensaje.classList.add(
                            valido
                                ? "text-success"
                                : "text-danger"
                        );

                    }


                    campo.addEventListener(
                        "input",
                        function () {

                            campo.value =
                                campo.value.replace(
                                    /[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]/g,
                                    ""
                                );

                            validarResponsable();

                        }
                    );


                    campo.addEventListener(
                        "blur",
                        validarResponsable
                    );


                    const formulario =
                        campo.closest(
                            ".form-incidencia"
                        );


                    if (formulario) {

                        formulario.addEventListener(
                            "submit",
                            function (evento) {

                                if (
                                    !validarResponsable()
                                ) {

                                    evento.preventDefault();

                                    evento.stopPropagation();

                                    campo.focus();

                                }

                            }
                        );

                    }

                }
            );

    }
);
 
/* La fecha de detección nunca puede ser una fecha futura */
document.addEventListener("DOMContentLoaded", function () {
 
    function hoyComoTexto() {
        const ahora = new Date();
        const año = ahora.getFullYear();
        const mes = String(ahora.getMonth() + 1).padStart(2, "0");
        const dia = String(ahora.getDate()).padStart(2, "0");
        return `${año}-${mes}-${dia}`;
    }
 
    const hoyTexto = hoyComoTexto();
 
    document.querySelectorAll(".fecha-incidencia").forEach(function (fecha) {
        fecha.max = hoyTexto;
    });
 
    document.querySelectorAll(".form-incidencia").forEach(function (form) {
        const fecha = form.querySelector(".fecha-incidencia");
        if (!fecha) return;
 
        form.addEventListener("submit", function (e) {
            if (!fecha.value || fecha.value > hoyTexto) {
                e.preventDefault();
                fecha.classList.add("is-invalid");
                alert("La fecha de detección no puede ser una fecha futura.");
            } else {
                fecha.classList.remove("is-invalid");
            }
        });
    });
});
 
/* Evitar textos vacíos (solo espacios) en formularios de incidencia */
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".form-incidencia").forEach(function (form) {
        form.addEventListener("submit", function (e) {
            let valido = true;
 
            form.querySelectorAll('input[type="text"][required], textarea[required]').forEach(function (campo) {
                campo.value = campo.value.trim();
                if (campo.value === "") {
                    valido = false;
                    campo.classList.add("is-invalid");
                } else {
                    campo.classList.remove("is-invalid");
                }
            });
 
            if (!valido) e.preventDefault();
        });
    });
});