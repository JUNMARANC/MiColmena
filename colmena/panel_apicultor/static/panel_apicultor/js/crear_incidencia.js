/* ==========================================================
   CREAR INCIDENCIA - PANEL APICULTOR
   MI COLMENA
========================================================== */

document.addEventListener("DOMContentLoaded", function () {


    /* ======================================================
       1. FORMULARIO
    ====================================================== */

    const formulario = document.getElementById(
        "formCrearIncidencia"
    );


    if (!formulario) {
        return;
    }



    /* ======================================================
       2. TIPO DE INCIDENCIA
    ====================================================== */

    const radiosTipoEntidad = document.querySelectorAll(
        ".tipo-entidad-radio"
    );

    const opcionesTipoEntidad = document.querySelectorAll(
        ".tipo-incidencia-opcion"
    );



    /* ======================================================
       3. UBICACIÓN
    ====================================================== */

    const selectApiario = document.getElementById(
        "apiarioIncidencia"
    );

    const contenedorColmena = document.getElementById(
        "contenedorColmena"
    );

    const selectColmena = document.getElementById(
        "colmenaIncidencia"
    );



    /* ======================================================
       4. INFORMACIÓN
    ====================================================== */

    const inputTitulo = document.getElementById(
        "tituloIncidencia"
    );

    const selectPrioridad = document.getElementById(
        "prioridadIncidencia"
    );

    const inputFecha = document.getElementById(
        "fechaIncidencia"
    );

    const textareaObservaciones = document.getElementById(
        "observacionesIncidencia"
    );



    /* ======================================================
       5. CONTADORES
    ====================================================== */

    const contadorTitulo = document.getElementById(
        "contadorTitulo"
    );

    const contadorObservaciones = document.getElementById(
        "contadorObservaciones"
    );



    /* ======================================================
       6. EVIDENCIA
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
       7. BOTÓN GUARDAR
    ====================================================== */

    const btnGuardar = document.getElementById(
        "btnGuardarIncidencia"
    );



    /* ======================================================
       8. CONFIGURACIÓN
    ====================================================== */

    const MAX_IMAGEN = 5 * 1024 * 1024;

    const TIPOS_IMAGEN_VALIDOS = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    let urlPreviewActual = null;



    /* ======================================================
       9. OBTENER TIPO ACTUAL
    ====================================================== */

    function obtenerTipoEntidad() {

        const radioSeleccionado = document.querySelector(
            '.tipo-entidad-radio:checked'
        );


        if (!radioSeleccionado) {
            return "";
        }


        return radioSeleccionado.value;

    }



    /* ======================================================
       10. OBTENER CONTENEDOR DE CAMPO
    ====================================================== */

    function obtenerContenedorCampo(elemento) {

        if (!elemento) {
            return null;
        }


        return elemento.closest(
            ".campo-incidencia"
        );

    }



    /* ======================================================
       11. ELIMINAR ERROR DE UN CAMPO
    ====================================================== */

    function limpiarError(elemento) {

        const campo = obtenerContenedorCampo(
            elemento
        );


        if (!campo) {
            return;
        }


        campo.classList.remove(
            "error"
        );


        const mensaje = campo.querySelector(
            ".campo-error-mensaje"
        );


        if (mensaje) {
            mensaje.remove();
        }

    }



    /* ======================================================
       12. MOSTRAR ERROR
    ====================================================== */

    function mostrarError(
        elemento,
        mensaje
    ) {

        const campo = obtenerContenedorCampo(
            elemento
        );


        if (!campo) {
            return;
        }


        limpiarError(
            elemento
        );


        campo.classList.add(
            "error"
        );


        const mensajeError = document.createElement(
            "div"
        );


        mensajeError.className =
            "campo-error-mensaje";


        mensajeError.innerHTML = `
            <i class="bi bi-exclamation-circle-fill"></i>
            <span>${mensaje}</span>
        `;


        campo.appendChild(
            mensajeError
        );

    }



    /* ======================================================
       13. LIMPIAR TODOS LOS ERRORES
    ====================================================== */

    function limpiarTodosLosErrores() {

        document.querySelectorAll(
            ".campo-incidencia.error"
        ).forEach(
            function (campo) {

                campo.classList.remove(
                    "error"
                );

            }
        );


        document.querySelectorAll(
            ".campo-error-mensaje"
        ).forEach(
            function (mensaje) {

                mensaje.remove();

            }
        );


        if (selectorImagen) {

            selectorImagen.classList.remove(
                "error"
            );

        }

    }



    /* ======================================================
       14. MARCAR VISUALMENTE TIPO SELECCIONADO
    ====================================================== */

    function actualizarTipoVisual() {

        opcionesTipoEntidad.forEach(
            function (opcion) {

                const radio = opcion.querySelector(
                    ".tipo-entidad-radio"
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

    }



    /* ======================================================
       15. MOSTRAR / OCULTAR COLMENA
    ====================================================== */

    function actualizarCampoColmena() {

        const tipoEntidad = obtenerTipoEntidad();


        if (
            !contenedorColmena ||
            !selectColmena
        ) {
            return;
        }


        if (tipoEntidad === "Colmena") {

            contenedorColmena.classList.remove(
                "oculto"
            );


            selectColmena.disabled =
                false;


            selectColmena.required =
                true;


            filtrarColmenasPorApiario(
                false
            );

        } else {

            contenedorColmena.classList.add(
                "oculto"
            );


            selectColmena.required =
                false;


            selectColmena.disabled =
                true;


            limpiarError(
                selectColmena
            );

        }

    }



    /* ======================================================
       16. FILTRAR COLMENAS SEGÚN APIARIO
    ====================================================== */

    function filtrarColmenasPorApiario(
        reiniciarSeleccion = true
    ) {

        if (
            !selectApiario ||
            !selectColmena
        ) {
            return;
        }


        const idApiario = selectApiario.value;

        const valorActual = selectColmena.value;

        let valorActualSigueDisponible = false;


        Array.from(
            selectColmena.options
        ).forEach(
            function (
                opcion,
                indice
            ) {

                /*
                 * La primera opción es:
                 * "Selecciona una colmena"
                 */

                if (indice === 0) {

                    opcion.hidden = false;

                    opcion.disabled = false;

                    return;

                }


                const idApiarioOpcion = (
                    opcion.dataset.apiarioId || ""
                );


                const perteneceApiario = (
                    idApiario !== ""
                    &&
                    idApiarioOpcion === idApiario
                );


                opcion.hidden =
                    !perteneceApiario;


                opcion.disabled =
                    !perteneceApiario;


                if (
                    perteneceApiario &&
                    opcion.value === valorActual
                ) {

                    valorActualSigueDisponible =
                        true;

                }

            }
        );


        /*
         * Si el usuario acaba de cambiar el apiario,
         * dejamos la colmena sin seleccionar.
         */

        if (reiniciarSeleccion) {

            selectColmena.value = "";

        } else if (
            valorActual &&
            !valorActualSigueDisponible
        ) {

            selectColmena.value = "";

        }


        limpiarError(
            selectColmena
        );

    }



    /* ======================================================
       17. CAMBIO TIPO APIARIO / COLMENA
    ====================================================== */

    radiosTipoEntidad.forEach(
        function (radio) {

            radio.addEventListener(
                "change",
                function () {

                    actualizarTipoVisual();

                    actualizarCampoColmena();

                }
            );

        }
    );



    /* ======================================================
       18. CAMBIO DE APIARIO
    ====================================================== */

    if (selectApiario) {

        selectApiario.addEventListener(
            "change",
            function () {

                limpiarError(
                    this
                );


                if (
                    obtenerTipoEntidad() ===
                    "Colmena"
                ) {

                    filtrarColmenasPorApiario(
                        true
                    );

                }

            }
        );

    }



    /* ======================================================
       19. CAMBIO DE COLMENA
    ====================================================== */

    if (selectColmena) {

        selectColmena.addEventListener(
            "change",
            function () {

                limpiarError(
                    this
                );

            }
        );

    }



    /* ======================================================
       20. CONTADOR GENÉRICO
    ====================================================== */

    function actualizarContador(
        elemento,
        contador,
        maximo
    ) {

        if (
            !elemento ||
            !contador
        ) {
            return;
        }


        const usados =
            elemento.value.length;


        contador.textContent = (
            usados +
            " / " +
            maximo
        );


        contador.classList.remove(
            "cerca-limite",
            "limite-alcanzado"
        );


        /*
         * Desde el 80% mostramos advertencia.
         */

        if (
            usados >=
            maximo * 0.8
        ) {

            contador.classList.add(
                "cerca-limite"
            );

        }


        if (
            usados >= maximo
        ) {

            contador.classList.remove(
                "cerca-limite"
            );


            contador.classList.add(
                "limite-alcanzado"
            );

        }

    }



    /* ======================================================
       21. CONTADOR TÍTULO
    ====================================================== */

    if (inputTitulo) {

        actualizarContador(
            inputTitulo,
            contadorTitulo,
            150
        );


        inputTitulo.addEventListener(
            "input",
            function () {

                actualizarContador(
                    this,
                    contadorTitulo,
                    150
                );


                if (
                    this.value.trim()
                ) {

                    limpiarError(
                        this
                    );

                }

            }
        );

    }



    /* ======================================================
       22. CONTADOR OBSERVACIONES
    ====================================================== */

    if (textareaObservaciones) {

        actualizarContador(
            textareaObservaciones,
            contadorObservaciones,
            1000
        );


        textareaObservaciones.addEventListener(
            "input",
            function () {

                actualizarContador(
                    this,
                    contadorObservaciones,
                    1000
                );

            }
        );

    }



    /* ======================================================
       23. PRIORIDAD
    ====================================================== */

    if (selectPrioridad) {

        selectPrioridad.addEventListener(
            "change",
            function () {

                if (this.value) {

                    limpiarError(
                        this
                    );

                }

            }
        );

    }



    /* ======================================================
       24. FECHA
    ====================================================== */

    if (inputFecha) {

        inputFecha.addEventListener(
            "change",
            function () {

                if (this.value) {

                    limpiarError(
                        this
                    );

                }

            }
        );

    }



    /* ======================================================
       25. FORMATEAR TAMAÑO DE ARCHIVO
    ====================================================== */

    function formatearPeso(
        bytes
    ) {

        if (
            bytes === 0
        ) {

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
       26. LIBERAR URL DE PREVIEW
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
       27. MOSTRAR PREVIEW
    ====================================================== */

    function mostrarPreviewArchivo(
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
       28. OCULTAR PREVIEW
    ====================================================== */

    function ocultarPreviewArchivo() {

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

            selectorImagen.classList.remove(
                "error"
            );

        }

    }



    /* ======================================================
       29. VALIDAR ARCHIVO
    ====================================================== */

    function validarArchivoImagen(
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
       30. MOSTRAR ERROR DE IMAGEN
    ====================================================== */

    function mostrarErrorImagen(
        mensaje
    ) {

        if (!selectorImagen) {
            return;
        }


        selectorImagen.classList.add(
            "error"
        );


        /*
         * Eliminamos mensaje anterior.
         */

        const existente =
            document.querySelector(
                ".evidencia-error-mensaje"
            );


        if (existente) {

            existente.remove();

        }


        const mensajeError =
            document.createElement(
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
       31. LIMPIAR ERROR DE IMAGEN
    ====================================================== */

    function limpiarErrorImagen() {

        if (selectorImagen) {

            selectorImagen.classList.remove(
                "error"
            );

        }


        const mensaje =
            document.querySelector(
                ".evidencia-error-mensaje"
            );


        if (mensaje) {

            mensaje.remove();

        }

    }



    /* ======================================================
       32. PROCESAR ARCHIVO
    ====================================================== */

    function procesarImagen(
        archivo
    ) {

        if (!archivo) {

            ocultarPreviewArchivo();

            return false;

        }


        const validacion =
            validarArchivoImagen(
                archivo
            );


        if (!validacion.valido) {

            mostrarErrorImagen(
                validacion.mensaje
            );


            if (inputImagen) {

                inputImagen.value = "";

            }


            ocultarPreviewArchivo();


            return false;

        }


        limpiarErrorImagen();


        mostrarPreviewArchivo(
            archivo
        );


        return true;

    }



    /* ======================================================
       33. CAMBIO INPUT IMAGEN
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
       34. QUITAR IMAGEN
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

                ocultarPreviewArchivo();

            }
        );

    }



    /* ======================================================
       35. DRAG & DROP
    ====================================================== */

    if (
        selectorImagen &&
        inputImagen
    ) {


        [
            "dragenter",
            "dragover"
        ].forEach(
            function (eventoNombre) {

                selectorImagen.addEventListener(
                    eventoNombre,
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
            function (eventoNombre) {

                selectorImagen.addEventListener(
                    eventoNombre,
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
                    validarArchivoImagen(
                        archivo
                    );


                if (!validacion.valido) {

                    mostrarErrorImagen(
                        validacion.mensaje
                    );

                    return;

                }


                /*
                 * Intentamos asignar el archivo soltado
                 * al input real.
                 */

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
                     * Si el navegador no permite asignarlo,
                     * no rompemos el formulario.
                     */

                    inputImagen.click();

                }

            }
        );

    }



    /* ======================================================
       36. VALIDAR TIPO
    ====================================================== */

    function validarTipoEntidad() {

        const tipo =
            obtenerTipoEntidad();


        return (
            tipo === "Apiario" ||
            tipo === "Colmena"
        );

    }



    /* ======================================================
       37. VALIDAR APIARIO
    ====================================================== */

    function validarApiario() {

        if (
            !selectApiario ||
            !selectApiario.value
        ) {

            mostrarError(
                selectApiario,
                "Selecciona el apiario donde ocurrió la incidencia."
            );


            return false;

        }


        limpiarError(
            selectApiario
        );


        return true;

    }



    /* ======================================================
       38. VALIDAR COLMENA
    ====================================================== */

    function validarColmena() {

        if (
            obtenerTipoEntidad() !==
            "Colmena"
        ) {

            return true;

        }


        if (
            !selectColmena ||
            !selectColmena.value
        ) {

            mostrarError(
                selectColmena,
                "Selecciona la colmena afectada."
            );


            return false;

        }


        const opcionSeleccionada =
            selectColmena.options[
                selectColmena.selectedIndex
            ];


        if (
            !opcionSeleccionada ||
            opcionSeleccionada.dataset.apiarioId
            !==
            selectApiario.value
        ) {

            mostrarError(
                selectColmena,
                "La colmena seleccionada no pertenece al apiario indicado."
            );


            return false;

        }


        limpiarError(
            selectColmena
        );


        return true;

    }



    /* ======================================================
       39. VALIDAR TÍTULO
    ====================================================== */

    function validarTitulo() {

        if (!inputTitulo) {

            return false;

        }


        inputTitulo.value =
            inputTitulo.value.trim();


        if (!inputTitulo.value) {

            mostrarError(
                inputTitulo,
                "Escribe un título para la incidencia."
            );


            return false;

        }


        if (
            inputTitulo.value.length < 3
        ) {

            mostrarError(
                inputTitulo,
                "El título debe tener al menos 3 caracteres."
            );


            return false;

        }


        if (
            inputTitulo.value.length > 150
        ) {

            mostrarError(
                inputTitulo,
                "El título no puede superar los 150 caracteres."
            );


            return false;

        }


        limpiarError(
            inputTitulo
        );


        return true;

    }



    /* ======================================================
       40. VALIDAR PRIORIDAD
    ====================================================== */

    function validarPrioridad() {

        if (
            !selectPrioridad ||
            !selectPrioridad.value
        ) {

            mostrarError(
                selectPrioridad,
                "Selecciona la prioridad de la incidencia."
            );


            return false;

        }


        const prioridadesValidas = [
            "Baja",
            "Media",
            "Alta",
            "Crítica"
        ];


        if (
            !prioridadesValidas.includes(
                selectPrioridad.value
            )
        ) {

            mostrarError(
                selectPrioridad,
                "La prioridad seleccionada no es válida."
            );


            return false;

        }


        limpiarError(
            selectPrioridad
        );


        return true;

    }



    /* ======================================================
       41. VALIDAR FECHA
    ====================================================== */

    function validarFecha() {

        if (
            !inputFecha ||
            !inputFecha.value
        ) {

            mostrarError(
                inputFecha,
                "Selecciona la fecha de detección."
            );


            return false;

        }


        /*
         * El formato de input[type=date]
         * es YYYY-MM-DD.
         */

        const fechaMaxima =
            inputFecha.getAttribute(
                "max"
            );


        if (
            fechaMaxima &&
            inputFecha.value >
            fechaMaxima
        ) {

            mostrarError(
                inputFecha,
                "La fecha de detección no puede ser futura."
            );


            return false;

        }


        limpiarError(
            inputFecha
        );


        return true;

    }



    /* ======================================================
       42. VALIDAR OBSERVACIONES
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

            mostrarError(
                textareaObservaciones,
                "La descripción no puede superar los 1000 caracteres."
            );


            return false;

        }


        limpiarError(
            textareaObservaciones
        );


        return true;

    }



    /* ======================================================
       43. VALIDAR IMAGEN ACTUAL
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


        const archivo =
            inputImagen.files[0];


        const validacion =
            validarArchivoImagen(
                archivo
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
       44. IR AL PRIMER ERROR
    ====================================================== */

    function enfocarPrimerError() {

        const primerCampoError =
            formulario.querySelector(
                ".campo-incidencia.error"
            );


        if (primerCampoError) {

            primerCampoError.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });


            const elemento = primerCampoError.querySelector(
                "input, select, textarea"
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
       45. VALIDAR FORMULARIO COMPLETO
    ====================================================== */

    function validarFormulario() {

        limpiarTodosLosErrores();


        let valido = true;


        if (!validarTipoEntidad()) {

            valido = false;

        }


        if (!validarApiario()) {

            valido = false;

        }


        if (!validarColmena()) {

            valido = false;

        }


        if (!validarTitulo()) {

            valido = false;

        }


        if (!validarPrioridad()) {

            valido = false;

        }


        if (!validarFecha()) {

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
       46. ENVIAR FORMULARIO
    ====================================================== */

    formulario.addEventListener(
        "submit",
        function (evento) {

            evento.preventDefault();


            const formularioValido =
                validarFormulario();


            if (!formularioValido) {

                enfocarPrimerError();

                return;

            }


            /*
             * Si es incidencia de apiario,
             * dejamos explícitamente la colmena
             * deshabilitada para que no se envíe.
             */

            if (
                obtenerTipoEntidad() ===
                "Apiario"
                &&
                selectColmena
            ) {

                selectColmena.disabled =
                    true;

            }


            /*
             * Evitar doble envío.
             */

            if (btnGuardar) {

                btnGuardar.disabled =
                    true;


                btnGuardar.innerHTML = `
                    <span>
                        Reportando...
                    </span>
                `;

            }


            /*
             * Enviar de forma nativa.
             *
             * No usamos requestSubmit()
             * porque volvería a ejecutar
             * este mismo listener.
             */

            HTMLFormElement.prototype.submit.call(
                formulario
            );

        }
    );



    /* ======================================================
       47. ESTADO INICIAL
    ====================================================== */

    actualizarTipoVisual();


    /*
     * Es importante ejecutar primero el filtrado
     * sin eliminar el valor que Django dejó
     * preseleccionado.
     */

    if (
        obtenerTipoEntidad() ===
        "Colmena"
    ) {

        if (selectColmena) {

            selectColmena.disabled =
                false;

            selectColmena.required =
                true;

        }


        filtrarColmenasPorApiario(
            false
        );


        if (contenedorColmena) {

            contenedorColmena.classList.remove(
                "oculto"
            );

        }

    } else {

        actualizarCampoColmena();

    }



    /* ======================================================
       48. RESTAURAR AL VOLVER CON EL NAVEGADOR
    ====================================================== */

    window.addEventListener(
        "pageshow",
        function () {

            if (btnGuardar) {

                btnGuardar.disabled =
                    false;


                btnGuardar.innerHTML = `
                    <i class="bi bi-exclamation-triangle-fill"></i>

                    <span>
                        Reportar incidencia
                    </span>
                `;

            }


            actualizarTipoVisual();

            actualizarCampoColmena();

        }
    );



    /* ======================================================
       49. LIMPIAR URL DE PREVIEW AL SALIR
    ====================================================== */

    window.addEventListener(
        "beforeunload",
        function () {

            liberarPreviewAnterior();

        }
    );


});