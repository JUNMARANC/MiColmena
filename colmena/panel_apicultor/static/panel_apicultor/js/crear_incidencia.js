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
       2. TIPO DE ENTIDAD
    ====================================================== */

    const radiosTipoEntidad = formulario.querySelectorAll(
        ".tipo-entidad-radio"
    );

    const opcionesTipoEntidad = formulario.querySelectorAll(
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
       4. INFORMACIÓN DE LA INCIDENCIA
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
       6. EVIDENCIAS FOTOGRÁFICAS
    ====================================================== */

    const contenedorEvidencias = document.getElementById(
        "contenedorEvidenciasProblema"
    );

    const inputEvidencias = document.getElementById(
        "evidenciasProblema"
    );

    const selectorEvidencias = document.getElementById(
        "selectorEvidenciasProblema"
    );

    const contadorEvidencias = document.getElementById(
        "contadorEvidenciasProblema"
    );

    const btnLimpiarEvidencias = document.getElementById(
        "btnLimpiarEvidenciasProblema"
    );

    const errorEvidencias = document.getElementById(
        "errorEvidenciasProblema"
    );

    const previewEvidencias = document.getElementById(
        "previewEvidenciasProblema"
    );

    const gridEvidencias = document.getElementById(
        "gridEvidenciasProblema"
    );


    /* ======================================================
       7. BOTÓN GUARDAR
    ====================================================== */

    const btnGuardar = document.getElementById(
        "btnGuardarIncidencia"
    );


    /* ======================================================
       8. CONFIGURACIÓN GENERAL
    ====================================================== */

    const MAX_TITULO = 150;

    const MIN_TITULO = 3;

    const MAX_OBSERVACIONES = 1000;


    /* ======================================================
       9. CONFIGURACIÓN DE EVIDENCIAS
    ====================================================== */

    const MAX_EVIDENCIAS = Number(
        contenedorEvidencias?.dataset.maxArchivos || 6
    );

    const MAX_MB = Number(
        contenedorEvidencias?.dataset.maxMb || 5
    );

    const MAX_BYTES = (
        MAX_MB *
        1024 *
        1024
    );


    const TIPOS_IMAGEN_VALIDOS = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    /* ======================================================
       10. ESTADO DE LAS EVIDENCIAS
    ====================================================== */

    let archivosSeleccionados = [];

    let urlsPreview = [];


    /* ======================================================
       11. OBTENER TIPO DE ENTIDAD
    ====================================================== */

    function obtenerTipoEntidad() {

        const radioSeleccionado = formulario.querySelector(
            'input[name="tipo_entidad"]:checked'
        );

        if (!radioSeleccionado) {
            return "";
        }

        return radioSeleccionado.value;

    }


    /* ======================================================
       12. OBTENER CONTENEDOR DE CAMPO
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
       13. LIMPIAR ERROR DE CAMPO
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
       14. MOSTRAR ERROR DE CAMPO
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
            <span></span>
        `;

        const span = mensajeError.querySelector(
            "span"
        );

        if (span) {
            span.textContent = mensaje;
        }

        campo.appendChild(
            mensajeError
        );

    }


    /* ======================================================
       15. ERROR DE EVIDENCIAS
    ====================================================== */

    function mostrarErrorEvidencias(mensaje) {

        if (!errorEvidencias) {
            return;
        }

        const texto = errorEvidencias.querySelector(
            "span"
        );

        if (texto) {
            texto.textContent = mensaje;
        }

        errorEvidencias.hidden = false;

        if (selectorEvidencias) {
            selectorEvidencias.classList.add(
                "error"
            );
        }

    }


    function limpiarErrorEvidencias() {

        if (errorEvidencias) {

            errorEvidencias.hidden = true;

            const texto = errorEvidencias.querySelector(
                "span"
            );

            if (texto) {
                texto.textContent = "";
            }

        }

        if (selectorEvidencias) {

            selectorEvidencias.classList.remove(
                "error"
            );

        }

    }


    /* ======================================================
       16. LIMPIAR TODOS LOS ERRORES
    ====================================================== */

    function limpiarTodosLosErrores() {

        formulario.querySelectorAll(
            ".campo-incidencia.error"
        ).forEach(function (campo) {

            campo.classList.remove(
                "error"
            );

        });


        formulario.querySelectorAll(
            ".campo-error-mensaje"
        ).forEach(function (mensaje) {

            mensaje.remove();

        });


        limpiarErrorEvidencias();

    }


    /* ======================================================
       17. ESTADO VISUAL DEL TIPO
    ====================================================== */

    function actualizarTipoVisual() {

        opcionesTipoEntidad.forEach(
            function (opcion) {

                const radio = opcion.querySelector(
                    ".tipo-entidad-radio"
                );

                opcion.classList.toggle(
                    "activa",
                    Boolean(
                        radio &&
                        radio.checked
                    )
                );

            }
        );

    }


    /* ======================================================
       18. MOSTRAR / OCULTAR COLMENA
    ====================================================== */

    function actualizarCampoColmena() {

        if (
            !contenedorColmena ||
            !selectColmena
        ) {
            return;
        }


        const tipoEntidad =
            obtenerTipoEntidad();


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
       19. FILTRAR COLMENAS POR APIARIO
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


        const idApiario =
            selectApiario.value;

        const valorActual =
            selectColmena.value;

        let valorActualDisponible =
            false;


        Array.from(
            selectColmena.options
        ).forEach(
            function (opcion, indice) {


                /*
                 * Primera opción:
                 * "Selecciona una colmena"
                 */

                if (indice === 0) {

                    opcion.hidden =
                        false;

                    opcion.disabled =
                        false;

                    return;

                }


                const idApiarioOpcion =
                    opcion.dataset.apiarioId || "";


                const pertenece =
                    idApiario !== "" &&
                    idApiarioOpcion === idApiario;


                opcion.hidden =
                    !pertenece;

                opcion.disabled =
                    !pertenece;


                if (
                    pertenece &&
                    opcion.value === valorActual
                ) {

                    valorActualDisponible =
                        true;

                }

            }
        );


        if (reiniciarSeleccion) {

            selectColmena.value =
                "";

        } else if (
            valorActual &&
            !valorActualDisponible
        ) {

            selectColmena.value =
                "";

        }


        limpiarError(
            selectColmena
        );

    }


    /* ======================================================
       20. CAMBIO DE TIPO
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
       21. CAMBIO DE APIARIO
    ====================================================== */

    if (selectApiario) {

        selectApiario.addEventListener(
            "change",
            function () {

                limpiarError(
                    selectApiario
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
       22. CAMBIO DE COLMENA
    ====================================================== */

    if (selectColmena) {

        selectColmena.addEventListener(
            "change",
            function () {

                limpiarError(
                    selectColmena
                );

            }
        );

    }


    /* ======================================================
       23. CONTADOR DE TEXTO
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


        contador.textContent =
            `${usados} / ${maximo}`;


        contador.classList.remove(
            "cerca-limite",
            "limite-alcanzado"
        );


        if (
            usados >= maximo * 0.8 &&
            usados < maximo
        ) {

            contador.classList.add(
                "cerca-limite"
            );

        }


        if (usados >= maximo) {

            contador.classList.add(
                "limite-alcanzado"
            );

        }

    }


    /* ======================================================
       24. TÍTULO
    ====================================================== */

    if (inputTitulo) {

        actualizarContador(
            inputTitulo,
            contadorTitulo,
            MAX_TITULO
        );


        inputTitulo.addEventListener(
            "input",
            function () {

                actualizarContador(
                    inputTitulo,
                    contadorTitulo,
                    MAX_TITULO
                );


                if (
                    inputTitulo.value.trim().length >=
                    MIN_TITULO
                ) {

                    limpiarError(
                        inputTitulo
                    );

                }

            }
        );

    }


    /* ======================================================
       25. OBSERVACIONES
    ====================================================== */

    if (textareaObservaciones) {

        actualizarContador(
            textareaObservaciones,
            contadorObservaciones,
            MAX_OBSERVACIONES
        );


        textareaObservaciones.addEventListener(
            "input",
            function () {

                actualizarContador(
                    textareaObservaciones,
                    contadorObservaciones,
                    MAX_OBSERVACIONES
                );


                if (
                    textareaObservaciones.value.length <=
                    MAX_OBSERVACIONES
                ) {

                    limpiarError(
                        textareaObservaciones
                    );

                }

            }
        );

    }


    /* ======================================================
       26. PRIORIDAD
    ====================================================== */

    if (selectPrioridad) {

        selectPrioridad.addEventListener(
            "change",
            function () {

                if (selectPrioridad.value) {

                    limpiarError(
                        selectPrioridad
                    );

                }

            }
        );

    }


    /* ======================================================
       27. FECHA
    ====================================================== */

    if (inputFecha) {

        inputFecha.addEventListener(
            "change",
            function () {

                if (inputFecha.value) {

                    limpiarError(
                        inputFecha
                    );

                }

            }
        );

    }


    /* ======================================================
       28. FORMATEAR PESO
    ====================================================== */

    function formatearPeso(bytes) {

        if (!bytes) {
            return "0 KB";
        }


        const kb =
            bytes / 1024;


        if (kb < 1024) {

            return (
                `${kb.toFixed(1)} KB`
            );

        }


        const mb =
            kb / 1024;


        return (
            `${mb.toFixed(2)} MB`
        );

    }


    /* ======================================================
       29. IDENTIFICADOR ÚNICO DEL ARCHIVO
    ====================================================== */

    function obtenerClaveArchivo(archivo) {

        return [
            archivo.name,
            archivo.size,
            archivo.lastModified,
            archivo.type
        ].join("::");

    }


    /* ======================================================
       30. VALIDAR UNA IMAGEN
    ====================================================== */

    function validarArchivoImagen(archivo) {

        if (!archivo) {

            return {
                valido: false,
                mensaje: "No se pudo leer la fotografía."
            };

        }


        if (archivo.size <= 0) {

            return {
                valido: false,
                mensaje:
                    `La fotografía "${archivo.name}" está vacía.`
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
                    `La fotografía "${archivo.name}" debe ser JPG, PNG o WEBP.`
            };

        }


        if (
            archivo.size >
            MAX_BYTES
        ) {

            return {
                valido: false,
                mensaje:
                    `La fotografía "${archivo.name}" supera los ${MAX_MB} MB.`
            };

        }


        return {
            valido: true,
            mensaje: ""
        };

    }


    /* ======================================================
       31. REVOCAR URLS DE PREVISUALIZACIÓN
    ====================================================== */

    function liberarUrlsPreview() {

        urlsPreview.forEach(
            function (url) {

                URL.revokeObjectURL(
                    url
                );

            }
        );


        urlsPreview = [];

    }


    /* ======================================================
       32. SINCRONIZAR ARCHIVOS CON EL INPUT REAL
    ====================================================== */

    function sincronizarInputEvidencias() {

        if (!inputEvidencias) {
            return;
        }


        try {

            const transferencia =
                new DataTransfer();


            archivosSeleccionados.forEach(
                function (archivo) {

                    transferencia.items.add(
                        archivo
                    );

                }
            );


            inputEvidencias.files =
                transferencia.files;


        } catch (error) {

            console.warn(
                "No fue posible sincronizar el selector de evidencias.",
                error
            );

        }

    }


    /* ======================================================
       33. ACTUALIZAR CONTADOR DE EVIDENCIAS
    ====================================================== */

    function actualizarContadorEvidencias() {

        const cantidad =
            archivosSeleccionados.length;


        if (contadorEvidencias) {

            contadorEvidencias.textContent =
                cantidad;

        }


        if (btnLimpiarEvidencias) {

            btnLimpiarEvidencias.hidden =
                cantidad === 0;

        }


        if (selectorEvidencias) {

            selectorEvidencias.classList.toggle(
                "limite-alcanzado",
                cantidad >= MAX_EVIDENCIAS
            );

        }

    }


    /* ======================================================
       34. ELIMINAR UNA EVIDENCIA
    ====================================================== */

    function eliminarEvidencia(claveArchivo) {

        archivosSeleccionados =
            archivosSeleccionados.filter(
                function (archivo) {

                    return (
                        obtenerClaveArchivo(
                            archivo
                        )
                        !==
                        claveArchivo
                    );

                }
            );


        sincronizarInputEvidencias();

        limpiarErrorEvidencias();

        renderizarEvidencias();

    }


    /* ======================================================
       35. CREAR TARJETA DE PREVISUALIZACIÓN
    ====================================================== */

    function crearTarjetaEvidencia(
        archivo,
        indice
    ) {

        const articulo = document.createElement(
            "article"
        );

        articulo.className =
            "evidencia-preview-item";


        /* ===============================================
           IMAGEN
        =============================================== */

        const contenedorImagen =
            document.createElement(
                "div"
            );

        contenedorImagen.className =
            "evidencia-preview-item-imagen";


        const imagen =
            document.createElement(
                "img"
            );


        const url =
            URL.createObjectURL(
                archivo
            );


        urlsPreview.push(
            url
        );


        imagen.src =
            url;

        imagen.alt =
            `Evidencia ${indice + 1}`;


        contenedorImagen.appendChild(
            imagen
        );


        /* ===============================================
           NÚMERO
        =============================================== */

        const numero =
            document.createElement(
                "span"
            );

        numero.className =
            "evidencia-preview-numero";

        numero.textContent =
            indice + 1;


        contenedorImagen.appendChild(
            numero
        );


        /* ===============================================
           BOTÓN ELIMINAR
        =============================================== */

        const botonEliminar =
            document.createElement(
                "button"
            );

        botonEliminar.type =
            "button";

        botonEliminar.className =
            "btn-eliminar-evidencia";

        botonEliminar.title =
            "Quitar fotografía";

        botonEliminar.setAttribute(
            "aria-label",
            `Quitar ${archivo.name}`
        );


        botonEliminar.innerHTML = `
            <i class="bi bi-x-lg"></i>
        `;


        const claveArchivo =
            obtenerClaveArchivo(
                archivo
            );


        botonEliminar.addEventListener(
            "click",
            function () {

                eliminarEvidencia(
                    claveArchivo
                );

            }
        );


        contenedorImagen.appendChild(
            botonEliminar
        );


        /* ===============================================
           INFORMACIÓN
        =============================================== */

        const informacion =
            document.createElement(
                "div"
            );

        informacion.className =
            "evidencia-preview-item-info";


        const nombre =
            document.createElement(
                "strong"
            );

        nombre.textContent =
            archivo.name;

        nombre.title =
            archivo.name;


        const peso =
            document.createElement(
                "span"
            );

        peso.textContent =
            formatearPeso(
                archivo.size
            );


        informacion.appendChild(
            nombre
        );

        informacion.appendChild(
            peso
        );


        /* ===============================================
           ARMAR TARJETA
        =============================================== */

        articulo.appendChild(
            contenedorImagen
        );

        articulo.appendChild(
            informacion
        );


        return articulo;

    }


    /* ======================================================
       36. RENDERIZAR TODAS LAS EVIDENCIAS
    ====================================================== */

    function renderizarEvidencias() {

        liberarUrlsPreview();


        if (gridEvidencias) {

            gridEvidencias.innerHTML =
                "";

        }


        actualizarContadorEvidencias();


        if (
            archivosSeleccionados.length === 0
        ) {

            if (previewEvidencias) {

                previewEvidencias.hidden =
                    true;

            }

            return;

        }


        if (previewEvidencias) {

            previewEvidencias.hidden =
                false;

        }


        archivosSeleccionados.forEach(
            function (archivo, indice) {

                if (!gridEvidencias) {
                    return;
                }


                const tarjeta =
                    crearTarjetaEvidencia(
                        archivo,
                        indice
                    );


                gridEvidencias.appendChild(
                    tarjeta
                );

            }
        );

    }


    /* ======================================================
       37. AGREGAR ARCHIVOS
    ====================================================== */

    function agregarArchivos(listaArchivos) {

        limpiarErrorEvidencias();


        const nuevosArchivos =
            Array.from(
                listaArchivos || []
            );


        if (
            nuevosArchivos.length === 0
        ) {
            return;
        }


        const clavesExistentes =
            new Set(
                archivosSeleccionados.map(
                    obtenerClaveArchivo
                )
            );


        let mensajeError =
            "";


        for (
            const archivo of nuevosArchivos
        ) {


            /* ===========================================
               YA LLEGAMOS AL MÁXIMO
            =========================================== */

            if (
                archivosSeleccionados.length >=
                MAX_EVIDENCIAS
            ) {

                mensajeError =
                    `Puedes seleccionar un máximo de ${MAX_EVIDENCIAS} fotografías.`;

                break;

            }


            /* ===========================================
               VALIDAR ARCHIVO
            =========================================== */

            const validacion =
                validarArchivoImagen(
                    archivo
                );


            if (!validacion.valido) {

                if (!mensajeError) {

                    mensajeError =
                        validacion.mensaje;

                }

                continue;

            }


            /* ===========================================
               EVITAR DUPLICADOS
            =========================================== */

            const clave =
                obtenerClaveArchivo(
                    archivo
                );


            if (
                clavesExistentes.has(
                    clave
                )
            ) {

                if (!mensajeError) {

                    mensajeError =
                        `La fotografía "${archivo.name}" ya fue seleccionada.`;

                }

                continue;

            }


            archivosSeleccionados.push(
                archivo
            );


            clavesExistentes.add(
                clave
            );

        }


        sincronizarInputEvidencias();

        renderizarEvidencias();


        if (mensajeError) {

            mostrarErrorEvidencias(
                mensajeError
            );

        }

    }


    /* ======================================================
       38. CAMBIO DEL INPUT
    ====================================================== */

    if (inputEvidencias) {

        inputEvidencias.addEventListener(
            "change",
            function () {

                const archivos =
                    Array.from(
                        inputEvidencias.files || []
                    );


                agregarArchivos(
                    archivos
                );

            }
        );

    }


    /* ======================================================
       39. QUITAR TODAS LAS EVIDENCIAS
    ====================================================== */

    function limpiarTodasLasEvidencias() {

        archivosSeleccionados =
            [];


        sincronizarInputEvidencias();

        limpiarErrorEvidencias();

        renderizarEvidencias();

    }


    if (btnLimpiarEvidencias) {

        btnLimpiarEvidencias.addEventListener(
            "click",
            function () {

                limpiarTodasLasEvidencias();

            }
        );

    }


    /* ======================================================
       40. DRAG & DROP
    ====================================================== */

    if (
        selectorEvidencias &&
        inputEvidencias
    ) {


        [
            "dragenter",
            "dragover"
        ].forEach(
            function (nombreEvento) {

                selectorEvidencias.addEventListener(
                    nombreEvento,
                    function (evento) {

                        evento.preventDefault();

                        evento.stopPropagation();


                        selectorEvidencias.classList.add(
                            "arrastrando"
                        );

                    }
                );

            }
        );


        [
            "dragleave",
            "dragend"
        ].forEach(
            function (nombreEvento) {

                selectorEvidencias.addEventListener(
                    nombreEvento,
                    function (evento) {

                        evento.preventDefault();

                        evento.stopPropagation();


                        selectorEvidencias.classList.remove(
                            "arrastrando"
                        );

                    }
                );

            }
        );


        selectorEvidencias.addEventListener(
            "drop",
            function (evento) {

                evento.preventDefault();

                evento.stopPropagation();


                selectorEvidencias.classList.remove(
                    "arrastrando"
                );


                const archivos =
                    evento.dataTransfer?.files;


                if (
                    !archivos ||
                    archivos.length === 0
                ) {
                    return;
                }


                agregarArchivos(
                    archivos
                );

            }
        );

    }


    /* ======================================================
       41. VALIDAR TIPO
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
       42. VALIDAR APIARIO
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
       43. VALIDAR COLMENA
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


        if (
            !selectApiario ||
            !selectApiario.value
        ) {

            mostrarError(
                selectColmena,
                "Primero selecciona un apiario."
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
                !== selectApiario.value
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
       44. VALIDAR TÍTULO
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
            inputTitulo.value.length <
            MIN_TITULO
        ) {

            mostrarError(
                inputTitulo,
                `El título debe tener al menos ${MIN_TITULO} caracteres.`
            );

            return false;

        }


        if (
            inputTitulo.value.length >
            MAX_TITULO
        ) {

            mostrarError(
                inputTitulo,
                `El título no puede superar los ${MAX_TITULO} caracteres.`
            );

            return false;

        }


        limpiarError(
            inputTitulo
        );

        return true;

    }


    /* ======================================================
       45. VALIDAR PRIORIDAD
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
       46. VALIDAR FECHA
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
       47. VALIDAR OBSERVACIONES
    ====================================================== */

    function validarObservaciones() {

        if (!textareaObservaciones) {
            return true;
        }


        textareaObservaciones.value =
            textareaObservaciones.value.trim();


        if (
            textareaObservaciones.value.length >
            MAX_OBSERVACIONES
        ) {

            mostrarError(
                textareaObservaciones,
                `La descripción no puede superar los ${MAX_OBSERVACIONES} caracteres.`
            );

            return false;

        }


        limpiarError(
            textareaObservaciones
        );

        return true;

    }


    /* ======================================================
       48. VALIDAR TODAS LAS EVIDENCIAS
    ====================================================== */

    function validarEvidencias() {

        limpiarErrorEvidencias();


        /*
         * Las fotografías son opcionales.
         */

        if (
            archivosSeleccionados.length === 0
        ) {

            return true;

        }


        if (
            archivosSeleccionados.length >
            MAX_EVIDENCIAS
        ) {

            mostrarErrorEvidencias(
                `Puedes subir un máximo de ${MAX_EVIDENCIAS} fotografías.`
            );

            return false;

        }


        for (
            const archivo of archivosSeleccionados
        ) {

            const validacion =
                validarArchivoImagen(
                    archivo
                );


            if (!validacion.valido) {

                mostrarErrorEvidencias(
                    validacion.mensaje
                );

                return false;

            }

        }


        return true;

    }


    /* ======================================================
       49. VALIDAR FORMULARIO COMPLETO
    ====================================================== */

    function validarFormulario() {

        limpiarTodosLosErrores();


        let valido =
            true;


        if (!validarTipoEntidad()) {

            valido =
                false;

        }


        if (!validarApiario()) {

            valido =
                false;

        }


        if (!validarColmena()) {

            valido =
                false;

        }


        if (!validarTitulo()) {

            valido =
                false;

        }


        if (!validarPrioridad()) {

            valido =
                false;

        }


        if (!validarFecha()) {

            valido =
                false;

        }


        if (!validarObservaciones()) {

            valido =
                false;

        }


        if (!validarEvidencias()) {

            valido =
                false;

        }


        return valido;

    }


    /* ======================================================
       50. ENFOCAR PRIMER ERROR
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


            const elemento =
                primerCampoError.querySelector(
                    "input, select, textarea"
                );


            if (elemento) {

                setTimeout(
                    function () {

                        elemento.focus();

                    },
                    300
                );

            }


            return;

        }


        if (
            errorEvidencias &&
            !errorEvidencias.hidden
        ) {

            contenedorEvidencias?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }

    }


    /* ======================================================
       51. ESTADO DEL BOTÓN AL GUARDAR
    ====================================================== */

    function activarEstadoGuardando() {

        if (!btnGuardar) {
            return;
        }


        btnGuardar.disabled =
            true;


        btnGuardar.innerHTML = `
            <i class="bi bi-arrow-repeat"></i>

            <span>
                Reportando...
            </span>
        `;

    }


    /* ======================================================
       52. RESTAURAR BOTÓN
    ====================================================== */

    function restaurarBotonGuardar() {

        if (!btnGuardar) {
            return;
        }


        btnGuardar.disabled =
            false;


        btnGuardar.innerHTML = `
            <i class="bi bi-exclamation-triangle-fill"></i>

            <span>
                Reportar incidencia
            </span>
        `;

    }


    /* ======================================================
       53. ENVIAR FORMULARIO
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
             * Nos aseguramos de que el input real tenga
             * exactamente los archivos que aparecen
             * en la vista previa.
             */

            sincronizarInputEvidencias();


            /*
             * Si la incidencia es del apiario,
             * la colmena no debe enviarse.
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


            activarEstadoGuardando();


            /*
             * Envío nativo para no volver a ejecutar
             * este listener.
             */

            HTMLFormElement.prototype.submit.call(
                formulario
            );

        }
    );


    /* ======================================================
       54. ESTADO INICIAL DE LA COLMENA
    ====================================================== */

    function inicializarUbicacion() {

        actualizarTipoVisual();


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

    }


    /* ======================================================
       55. INICIALIZAR EVIDENCIAS
    ====================================================== */

    function inicializarEvidencias() {

        if (!inputEvidencias) {
            return;
        }


        archivosSeleccionados =
            Array.from(
                inputEvidencias.files || []
            );


        /*
         * Por seguridad, si el navegador recuperó más
         * archivos de los permitidos, dejamos solo 6.
         */

        if (
            archivosSeleccionados.length >
            MAX_EVIDENCIAS
        ) {

            archivosSeleccionados =
                archivosSeleccionados.slice(
                    0,
                    MAX_EVIDENCIAS
                );


            sincronizarInputEvidencias();

        }


        renderizarEvidencias();

    }


    /* ======================================================
       56. RESTAURAR AL VOLVER ATRÁS
    ====================================================== */

    window.addEventListener(
        "pageshow",
        function () {

            restaurarBotonGuardar();

            inicializarUbicacion();

            actualizarContador(
                inputTitulo,
                contadorTitulo,
                MAX_TITULO
            );

            actualizarContador(
                textareaObservaciones,
                contadorObservaciones,
                MAX_OBSERVACIONES
            );

            inicializarEvidencias();

        }
    );


    /* ======================================================
       57. LIBERAR PREVIEWS AL SALIR
    ====================================================== */

    window.addEventListener(
        "beforeunload",
        function () {

            liberarUrlsPreview();

        }
    );


    /* ======================================================
       58. INICIALIZACIÓN GENERAL
    ====================================================== */

    inicializarUbicacion();


    actualizarContador(
        inputTitulo,
        contadorTitulo,
        MAX_TITULO
    );


    actualizarContador(
        textareaObservaciones,
        contadorObservaciones,
        MAX_OBSERVACIONES
    );


    inicializarEvidencias();


});