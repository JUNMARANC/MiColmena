/* ==========================================================
   MIS COLMENAS - PANEL APICULTOR
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* ==================================================
           ELEMENTOS
        ================================================== */

        const botonesAbrirModal = (
            document.querySelectorAll(
                "[data-colmena-modal]"
            )
        );


        const botonesCerrarModal = (
            document.querySelectorAll(
                "[data-cerrar-colmena-modal]"
            )
        );


        const overlays = (
            document.querySelectorAll(
                ".colmena-modal-overlay"
            )
        );



        /* ==================================================
           ABRIR MODAL
        ================================================== */

        function abrirModal(
            modal
        ) {

            if (!modal) {

                return;

            }


            /* ==============================================
               CERRAR OTROS MODALES
            ============================================== */

            overlays.forEach(
                function (
                    otroModal
                ) {

                    if (
                        otroModal !== modal
                    ) {

                        otroModal.classList.remove(
                            "activo"
                        );

                    }

                }
            );


            /* ==============================================
               ABRIR MODAL
            ============================================== */

            modal.classList.add(
                "activo"
            );


            modal.setAttribute(
                "aria-hidden",
                "false"
            );


            /* ==============================================
               BLOQUEAR SCROLL
            ============================================== */

            document.body.style.overflow =
                "hidden";


            /* ==============================================
               ENFOCAR BOTÓN X
            ============================================== */

            const botonCerrar = (
                modal.querySelector(
                    ".colmena-modal-x"
                )
            );


            if (botonCerrar) {

                setTimeout(
                    function () {

                        botonCerrar.focus();

                    },
                    100
                );

            }

        }



        /* ==================================================
           CERRAR MODAL
        ================================================== */

        function cerrarModal(
            modal
        ) {

            if (!modal) {

                return;

            }


            modal.classList.remove(
                "activo"
            );


            modal.setAttribute(
                "aria-hidden",
                "true"
            );


            /* ==============================================
               COMPROBAR SI QUEDA OTRO MODAL ABIERTO
            ============================================== */

            const modalActivo = (
                document.querySelector(
                    ".colmena-modal-overlay.activo"
                )
            );


            if (!modalActivo) {

                document.body.style.overflow =
                    "";

            }

        }



        /* ==================================================
           BOTONES VER DETALLE
        ================================================== */

        botonesAbrirModal.forEach(
            function (
                boton
            ) {

                boton.addEventListener(
                    "click",
                    function () {

                        const idModal = (
                            this.dataset
                                .colmenaModal
                        );


                        if (!idModal) {

                            return;

                        }


                        const modal = (
                            document.getElementById(
                                idModal
                            )
                        );


                        abrirModal(
                            modal
                        );

                    }
                );

            }
        );



        /* ==================================================
           BOTONES CERRAR
        ================================================== */

        botonesCerrarModal.forEach(
            function (
                boton
            ) {

                boton.addEventListener(
                    "click",
                    function () {

                        const modal = (
                            this.closest(
                                ".colmena-modal-overlay"
                            )
                        );


                        cerrarModal(
                            modal
                        );

                    }
                );

            }
        );



        /* ==================================================
           CERRAR HACIENDO CLIC FUERA DEL MODAL
        ================================================== */

        overlays.forEach(
            function (
                overlay
            ) {

                overlay.addEventListener(
                    "click",
                    function (
                        evento
                    ) {

                        if (
                            evento.target
                            ===
                            overlay
                        ) {

                            cerrarModal(
                                overlay
                            );

                        }

                    }
                );

            }
        );



        /* ==================================================
           CERRAR CON ESC
        ================================================== */

        document.addEventListener(
            "keydown",
            function (
                evento
            ) {

                if (
                    evento.key
                    !==
                    "Escape"
                ) {

                    return;

                }


                const modalActivo = (
                    document.querySelector(
                        ".colmena-modal-overlay.activo"
                    )
                );


                if (
                    modalActivo
                ) {

                    cerrarModal(
                        modalActivo
                    );

                }

            }
        );



        /* ==================================================
           VALIDAR CAMPOS DE FILTRO
        ================================================== */

        const formularioFiltros = (
            document.querySelector(
                ".colmenas-form-filtros"
            )
        );


        const buscador = (
            document.querySelector(
                ".colmenas-buscador input"
            )
        );


        if (
            formularioFiltros
            &&
            buscador
        ) {

            formularioFiltros.addEventListener(
                "submit",
                function () {

                    buscador.value = (
                        buscador.value.trim()
                    );

                }
            );

        }



        /* ==================================================
           ENTER EN BUSCADOR
        ================================================== */

        if (
            buscador
            &&
            formularioFiltros
        ) {

            buscador.addEventListener(
                "keydown",
                function (
                    evento
                ) {

                    if (
                        evento.key
                        ===
                        "Enter"
                    ) {

                        evento.preventDefault();


                        this.value = (
                            this.value.trim()
                        );


                        formularioFiltros.submit();

                    }

                }
            );

        }



        /* ==================================================
           AUTO FILTRAR AL CAMBIAR SELECT
           Opcional pero útil para el usuario.
        ================================================== */

        const selects = (
            document.querySelectorAll(
                ".colmenas-select"
            )
        );


        selects.forEach(
            function (
                select
            ) {

                select.addEventListener(
                    "change",
                    function () {

                        if (
                            formularioFiltros
                        ) {

                            formularioFiltros.submit();

                        }

                    }
                );

            }
        );



        /* ==================================================
        RESTABLECER SCROLL AL RECARGAR
        ================================================== */

        window.addEventListener(
            "pageshow",
            function () {

                document.body.style.overflow =
                    "";

            }
        );

    }
);