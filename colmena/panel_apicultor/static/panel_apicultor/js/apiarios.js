document.addEventListener("DOMContentLoaded", function () {

    // =========================================================
    // MIS APIARIOS
    // PANEL APICULTOR
    // =========================================================


    // =========================================================
    // CONFIGURACIÓN
    // =========================================================

    const MAX_TAMANO_MB = 5;

    const MAX_OBSERVACIONES = 1000;

    const MAX_TAMANO_BYTES =
        MAX_TAMANO_MB * 1024 * 1024;

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

    const ESTADOS_VALIDOS = [
        "Bueno",
        "Precaución",
        "Deficiente"
    ];


    // =========================================================
    // ELEMENTOS
    // =========================================================

    const botonesGestionar = document.querySelectorAll(
        "[data-editar-apiario-modal]"
    );

    const modalesEditar = document.querySelectorAll(
        ".modal-editar-apiario"
    );

    const botonesCerrarEditar = document.querySelectorAll(
        "[data-cerrar-editar-apiario]"
    );

    const formulariosEditar = document.querySelectorAll(
        ".form-editar-apiario"
    );

    const inputsImagen = document.querySelectorAll(
        ".input-imagen-apiario"
    );

    const botonesImagenApiario = document.querySelectorAll(
        ".btn-imagen-apiario"
    );


    // =========================================================
    // VISOR DE IMAGEN
    // =========================================================

    const visorImagen = document.getElementById(
        "visorImagenApiario"
    );

    const imagenVisor = document.getElementById(
        "imagenVisorApiario"
    );

    const tituloVisor = document.getElementById(
        "tituloVisorApiario"
    );

    const botonCerrarVisor = document.getElementById(
        "btnCerrarVisorApiario"
    );


    // =========================================================
    // GUARDAR ESTADO ORIGINAL DE LOS FORMULARIOS
    //
    // Esto permite que al pulsar Cancelar se restaure:
    //
    // - estado
    // - observaciones
    // - fotografía
    // =========================================================

    const estadoOriginalFormularios = new WeakMap();

    const previewOriginal = new WeakMap();

    // =========================================================
    // CONTADOR DE OBSERVACIONES
    // =========================================================

    function actualizarContadorObservaciones(
        formulario
    ) {

        const descripcion =
            formulario.querySelector(
                '[name="descripcion"]'
            );


        const contador =
            formulario.querySelector(
                "[data-contador-observaciones]"
            );


        if (
            !descripcion
            ||
            !contador
        ) {

            return;

        }


        const caracteresRestantes =
            (
                MAX_OBSERVACIONES
                -
                descripcion.value.length
            );


        contador.textContent =
            (
                caracteresRestantes
                +
                " caracteres restantes"
            );

    }


    // =========================================================
    // REGLA DINÁMICA DE OBSERVACIONES
    // =========================================================

    function actualizarReglaObservaciones(
        formulario,
        enfocar = false
    ) {

        const selectEstado =
            formulario.querySelector(
                '[name="estado"]'
            );


        const descripcion =
            formulario.querySelector(
                '[name="descripcion"]'
            );


        const mensaje =
            formulario.querySelector(
                "[data-mensaje-observaciones]"
            );


        const datosOriginales =
            estadoOriginalFormularios.get(
                formulario
            );


        if (
            !selectEstado
            ||
            !descripcion
        ) {

            return;

        }


        const estado =
            selectEstado.value.trim();


        const requiereObservaciones =
            (
                estado === "Precaución"
                ||
                estado === "Deficiente"
            );


        const cambioAEstadoAtencion =
            (
                requiereObservaciones
                &&
                datosOriginales
                &&
                estado
                !==
                datosOriginales.estado
            );


        const descripcionActual =
            descripcion.value.trim();


        const descripcionOriginal =
            (
                datosOriginales
                &&
                datosOriginales.descripcion
                    ? datosOriginales.descripcion.trim()
                    : ""
            );


        // =============================================
        // REQUIRED DINÁMICO
        // =============================================

        descripcion.required =
            requiereObservaciones;


        // =============================================
        // MENSAJE DE AYUDA
        // =============================================

        if (mensaje) {

            if (cambioAEstadoAtencion) {

                mensaje.textContent =
                    (
                        'Cambiaste el estado a "'
                        +
                        estado
                        +
                        '". Actualiza las observaciones '
                        +
                        "para indicar el motivo."
                    );

            } else if (requiereObservaciones) {

                mensaje.textContent =
                    (
                        "Las observaciones son obligatorias "
                        +
                        'mientras el apiario esté en estado "'
                        +
                        estado
                        +
                        '".'
                    );

            } else {

                mensaje.textContent =
                    (
                        "Las observaciones son opcionales "
                        +
                        "mientras el apiario esté en estado Bueno."
                    );

            }

        }


        // =============================================
        // DETERMINAR SI FALTA INFORMACIÓN
        // =============================================

        const observacionSinActualizar =
            (
                cambioAEstadoAtencion
                &&
                descripcionActual
                ===
                descripcionOriginal
            );


        const observacionInvalida =
            (
                requiereObservaciones
                &&
                (
                    !descripcionActual
                    ||
                    observacionSinActualizar
                )
            );


        descripcion.classList.toggle(
            "is-invalid",
            observacionInvalida
        );


        if (
            observacionInvalida
            &&
            enfocar
        ) {

            descripcion.focus();

        }

    }


    formulariosEditar.forEach(function (formulario) {

        const estado = formulario.querySelector(
            '[name="estado"]'
        );

        const descripcion = formulario.querySelector(
            '[name="descripcion"]'
        );

        estadoOriginalFormularios.set(
            formulario,
            {
                estado:
                    estado
                        ? estado.value
                        : "",

                descripcion:
                    descripcion
                        ? descripcion.value
                        : ""
            }
        );

        // =====================================================
        // CAMBIO DE ESTADO
        // =====================================================

        if (estado) {

            estado.addEventListener(
                "change",
                function () {

                    actualizarReglaObservaciones(
                        formulario,
                        true
                    );

                }
            );

        }


        // =====================================================
        // ESCRITURA EN OBSERVACIONES
        // =====================================================

        if (descripcion) {

            descripcion.addEventListener(
                "input",
                function () {

                    actualizarContadorObservaciones(
                        formulario
                    );


                    actualizarReglaObservaciones(
                        formulario,
                        false
                    );

                }
            );

        }


        // =====================================================
        // ESTADO INICIAL
        // =====================================================

        actualizarContadorObservaciones(
            formulario
        );


        actualizarReglaObservaciones(
            formulario,
            false
        );


        const preview = formulario.querySelector(
            ".apiario-preview-imagen"
        );

        if (preview) {

            previewOriginal.set(
                preview,
                preview.innerHTML
            );

        }

    });


    // =========================================================
    // BLOQUEO DE SCROLL DEL BODY
    // =========================================================

    function actualizarBloqueoBody() {

        const hayModalAbierto =
            document.querySelector(
                ".modal-editar-apiario.activo"
            );

        const visorAbierto =
            visorImagen
            &&
            visorImagen.classList.contains(
                "activo"
            );


        if (
            hayModalAbierto
            ||
            visorAbierto
        ) {

            document.body.classList.add(
                "modal-apiario-abierto"
            );

            document.body.style.overflow =
                "hidden";

        } else {

            document.body.classList.remove(
                "modal-apiario-abierto"
            );

            document.body.style.overflow =
                "";

        }

    }


    // =========================================================
    // ABRIR MODAL DE GESTIÓN
    // =========================================================

    function abrirModalEditar(modal) {

        if (!modal) {
            return;
        }


        modal.classList.add(
            "activo"
        );

        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        actualizarBloqueoBody();


        // ---------------------------------------------
        // ENFOCAR PRIMER CAMPO EDITABLE
        // ---------------------------------------------

        const primerCampo = modal.querySelector(
            'select[name="estado"]'
        );

        if (primerCampo) {

            setTimeout(function () {

                primerCampo.focus();

            }, 120);

        }

    }


    // =========================================================
    // RESTAURAR FORMULARIO
    // =========================================================

    function restaurarFormulario(formulario) {

        if (!formulario) {
            return;
        }


        const datosOriginales =
            estadoOriginalFormularios.get(
                formulario
            );


        // ---------------------------------------------
        // RESTAURAR ESTADO
        // ---------------------------------------------

        const selectEstado =
            formulario.querySelector(
                '[name="estado"]'
            );


        if (
            selectEstado
            &&
            datosOriginales
        ) {

            selectEstado.value =
                datosOriginales.estado;

        }


        // ---------------------------------------------
        // RESTAURAR OBSERVACIONES
        // ---------------------------------------------

        const descripcion =
            formulario.querySelector(
                '[name="descripcion"]'
            );


        if (
            descripcion
            &&
            datosOriginales
        ) {

            descripcion.value =
                datosOriginales.descripcion;

        }


        actualizarContadorObservaciones(
            formulario
        );


        actualizarReglaObservaciones(
            formulario,
            false
        );



        // ---------------------------------------------
        // LIMPIAR INPUT DE IMAGEN
        // ---------------------------------------------

        const inputImagen =
            formulario.querySelector(
                ".input-imagen-apiario"
            );


        if (inputImagen) {

            inputImagen.value = "";

        }


        // ---------------------------------------------
        // RESTAURAR PREVIEW ORIGINAL
        // ---------------------------------------------

        const preview =
            formulario.querySelector(
                ".apiario-preview-imagen"
            );


        if (preview) {

            const htmlOriginal =
                previewOriginal.get(
                    preview
                );


            if (
                typeof htmlOriginal
                ===
                "string"
            ) {

                preview.innerHTML =
                    htmlOriginal;

            }

        }


        // ---------------------------------------------
        // QUITAR ERRORES
        // ---------------------------------------------

        formulario
            .querySelectorAll(
                ".is-invalid"
            )
            .forEach(function (campo) {

                campo.classList.remove(
                    "is-invalid"
                );

            });


        // ---------------------------------------------
        // RESTAURAR BOTÓN GUARDAR
        // ---------------------------------------------

        const botonGuardar =
            formulario.querySelector(
                ".btn-guardar-apiario"
            );


        if (botonGuardar) {

            botonGuardar.disabled =
                false;

            botonGuardar.innerHTML = `
                <i class="bi bi-check-circle"></i>
                Guardar cambios
            `;

        }

    }


    // =========================================================
    // CERRAR MODAL
    // =========================================================

    function cerrarModalEditar(
        modal,
        restaurar = true
    ) {

        if (!modal) {
            return;
        }


        const formulario =
            modal.querySelector(
                ".form-editar-apiario"
            );


        if (
            restaurar
            &&
            formulario
        ) {

            restaurarFormulario(
                formulario
            );

        }


        modal.classList.remove(
            "activo"
        );

        modal.setAttribute(
            "aria-hidden",
            "true"
        );


        actualizarBloqueoBody();

    }


    // =========================================================
    // BOTONES GESTIONAR
    // =========================================================

    botonesGestionar.forEach(
        function (boton) {

            boton.addEventListener(
                "click",
                function () {

                    const idModal =
                        boton.getAttribute(
                            "data-editar-apiario-modal"
                        );


                    if (!idModal) {
                        return;
                    }


                    const modal =
                        document.getElementById(
                            idModal
                        );


                    abrirModalEditar(
                        modal
                    );

                }
            );

        }
    );


    // =========================================================
    // BOTONES CERRAR / CANCELAR
    // =========================================================

    botonesCerrarEditar.forEach(
        function (boton) {

            boton.addEventListener(
                "click",
                function () {

                    const modal =
                        boton.closest(
                            ".modal-editar-apiario"
                        );


                    cerrarModalEditar(
                        modal,
                        true
                    );

                }
            );

        }
    );


    // =========================================================
    // CERRAR AL HACER CLICK FUERA DEL MODAL
    // =========================================================

    modalesEditar.forEach(
        function (modal) {

            modal.addEventListener(
                "mousedown",
                function (evento) {

                    if (
                        evento.target
                        ===
                        modal
                    ) {

                        cerrarModalEditar(
                            modal,
                            true
                        );

                    }

                }
            );

        }
    );


    // =========================================================
    // OBTENER EXTENSIÓN
    // =========================================================

    function obtenerExtension(nombreArchivo) {

        if (!nombreArchivo) {
            return "";
        }


        const partes =
            nombreArchivo
                .toLowerCase()
                .split(".");


        if (
            partes.length
            <=
            1
        ) {

            return "";

        }


        return partes.pop();

    }


    // =========================================================
    // VALIDAR IMAGEN
    // =========================================================

    function validarImagen(archivo) {

        if (!archivo) {

            return {
                valido: true,
                mensaje: ""
            };

        }


        // ---------------------------------------------
        // ARCHIVO VACÍO
        // ---------------------------------------------

        if (
            archivo.size
            <=
            0
        ) {

            return {

                valido:
                    false,

                mensaje:
                    "La fotografía seleccionada está vacía."

            };

        }


        // ---------------------------------------------
        // TAMAÑO
        // ---------------------------------------------

        if (
            archivo.size
            >
            MAX_TAMANO_BYTES
        ) {

            return {

                valido:
                    false,

                mensaje:
                    "La fotografía no puede superar los "
                    +
                    MAX_TAMANO_MB
                    +
                    " MB."

            };

        }


        // ---------------------------------------------
        // EXTENSIÓN
        // ---------------------------------------------

        const extension =
            obtenerExtension(
                archivo.name
            );


        if (
            !EXTENSIONES_VALIDAS.includes(
                extension
            )
        ) {

            return {

                valido:
                    false,

                mensaje:
                    "Formato no permitido. Utiliza JPG, PNG o WEBP."

            };

        }


        // ---------------------------------------------
        // MIME
        // ---------------------------------------------

        if (
            archivo.type
            &&
            !TIPOS_IMAGEN_VALIDOS.includes(
                archivo.type
            )
        ) {

            return {

                valido:
                    false,

                mensaje:
                    "El archivo seleccionado no es una imagen válida."

            };

        }


        return {

            valido:
                true,

            mensaje:
                ""

        };

    }


    // =========================================================
    // MOSTRAR MENSAJE DE ERROR
    // TOAST NO BLOQUEANTE
    // =========================================================

    function mostrarError(mensaje) {

        // =====================================================
        // CONTENEDOR GLOBAL
        // =====================================================

        // =====================================================
        // MODAL ACTUALMENTE ABIERTO
        // =====================================================

        const modalActivo =
            document.querySelector(
                ".modal-editar-apiario.activo .apiario-editar-modal"
            );


        if (!modalActivo) {

            return;

        }


        // =====================================================
        // CONTENEDOR DEL TOAST DENTRO DEL MODAL
        // =====================================================

        let contenedor =
            modalActivo.querySelector(
                ".contenedor-toast-apiario"
            );


        if (!contenedor) {

            contenedor =
                document.createElement(
                    "div"
                );


            contenedor.className =
                "contenedor-toast-apiario";


            modalActivo.appendChild(
                contenedor
            );

        }


        // =====================================================
        // EVITAR ACUMULAR VARIOS AVISOS
        // =====================================================

        const toastAnterior =
            contenedor.querySelector(
                ".toast-apiario"
            );


        if (toastAnterior) {

            toastAnterior.remove();

        }


        // =====================================================
        // CREAR TOAST
        // =====================================================

        const toast =
            document.createElement(
                "div"
            );


        toast.className =
            "toast-apiario toast-apiario-warning";


        // =====================================================
        // ICONO
        // =====================================================

        const icono =
            document.createElement(
                "div"
            );


        icono.className =
            "toast-apiario-icono";


        icono.innerHTML = `
            <i class="bi bi-exclamation-triangle-fill"></i>
        `;


        // =====================================================
        // CONTENIDO
        // =====================================================

        const contenido =
            document.createElement(
                "div"
            );


        contenido.className =
            "toast-apiario-contenido";


        const titulo =
            document.createElement(
                "strong"
            );


        titulo.textContent =
            "Atención";


        const texto =
            document.createElement(
                "span"
            );


        texto.textContent =
            mensaje;


        contenido.appendChild(
            titulo
        );


        contenido.appendChild(
            texto
        );


        // =====================================================
        // BOTÓN CERRAR
        // =====================================================

        const botonCerrar =
            document.createElement(
                "button"
            );


        botonCerrar.type =
            "button";


        botonCerrar.className =
            "toast-apiario-cerrar";


        botonCerrar.setAttribute(
            "aria-label",
            "Cerrar notificación"
        );


        botonCerrar.innerHTML = `
            <i class="bi bi-x-lg"></i>
        `;


        // =====================================================
        // ARMAR TOAST
        // =====================================================

        toast.appendChild(
            icono
        );


        toast.appendChild(
            contenido
        );


        toast.appendChild(
            botonCerrar
        );


        contenedor.appendChild(
            toast
        );


        // =====================================================
        // FUNCIÓN CERRAR
        // =====================================================

        function cerrarToast() {

            if (
                !toast.isConnected
            ) {

                return;

            }


            // =============================================
            // DEJAR DE ESCUCHAR CLICS EXTERNOS
            // =============================================

            document.removeEventListener(
                "pointerdown",
                cerrarAlHacerClickFuera
            );


            // =============================================
            // ANIMACIÓN DE SALIDA
            // =============================================

            toast.classList.add(
                "toast-apiario-saliendo"
            );


            window.setTimeout(
                function () {

                    if (
                        toast.isConnected
                    ) {

                        toast.remove();

                    }


                    // =====================================
                    // ELIMINAR CONTENEDOR SI QUEDÓ VACÍO
                    // =====================================

                    if (
                        contenedor.isConnected
                        &&
                        !contenedor.querySelector(
                            ".toast-apiario"
                        )
                    ) {

                        contenedor.remove();

                    }

                },
                300
            );

        }


        // =====================================================
        // CERRAR AL HACER CLIC FUERA DEL TOAST
        // =====================================================

        function cerrarAlHacerClickFuera(
            evento
        ) {

            if (
                !toast.isConnected
            ) {

                return;

            }


            // =============================================
            // SI EL CLIC FUE DENTRO DEL TOAST,
            // NO HACEMOS NADA
            // =============================================

            if (
                toast.contains(
                    evento.target
                )
            ) {

                return;

            }


            cerrarToast();

        }


        // =====================================================
        // CERRAR MANUALMENTE CON LA X
        // =====================================================

        botonCerrar.addEventListener(
            "click",
            cerrarToast
        );


        // =====================================================
        // ACTIVAR CIERRE AL HACER CLIC FUERA
        //
        // Usamos un pequeño retraso para evitar que el mismo
        // clic que originó la notificación pueda cerrarla.
        // =====================================================

        window.setTimeout(
            function () {

                if (
                    toast.isConnected
                ) {

                    document.addEventListener(
                        "pointerdown",
                        cerrarAlHacerClickFuera
                    );

                }

            },
            50
        );


        // =====================================================
        // ANIMACIÓN DE ENTRADA
        // =====================================================

        window.setTimeout(
            function () {

                toast.classList.add(
                    "toast-apiario-visible"
                );

            },
            20
        );


        // =====================================================
        // CERRAR AUTOMÁTICAMENTE
        // 4.5 SEGUNDOS
        // =====================================================

        window.setTimeout(
            cerrarToast,
            4500
        );

    }


    // =========================================================
    // CREAR PREVIEW DE IMAGEN
    // =========================================================

    function mostrarPreview(
        input,
        archivo
    ) {

        const idPreview =
            input.getAttribute(
                "data-preview"
            );


        if (!idPreview) {
            return;
        }


        const preview =
            document.getElementById(
                idPreview
            );


        if (!preview) {
            return;
        }


        const lector =
            new FileReader();


        lector.onload =
            function (evento) {

                preview.innerHTML = `

                    <img
                        src="${evento.target.result}"
                        alt="Vista previa de la nueva fotografía"
                    >

                    <div class="apiario-preview-overlay">

                        <i class="bi bi-check-circle"></i>

                        <span>
                            Nueva fotografía seleccionada
                        </span>

                    </div>

                `;

            };


        lector.readAsDataURL(
            archivo
        );

    }


    // =========================================================
    // CAMBIO DE FOTOGRAFÍA
    // =========================================================

    inputsImagen.forEach(
        function (input) {

            input.addEventListener(
                "change",
                function () {

                    const archivo =
                        input.files
                        &&
                        input.files.length
                        >
                        0
                            ? input.files[0]
                            : null;


                    if (!archivo) {
                        return;
                    }


                    const validacion =
                        validarImagen(
                            archivo
                        );


                    if (
                        !validacion.valido
                    ) {

                        mostrarError(
                            validacion.mensaje
                        );


                        input.value =
                            "";


                        return;

                    }


                    mostrarPreview(
                        input,
                        archivo
                    );

                }
            );

        }
    );


    // =========================================================
    // VALIDAR FORMULARIO ANTES DE ENVIAR
    // =========================================================

    formulariosEditar.forEach(
        function (formulario) {

            formulario.addEventListener(
                "submit",
                function (evento) {


                    // -----------------------------------------
                    // ESTADO
                    // -----------------------------------------

                    const selectEstado =
                        formulario.querySelector(
                            '[name="estado"]'
                        );


                    const estado =
                        selectEstado
                            ? selectEstado.value.trim()
                            : "";


                    if (
                        !ESTADOS_VALIDOS.includes(
                            estado
                        )
                    ) {

                        evento.preventDefault();


                        if (selectEstado) {

                            selectEstado.classList.add(
                                "is-invalid"
                            );

                            selectEstado.focus();

                        }


                        mostrarError(
                            "Selecciona un estado válido para el apiario."
                        );


                        return;

                    }


                    if (selectEstado) {

                        selectEstado.classList.remove(
                            "is-invalid"
                        );

                    }


                    // -----------------------------------------
                    // OBSERVACIONES
                    // -----------------------------------------

                    const descripcion =
                        formulario.querySelector(
                            '[name="descripcion"]'
                        );


                    if (descripcion) {

                        descripcion.value =
                            descripcion.value.trim();


                        // =====================================
                        // MÁXIMO 1000 CARACTERES
                        // =====================================

                        if (
                            descripcion.value.length
                            >
                            MAX_OBSERVACIONES
                        ) {

                            evento.preventDefault();


                            descripcion.classList.add(
                                "is-invalid"
                            );


                            descripcion.focus();


                            mostrarError(
                                "Las observaciones no pueden superar "
                                +
                                MAX_OBSERVACIONES
                                +
                                " caracteres."
                            );


                            return;

                        }


                        // =====================================
                        // OBLIGATORIAS SEGÚN EL ESTADO
                        // =====================================

                        const datosOriginales =
                            estadoOriginalFormularios.get(
                                formulario
                            );


                        const requiereObservaciones =
                            (
                                estado === "Precaución"
                                ||
                                estado === "Deficiente"
                            );


                        const descripcionActual =
                            descripcion.value.trim();


                        const descripcionOriginal =
                            (
                                datosOriginales
                                &&
                                datosOriginales.descripcion
                                    ? datosOriginales.descripcion.trim()
                                    : ""
                            );


                        const cambioAEstadoAtencion =
                            (
                                requiereObservaciones
                                &&
                                datosOriginales
                                &&
                                estado
                                !==
                                datosOriginales.estado
                            );


                        if (
                            requiereObservaciones
                            &&
                            !descripcionActual
                        ) {

                            evento.preventDefault();


                            descripcion.classList.add(
                                "is-invalid"
                            );


                            descripcion.focus();


                            mostrarError(
                                "Debes indicar en las observaciones "
                                +
                                "el motivo por el que el apiario está "
                                +
                                'en estado "'
                                +
                                estado
                                +
                                '".'
                            );


                            return;

                        }


                        // =====================================
                        // AL CAMBIAR EL ESTADO DE ATENCIÓN,
                        // LA OBSERVACIÓN TAMBIÉN DEBE CAMBIAR
                        // =====================================

                        if (
                            cambioAEstadoAtencion
                            &&
                            descripcionActual
                            ===
                            descripcionOriginal
                        ) {

                            evento.preventDefault();


                            descripcion.classList.add(
                                "is-invalid"
                            );


                            descripcion.focus();


                            mostrarError(
                                'Cambiaste el estado a "'
                                +
                                estado
                                +
                                '". Actualiza también las '
                                +
                                "observaciones indicando el motivo."
                            );


                            return;

                        }

                        descripcion.classList.remove(
                            "is-invalid"
                        );

                    }


                    // -----------------------------------------
                    // FOTOGRAFÍA
                    // -----------------------------------------

                    const inputImagen =
                        formulario.querySelector(
                            ".input-imagen-apiario"
                        );


                    if (
                        inputImagen
                        &&
                        inputImagen.files
                        &&
                        inputImagen.files.length
                        >
                        0
                    ) {

                        const archivo =
                            inputImagen.files[0];


                        const validacion =
                            validarImagen(
                                archivo
                            );


                        if (
                            !validacion.valido
                        ) {

                            evento.preventDefault();


                            inputImagen.classList.add(
                                "is-invalid"
                            );


                            mostrarError(
                                validacion.mensaje
                            );


                            return;

                        }

                    }


                    // -----------------------------------------
                    // EVITAR DOBLE ENVÍO
                    // -----------------------------------------

                    const botonGuardar =
                        formulario.querySelector(
                            ".btn-guardar-apiario"
                        );


                    if (botonGuardar) {

                        botonGuardar.disabled =
                            true;

                        botonGuardar.innerHTML = `

                            <span
                                class="spinner-border spinner-border-sm"
                                aria-hidden="true"
                            ></span>

                            Guardando...

                        `;

                    }

                }
            );

        }
    );


    // =========================================================
    // ABRIR VISOR DE FOTOGRAFÍA
    // =========================================================

    function abrirVisor(
        urlImagen,
        titulo
    ) {

        if (
            !visorImagen
            ||
            !imagenVisor
        ) {

            return;

        }


        if (!urlImagen) {
            return;
        }


        imagenVisor.src =
            urlImagen;


        imagenVisor.alt =
            titulo
                ? "Fotografía de " + titulo
                : "Fotografía del apiario";


        if (tituloVisor) {

            tituloVisor.textContent =
                titulo || "Apiario";

        }


        visorImagen.classList.add(
            "activo"
        );

        visorImagen.setAttribute(
            "aria-hidden",
            "false"
        );


        actualizarBloqueoBody();

    }


    // =========================================================
    // CERRAR VISOR
    // =========================================================

    function cerrarVisor() {

        if (!visorImagen) {
            return;
        }


        visorImagen.classList.remove(
            "activo"
        );

        visorImagen.setAttribute(
            "aria-hidden",
            "true"
        );


        if (imagenVisor) {

            setTimeout(
                function () {

                    if (
                        !visorImagen.classList.contains(
                            "activo"
                        )
                    ) {

                        imagenVisor.src =
                            "";

                    }

                },
                200
            );

        }


        actualizarBloqueoBody();

    }


    // =========================================================
    // FOTOGRAFÍAS DE LAS TARJETAS
    // =========================================================

    botonesImagenApiario.forEach(
        function (boton) {

            boton.addEventListener(
                "click",
                function () {

                    const imagen =
                        boton.getAttribute(
                            "data-imagen-apiario"
                        );

                    const titulo =
                        boton.getAttribute(
                            "data-imagen-titulo"
                        );


                    abrirVisor(
                        imagen,
                        titulo
                    );

                }
            );

        }
    );


    // =========================================================
    // FOTOGRAFÍA DEL PREVIEW DEL MODAL
    //
    // Delegación de eventos porque la imagen puede cambiar
    // cuando se selecciona una nueva.
    // =========================================================

    document.addEventListener(
        "click",
        function (evento) {

            const imagenPreview =
                evento.target.closest(
                    ".apiario-preview-imagen img"
                );


            if (!imagenPreview) {
                return;
            }


            const modal =
                imagenPreview.closest(
                    ".modal-editar-apiario"
                );


            let titulo =
                "Apiario";


            if (modal) {

                const tituloModal =
                    modal.querySelector(
                        ".apiario-editar-header h2"
                    );


                if (tituloModal) {

                    titulo =
                        tituloModal.textContent.trim();

                }

            }


            abrirVisor(
                imagenPreview.src,
                titulo
            );

        }
    );


    // =========================================================
    // BOTÓN CERRAR VISOR
    // =========================================================

    if (botonCerrarVisor) {

        botonCerrarVisor.addEventListener(
            "click",
            function () {

                cerrarVisor();

            }
        );

    }


    // =========================================================
    // CERRAR VISOR AL HACER CLICK EN EL FONDO
    // =========================================================

    if (visorImagen) {

        visorImagen.addEventListener(
            "mousedown",
            function (evento) {

                if (
                    evento.target
                    ===
                    visorImagen
                ) {

                    cerrarVisor();

                }

            }
        );

    }


    // =========================================================
    // TECLA ESC
    // =========================================================

    document.addEventListener(
        "keydown",
        function (evento) {

            if (
                evento.key
                !==
                "Escape"
            ) {

                return;

            }


            // ---------------------------------------------
            // PRIMERO CERRAMOS VISOR
            // ---------------------------------------------

            if (
                visorImagen
                &&
                visorImagen.classList.contains(
                    "activo"
                )
            ) {

                cerrarVisor();

                return;

            }


            // ---------------------------------------------
            // DESPUÉS MODAL
            // ---------------------------------------------

            const modalAbierto =
                document.querySelector(
                    ".modal-editar-apiario.activo"
                );


            if (modalAbierto) {

                cerrarModalEditar(
                    modalAbierto,
                    true
                );

            }

        }
    );


    // =========================================================
    // SELECT DE FILTRO
    //
    // Al cambiar estado no lo enviamos automáticamente.
    // Conservamos el funcionamiento del botón "Filtrar".
    // =========================================================

    const formularioFiltros =
        document.querySelector(
            ".apiarios-form-filtros"
        );


    if (formularioFiltros) {

        formularioFiltros.addEventListener(
            "submit",
            function () {

                const buscador =
                    formularioFiltros.querySelector(
                        'input[name="q"]'
                    );


                if (buscador) {

                    buscador.value =
                        buscador.value.trim();

                }

            }
        );

    }


    // =========================================================
    // ENTER EN BUSCADOR
    // =========================================================

    const buscadorApiarios =
        document.querySelector(
            '.apiarios-buscador input[name="q"]'
        );


    if (
        buscadorApiarios
        &&
        formularioFiltros
    ) {

        buscadorApiarios.addEventListener(
            "keydown",
            function (evento) {

                if (
                    evento.key
                    ===
                    "Enter"
                ) {

                    evento.preventDefault();

                    buscadorApiarios.value =
                        buscadorApiarios.value.trim();


                    formularioFiltros.requestSubmit();

                }

            }
        );

    }


    // =========================================================
    // PAGESHOW
    //
    // Importante cuando el navegador regresa con botón Atrás.
    // =========================================================

    window.addEventListener(
        "pageshow",
        function () {


            // ---------------------------------------------
            // CERRAR MODALES
            // ---------------------------------------------

            modalesEditar.forEach(
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


            // ---------------------------------------------
            // CERRAR VISOR
            // ---------------------------------------------

            if (visorImagen) {

                visorImagen.classList.remove(
                    "activo"
                );

                visorImagen.setAttribute(
                    "aria-hidden",
                    "true"
                );

            }


            // ---------------------------------------------
            // RESTAURAR BOTONES
            // ---------------------------------------------

            formulariosEditar.forEach(
                function (formulario) {

                    const botonGuardar =
                        formulario.querySelector(
                            ".btn-guardar-apiario"
                        );


                    if (botonGuardar) {

                        botonGuardar.disabled =
                            false;

                        botonGuardar.innerHTML = `

                            <i class="bi bi-check-circle"></i>

                            Guardar cambios

                        `;

                    }

                }
            );


            // ---------------------------------------------
            // BODY
            // ---------------------------------------------

            document.body.style.overflow =
                "";

            document.body.classList.remove(
                "modal-apiario-abierto"
            );

        }
    );


});