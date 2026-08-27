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

        function abrirSidebar() {

            if (sidebar) {
                sidebar.classList.add("activo");
            }

            if (overlay) {
                overlay.classList.add("activo");
            }

            document.body.classList.add(
                "sidebar-movil-abierto"
            );
        }


        /* ==================================================
           CERRAR SIDEBAR
        ================================================== */

        function cerrarSidebar() {

            if (sidebar) {
                sidebar.classList.remove("activo");
            }

            if (overlay) {
                overlay.classList.remove("activo");
            }

            document.body.classList.remove(
                "sidebar-movil-abierto"
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

                if (evento.key === "Escape") {
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
                    cerrarSidebar();
                }

            }
        );

    }
);