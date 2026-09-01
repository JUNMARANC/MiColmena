/* ==========================================================
   MANTENIMIENTOS - PANEL APICULTOR
========================================================== */

document.addEventListener("DOMContentLoaded", function () {


    /* ======================================================
       1. ELEMENTOS - MODAL DE DETALLE
    ====================================================== */

    const botonesAbrirDetalle = document.querySelectorAll(
        "[data-modal-mantenimiento]"
    );

    const botonesCerrarDetalle = document.querySelectorAll(
        "[data-cerrar-modal-mantenimiento]"
    );

    const modalesDetalle = document.querySelectorAll(
        ".mantenimiento-modal-overlay"
    );



    /* ======================================================
       2. ELEMENTOS - COMPLETAR MANTENIMIENTO
    ====================================================== */

    const formulariosCompletar = document.querySelectorAll(
        ".form-completar-mantenimiento, .form-completar-modal"
    );

    const modalConfirmarCompletado = document.getElementById(
        "modalConfirmarCompletado"
    );

    const botonCancelarCompletado = document.getElementById(
        "btnCancelarCompletado"
    );

    const botonConfirmarCompletado = document.getElementById(
        "btnConfirmarCompletado"
    );

    const textoNombreMantenimiento = document.getElementById(
        "confirmarNombreMantenimiento"
    );

    const textoUbicacionMantenimiento = document.getElementById(
        "confirmarColmenaMantenimiento"
    );



    /* ======================================================
       3. ELEMENTOS - OBSERVACIONES
    ====================================================== */

    const botonesEditarObservacion = document.querySelectorAll(
        "[data-editar-observacion]"
    );

    const botonesCancelarObservacion = document.querySelectorAll(
        "[data-cancelar-observacion]"
    );

    const formulariosObservacion = document.querySelectorAll(
        ".form-editar-observacion"
    );



    /* ======================================================
       4. ELEMENTOS - FILTROS
    ====================================================== */

    const formularioFiltros = document.querySelector(
        ".mantenimientos-form-filtros"
    );

    const buscador = document.querySelector(
        ".mantenimientos-buscador input"
    );

    const selectsFiltros = document.querySelectorAll(
        ".mantenimientos-select"
    );



    /* ======================================================
       5. ESTADO INTERNO
    ====================================================== */

    let modalDetalleActivo = null;

    let botonAbrioDetalle = null;

    let formularioCompletarActivo = null;

    let botonCompletarOrigen = null;



    /* ======================================================
       6. UTILIDADES GENERALES
    ====================================================== */

    function bloquearScroll() {

        document.body.style.overflow = "hidden";

    }


    function existeModalAbierto() {

        const detalleAbierto = document.querySelector(
            ".mantenimiento-modal-overlay.activo"
        );

        const confirmacionAbierta = (
            modalConfirmarCompletado &&
            modalConfirmarCompletado.classList.contains("activo")
        );


        return Boolean(
            detalleAbierto ||
            confirmacionAbierta
        );

    }


    function restaurarScroll() {

        if (!existeModalAbierto()) {

            document.body.style.overflow = "";

        }

    }



    /* ======================================================
       7. UTILIDADES - OBSERVACIONES
    ====================================================== */

    function obtenerObservacionActual(formulario) {

        if (!formulario) {

            return null;

        }


        return formulario.previousElementSibling;

    }


    function obtenerTextarea(formulario) {

        if (!formulario) {

            return null;

        }


        return formulario.querySelector(
            "textarea[name='observaciones']"
        );

    }


    function actualizarContador(textarea) {

        if (!textarea) {

            return;

        }


        const formulario = textarea.closest(
            ".form-editar-observacion"
        );


        if (!formulario) {

            return;

        }


        const contador = formulario.querySelector(
            ".contador-observacion"
        );


        if (!contador) {

            return;

        }


        const maximo = Number(
            textarea.getAttribute("maxlength")
        ) || 1000;


        contador.textContent = (
            textarea.value.length +
            " / " +
            maximo +
            " caracteres"
        );

    }


    function guardarValorOriginal(textarea) {

        if (!textarea) {

            return;

        }


        textarea.dataset.valorOriginal =
            textarea.value;

    }


    function restaurarValorOriginal(textarea) {

        if (!textarea) {

            return;

        }


        if (
            textarea.dataset.valorOriginal !== undefined
        ) {

            textarea.value =
                textarea.dataset.valorOriginal;

        }


        actualizarContador(
            textarea
        );

    }



    /* ======================================================
       8. ABRIR EDICIÓN DE OBSERVACIÓN
    ====================================================== */

    function abrirEdicionObservacion(formulario) {

        if (!formulario) {

            return;

        }


        const observacionActual = obtenerObservacionActual(
            formulario
        );

        const textarea = obtenerTextarea(
            formulario
        );


        formulario.classList.add(
            "activo"
        );


        if (observacionActual) {

            observacionActual.classList.add(
                "oculto"
            );

        }


        if (textarea) {

            actualizarContador(
                textarea
            );


            setTimeout(
                function () {

                    textarea.focus();


                    const posicion =
                        textarea.value.length;


                    textarea.setSelectionRange(
                        posicion,
                        posicion
                    );

                },
                50
            );

        }

    }



    /* ======================================================
       9. CERRAR EDICIÓN DE OBSERVACIÓN
    ====================================================== */

    function cerrarEdicionObservacion(
        formulario,
        restaurarContenido = true
    ) {

        if (!formulario) {

            return;

        }


        const observacionActual = obtenerObservacionActual(
            formulario
        );

        const textarea = obtenerTextarea(
            formulario
        );


        formulario.classList.remove(
            "activo"
        );


        if (observacionActual) {

            observacionActual.classList.remove(
                "oculto"
            );

        }


        if (
            restaurarContenido &&
            textarea
        ) {

            restaurarValorOriginal(
                textarea
            );

        }

    }



    /* ======================================================
       10. CERRAR EDICIONES DENTRO DE UN MODAL
    ====================================================== */

    function cerrarEdicionesDelModal(modal) {

        if (!modal) {

            return;

        }


        const formulariosActivos = modal.querySelectorAll(
            ".form-editar-observacion.activo"
        );


        formulariosActivos.forEach(
            function (formulario) {

                cerrarEdicionObservacion(
                    formulario,
                    true
                );

            }
        );

    }



    /* ======================================================
       11. ABRIR MODAL DE DETALLE
    ====================================================== */

    function abrirModalDetalle(
        modal,
        botonOrigen = null
    ) {

        if (!modal) {

            return;

        }


        /* Cerrar otros detalles */

        modalesDetalle.forEach(
            function (otroModal) {

                if (otroModal !== modal) {

                    otroModal.classList.remove(
                        "activo"
                    );

                    otroModal.setAttribute(
                        "aria-hidden",
                        "true"
                    );

                    cerrarEdicionesDelModal(
                        otroModal
                    );

                }

            }
        );


        modalDetalleActivo =
            modal;


        botonAbrioDetalle =
            botonOrigen;


        modal.classList.add(
            "activo"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        bloquearScroll();


        const botonCerrar = modal.querySelector(
            ".mantenimiento-modal-cerrar"
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
       12. CERRAR MODAL DE DETALLE
    ====================================================== */

    function cerrarModalDetalle(modal) {

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


        cerrarEdicionesDelModal(
            modal
        );


        modalDetalleActivo =
            null;


        restaurarScroll();


        if (
            botonAbrioDetalle &&
            document.body.contains(
                botonAbrioDetalle
            )
        ) {

            botonAbrioDetalle.focus();

        }


        botonAbrioDetalle =
            null;

    }



    /* ======================================================
       13. EVENTOS - ABRIR DETALLE
    ====================================================== */

    botonesAbrirDetalle.forEach(
        function (boton) {

            boton.addEventListener(
                "click",
                function () {

                    const idModal =
                        this.dataset.modalMantenimiento;


                    if (!idModal) {

                        return;

                    }


                    const modal = document.getElementById(
                        idModal
                    );


                    abrirModalDetalle(
                        modal,
                        this
                    );

                }
            );

        }
    );



    /* ======================================================
       14. EVENTOS - CERRAR DETALLE
    ====================================================== */

    botonesCerrarDetalle.forEach(
        function (boton) {

            boton.addEventListener(
                "click",
                function () {

                    const modal = this.closest(
                        ".mantenimiento-modal-overlay"
                    );


                    cerrarModalDetalle(
                        modal
                    );

                }
            );

        }
    );



    /* ======================================================
       15. CERRAR DETALLE HACIENDO CLIC EN FONDO
    ====================================================== */

    modalesDetalle.forEach(
        function (modal) {

            modal.addEventListener(
                "click",
                function (evento) {

                    if (
                        evento.target === modal
                    ) {

                        cerrarModalDetalle(
                            modal
                        );

                    }

                }
            );

        }
    );



    /* ======================================================
       16. RESTAURAR BOTÓN DE CONFIRMACIÓN
    ====================================================== */

    function restaurarBotonConfirmar() {

        if (!botonConfirmarCompletado) {

            return;

        }


        botonConfirmarCompletado.disabled =
            false;


        botonConfirmarCompletado.innerHTML = `
            <i class="bi bi-check-lg"></i>

            <span>
                Sí, completar
            </span>
        `;

    }



    /* ======================================================
       17. ABRIR MODAL DE CONFIRMACIÓN
    ====================================================== */

    function abrirConfirmacionCompletado(
        formulario
    ) {

        if (
            !formulario ||
            !modalConfirmarCompletado
        ) {

            return;

        }


        formularioCompletarActivo =
            formulario;


        botonCompletarOrigen =
            formulario.querySelector(
                'button[type="submit"]'
            );


        /* ==============================================
           OBTENER DATOS DEL HTML
        ============================================== */

        const nombreMantenimiento = (
            formulario.dataset.nombreMantenimiento ||
            "Mantenimiento"
        ).trim();


        /*
         * Puede recibir:
         *
         * Colmena CM000003
         *
         * o:
         *
         * Apiario La Esperanza
         */

        const ubicacionMantenimiento = (
            formulario.dataset.colmenaMantenimiento ||
            "Sin ubicación asociada"
        ).trim();



        /* ==============================================
           MOSTRAR INFORMACIÓN
        ============================================== */

        if (textoNombreMantenimiento) {

            textoNombreMantenimiento.textContent =
                nombreMantenimiento;

        }


        if (textoUbicacionMantenimiento) {

            textoUbicacionMantenimiento.textContent =
                ubicacionMantenimiento;

        }


        restaurarBotonConfirmar();


        /* ==============================================
           MOSTRAR MODAL
        ============================================== */

        modalConfirmarCompletado.classList.add(
            "activo"
        );


        modalConfirmarCompletado.setAttribute(
            "aria-hidden",
            "false"
        );


        bloquearScroll();


        if (botonConfirmarCompletado) {

            setTimeout(
                function () {

                    botonConfirmarCompletado.focus();

                },
                80
            );

        }

    }



    /* ======================================================
       18. CERRAR MODAL DE CONFIRMACIÓN
    ====================================================== */

    function cerrarConfirmacionCompletado() {

        if (!modalConfirmarCompletado) {

            return;

        }


        modalConfirmarCompletado.classList.remove(
            "activo"
        );


        modalConfirmarCompletado.setAttribute(
            "aria-hidden",
            "true"
        );


        restaurarBotonConfirmar();


        restaurarScroll();


        if (
            botonCompletarOrigen &&
            document.body.contains(
                botonCompletarOrigen
            )
        ) {

            botonCompletarOrigen.focus();

        }


        formularioCompletarActivo =
            null;


        botonCompletarOrigen =
            null;

    }



    /* ======================================================
       19. INTERCEPTAR FORMULARIOS "COMPLETAR"
    ====================================================== */

    formulariosCompletar.forEach(
        function (formulario) {

            formulario.addEventListener(
                "submit",
                function (evento) {

                    evento.preventDefault();


                    abrirConfirmacionCompletado(
                        formulario
                    );

                }
            );

        }
    );



    /* ======================================================
       20. CANCELAR COMPLETADO
    ====================================================== */

    if (botonCancelarCompletado) {

        botonCancelarCompletado.addEventListener(
            "click",
            function () {

                cerrarConfirmacionCompletado();

            }
        );

    }



    /* ======================================================
       21. CONFIRMAR COMPLETADO
    ====================================================== */

    if (botonConfirmarCompletado) {

        botonConfirmarCompletado.addEventListener(
            "click",
            function () {

                if (!formularioCompletarActivo) {

                    return;

                }


                const formulario =
                    formularioCompletarActivo;


                /*
                 * Evitar doble clic.
                 */

                botonConfirmarCompletado.disabled =
                    true;


                botonConfirmarCompletado.innerHTML = `
                    <span>
                        Completando...
                    </span>
                `;


                /*
                 * Enviamos directamente el formulario.
                 *
                 * No usamos requestSubmit() aquí porque
                 * volvería a ejecutar el listener submit
                 * y abriría nuevamente la confirmación.
                 */

                HTMLFormElement.prototype.submit.call(
                    formulario
                );

            }
        );

    }



    /* ======================================================
       22. CLIC FUERA DEL MODAL DE CONFIRMACIÓN
    ====================================================== */

    if (modalConfirmarCompletado) {

        modalConfirmarCompletado.addEventListener(
            "click",
            function (evento) {

                if (
                    evento.target ===
                    modalConfirmarCompletado
                ) {

                    cerrarConfirmacionCompletado();

                }

            }
        );

    }



    /* ======================================================
       23. EDITAR OBSERVACIÓN
    ====================================================== */

    botonesEditarObservacion.forEach(
        function (boton) {

            boton.addEventListener(
                "click",
                function () {

                    const idFormulario =
                        this.dataset.editarObservacion;


                    if (!idFormulario) {

                        return;

                    }


                    const formulario =
                        document.getElementById(
                            idFormulario
                        );


                    abrirEdicionObservacion(
                        formulario
                    );

                }
            );

        }
    );



    /* ======================================================
       24. CANCELAR EDICIÓN DE OBSERVACIÓN
    ====================================================== */

    botonesCancelarObservacion.forEach(
        function (boton) {

            boton.addEventListener(
                "click",
                function () {

                    const formulario = this.closest(
                        ".form-editar-observacion"
                    );


                    cerrarEdicionObservacion(
                        formulario,
                        true
                    );

                }
            );

        }
    );



    /* ======================================================
       25. PREPARAR TEXTAREAS
    ====================================================== */

    formulariosObservacion.forEach(
        function (formulario) {

            const textarea = obtenerTextarea(
                formulario
            );


            if (!textarea) {

                return;

            }


            guardarValorOriginal(
                textarea
            );


            actualizarContador(
                textarea
            );


            textarea.addEventListener(
                "input",
                function () {

                    actualizarContador(
                        this
                    );

                }
            );

        }
    );



    /* ======================================================
       26. GUARDAR OBSERVACIÓN
    ====================================================== */

    formulariosObservacion.forEach(
        function (formulario) {

            formulario.addEventListener(
                "submit",
                function (evento) {

                    const textarea = obtenerTextarea(
                        formulario
                    );


                    if (!textarea) {

                        return;

                    }


                    textarea.value =
                        textarea.value.trim();


                    const maximo = Number(
                        textarea.getAttribute(
                            "maxlength"
                        )
                    ) || 1000;


                    if (
                        textarea.value.length >
                        maximo
                    ) {

                        evento.preventDefault();

                        textarea.focus();

                        return;

                    }


                    const botonGuardar =
                        formulario.querySelector(
                            ".btn-guardar-observacion"
                        );


                    if (botonGuardar) {

                        botonGuardar.disabled =
                            true;


                        botonGuardar.innerHTML = `
                            <span>
                                Guardando...
                            </span>
                        `;

                    }

                }
            );

        }
    );



    /* ======================================================
       27. TECLA ESCAPE
    ====================================================== */

    document.addEventListener(
        "keydown",
        function (evento) {

            if (
                evento.key !== "Escape"
            ) {

                return;

            }


            /* ==============================================
               PRIORIDAD 1
               CONFIRMACIÓN DE COMPLETADO
            ============================================== */

            if (
                modalConfirmarCompletado &&
                modalConfirmarCompletado.classList.contains(
                    "activo"
                )
            ) {

                cerrarConfirmacionCompletado();

                return;

            }


            /* ==============================================
               PRIORIDAD 2
               EDICIÓN DE OBSERVACIÓN
            ============================================== */

            if (modalDetalleActivo) {

                const formularioEdicion =
                    modalDetalleActivo.querySelector(
                        ".form-editar-observacion.activo"
                    );


                if (formularioEdicion) {

                    cerrarEdicionObservacion(
                        formularioEdicion,
                        true
                    );

                    return;

                }

            }


            /* ==============================================
               PRIORIDAD 3
               MODAL DE DETALLE
            ============================================== */

            if (modalDetalleActivo) {

                cerrarModalDetalle(
                    modalDetalleActivo
                );

            }

        }
    );



    /* ======================================================
       28. FUNCIÓN ENVIAR FILTROS
    ====================================================== */

    function enviarFiltros() {

        if (!formularioFiltros) {

            return;

        }


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
       29. LIMPIAR BUSCADOR ANTES DE ENVIAR
    ====================================================== */

    if (
        formularioFiltros &&
        buscador
    ) {

        formularioFiltros.addEventListener(
            "submit",
            function () {

                buscador.value =
                    buscador.value.trim();

            }
        );

    }



    /* ======================================================
       30. BUSCAR CON ENTER
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


                buscador.value =
                    buscador.value.trim();


                enviarFiltros();

            }
        );

    }



    /* ======================================================
       31. FILTROS AUTOMÁTICOS
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
       32. RESTAURAR BOTONES DE OBSERVACIONES
    ====================================================== */

    function restaurarBotonesObservacion() {

        formulariosObservacion.forEach(
            function (formulario) {

                const botonGuardar =
                    formulario.querySelector(
                        ".btn-guardar-observacion"
                    );


                if (!botonGuardar) {

                    return;

                }


                botonGuardar.disabled =
                    false;


                botonGuardar.innerHTML = `
                    <i class="bi bi-check-lg"></i>

                    <span>
                        Guardar cambio
                    </span>
                `;

            }
        );

    }



    /* ======================================================
       33. RESTAURAR PÁGINA AL VOLVER CON EL NAVEGADOR
    ====================================================== */

    window.addEventListener(
        "pageshow",
        function () {


            /* ==============================================
               CERRAR MODALES DE DETALLE
            ============================================== */

            modalesDetalle.forEach(
                function (modal) {

                    modal.classList.remove(
                        "activo"
                    );


                    modal.setAttribute(
                        "aria-hidden",
                        "true"
                    );


                    cerrarEdicionesDelModal(
                        modal
                    );

                }
            );



            /* ==============================================
               CERRAR MODAL DE CONFIRMACIÓN
            ============================================== */

            if (modalConfirmarCompletado) {

                modalConfirmarCompletado.classList.remove(
                    "activo"
                );


                modalConfirmarCompletado.setAttribute(
                    "aria-hidden",
                    "true"
                );

            }



            /* ==============================================
               RESTAURAR BOTONES
            ============================================== */

            restaurarBotonConfirmar();

            restaurarBotonesObservacion();



            /* ==============================================
               RESTAURAR VARIABLES
            ============================================== */

            modalDetalleActivo =
                null;

            botonAbrioDetalle =
                null;

            formularioCompletarActivo =
                null;

            botonCompletarOrigen =
                null;



            /* ==============================================
               RESTAURAR SCROLL
            ============================================== */

            document.body.style.overflow =
                "";

        }
    );


});