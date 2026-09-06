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

    const opcionesEstado = formulario.querySelectorAll(
        ".estado-incidencia-opcion"
    );

    const radiosEstado = formulario.querySelectorAll(
        'input[name="estado"]'
    );

    const estadoSuperior = document.querySelector(
        ".incidencia-estado-principal"
    );

    const contenedorEstados = document.getElementById(
        "opcionesEstadoIncidencia"
    );

    const avisoEvidenciaSolucion = document.getElementById(
        "avisoEvidenciaSolucion"
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
       4. BOTÓN GUARDAR
    ====================================================== */

    const btnGuardar = document.getElementById(
        "btnGuardarIncidencia"
    );


    /* ======================================================
       5. CONFIGURACIÓN
    ====================================================== */

    const MAX_OBSERVACIONES = 1000;

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


    /* ======================================================
       6. OBTENER ESTADO SELECCIONADO
    ====================================================== */

    function obtenerEstadoSeleccionado() {

        const radio = formulario.querySelector(
            'input[name="estado"]:checked'
        );

        return radio
            ? radio.value
            : "";

    }


    /* ======================================================
       7. ACTUALIZAR ESTADO VISUAL
    ====================================================== */

    function actualizarEstadoVisual() {

        opcionesEstado.forEach(
            function (opcion) {

                const radio = opcion.querySelector(
                    'input[name="estado"]'
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


        actualizarBadgeSuperior();

        actualizarAvisoSolucion();

    }


    /* ======================================================
       8. BADGE SUPERIOR
    ====================================================== */

    function actualizarBadgeSuperior() {

        if (!estadoSuperior) {
            return;
        }


        const estado =
            obtenerEstadoSeleccionado();


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
         * Conservamos el primer span del badge,
         * que representa el indicador visual.
         */

        const nodos =
            Array.from(
                estadoSuperior.childNodes
            );


        const nodoTexto =
            nodos.find(
                function (nodo) {

                    return (
                        nodo.nodeType === Node.TEXT_NODE
                        &&
                        nodo.textContent.trim() !== ""
                    );

                }
            );


        if (nodoTexto) {

            nodoTexto.textContent =
                ` ${estado}`;

        }

    }


    /* ======================================================
       9. AVISO DE SOLUCIÓN
    ====================================================== */

    function actualizarAvisoSolucion() {

        if (!avisoEvidenciaSolucion) {
            return;
        }


        const estado =
            obtenerEstadoSeleccionado();


        avisoEvidenciaSolucion.classList.toggle(
            "activo",
            estado === "Resuelta"
        );

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

                    /*
                     * Si selecciona Resuelta y todavía no existe
                     * evidencia de solución, dejamos visible
                     * inmediatamente la advertencia.
                     */

                    if (
                        obtenerEstadoSeleccionado() ===
                        "Resuelta"
                    ) {

                        validarReglaResuelta(
                            false
                        );

                    } else {

                        limpiarErrorEvidencias(
                            gestorSolucion
                        );

                    }

                }
            );

        }
    );


    /* ======================================================
       11. ERROR DE ESTADO
    ====================================================== */

    function mostrarErrorEstado(mensaje) {

        if (!contenedorEstados) {
            return;
        }


        limpiarErrorEstado();


        contenedorEstados.classList.add(
            "error"
        );


        const mensajeError =
            document.createElement(
                "div"
            );


        mensajeError.className =
            "campo-error-mensaje estado-error-mensaje";


        mensajeError.innerHTML = `
            <i class="bi bi-exclamation-circle-fill"></i>
            <span></span>
        `;


        const texto =
            mensajeError.querySelector(
                "span"
            );


        if (texto) {
            texto.textContent = mensaje;
        }


        contenedorEstados.insertAdjacentElement(
            "afterend",
            mensajeError
        );

    }


    function limpiarErrorEstado() {

        if (contenedorEstados) {

            contenedorEstados.classList.remove(
                "error"
            );

        }


        const mensaje =
            formulario.querySelector(
                ".estado-error-mensaje"
            );


        if (mensaje) {
            mensaje.remove();
        }

    }


    /* ======================================================
       12. CONTADOR DE OBSERVACIONES
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
            `${cantidad} / ${MAX_OBSERVACIONES}`;


        contadorObservaciones.classList.remove(
            "cerca-limite",
            "limite-alcanzado"
        );


        if (
            cantidad >= 800
            &&
            cantidad < MAX_OBSERVACIONES
        ) {

            contadorObservaciones.classList.add(
                "cerca-limite"
            );

        }


        if (
            cantidad >= MAX_OBSERVACIONES
        ) {

            contadorObservaciones.classList.add(
                "limite-alcanzado"
            );

        }

    }


    /* ======================================================
       13. EVENTO DE OBSERVACIONES
    ====================================================== */

    if (textareaObservaciones) {

        textareaObservaciones.addEventListener(
            "input",
            function () {

                actualizarContadorObservaciones();


                if (
                    textareaObservaciones.value.length <=
                    MAX_OBSERVACIONES
                ) {

                    limpiarErrorObservaciones();

                }

            }
        );

    }


    /* ======================================================
       14. ERROR DE OBSERVACIONES
    ====================================================== */

    function mostrarErrorObservaciones(mensaje) {

        if (!textareaObservaciones) {
            return;
        }


        const campo =
            textareaObservaciones.closest(
                ".campo-incidencia"
            );


        if (!campo) {
            return;
        }


        limpiarErrorObservaciones();


        campo.classList.add(
            "error"
        );


        const mensajeError =
            document.createElement(
                "div"
            );


        mensajeError.className =
            "campo-error-mensaje observaciones-error-mensaje";


        mensajeError.innerHTML = `
            <i class="bi bi-exclamation-circle-fill"></i>
            <span></span>
        `;


        const texto =
            mensajeError.querySelector(
                "span"
            );


        if (texto) {
            texto.textContent = mensaje;
        }


        campo.appendChild(
            mensajeError
        );

    }


    function limpiarErrorObservaciones() {

        if (textareaObservaciones) {

            const campo =
                textareaObservaciones.closest(
                    ".campo-incidencia"
                );


            if (campo) {

                campo.classList.remove(
                    "error"
                );

            }

        }


        const mensaje =
            formulario.querySelector(
                ".observaciones-error-mensaje"
            );


        if (mensaje) {
            mensaje.remove();
        }

    }


    /* ======================================================
       15. FORMATEAR PESO
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
       16. CLAVE ÚNICA DEL ARCHIVO
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
       17. VALIDAR ARCHIVO DE IMAGEN
    ====================================================== */

    function validarArchivoImagen(
        archivo,
        maxBytes,
        maxMb
    ) {

        if (!archivo) {

            return {
                valido: false,
                mensaje:
                    "No se pudo leer una de las fotografías."
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
            maxBytes
        ) {

            return {
                valido: false,
                mensaje:
                    `La fotografía "${archivo.name}" supera los ${maxMb} MB.`
            };

        }


        return {
            valido: true,
            mensaje: ""
        };

    }


    /* ======================================================
       18. CREAR GESTOR DE EVIDENCIAS
       
       Esta función controla de forma independiente:
       
       - Evidencias del problema
       - Evidencias de la solución
    ====================================================== */

    function crearGestorEvidencias(configuracion) {


        /* ==================================================
           ELEMENTOS
        ================================================== */

        const bloque =
            document.getElementById(
                configuracion.idBloque
            );

        const input =
            document.getElementById(
                configuracion.idInput
            );

        const selector =
            document.getElementById(
                configuracion.idSelector
            );

        const contadorNuevas =
            document.getElementById(
                configuracion.idContador
            );

        const btnLimpiar =
            document.getElementById(
                configuracion.idBtnLimpiar
            );

        const error =
            document.getElementById(
                configuracion.idError
            );

        const preview =
            document.getElementById(
                configuracion.idPreview
            );

        const grid =
            document.getElementById(
                configuracion.idGrid
            );


        /* ==================================================
           CONFIGURACIÓN DEL BLOQUE
        ================================================== */

        const existentes =
            Number(
                bloque?.dataset.existentes || 0
            );

        const maximo =
            Number(
                bloque?.dataset.max || 6
            );

        const maxMb =
            Number(
                bloque?.dataset.maxMb || 5
            );

        const maxBytes =
            maxMb *
            1024 *
            1024;


        /* ==================================================
           ESTADO
        ================================================== */

        let archivos =
            [];

        let urlsPreview =
            [];


        /* ==================================================
           DISPONIBLES
        ================================================== */

        function obtenerDisponibles() {

            return Math.max(
                0,
                maximo
                -
                existentes
                -
                archivos.length
            );

        }


        /* ==================================================
           TOTAL
        ================================================== */

        function obtenerTotal() {

            return (
                existentes
                +
                archivos.length
            );

        }


        /* ==================================================
           REVOCAR URLS
        ================================================== */

        function liberarUrls() {

            urlsPreview.forEach(
                function (url) {

                    URL.revokeObjectURL(
                        url
                    );

                }
            );


            urlsPreview =
                [];

        }


        /* ==================================================
           ERROR
        ================================================== */

        function mostrarError(mensaje) {

            if (!error) {
                return;
            }


            const texto =
                error.querySelector(
                    "span"
                );


            if (texto) {
                texto.textContent = mensaje;
            }


            error.hidden =
                false;


            if (selector) {

                selector.classList.add(
                    "error"
                );

            }

        }


        function limpiarError() {

            if (error) {

                error.hidden =
                    true;


                const texto =
                    error.querySelector(
                        "span"
                    );


                if (texto) {
                    texto.textContent = "";
                }

            }


            if (selector) {

                selector.classList.remove(
                    "error"
                );

            }

        }


        /* ==================================================
           SINCRONIZAR CON INPUT REAL
        ================================================== */

        function sincronizarInput() {

            if (!input) {
                return;
            }


            try {

                const transferencia =
                    new DataTransfer();


                archivos.forEach(
                    function (archivo) {

                        transferencia.items.add(
                            archivo
                        );

                    }
                );


                input.files =
                    transferencia.files;


            } catch (errorSync) {

                console.warn(
                    "No fue posible sincronizar las evidencias.",
                    errorSync
                );

            }

        }


        /* ==================================================
           ACTUALIZAR CONTADOR
        ================================================== */

        function actualizarContador() {

            if (contadorNuevas) {

                contadorNuevas.textContent =
                    archivos.length;

            }


            if (btnLimpiar) {

                btnLimpiar.hidden =
                    archivos.length === 0;

            }


            if (selector) {

                const limiteAlcanzado =
                    obtenerTotal() >= maximo;


                selector.classList.toggle(
                    "limite-alcanzado",
                    limiteAlcanzado
                );


                selector.setAttribute(
                    "aria-disabled",
                    limiteAlcanzado
                        ? "true"
                        : "false"
                );

            }

        }


        /* ==================================================
           ELIMINAR ARCHIVO
        ================================================== */

        function eliminarArchivo(clave) {

            archivos =
                archivos.filter(
                    function (archivo) {

                        return (
                            obtenerClaveArchivo(
                                archivo
                            )
                            !==
                            clave
                        );

                    }
                );


            sincronizarInput();

            limpiarError();

            renderizar();


            /*
             * Si estamos administrando soluciones y
             * el estado es Resuelta, revisamos nuevamente.
             */

            if (
                configuracion.tipo === "solucion"
                &&
                obtenerEstadoSeleccionado() ===
                "Resuelta"
            ) {

                validarReglaResuelta(
                    false
                );

            }

        }


        /* ==================================================
           CREAR TARJETA
        ================================================== */

        function crearTarjeta(
            archivo,
            indice
        ) {

            const articulo =
                document.createElement(
                    "article"
                );


            articulo.className =
                "evidencia-preview-item";


            /* =============================================
               CONTENEDOR IMAGEN
            ============================================= */

            const contenedorImagen =
                document.createElement(
                    "div"
                );


            contenedorImagen.className =
                "evidencia-preview-item-imagen";


            /* =============================================
               IMAGEN
            ============================================= */

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
                configuracion.tipo === "solucion"
                    ? `Nueva evidencia de solución ${indice + 1}`
                    : `Nueva evidencia del problema ${indice + 1}`;


            contenedorImagen.appendChild(
                imagen
            );


            /* =============================================
               NÚMERO
            ============================================= */

            const numero =
                document.createElement(
                    "span"
                );


            numero.className =
                "evidencia-preview-numero";


            numero.textContent =
                existentes + indice + 1;


            contenedorImagen.appendChild(
                numero
            );


            /* =============================================
               BADGE TIPO
            ============================================= */

            const badge =
                document.createElement(
                    "span"
                );


            badge.className =
                `evidencia-preview-tipo ${configuracion.tipo}`;


            badge.textContent =
                configuracion.tipo === "solucion"
                    ? "Solución"
                    : "Problema";


            contenedorImagen.appendChild(
                badge
            );


            /* =============================================
               BOTÓN ELIMINAR
            ============================================= */

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


            const clave =
                obtenerClaveArchivo(
                    archivo
                );


            botonEliminar.addEventListener(
                "click",
                function () {

                    eliminarArchivo(
                        clave
                    );

                }
            );


            contenedorImagen.appendChild(
                botonEliminar
            );


            /* =============================================
               INFORMACIÓN
            ============================================= */

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


            /* =============================================
               ARMAR
            ============================================= */

            articulo.appendChild(
                contenedorImagen
            );


            articulo.appendChild(
                informacion
            );


            return articulo;

        }


        /* ==================================================
           RENDERIZAR PREVIEWS
        ================================================== */

        function renderizar() {

            liberarUrls();


            if (grid) {

                grid.innerHTML =
                    "";

            }


            actualizarContador();


            if (
                archivos.length === 0
            ) {

                if (preview) {

                    preview.hidden =
                        true;

                }


                return;

            }


            if (preview) {

                preview.hidden =
                    false;

            }


            archivos.forEach(
                function (archivo, indice) {

                    if (!grid) {
                        return;
                    }


                    const tarjeta =
                        crearTarjeta(
                            archivo,
                            indice
                        );


                    grid.appendChild(
                        tarjeta
                    );

                }
            );

        }


        /* ==================================================
           AGREGAR ARCHIVOS
        ================================================== */

        function agregarArchivos(lista) {

            limpiarError();


            const nuevos =
                Array.from(
                    lista || []
                );


            if (
                nuevos.length === 0
            ) {

                return;

            }


            const claves =
                new Set(
                    archivos.map(
                        obtenerClaveArchivo
                    )
                );


            let mensajeError =
                "";


            for (
                const archivo of nuevos
            ) {


                /* =========================================
                   LÍMITE TOTAL
                ========================================= */

                if (
                    obtenerTotal() >=
                    maximo
                ) {

                    mensajeError =
                        `Esta incidencia puede tener un máximo de ${maximo} fotografías de ${configuracion.nombrePlural}.`;

                    break;

                }


                /* =========================================
                   VALIDACIÓN
                ========================================= */

                const validacion =
                    validarArchivoImagen(
                        archivo,
                        maxBytes,
                        maxMb
                    );


                if (!validacion.valido) {

                    if (!mensajeError) {

                        mensajeError =
                            validacion.mensaje;

                    }

                    continue;

                }


                /* =========================================
                   DUPLICADO
                ========================================= */

                const clave =
                    obtenerClaveArchivo(
                        archivo
                    );


                if (
                    claves.has(
                        clave
                    )
                ) {

                    if (!mensajeError) {

                        mensajeError =
                            `La fotografía "${archivo.name}" ya fue seleccionada.`;

                    }

                    continue;

                }


                /* =========================================
                   AGREGAR
                ========================================= */

                archivos.push(
                    archivo
                );


                claves.add(
                    clave
                );

            }


            sincronizarInput();

            renderizar();


            if (mensajeError) {

                mostrarError(
                    mensajeError
                );

            }


            /*
             * Si acabamos de agregar solución mientras
             * el estado está en Resuelta, quitamos la
             * advertencia cuando ya haya al menos una.
             */

            if (
                configuracion.tipo === "solucion"
                &&
                obtenerEstadoSeleccionado() ===
                "Resuelta"
            ) {

                validarReglaResuelta(
                    false
                );

            }

        }


        /* ==================================================
           INPUT CHANGE
        ================================================== */

        if (input) {

            input.addEventListener(
                "change",
                function () {

                    const seleccionados =
                        Array.from(
                            input.files || []
                        );


                    agregarArchivos(
                        seleccionados
                    );

                }
            );

        }


        /* ==================================================
           EVITAR ABRIR SELECTOR SI YA LLEGÓ AL MÁXIMO
        ================================================== */

        if (selector) {

            selector.addEventListener(
                "click",
                function (evento) {

                    if (
                        obtenerTotal() >=
                        maximo
                    ) {

                        evento.preventDefault();


                        mostrarError(
                            `Ya alcanzaste el máximo de ${maximo} fotografías de ${configuracion.nombrePlural}.`
                        );

                    }

                }
            );

        }


        /* ==================================================
           LIMPIAR NUEVAS
        ================================================== */

        function limpiarArchivos() {

            archivos =
                [];


            sincronizarInput();

            limpiarError();

            renderizar();


            if (
                configuracion.tipo === "solucion"
                &&
                obtenerEstadoSeleccionado() ===
                "Resuelta"
            ) {

                validarReglaResuelta(
                    false
                );

            }

        }


        if (btnLimpiar) {

            btnLimpiar.addEventListener(
                "click",
                function () {

                    limpiarArchivos();

                }
            );

        }


        /* ==================================================
           DRAG & DROP
        ================================================== */

        if (
            selector &&
            input
        ) {


            [
                "dragenter",
                "dragover"
            ].forEach(
                function (nombreEvento) {

                    selector.addEventListener(
                        nombreEvento,
                        function (evento) {

                            evento.preventDefault();

                            evento.stopPropagation();


                            if (
                                obtenerTotal() >=
                                maximo
                            ) {

                                return;

                            }


                            selector.classList.add(
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

                    selector.addEventListener(
                        nombreEvento,
                        function (evento) {

                            evento.preventDefault();

                            evento.stopPropagation();


                            selector.classList.remove(
                                "arrastrando"
                            );

                        }
                    );

                }
            );


            selector.addEventListener(
                "drop",
                function (evento) {

                    evento.preventDefault();

                    evento.stopPropagation();


                    selector.classList.remove(
                        "arrastrando"
                    );


                    if (
                        obtenerTotal() >=
                        maximo
                    ) {

                        mostrarError(
                            `Ya alcanzaste el máximo de ${maximo} fotografías de ${configuracion.nombrePlural}.`
                        );

                        return;

                    }


                    const archivosSoltados =
                        evento.dataTransfer?.files;


                    if (
                        !archivosSoltados ||
                        archivosSoltados.length === 0
                    ) {

                        return;

                    }


                    agregarArchivos(
                        archivosSoltados
                    );

                }
            );

        }


        /* ==================================================
           VALIDACIÓN DEL BLOQUE
        ================================================== */

        function validar() {

            limpiarError();


            if (
                obtenerTotal() >
                maximo
            ) {

                mostrarError(
                    `Solo se permiten ${maximo} fotografías de ${configuracion.nombrePlural}.`
                );

                return false;

            }


            for (
                const archivo of archivos
            ) {

                const validacion =
                    validarArchivoImagen(
                        archivo,
                        maxBytes,
                        maxMb
                    );


                if (!validacion.valido) {

                    mostrarError(
                        validacion.mensaje
                    );

                    return false;

                }

            }


            return true;

        }


        /* ==================================================
           INICIALIZAR
        ================================================== */

        function inicializar() {

            if (input) {

                archivos =
                    Array.from(
                        input.files || []
                    );

            }


            /*
             * Nunca permitimos conservar desde el navegador
             * más archivos que espacios disponibles.
             */

            const disponiblesIniciales =
                Math.max(
                    0,
                    maximo - existentes
                );


            if (
                archivos.length >
                disponiblesIniciales
            ) {

                archivos =
                    archivos.slice(
                        0,
                        disponiblesIniciales
                    );


                sincronizarInput();

            }


            renderizar();

        }


        /* ==================================================
           API PÚBLICA DEL GESTOR
        ================================================== */

        return {

            bloque:
                bloque,

            selector:
                selector,

            input:
                input,

            inicializar:
                inicializar,

            validar:
                validar,

            limpiarError:
                limpiarError,

            mostrarError:
                mostrarError,

            sincronizarInput:
                sincronizarInput,

            liberarUrls:
                liberarUrls,

            obtenerExistentes:
                function () {
                    return existentes;
                },

            obtenerNuevas:
                function () {
                    return archivos.length;
                },

            obtenerTotal:
                obtenerTotal,

            obtenerMaximo:
                function () {
                    return maximo;
                },

            obtenerDisponibles:
                obtenerDisponibles,

        };

    }


    /* ======================================================
       19. GESTOR - PROBLEMA
    ====================================================== */

    const gestorProblema =
        crearGestorEvidencias({

            idBloque:
                "bloqueEvidenciasProblema",

            idInput:
                "evidenciasProblema",

            idSelector:
                "selectorEvidenciasProblema",

            idContador:
                "contadorNuevasProblema",

            idBtnLimpiar:
                "btnLimpiarProblema",

            idError:
                "errorEvidenciasProblema",

            idPreview:
                "previewEvidenciasProblema",

            idGrid:
                "gridEvidenciasProblema",

            tipo:
                "problema",

            nombrePlural:
                "problema"

        });


    /* ======================================================
       20. GESTOR - SOLUCIÓN
    ====================================================== */

    const gestorSolucion =
        crearGestorEvidencias({

            idBloque:
                "bloqueEvidenciasSolucion",

            idInput:
                "evidenciasSolucion",

            idSelector:
                "selectorEvidenciasSolucion",

            idContador:
                "contadorNuevasSolucion",

            idBtnLimpiar:
                "btnLimpiarSolucion",

            idError:
                "errorEvidenciasSolucion",

            idPreview:
                "previewEvidenciasSolucion",

            idGrid:
                "gridEvidenciasSolucion",

            tipo:
                "solucion",

            nombrePlural:
                "solución"

        });


    /* ======================================================
       21. HELPERS DE ERROR DE EVIDENCIAS
    ====================================================== */

    function limpiarErrorEvidencias(
        gestor
    ) {

        if (!gestor) {
            return;
        }


        gestor.limpiarError();

    }


    /* ======================================================
       22. VALIDAR ESTADO
    ====================================================== */

    function validarEstado() {

        const estado =
            obtenerEstadoSeleccionado();


        if (
            !estado
            ||
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
       23. VALIDAR OBSERVACIONES
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

            mostrarErrorObservaciones(
                `Las observaciones no pueden superar los ${MAX_OBSERVACIONES} caracteres.`
            );

            return false;

        }


        limpiarErrorObservaciones();


        return true;

    }


    /* ======================================================
       24. REGLA PARA MARCAR COMO RESUELTA
       
       Debe existir al menos:
       
       - 1 solución ya guardada
       
       o
       
       - 1 nueva solución seleccionada
    ====================================================== */

    function validarReglaResuelta(
        mostrarScroll = true
    ) {

        if (
            obtenerEstadoSeleccionado() !==
            "Resuelta"
        ) {

            limpiarErrorEvidencias(
                gestorSolucion
            );

            return true;

        }


        const totalSoluciones =
            gestorSolucion
                ? gestorSolucion.obtenerTotal()
                : 0;


        if (
            totalSoluciones <= 0
        ) {

            if (gestorSolucion) {

                gestorSolucion.mostrarError(
                    "Para marcar la incidencia como Resuelta debes agregar al menos una fotografía que evidencie la solución."
                );

            }


            if (
                mostrarScroll
                &&
                gestorSolucion?.bloque
            ) {

                gestorSolucion.bloque.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }


            return false;

        }


        limpiarErrorEvidencias(
            gestorSolucion
        );


        return true;

    }


    /* ======================================================
       25. VALIDAR FORMULARIO COMPLETO
    ====================================================== */

    function validarFormulario() {

        let valido =
            true;


        limpiarErrorEstado();

        limpiarErrorObservaciones();

        limpiarErrorEvidencias(
            gestorProblema
        );

        limpiarErrorEvidencias(
            gestorSolucion
        );


        if (!validarEstado()) {

            valido =
                false;

        }


        if (!validarObservaciones()) {

            valido =
                false;

        }


        if (
            gestorProblema
            &&
            !gestorProblema.validar()
        ) {

            valido =
                false;

        }


        if (
            gestorSolucion
            &&
            !gestorSolucion.validar()
        ) {

            valido =
                false;

        }


        if (
            !validarReglaResuelta(
                false
            )
        ) {

            valido =
                false;

        }


        return valido;

    }


    /* ======================================================
       26. ENFOCAR PRIMER ERROR
    ====================================================== */

    function enfocarPrimerError() {


        /* ==================================================
           ESTADO
        ================================================== */

        const errorEstado =
            formulario.querySelector(
                ".estado-error-mensaje"
            );


        if (
            errorEstado
            &&
            contenedorEstados
        ) {

            contenedorEstados.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            return;

        }


        /* ==================================================
           OBSERVACIONES
        ================================================== */

        const campoError =
            formulario.querySelector(
                ".campo-incidencia.error"
            );


        if (campoError) {

            campoError.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });


            const elemento =
                campoError.querySelector(
                    "textarea, input, select"
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


        /* ==================================================
           PROBLEMA
        ================================================== */

        const errorProblema =
            document.getElementById(
                "errorEvidenciasProblema"
            );


        if (
            errorProblema &&
            !errorProblema.hidden
        ) {

            gestorProblema?.bloque?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            return;

        }


        /* ==================================================
           SOLUCIÓN
        ================================================== */

        const errorSolucion =
            document.getElementById(
                "errorEvidenciasSolucion"
            );


        if (
            errorSolucion &&
            !errorSolucion.hidden
        ) {

            gestorSolucion?.bloque?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }

    }


    /* ======================================================
       27. ESTADO DEL BOTÓN GUARDAR
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
                Guardando...
            </span>
        `;

    }


    /* ======================================================
       28. RESTAURAR BOTÓN
    ====================================================== */

    function restaurarBotonGuardar() {

        if (!btnGuardar) {
            return;
        }


        btnGuardar.disabled =
            false;


        btnGuardar.innerHTML = `
            <i class="bi bi-check2-circle"></i>

            <span>
                Guardar cambios
            </span>
        `;

    }


    /* ======================================================
       29. SUBMIT
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
             * Nos aseguramos de que los dos input reales
             * tengan exactamente los archivos que aparecen
             * en las vistas previas.
             */

            gestorProblema?.sincronizarInput();

            gestorSolucion?.sincronizarInput();


            activarEstadoGuardando();


            /*
             * Envío nativo.
             */

            HTMLFormElement.prototype.submit.call(
                formulario
            );

        }
    );


    /* ======================================================
       30. PAGESHOW
    ====================================================== */

    window.addEventListener(
        "pageshow",
        function () {

            restaurarBotonGuardar();


            actualizarEstadoVisual();


            actualizarContadorObservaciones();


            gestorProblema?.inicializar();

            gestorSolucion?.inicializar();

        }
    );


    /* ======================================================
       31. LIBERAR PREVIEWS
    ====================================================== */

    window.addEventListener(
        "beforeunload",
        function () {

            gestorProblema?.liberarUrls();

            gestorSolucion?.liberarUrls();

        }
    );


    /* ======================================================
       32. ESTADO INICIAL
    ====================================================== */

    actualizarEstadoVisual();


    actualizarContadorObservaciones();


    gestorProblema?.inicializar();


    gestorSolucion?.inicializar();


});