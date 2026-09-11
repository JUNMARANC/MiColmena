/* ==========================================================
   BASE PANEL APICULTOR
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /* ==================================================
           ELEMENTOS
        ================================================== */

        const sidebar = document.getElementById(
            "sidebarApicultor"
        );

        const btnMenu = document.getElementById(
            "btnMenuApicultor"
        );

        const overlay = document.getElementById(
            "sidebarOverlay"
        );


        /* ==================================================
           ABRIR SIDEBAR
        ================================================== */

        // Dónde estaba el foco antes de abrir, para devolverlo al cerrar
        let elementoQueAbrio = null;


        function abrirSidebar() {

            elementoQueAbrio = document.activeElement;

            if (sidebar) {
                sidebar.classList.add("activo");
            }

            if (overlay) {
                overlay.classList.add("activo");
            }

            if (btnMenu) {
                btnMenu.setAttribute("aria-expanded", "true");
            }

            document.body.classList.add(
                "sidebar-movil-abierto"
            );

            // Lleva el foco al primer enlace del menú
            const primerEnlace = sidebar
                ? sidebar.querySelector(".sidebar-link")
                : null;

            if (primerEnlace) {
                primerEnlace.focus();
            }
        }


        /* ==================================================
           CERRAR SIDEBAR
        ================================================== */

        function cerrarSidebar(devolverFoco) {

            if (sidebar) {
                sidebar.classList.remove("activo");
            }

            if (overlay) {
                overlay.classList.remove("activo");
            }

            if (btnMenu) {
                btnMenu.setAttribute("aria-expanded", "false");
            }

            document.body.classList.remove(
                "sidebar-movil-abierto"
            );

            // Devuelve el foco al botón que abrió el menú, para que
            // con teclado no quede perdido en el contenido de atrás.
            if (devolverFoco !== false && elementoQueAbrio) {
                elementoQueAbrio.focus();
                elementoQueAbrio = null;
            }
        }


        function menuMovilAbierto() {
            return sidebar
                ? sidebar.classList.contains("activo")
                : false;
        }


        /* ==================================================
           EL FOCO NO SE SALE DEL MENÚ MIENTRAS ESTÁ ABIERTO

           Antes se podía tabular hacia elementos tapados por
           el overlay, que no se ven pero sí reciben el foco.
        ================================================== */

        if (sidebar) {

            sidebar.addEventListener(
                "keydown",
                function (evento) {

                    if (
                        evento.key !== "Tab" ||
                        !menuMovilAbierto()
                    ) {
                        return;
                    }

                    const enfocables = sidebar.querySelectorAll(
                        'a[href], button:not([disabled]):not([tabindex="-1"])'
                    );

                    if (enfocables.length === 0) {
                        return;
                    }

                    const primero = enfocables[0];
                    const ultimo =
                        enfocables[enfocables.length - 1];

                    if (
                        evento.shiftKey &&
                        document.activeElement === primero
                    ) {
                        evento.preventDefault();
                        ultimo.focus();

                    } else if (
                        !evento.shiftKey &&
                        document.activeElement === ultimo
                    ) {
                        evento.preventDefault();
                        primero.focus();
                    }

                }
            );

        }


        /* ==================================================
           BOTÓN HAMBURGUESA
        ================================================== */

        if (btnMenu) {

            btnMenu.addEventListener(
                "click",
                function () {

                    if (!sidebar) {
                        return;
                    }

                    const estaAbierto = (
                        sidebar.classList.contains(
                            "activo"
                        )
                    );

                    if (estaAbierto) {
                        cerrarSidebar();
                    } else {
                        abrirSidebar();
                    }

                }
            );

        }


        /* ==================================================
           CERRAR AL TOCAR EL OVERLAY
        ================================================== */

        if (overlay) {

            overlay.addEventListener(
                "click",
                function () {
                    cerrarSidebar();
                }
            );

        }


        /* ==================================================
           CERRAR CON ESC
        ================================================== */

        document.addEventListener(
            "keydown",
            function (evento) {

                if (
                    evento.key === "Escape" &&
                    menuMovilAbierto()
                ) {
                    cerrarSidebar();
                }

            }
        );


        /* ==================================================
           CERRAR SIDEBAR AL HACER CLIC EN UN ENLACE
           SOLO EN MÓVIL
        ================================================== */

        const enlacesSidebar = document.querySelectorAll(
            ".sidebar-apicultor .sidebar-link"
        );

        enlacesSidebar.forEach(
            function (enlace) {

                enlace.addEventListener(
                    "click",
                    function () {

                        if (
                            window.innerWidth <= 820
                        ) {
                            cerrarSidebar();
                        }

                    }
                );

            }
        );


        /* ==================================================
           CERRAR SIDEBAR AL PASAR A ESCRITORIO
        ================================================== */

        window.addEventListener(
            "resize",
            function () {

                if (window.innerWidth > 820) {
                    cerrarSidebar(false);
                }

            }
        );

    }
);

/* ==========================================================
   ==========================================================
   AÑADIDOS AL SIDEBAR

   Bloque nuevo, independiente del código anterior. Si algo
   falla se puede borrar entero y el menú vuelve a como estaba.

   Cubre lo que el panel del administrador ya tenía y este no:
   contraer el menú (recordándolo entre recargas) y el aviso
   de que quedan ítems por debajo.
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const sidebar = document.getElementById("sidebarApicultor");

    if (!sidebar) {
        return;
    }


    /* ======================================================
       CONTRAER Y EXPANDIR
    ====================================================== */

    const CLAVE_CONTRAIDO = "sidebarApicultorContraido";

    const btnContraer = document.getElementById("btnContraerSidebar");

    if (btnContraer) {

        // El estado inicial ya lo aplicó el script en línea del
        // HTML; aquí solo se sincroniza el aria-expanded.
        btnContraer.setAttribute(
            "aria-expanded",
            sidebar.classList.contains("contraido") ? "false" : "true"
        );

        sidebar.addEventListener("mouseleave", function () {
            sidebar.classList.remove("sin-asomar");
        });

        btnContraer.addEventListener("click", function () {

            const contraido = sidebar.classList.toggle("contraido");

            btnContraer.setAttribute(
                "aria-expanded",
                contraido ? "false" : "true"
            );

            try {
                localStorage.setItem(
                    CLAVE_CONTRAIDO,
                    contraido ? "1" : "0"
                );
            } catch (error) {
                // Si el navegador bloquea localStorage (modo privado,
                // por ejemplo), el menú funciona igual: solo no
                // recuerda el estado.
            }

            // El botón vive dentro del <aside>, así que al contraer,
            // el cursor sigue encima y la regla :hover lo vuelve a
            // abrir de inmediato: da la sensación de que el botón no
            // funcionó. Se suprime el "asomarse" hasta que el mouse
            // salga del menú.
            if (contraido) {
                sidebar.classList.add("sin-asomar");
            }

            // El menú cambió de ancho: puede haber aparecido o
            // desaparecido el scroll.
            revisarAvisoScroll();
        });

    }


    /* ======================================================
       AVISO DE SCROLL EN EL MENÚ

       Con seis ítems no suele hacer falta, pero en pantallas
       bajas o con el navegador reducido el último queda
       cortado sin que nada lo indique.
    ====================================================== */

    const menu = document.getElementById("sidebarMenuApicultor");
    const aviso = document.getElementById("sidebarScrollHint");

    function revisarAvisoScroll() {

        if (!menu || !aviso) {
            return;
        }

        const faltaPorAbajo =
            menu.scrollHeight - menu.scrollTop - menu.clientHeight;

        aviso.classList.toggle("visible", faltaPorAbajo > 8);
    }

    if (menu && aviso) {

        menu.addEventListener("scroll", revisarAvisoScroll);
        window.addEventListener("resize", revisarAvisoScroll);

        aviso.addEventListener("click", function () {
            menu.scrollBy({ top: 160, behavior: "smooth" });
        });

        revisarAvisoScroll();
    }

});

