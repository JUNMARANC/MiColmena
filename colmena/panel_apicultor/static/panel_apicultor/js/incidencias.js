/* ==========================================================
   INCIDENCIAS - PANEL APICULTOR
========================================================== */

document.addEventListener("DOMContentLoaded", function () {


    /* ======================================================
       1. ELEMENTOS - MODALES DE DETALLE
    ====================================================== */

    const botonesAbrirDetalle = document.querySelectorAll(
        "[data-modal-incidencia]"
    );

    const botonesCerrarDetalle = document.querySelectorAll(
        "[data-cerrar-modal-incidencia]"
    );

    const modalesIncidencia = document.querySelectorAll(
        ".incidencia-modal-overlay"
    );



    /* ======================================================
       2. ELEMENTOS - FILTROS
    ====================================================== */

    const formularioFiltros = document.querySelector(
        ".incidencias-form-filtros"
    );

    const buscador = document.querySelector(
        ".incidencias-buscador input"
    );

    const selectsFiltros = document.querySelectorAll(
        ".incidencias-select"
    );



    /* ======================================================
       3. ESTADO INTERNO
    ====================================================== */

    let modalActivo = null;

    let botonQueAbrioModal = null;



    /* ======================================================
       4. UTILIDADES GENERALES
    ====================================================== */

    function bloquearScroll() {

        document.body.style.overflow = "hidden";

    }


    function restaurarScroll() {

        const existeModalActivo = document.querySelector(
            ".incidencia-modal-overlay.activo"
        );


        if (!existeModalActivo) {

            document.body.style.overflow = "";

        }

    }



    /* ======================================================
       5. ABRIR MODAL DE INCIDENCIA
    ====================================================== */

    function abrirModalIncidencia(
        modal,
        botonOrigen = null
    ) {

        if (!modal) {

            return;

        }


        /* ==================================================
           CERRAR CUALQUIER OTRO MODAL
        ================================================== */

        modalesIncidencia.forEach(
            function (otroModal) {

                if (
                    otroModal !== modal
                ) {

                    otroModal.classList.remove(
                        "activo"
                    );


                    otroModal.setAttribute(
                        "aria-hidden",
                        "true"
                    );

                }

            }
        );


        /* ==================================================
           GUARDAR REFERENCIAS
        ================================================== */

        modalActivo = modal;

        botonQueAbrioModal = botonOrigen;


        /* ==================================================
           MOSTRAR MODAL
        ================================================== */

        modal.classList.add(
            "activo"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        /* ==================================================
           BLOQUEAR SCROLL
        ================================================== */

        bloquearScroll();


        /* ==================================================
           ENFOCAR BOTÓN CERRAR
        ================================================== */

        const botonCerrar = modal.querySelector(
            ".incidencia-modal-cerrar"
        );


        if (botonCerrar) {

            setTimeout(
                function () {

                    botonCerrar.focus();

                },
                80
            );

        }

    }



    /* ======================================================
       6. CERRAR MODAL DE INCIDENCIA
    ====================================================== */

    function cerrarModalIncidencia(
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


        modalActivo = null;


        restaurarScroll();


        /* ==================================================
           DEVOLVER FOCO AL BOTÓN QUE ABRIÓ EL MODAL
        ================================================== */

        if (
            botonQueAbrioModal &&
            document.body.contains(
                botonQueAbrioModal
            )
        ) {

            botonQueAbrioModal.focus();

        }


        botonQueAbrioModal = null;

    }



    /* ======================================================
       7. EVENTOS - ABRIR DETALLE
    ====================================================== */

    botonesAbrirDetalle.forEach(
        function (boton) {

            boton.addEventListener(
                "click",
                function () {

                    const idModal = (
                        this.dataset.modalIncidencia
                    );


                    if (!idModal) {

                        return;

                    }


                    const modal = document.getElementById(
                        idModal
                    );


                    abrirModalIncidencia(
                        modal,
                        this
                    );

                }
            );

        }
    );



    /* ======================================================
       8. EVENTOS - BOTONES CERRAR
    ====================================================== */

    botonesCerrarDetalle.forEach(
        function (boton) {

            boton.addEventListener(
                "click",
                function () {

                    const modal = this.closest(
                        ".incidencia-modal-overlay"
                    );


                    cerrarModalIncidencia(
                        modal
                    );

                }
            );

        }
    );



    /* ======================================================
       9. CERRAR HACIENDO CLIC EN EL FONDO
    ====================================================== */

    modalesIncidencia.forEach(
        function (modal) {

            modal.addEventListener(
                "click",
                function (evento) {

                    if (
                        evento.target === modal
                    ) {

                        cerrarModalIncidencia(
                            modal
                        );

                    }

                }
            );

        }
    );



    /* ======================================================
       10. CERRAR CON ESCAPE
    ====================================================== */

    document.addEventListener(
        "keydown",
        function (evento) {

            if (
                evento.key !== "Escape"
            ) {

                return;

            }


            if (modalActivo) {

                cerrarModalIncidencia(
                    modalActivo
                );

            }

        }
    );



    /* ======================================================
       11. FUNCIÓN ENVIAR FILTROS
    ====================================================== */

    function enviarFiltros() {

        if (!formularioFiltros) {

            return;

        }


        /*
         * requestSubmit()
         * permite ejecutar correctamente
         * el evento submit del formulario.
         */

        if (
            typeof formularioFiltros.requestSubmit
            ===
            "function"
        ) {

            formularioFiltros.requestSubmit();

        } else {

            formularioFiltros.submit();

        }

    }



    /* ======================================================
       12. LIMPIAR BUSCADOR ANTES DE ENVIAR
    ====================================================== */

    if (
        formularioFiltros &&
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



    /* ======================================================
       13. BUSCAR CON ENTER
    ====================================================== */

    if (
        buscador &&
        formularioFiltros
    ) {

        buscador.addEventListener(
            "keydown",
            function (evento) {

                if (
                    evento.key !== "Enter"
                ) {

                    return;

                }


                evento.preventDefault();


                buscador.value = (
                    buscador.value.trim()
                );


                enviarFiltros();

            }
        );

    }



    /* ======================================================
       14. FILTRAR AUTOMÁTICAMENTE CON LOS SELECT
    ====================================================== */

    selectsFiltros.forEach(
        function (select) {

            select.addEventListener(
                "change",
                function () {

                    enviarFiltros();

                }
            );

        }
    );



    /* ======================================================
       15. MANEJO DE IMÁGENES DE EVIDENCIA
    ====================================================== */

    const imagenesEvidencia = document.querySelectorAll(
        ".incidencia-evidencia-imagen img"
    );


    imagenesEvidencia.forEach(
        function (imagen) {


            /* ==================================================
               SI LA IMAGEN NO PUEDE CARGARSE
            ================================================== */

            imagen.addEventListener(
                "error",
                function () {

                    const contenedor = this.closest(
                        ".incidencia-evidencia-imagen"
                    );


                    if (!contenedor) {

                        return;

                    }


                    contenedor.innerHTML = `
                        <div class="incidencia-evidencia-error">

                            <i class="bi bi-image"></i>

                            <span>
                                No fue posible cargar la evidencia.
                            </span>

                        </div>
                    `;

                }
            );


            /* ==================================================
               CURSOR PARA INDICAR QUE ES IMAGEN
            ================================================== */

            imagen.style.cursor = "pointer";


            /*
             * Al hacer clic abrimos la imagen directamente
             * en una nueva pestaña para verla en tamaño completo.
             */

            imagen.addEventListener(
                "click",
                function () {

                    if (!this.src) {

                        return;

                    }


                    window.open(
                        this.src,
                        "_blank",
                        "noopener,noreferrer"
                    );

                }
            );

        }
    );



    /* ======================================================
       16. RESTAURAR ESTADO AL VOLVER CON EL NAVEGADOR
    ====================================================== */

    window.addEventListener(
        "pageshow",
        function () {


            /* ==================================================
               CERRAR TODOS LOS MODALES
            ================================================== */

            modalesIncidencia.forEach(
                function (modal) {

                    modal.classList.remove(
                        "activo"
                    );


                    modal.setAttribute(
                        "aria-hidden",
                        "true"
                    );

                }
            );


            /* ==================================================
               RESTAURAR VARIABLES
            ================================================== */

            modalActivo = null;

            botonQueAbrioModal = null;


            /* ==================================================
               RESTAURAR SCROLL
            ================================================== */

            document.body.style.overflow = "";

        }
    );


});