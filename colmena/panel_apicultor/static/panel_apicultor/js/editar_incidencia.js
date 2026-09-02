/* ==========================================================
   EDITAR INCIDENCIA - PANEL APICULTOR
   MI COLMENA
========================================================== */

document.addEventListener("DOMContentLoaded", function () {


    /* ======================================================
       1. FORMULARIO
    ====================================================== */

    const formulario = document.getElementById(
        "formEditarIncidencia"
    );


    if (!formulario) {
        return;
    }



    /* ======================================================
       2. ESTADOS
    ====================================================== */

    const opcionesEstado = document.querySelectorAll(
        ".estado-incidencia-opcion"
    );

    const radiosEstado = document.querySelectorAll(
        '.estado-incidencia-opcion input[name="estado"]'
    );

    const estadoSuperior = document.querySelector(
        ".incidencia-estado-principal"
    );



    /* ======================================================
       3. OBSERVACIONES
    ====================================================== */

    const textareaObservaciones = document.getElementById(
        "observacionesIncidencia"
    );

    const contadorObservaciones = document.getElementById(
        "contadorObservaciones"
    );



    /* ======================================================
       4. EVIDENCIA
    ====================================================== */

    const inputImagen = document.getElementById(
        "imagenIncidencia"
    );

    const selectorImagen = document.getElementById(
        "selectorImagenIncidencia"
    );

    const previewImagen = document.getElementById(
        "previewImagenIncidencia"
    );

    const imagenPreview = document.getElementById(
        "imagenPreview"
    );

    const nombreImagen = document.getElementById(
        "nombreImagen"
    );

    const pesoImagen = document.getElementById(
        "pesoImagen"
    );

    const btnEliminarImagen = document.getElementById(
        "btnEliminarImagen"
    );



    /* ======================================================
       5. BOTÓN GUARDAR
    ====================================================== */

    const btnGuardar = document.getElementById(
        "btnGuardarIncidencia"
    );



    /* ======================================================
       6. CONFIGURACIÓN
    ====================================================== */

    const MAX_IMAGEN = 5 * 1024 * 1024;

    const TIPOS_IMAGEN_VALIDOS = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    const ESTADOS_VALIDOS = [
        "Pendiente",
        "En proceso",
        "Resuelta"
    ];


    let urlPreviewActual = null;



    /* ======================================================
       7. OBTENER ESTADO ACTUAL
    ====================================================== */

    function obtenerEstadoSeleccionado() {

        const radio = formulario.querySelector(
            'input[name="estado"]:checked'
        );


        if (!radio) {
            return "";
        }


        return radio.value;

    }



    /* ======================================================
       8. ACTUALIZAR ESTADOS VISUALES
    ====================================================== */

    function actualizarEstadoVisual() {

        opcionesEstado.forEach(
            function (opcion) {

                const radio = opcion.querySelector(
                    'input[name="estado"]'
                );


                if (
                    radio &&
                    radio.checked
                ) {

                    opcion.classList.add(
                        "activa"
                    );

                } else {

                    opcion.classList.remove(
                        "activa"
                    );

                }

            }
        );


        actualizarBadgeSuperior();

    }



    /* ======================================================
       9. ACTUALIZAR BADGE SUPERIOR
    ====================================================== */

    function actualizarBadgeSuperior() {

        if (!estadoSuperior) {
            return;
        }


        const estado = obtenerEstadoSeleccionado();


        estadoSuperior.classList.remove(
            "pendiente",
            "proceso",
            "resuelta"
        );


        if (estado === "Pendiente") {

            estadoSuperior.classList.add(
                "pendiente"
            );

        } else if (estado === "En proceso") {

            estadoSuperior.classList.add(
                "proceso"
            );

        } else if (estado === "Resuelta") {

            estadoSuperior.classList.add(
                "resuelta"
            );

        }


        /*
         * El primer span es el puntico del badge.
         * Conservamos ese elemento y cambiamos únicamente
         * el nodo de texto.
         */

        const nodos = Array.from(
            estadoSuperior.childNodes
        );


        const nodoTexto = nodos.find(
            function (nodo) {

                return (
                    nodo.nodeType === Node.TEXT_NODE &&
                    nodo.textContent.trim() !== ""
                );

            }
        );


        if (nodoTexto) {

            nodoTexto.textContent =
                " " + estado;

        }

    }



    /* ======================================================
       10. CAMBIO DE ESTADO
    ====================================================== */

    radiosEstado.forEach(
        function (radio) {

            radio.addEventListener(
                "change",
                function () {

                    actualizarEstadoVisual();

                    limpiarErrorEstado();

                }
            );

        }
    );



    /* ======================================================
       11. MOSTRAR ERROR DEL ESTADO
    ====================================================== */

    function mostrarErrorEstado(
        mensaje
    ) {

        const contenedor = document.querySelector(
            ".estado-incidencia-opciones"
        );


        if (!contenedor) {
            return;
        }


        limpiarErrorEstado();


        contenedor.classList.add(
            "error"
        );


        const mensajeError = document.createElement(
            "div"
        );


        mensajeError.className =
            "campo-error-mensaje estado-error-mensaje";


        mensajeError.innerHTML = `
            <i class="bi bi-exclamation-circle-fill"></i>
            <span>${mensaje}</span>
        `;


        contenedor.insertAdjacentElement(
            "afterend",
            mensajeError
        );

    }



    /* ======================================================
       12. LIMPIAR ERROR DEL ESTADO
    ====================================================== */

    function limpiarErrorEstado() {

        const contenedor = document.querySelector(
            ".estado-incidencia-opciones"
        );


        if (contenedor) {

            contenedor.classList.remove(
                "error"
            );

        }


        const mensaje = document.querySelector(
            ".estado-error-mensaje"
        );


        if (mensaje) {

            mensaje.remove();

        }

    }



    /* ======================================================
       13. CONTADOR DE OBSERVACIONES
    ====================================================== */

    function actualizarContadorObservaciones() {

        if (
            !textareaObservaciones ||
            !contadorObservaciones
        ) {
            return;
        }


        const cantidad =
            textareaObservaciones.value.length;


        contadorObservaciones.textContent =
            cantidad + " / 1000";


        contadorObservaciones.classList.remove(
            "cerca-limite",
            "limite-alcanzado"
        );


        if (
            cantidad >= 800 &&
            cantidad < 1000
        ) {

            contadorObservaciones.classList.add(
                "cerca-limite"
            );

        }


        if (cantidad >= 1000) {

            contadorObservaciones.classList.add(
                "limite-alcanzado"
            );

        }

    }



    /* ======================================================
       14. EVENTO OBSERVACIONES
    ====================================================== */

    if (textareaObservaciones) {

        actualizarContadorObservaciones();


        textareaObservaciones.addEventListener(
            "input",
            function () {

                actualizarContadorObservaciones();


                if (
                    this.value.length <= 1000
                ) {

                    limpiarErrorObservaciones();

                }

            }
        );

    }



    /* ======================================================
       15. ERROR OBSERVACIONES
    ====================================================== */

    function mostrarErrorObservaciones(
        mensaje
    ) {

        if (!textareaObservaciones) {
            return;
        }


        const campo = textareaObservaciones.closest(
            ".campo-incidencia"
        );


        if (!campo) {
            return;
        }


        limpiarErrorObservaciones();


        campo.classList.add(
            "error"
        );


        const mensajeError = document.createElement(
            "div"
        );


        mensajeError.className =
            "campo-error-mensaje observaciones-error-mensaje";


        mensajeError.innerHTML = `
            <i class="bi bi-exclamation-circle-fill"></i>
            <span>${mensaje}</span>
        `;


        campo.appendChild(
            mensajeError
        );

    }



    /* ======================================================
       16. LIMPIAR ERROR OBSERVACIONES
    ====================================================== */

    function limpiarErrorObservaciones() {

        if (textareaObservaciones) {

            const campo = textareaObservaciones.closest(
                ".campo-incidencia"
            );


            if (campo) {

                campo.classList.remove(
                    "error"
                );

            }

        }


        const mensaje = document.querySelector(
            ".observaciones-error-mensaje"
        );


        if (mensaje) {

            mensaje.remove();

        }

    }



    /* ======================================================
       17. FORMATEAR PESO
    ====================================================== */

    function formatearPeso(
        bytes
    ) {

        if (!bytes) {
            return "0 KB";
        }


        const kb = bytes / 1024;


        if (kb < 1024) {

            return (
                kb.toFixed(1) +
                " KB"
            );

        }


        const mb =
            kb / 1024;


        return (
            mb.toFixed(2) +
            " MB"
        );

    }



    /* ======================================================
       18. VALIDAR IMAGEN
    ====================================================== */

    function validarImagen(
        archivo
    ) {

        if (!archivo) {

            return {
                valido: true,
                mensaje: ""
            };

        }


        if (
            !TIPOS_IMAGEN_VALIDOS.includes(
                archivo.type
            )
        ) {

            return {

                valido: false,

                mensaje:
                    "Selecciona una imagen JPG, PNG o WEBP."

            };

        }


        if (
            archivo.size >
            MAX_IMAGEN
        ) {

            return {

                valido: false,

                mensaje:
                    "La imagen no puede superar los 5 MB."

            };

        }


        return {
            valido: true,
            mensaje: ""
        };

    }



    /* ======================================================
       19. LIBERAR URL PREVIEW
    ====================================================== */

    function liberarPreviewAnterior() {

        if (urlPreviewActual) {

            URL.revokeObjectURL(
                urlPreviewActual
            );


            urlPreviewActual = null;

        }

    }



    /* ======================================================
       20. MOSTRAR PREVIEW
    ====================================================== */

    function mostrarPreview(
        archivo
    ) {

        if (
            !archivo ||
            !previewImagen ||
            !imagenPreview
        ) {
            return;
        }


        liberarPreviewAnterior();


        urlPreviewActual =
            URL.createObjectURL(
                archivo
            );


        imagenPreview.src =
            urlPreviewActual;


        if (nombreImagen) {

            nombreImagen.textContent =
                archivo.name;

        }


        if (pesoImagen) {

            pesoImagen.textContent =
                formatearPeso(
                    archivo.size
                );

        }


        previewImagen.hidden =
            false;


        if (selectorImagen) {

            selectorImagen.style.display =
                "none";

        }

    }



    /* ======================================================
       21. OCULTAR PREVIEW
    ====================================================== */

    function ocultarPreview() {

        liberarPreviewAnterior();


        if (imagenPreview) {

            imagenPreview.src = "";

        }


        if (nombreImagen) {

            nombreImagen.textContent =
                "Imagen";

        }


        if (pesoImagen) {

            pesoImagen.textContent =
                "—";

        }


        if (previewImagen) {

            previewImagen.hidden =
                true;

        }


        if (selectorImagen) {

            selectorImagen.style.display =
                "";

        }

    }



    /* ======================================================
       22. MOSTRAR ERROR IMAGEN
    ====================================================== */

    function mostrarErrorImagen(
        mensaje
    ) {

        if (!selectorImagen) {
            return;
        }


        limpiarErrorImagen();


        selectorImagen.classList.add(
            "error"
        );


        const mensajeError = document.createElement(
            "div"
        );


        mensajeError.className =
            "campo-error-mensaje evidencia-error-mensaje";


        mensajeError.innerHTML = `
            <i class="bi bi-exclamation-circle-fill"></i>
            <span>${mensaje}</span>
        `;


        selectorImagen.insertAdjacentElement(
            "afterend",
            mensajeError
        );

    }



    /* ======================================================
       23. LIMPIAR ERROR IMAGEN
    ====================================================== */

    function limpiarErrorImagen() {

        if (selectorImagen) {

            selectorImagen.classList.remove(
                "error"
            );

        }


        const mensaje = document.querySelector(
            ".evidencia-error-mensaje"
        );


        if (mensaje) {

            mensaje.remove();

        }

    }



    /* ======================================================
       24. PROCESAR NUEVA IMAGEN
    ====================================================== */

    function procesarImagen(
        archivo
    ) {

        if (!archivo) {

            ocultarPreview();

            limpiarErrorImagen();

            return true;

        }


        const validacion =
            validarImagen(
                archivo
            );


        if (!validacion.valido) {

            mostrarErrorImagen(
                validacion.mensaje
            );


            if (inputImagen) {

                inputImagen.value = "";

            }


            ocultarPreview();


            return false;

        }


        limpiarErrorImagen();


        mostrarPreview(
            archivo
        );


        return true;

    }



    /* ======================================================
       25. INPUT DE IMAGEN
    ====================================================== */

    if (inputImagen) {

        inputImagen.addEventListener(
            "change",
            function () {

                const archivo = (
                    this.files &&
                    this.files.length
                )
                    ? this.files[0]
                    : null;


                procesarImagen(
                    archivo
                );

            }
        );

    }



    /* ======================================================
       26. QUITAR NUEVA IMAGEN
    ====================================================== */

    if (btnEliminarImagen) {

        btnEliminarImagen.addEventListener(
            "click",
            function () {

                if (inputImagen) {

                    inputImagen.value =
                        "";

                }


                limpiarErrorImagen();

                ocultarPreview();

            }
        );

    }



    /* ======================================================
       27. DRAG & DROP
    ====================================================== */

    if (
        selectorImagen &&
        inputImagen
    ) {


        [
            "dragenter",
            "dragover"
        ].forEach(
            function (nombreEvento) {

                selectorImagen.addEventListener(
                    nombreEvento,
                    function (evento) {

                        evento.preventDefault();

                        evento.stopPropagation();


                        selectorImagen.classList.add(
                            "arrastrando"
                        );

                    }
                );

            }
        );


        [
            "dragleave",
            "drop"
        ].forEach(
            function (nombreEvento) {

                selectorImagen.addEventListener(
                    nombreEvento,
                    function (evento) {

                        evento.preventDefault();

                        evento.stopPropagation();


                        selectorImagen.classList.remove(
                            "arrastrando"
                        );

                    }
                );

            }
        );


        selectorImagen.addEventListener(
            "drop",
            function (evento) {

                const archivos =
                    evento.dataTransfer.files;


                if (
                    !archivos ||
                    !archivos.length
                ) {

                    return;

                }


                const archivo =
                    archivos[0];


                const validacion =
                    validarImagen(
                        archivo
                    );


                if (!validacion.valido) {

                    mostrarErrorImagen(
                        validacion.mensaje
                    );

                    return;

                }


                try {

                    const transferencia =
                        new DataTransfer();


                    transferencia.items.add(
                        archivo
                    );


                    inputImagen.files =
                        transferencia.files;


                    procesarImagen(
                        archivo
                    );

                } catch (error) {

                    /*
                     * Fallback para navegadores donde
                     * no sea posible asignar DataTransfer.
                     */

                    inputImagen.click();

                }

            }
        );

    }



    /* ======================================================
       28. VALIDAR ESTADO
    ====================================================== */

    function validarEstado() {

        const estado =
            obtenerEstadoSeleccionado();


        if (
            !estado ||
            !ESTADOS_VALIDOS.includes(
                estado
            )
        ) {

            mostrarErrorEstado(
                "Selecciona un estado válido para la incidencia."
            );


            return false;

        }


        limpiarErrorEstado();


        return true;

    }



    /* ======================================================
       29. VALIDAR OBSERVACIONES
    ====================================================== */

    function validarObservaciones() {

        if (!textareaObservaciones) {

            return true;

        }


        textareaObservaciones.value =
            textareaObservaciones.value.trim();


        if (
            textareaObservaciones.value.length >
            1000
        ) {

            mostrarErrorObservaciones(
                "Las observaciones no pueden superar los 1000 caracteres."
            );


            return false;

        }


        limpiarErrorObservaciones();


        return true;

    }



    /* ======================================================
       30. VALIDAR IMAGEN ACTUAL
    ====================================================== */

    function validarImagenActual() {

        if (
            !inputImagen ||
            !inputImagen.files ||
            !inputImagen.files.length
        ) {

            limpiarErrorImagen();

            return true;

        }


        const validacion =
            validarImagen(
                inputImagen.files[0]
            );


        if (!validacion.valido) {

            mostrarErrorImagen(
                validacion.mensaje
            );


            return false;

        }


        limpiarErrorImagen();


        return true;

    }



    /* ======================================================
       31. VALIDAR FORMULARIO
    ====================================================== */

    function validarFormulario() {

        let valido = true;


        if (!validarEstado()) {

            valido = false;

        }


        if (!validarObservaciones()) {

            valido = false;

        }


        if (!validarImagenActual()) {

            valido = false;

        }


        return valido;

    }



    /* ======================================================
       32. ENFOCAR PRIMER ERROR
    ====================================================== */

    function enfocarPrimerError() {

        const errorEstado = document.querySelector(
            ".estado-error-mensaje"
        );


        if (errorEstado) {

            const opciones = document.querySelector(
                ".estado-incidencia-opciones"
            );


            if (opciones) {

                opciones.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }


            return;

        }


        const campoError = formulario.querySelector(
            ".campo-incidencia.error"
        );


        if (campoError) {

            campoError.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });


            const elemento = campoError.querySelector(
                "textarea, input, select"
            );


            if (elemento) {

                setTimeout(
                    function () {

                        elemento.focus();

                    },
                    350
                );

            }


            return;

        }


        if (
            selectorImagen &&
            selectorImagen.classList.contains(
                "error"
            )
        ) {

            selectorImagen.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }

    }



    /* ======================================================
       33. GUARDAR FORMULARIO
    ====================================================== */

    formulario.addEventListener(
        "submit",
        function (evento) {

            evento.preventDefault();


            const valido =
                validarFormulario();


            if (!valido) {

                enfocarPrimerError();

                return;

            }


            /*
             * Evitamos doble envío.
             */

            if (btnGuardar) {

                btnGuardar.disabled =
                    true;


                btnGuardar.innerHTML = `
                    <i class="bi bi-arrow-repeat"></i>
                    <span>Guardando...</span>
                `;

            }


            /*
             * Enviamos el formulario de manera nativa
             * para no volver a ejecutar este listener.
             */

            HTMLFormElement.prototype.submit.call(
                formulario
            );

        }
    );



    /* ======================================================
       34. RESTAURAR BOTÓN AL VOLVER ATRÁS
    ====================================================== */

    window.addEventListener(
        "pageshow",
        function () {

            if (btnGuardar) {

                btnGuardar.disabled =
                    false;


                btnGuardar.innerHTML = `
                    <i class="bi bi-check2-circle"></i>

                    <span>
                        Guardar cambios
                    </span>
                `;

            }


            actualizarEstadoVisual();

            actualizarContadorObservaciones();

        }
    );



    /* ======================================================
       35. LIBERAR PREVIEW AL SALIR
    ====================================================== */

    window.addEventListener(
        "beforeunload",
        function () {

            liberarPreviewAnterior();

        }
    );



    /* ======================================================
       36. ESTADO INICIAL
    ====================================================== */

    actualizarEstadoVisual();

    actualizarContadorObservaciones();


});