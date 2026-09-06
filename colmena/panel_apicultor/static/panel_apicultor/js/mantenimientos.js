/* ==========================================================
   ==========================================================
   MANTENIMIENTOS - PANEL APICULTOR
   ==========================================================
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {


    /* ======================================================
       ======================================================
       1. CONFIGURACIÓN
       ======================================================
       ====================================================== */

    const MAX_EVIDENCIAS = 6;

    const MAX_TAMANO_MB = 5;

    const MAX_TAMANO_BYTES =
        MAX_TAMANO_MB
        *
        1024
        *
        1024;


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



    /* ======================================================
       ======================================================
       2. ELEMENTOS - DETALLE
       ======================================================
       ====================================================== */

    const botonesAbrirDetalle =
        document.querySelectorAll(
            "[data-modal-mantenimiento]"
        );


    const botonesCerrarDetalle =
        document.querySelectorAll(
            "[data-cerrar-modal-mantenimiento]"
        );


    const modalesDetalle =
        document.querySelectorAll(
            ".mantenimiento-modal-overlay"
        );



    /* ======================================================
       ======================================================
       3. ELEMENTOS - CREAR
       ======================================================
       ====================================================== */

    const botonAbrirCrear =
        document.getElementById(
            "btnAbrirCrearMantenimiento"
        );


    const modalCrear =
        document.getElementById(
            "modalCrearMantenimiento"
        );


    const formularioCrear =
        document.getElementById(
            "formCrearMantenimiento"
        );


    const botonesCerrarCrear =
        document.querySelectorAll(
            "[data-cerrar-crear-mantenimiento]"
        );


    const apiarioCrear =
        document.getElementById(
            "apiarioCrearMantenimiento"
        );


    const colmenaCrear =
        document.getElementById(
            "colmenaCrearMantenimiento"
        );


    const campoColmenaCrear =
        document.getElementById(
            "campoColmenaCrearMantenimiento"
        );


    const radiosAlcanceCrear =
        document.querySelectorAll(
            ".alcance-mantenimiento-radio-apicultor"
        );


    const fechaCrear =
        document.getElementById(
            "fechaCrearMantenimiento"
        );



    /* ======================================================
       ======================================================
       4. ELEMENTOS - EDITAR
       ======================================================
       ====================================================== */

    const botonesAbrirEditar =
        document.querySelectorAll(
            "[data-modal-editar-mantenimiento]"
        );


    const modalesEditar =
        document.querySelectorAll(
            ".modal-editar-mantenimiento-apicultor"
        );


    const botonesCerrarEditar =
        document.querySelectorAll(
            "[data-cerrar-editar-mantenimiento]"
        );



    /* ======================================================
       ======================================================
       5. ELEMENTOS - COMPLETAR
       ======================================================
       ====================================================== */

    const formulariosCompletar =
        document.querySelectorAll(
            ".form-completar-mantenimiento, .form-completar-modal"
        );


    const modalConfirmarCompletado =
        document.getElementById(
            "modalConfirmarCompletado"
        );


    const botonCancelarCompletado =
        document.getElementById(
            "btnCancelarCompletado"
        );


    const botonConfirmarCompletado =
        document.getElementById(
            "btnConfirmarCompletado"
        );


    const textoNombreMantenimiento =
        document.getElementById(
            "confirmarNombreMantenimiento"
        );


    const textoUbicacionMantenimiento =
        document.getElementById(
            "confirmarColmenaMantenimiento"
        );



    /* ======================================================
       ======================================================
       6. ELEMENTOS - OBSERVACIONES
       ======================================================
       ====================================================== */

    const botonesEditarObservacion =
        document.querySelectorAll(
            "[data-editar-observacion]"
        );


    const botonesCancelarObservacion =
        document.querySelectorAll(
            "[data-cancelar-observacion]"
        );


    const formulariosObservacion =
        document.querySelectorAll(
            ".form-editar-observacion"
        );



    /* ======================================================
       ======================================================
       7. ELEMENTOS - VISOR
       ======================================================
       ====================================================== */

    const visorEvidencia =
        document.getElementById(
            "visorEvidenciaMantenimiento"
        );


    const imagenVisor =
        document.getElementById(
            "imagenVisorMantenimiento"
        );


    const botonCerrarVisor =
        document.getElementById(
            "btnCerrarVisorMantenimiento"
        );


    const botonesImagenEvidencia =
        document.querySelectorAll(
            "[data-imagen-evidencia]"
        );



    /* ======================================================
       ======================================================
       8. ELEMENTOS - FILTROS
       ======================================================
       ====================================================== */

    const formularioFiltros =
        document.querySelector(
            ".mantenimientos-form-filtros"
        );


    const buscador =
        document.querySelector(
            ".mantenimientos-buscador input"
        );


    const selectsFiltros =
        document.querySelectorAll(
            ".mantenimientos-select"
        );



    /* ======================================================
       ======================================================
       9. ESTADO INTERNO
       ======================================================
       ====================================================== */

    let modalDetalleActivo = null;

    let botonAbrioDetalle = null;


    let modalEditarActivo = null;

    let botonAbrioEditar = null;


    let formularioCompletarActivo = null;

    let botonCompletarOrigen = null;


    let elementoFocoAntesValidacion = null;

    let elementoFocoAntesVisor = null;



    /* ======================================================
       ======================================================
       10. UTILIDADES GENERALES
       ======================================================
       ====================================================== */

    function bloquearScroll() {

        document.body.classList.add(
            "modal-mantenimiento-abierto"
        );

    }



    function existeModalAbierto() {

        const detalle =
            document.querySelector(
                ".mantenimiento-modal-overlay.activo"
            );


        const crear = (
            modalCrear
            &&
            modalCrear.classList.contains(
                "activo"
            )
        );


        const editar =
            document.querySelector(
                ".modal-editar-mantenimiento-apicultor.activo"
            );


        const completar = (
            modalConfirmarCompletado
            &&
            modalConfirmarCompletado
                .classList
                .contains(
                    "activo"
                )
        );


        const visor = (
            visorEvidencia
            &&
            visorEvidencia
                .classList
                .contains(
                    "activo"
                )
        );


        const validacion =
            document.querySelector(
                "#modalValidacionMantenimientoApicultor.activo"
            );


        return Boolean(
            detalle
            ||
            crear
            ||
            editar
            ||
            completar
            ||
            visor
            ||
            validacion
        );

    }



    function restaurarScroll() {

        if (!existeModalAbierto()) {

            document.body.classList.remove(
                "modal-mantenimiento-abierto"
            );

        }

    }



    function obtenerFechaHoy() {

        const fecha =
            new Date();


        const anio =
            fecha.getFullYear();


        const mes =
            String(
                fecha.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const dia =
            String(
                fecha.getDate()
            ).padStart(
                2,
                "0"
            );


        return (
            `${anio}-${mes}-${dia}`
        );

    }



    const fechaHoy =
        obtenerFechaHoy();



    /* ======================================================
       ======================================================
       11. VENTANA EMERGENTE DE VALIDACIÓN
       ======================================================
       ====================================================== */

    function obtenerModalValidacion() {

        let modal =
            document.getElementById(
                "modalValidacionMantenimientoApicultor"
            );


        if (modal) {

            return modal;

        }


        modal =
            document.createElement(
                "div"
            );


        modal.id =
            "modalValidacionMantenimientoApicultor";


        modal.className =
            "confirmar-completado-overlay";


        modal.setAttribute(
            "aria-hidden",
            "true"
        );


        modal.innerHTML = `

            <div
                class="confirmar-completado-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="tituloValidacionMantenimientoApicultor"
            >

                <div
                    class="confirmar-completado-icono"
                    style="
                        background: #FFF0BE;
                        color: #896817;
                    "
                >

                    <i class="bi bi-exclamation-triangle-fill"></i>

                </div>


                <div class="confirmar-completado-contenido">

                    <span class="confirmar-completado-etiqueta">
                        Revisa la información
                    </span>


                    <h2
                        id="tituloValidacionMantenimientoApicultor"
                    >
                        Hay un detalle por corregir
                    </h2>


                    <p
                        id="mensajeValidacionMantenimientoApicultor"
                        style="white-space: pre-line;"
                    >
                    </p>

                </div>


                <div class="confirmar-completado-acciones">

                    <button
                        type="button"
                        class="btn-confirmar-completado"
                        id="btnCerrarValidacionMantenimientoApicultor"
                        style="grid-column: 1 / -1;"
                    >

                        <i class="bi bi-check-lg"></i>

                        <span>
                            Entendido
                        </span>

                    </button>

                </div>

            </div>
        `;


        document.body.appendChild(
            modal
        );


        const botonCerrar =
            modal.querySelector(
                "#btnCerrarValidacionMantenimientoApicultor"
            );


        if (botonCerrar) {

            botonCerrar.addEventListener(
                "click",
                cerrarValidacion
            );

        }


        modal.addEventListener(
            "click",
            function (evento) {

                if (
                    evento.target
                    ===
                    modal
                ) {

                    cerrarValidacion();

                }

            }
        );


        return modal;

    }



    function mostrarValidacion(
        mensaje,
        titulo = "Hay un detalle por corregir"
    ) {

        const modal =
            obtenerModalValidacion();


        elementoFocoAntesValidacion =
            document.activeElement;


        const tituloElemento =
            modal.querySelector(
                "#tituloValidacionMantenimientoApicultor"
            );


        const mensajeElemento =
            modal.querySelector(
                "#mensajeValidacionMantenimientoApicultor"
            );


        if (tituloElemento) {

            tituloElemento.textContent =
                titulo;

        }


        if (mensajeElemento) {

            mensajeElemento.textContent =
                mensaje;

        }


        modal.classList.add(
            "activo"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        bloquearScroll();


        const boton =
            modal.querySelector(
                "#btnCerrarValidacionMantenimientoApicultor"
            );


        if (boton) {

            setTimeout(
                function () {

                    boton.focus();

                },
                70
            );

        }

    }



    function cerrarValidacion() {

        const modal =
            document.getElementById(
                "modalValidacionMantenimientoApicultor"
            );


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


        restaurarScroll();


        if (
            elementoFocoAntesValidacion
            &&
            document.body.contains(
                elementoFocoAntesValidacion
            )
        ) {

            elementoFocoAntesValidacion.focus();

        }


        elementoFocoAntesValidacion =
            null;

    }



    /* ======================================================
       ======================================================
       12. UTILIDADES DE EVIDENCIAS
       ======================================================
       ====================================================== */

    function obtenerExtensionArchivo(
        nombre
    ) {

        if (!nombre) {

            return "";

        }


        const partes =
            nombre
            .toLowerCase()
            .split(".");


        if (
            partes.length
            <
            2
        ) {

            return "";

        }


        return partes[
            partes.length - 1
        ];

    }



    function obtenerInputsEvidencias(
        formulario
    ) {

        if (!formulario) {

            return [];

        }


        return Array.from(
            formulario.querySelectorAll(
                ".mantenimiento-input-evidencias"
            )
        );

    }



    function obtenerArchivosNuevos(
        formulario
    ) {

        const archivos = [];


        obtenerInputsEvidencias(
            formulario
        ).forEach(
            function (input) {

                Array.from(
                    input.files || []
                ).forEach(
                    function (archivo) {

                        archivos.push({
                            archivo: archivo,
                            input: input
                        });

                    }
                );

            }
        );


        return archivos;

    }



    function contarEvidenciasExistentes(
        formulario
    ) {

        if (
            !formulario
            ||
            !formulario.classList.contains(
                "form-editar-mantenimiento-apicultor"
            )
        ) {

            return 0;

        }


        return formulario.querySelectorAll(
            ".mantenimiento-editar-evidencias-existentes .mantenimiento-evidencia-item"
        ).length;

    }



    function limpiarErroresEvidencias(
        formulario
    ) {

        obtenerInputsEvidencias(
            formulario
        ).forEach(
            function (input) {

                input.classList.remove(
                    "is-invalid"
                );

            }
        );

    }



    function validarArchivoImagen(
        archivo
    ) {

        if (!archivo) {

            return (
                "No se pudo leer una de las fotografías seleccionadas."
            );

        }


        if (
            archivo.size
            <=
            0
        ) {

            return (
                `La fotografía "${archivo.name}" está vacía.`
            );

        }


        if (
            archivo.size
            >
            MAX_TAMANO_BYTES
        ) {

            return (
                `La fotografía "${archivo.name}" supera `
                +
                `el límite de ${MAX_TAMANO_MB} MB.`
            );

        }


        const extension =
            obtenerExtensionArchivo(
                archivo.name
            );


        const tipo =
            archivo.type
            ?
            archivo.type.toLowerCase()
            :
            "";


        const extensionValida =
            EXTENSIONES_VALIDAS.includes(
                extension
            );


        const tipoValido = (
            !tipo
            ||
            TIPOS_IMAGEN_VALIDOS.includes(
                tipo
            )
        );


        if (
            !extensionValida
            ||
            !tipoValido
        ) {

            return (
                `La fotografía "${archivo.name}" tiene `
                +
                "un formato no permitido.\n\n"
                +
                "Utiliza JPG, JPEG, PNG o WEBP."
            );

        }


        return null;

    }



    function validarEvidencias(
        formulario
    ) {

        limpiarErroresEvidencias(
            formulario
        );


        const archivos =
            obtenerArchivosNuevos(
                formulario
            );


        const existentes =
            contarEvidenciasExistentes(
                formulario
            );


        const nuevas =
            archivos.length;


        const total =
            existentes
            +
            nuevas;


        /* ==================================================
           MÁXIMO 6
        ================================================== */

        if (
            total
            >
            MAX_EVIDENCIAS
        ) {

            obtenerInputsEvidencias(
                formulario
            ).forEach(
                function (input) {

                    if (
                        input.files
                        &&
                        input.files.length
                    ) {

                        input.classList.add(
                            "is-invalid"
                        );

                    }

                }
            );


            const disponibles =
                Math.max(
                    0,
                    MAX_EVIDENCIAS
                    -
                    existentes
                );


            return {

                valido: false,

                mensaje:
                    "Cada mantenimiento puede tener máximo "
                    +
                    `${MAX_EVIDENCIAS} fotografías en total.\n\n`
                    +
                    `Fotografías guardadas: ${existentes}\n`
                    +
                    `Fotografías nuevas: ${nuevas}\n`
                    +
                    `Puedes agregar máximo ${disponibles} más.`

            };

        }



        /* ==================================================
           FORMATO Y TAMAÑO
        ================================================== */

        for (
            const elemento
            of
            archivos
        ) {

            const error =
                validarArchivoImagen(
                    elemento.archivo
                );


            if (error) {

                elemento.input.classList.add(
                    "is-invalid"
                );


                return {
                    valido: false,
                    mensaje: error
                };

            }

        }



        /* ==================================================
           DUPLICADOS
        ================================================== */

        const vistos =
            new Set();


        for (
            const elemento
            of
            archivos
        ) {

            const archivo =
                elemento.archivo;


            const clave =
                archivo.name.toLowerCase()
                +
                "|"
                +
                archivo.size
                +
                "|"
                +
                archivo.lastModified;


            if (
                vistos.has(
                    clave
                )
            ) {

                elemento.input.classList.add(
                    "is-invalid"
                );


                return {

                    valido: false,

                    mensaje:
                        `La fotografía "${archivo.name}" `
                        +
                        "fue seleccionada más de una vez."

                };

            }


            vistos.add(
                clave
            );

        }


        return {
            valido: true,
            mensaje: ""
        };

    }



    /* ======================================================
       ======================================================
       13. MODAL CREAR
       ======================================================
       ====================================================== */

    function obtenerAlcanceCrear() {

        if (!formularioCrear) {

            return "";

        }


        const radio =
            formularioCrear.querySelector(
                ".alcance-mantenimiento-radio-apicultor:checked"
            );


        return radio
            ?
            radio.value
            :
            "";

    }



    function filtrarColmenasCrear() {

        if (
            !apiarioCrear
            ||
            !colmenaCrear
            ||
            !campoColmenaCrear
        ) {

            return;

        }


        const alcance =
            obtenerAlcanceCrear();


        const idApiario =
            apiarioCrear.value;


        if (
            alcance
            !==
            "Colmena"
        ) {

            campoColmenaCrear.classList.add(
                "d-none"
            );


            colmenaCrear.required =
                false;


            colmenaCrear.value =
                "";


            return;

        }


        campoColmenaCrear.classList.remove(
            "d-none"
        );


        colmenaCrear.required =
            true;


        Array.from(
            colmenaCrear.options
        ).forEach(
            function (opcion) {


                if (!opcion.value) {

                    opcion.hidden =
                        false;

                    opcion.disabled =
                        false;

                    return;

                }


                const corresponde = (
                    idApiario
                    &&
                    opcion.dataset.apiario
                    ===
                    idApiario
                );


                opcion.hidden =
                    !corresponde;


                opcion.disabled =
                    !corresponde;

            }
        );


        const seleccionada =
            colmenaCrear.options[
                colmenaCrear.selectedIndex
            ];


        if (
            seleccionada
            &&
            seleccionada.value
            &&
            seleccionada.dataset.apiario
            !==
            idApiario
        ) {

            colmenaCrear.value =
                "";

        }

    }



    function abrirModalCrear() {

        if (!modalCrear) {

            return;

        }


        filtrarColmenasCrear();


        modalCrear.classList.add(
            "activo"
        );


        modalCrear.setAttribute(
            "aria-hidden",
            "false"
        );


        bloquearScroll();


        const body =
            modalCrear.querySelector(
                ".mantenimiento-form-body"
            );


        if (body) {

            body.scrollTop =
                0;

        }


        setTimeout(
            function () {

                if (apiarioCrear) {

                    apiarioCrear.focus();

                }

            },
            80
        );

    }



    function cerrarModalCrear() {

        if (!modalCrear) {

            return;

        }


        modalCrear.classList.remove(
            "activo"
        );


        modalCrear.setAttribute(
            "aria-hidden",
            "true"
        );


        restaurarScroll();


        if (botonAbrirCrear) {

            botonAbrirCrear.focus();

        }

    }



    if (
        botonAbrirCrear
        &&
        modalCrear
    ) {

        botonAbrirCrear.addEventListener(
            "click",
            abrirModalCrear
        );

    }



    botonesCerrarCrear.forEach(
        function (boton) {

            boton.addEventListener(
                "click",
                cerrarModalCrear
            );

        }
    );



    if (modalCrear) {

        modalCrear.addEventListener(
            "click",
            function (evento) {

                if (
                    evento.target
                    ===
                    modalCrear
                ) {

                    cerrarModalCrear();

                }

            }
        );

    }



    if (apiarioCrear) {

        apiarioCrear.addEventListener(
            "change",
            function () {

                if (colmenaCrear) {

                    colmenaCrear.value =
                        "";

                }


                filtrarColmenasCrear();

            }
        );

    }



    radiosAlcanceCrear.forEach(
        function (radio) {

            radio.addEventListener(
                "change",
                function () {

                    if (colmenaCrear) {

                        colmenaCrear.value =
                            "";

                    }


                    filtrarColmenasCrear();

                }
            );

        }
    );



    /* ======================================================
       ======================================================
       14. VALIDAR FORMULARIO CREAR
       ======================================================
       ====================================================== */

    if (fechaCrear) {

        fechaCrear.min =
            fechaHoy;

    }



    if (formularioCrear) {

        formularioCrear.addEventListener(
            "submit",
            function (evento) {


                /* ==========================================
                   TAREA
                ========================================== */

                const tipo =
                    formularioCrear.querySelector(
                        'input[name="tipo"]'
                    );


                if (tipo) {

                    tipo.value =
                        tipo.value.trim();


                    if (!tipo.value) {

                        evento.preventDefault();


                        tipo.classList.add(
                            "is-invalid"
                        );


                        mostrarValidacion(
                            "Debes indicar la tarea que se realizará."
                        );


                        tipo.focus();

                        return;

                    }


                    tipo.classList.remove(
                        "is-invalid"
                    );

                }



                /* ==========================================
                   APIARIO
                ========================================== */

                if (
                    !apiarioCrear
                    ||
                    !apiarioCrear.value
                ) {

                    evento.preventDefault();


                    if (apiarioCrear) {

                        apiarioCrear.classList.add(
                            "is-invalid"
                        );

                    }


                    mostrarValidacion(
                        "Debes seleccionar uno de tus apiarios."
                    );


                    return;

                }


                apiarioCrear.classList.remove(
                    "is-invalid"
                );



                /* ==========================================
                   COLMENA
                ========================================== */

                if (
                    obtenerAlcanceCrear()
                    ===
                    "Colmena"
                ) {

                    if (
                        !colmenaCrear
                        ||
                        !colmenaCrear.value
                    ) {

                        evento.preventDefault();


                        if (colmenaCrear) {

                            colmenaCrear.classList.add(
                                "is-invalid"
                            );

                        }


                        mostrarValidacion(
                            "Seleccionaste mantenimiento de una colmena.\n\nDebes elegir la colmena correspondiente."
                        );


                        return;

                    }


                    colmenaCrear.classList.remove(
                        "is-invalid"
                    );

                }



                /* ==========================================
                   FECHA
                ========================================== */

                if (
                    !fechaCrear
                    ||
                    !fechaCrear.value
                    ||
                    fechaCrear.value
                    <
                    fechaHoy
                ) {

                    evento.preventDefault();


                    if (fechaCrear) {

                        fechaCrear.classList.add(
                            "is-invalid"
                        );

                    }


                    mostrarValidacion(
                        "La fecha programada no puede ser anterior a hoy."
                    );


                    return;

                }


                fechaCrear.classList.remove(
                    "is-invalid"
                );



                /* ==========================================
                   EVIDENCIAS
                ========================================== */

                const resultado =
                    validarEvidencias(
                        formularioCrear
                    );


                if (!resultado.valido) {

                    evento.preventDefault();


                    mostrarValidacion(
                        resultado.mensaje
                    );


                    return;

                }



                /* ==========================================
                   ENVIANDO
                ========================================== */

                const boton =
                    formularioCrear.querySelector(
                        ".btn-guardar-form-mantenimiento"
                    );


                if (boton) {

                    boton.disabled =
                        true;


                    boton.innerHTML = `

                        <span>
                            Registrando...
                        </span>
                    `;

                }

            }
        );

    }



    /* ======================================================
       ======================================================
       15. MODALES EDITAR
       ======================================================
       ====================================================== */

    function configurarFormularioEditar(
        modal
    ) {

        if (!modal) {

            return;

        }


        const formulario =
            modal.querySelector(
                ".form-editar-mantenimiento-apicultor"
            );


        const radiosEntidad =
            modal.querySelectorAll(
                ".entidad-editar-mantenimiento"
            );


        const apiario =
            modal.querySelector(
                ".apiario-editar-mantenimiento"
            );


        const colmena =
            modal.querySelector(
                ".colmena-editar-mantenimiento"
            );


        const campoColmena =
            modal.querySelector(
                ".campo-colmena-editar-mantenimiento"
            );


        const fecha =
            modal.querySelector(
                ".fecha-editar-mantenimiento"
            );


        if (!formulario) {

            return;

        }



        /* ==================================================
           FECHA ORIGINAL
        ================================================== */

        if (fecha) {

            fecha.dataset.fechaOriginal =
                fecha.value;


            if (
                fecha.value
                &&
                fecha.value
                <
                fechaHoy
            ) {

                fecha.readOnly =
                    true;


                fecha.title =
                    "La fecha ya venció y debe conservarse.";

            } else {

                fecha.min =
                    fechaHoy;

            }

        }



        /* ==================================================
           ACTUALIZAR ALCANCE
        ================================================== */

        function obtenerEntidad() {

            const seleccionado =
                formulario.querySelector(
                    ".entidad-editar-mantenimiento:checked"
                );


            return seleccionado
                ?
                seleccionado.value
                :
                "";

        }



        function actualizarColmenas() {

            if (
                !apiario
                ||
                !colmena
                ||
                !campoColmena
            ) {

                return;

            }


            const entidad =
                obtenerEntidad();


            const idApiario =
                apiario.value;


            const esColmena =
                entidad
                ===
                "Colmena";


            campoColmena.classList.toggle(
                "d-none",
                !esColmena
            );


            colmena.required =
                esColmena;


            if (!esColmena) {

                colmena.value =
                    "";

                return;

            }


            Array.from(
                colmena.options
            ).forEach(
                function (opcion) {


                    if (!opcion.value) {

                        opcion.hidden =
                            false;

                        opcion.disabled =
                            false;

                        return;

                    }


                    const corresponde = (
                        idApiario
                        &&
                        opcion.dataset.apiario
                        ===
                        idApiario
                    );


                    opcion.hidden =
                        !corresponde;


                    opcion.disabled =
                        !corresponde;

                }
            );


            const seleccionada =
                colmena.options[
                    colmena.selectedIndex
                ];


            if (
                seleccionada
                &&
                seleccionada.value
                &&
                seleccionada.dataset.apiario
                !==
                idApiario
            ) {

                colmena.value =
                    "";

            }

        }



        radiosEntidad.forEach(
            function (radio) {

                radio.addEventListener(
                    "change",
                    function () {

                        if (colmena) {

                            colmena.value =
                                "";

                        }


                        actualizarColmenas();

                    }
                );

            }
        );



        if (apiario) {

            apiario.addEventListener(
                "change",
                function () {

                    if (colmena) {

                        colmena.value =
                            "";

                    }


                    actualizarColmenas();

                }
            );

        }


        actualizarColmenas();



        /* ==================================================
           VALIDAR SUBMIT
        ================================================== */

        formulario.addEventListener(
            "submit",
            function (evento) {


                const tipo =
                    formulario.querySelector(
                        'input[name="tipo"]'
                    );


                const observaciones =
                    formulario.querySelector(
                        'textarea[name="observaciones"]'
                    );



                /* ==========================================
                   TAREA
                ========================================== */

                if (tipo) {

                    tipo.value =
                        tipo.value.trim();


                    if (!tipo.value) {

                        evento.preventDefault();


                        tipo.classList.add(
                            "is-invalid"
                        );


                        mostrarValidacion(
                            "La tarea del mantenimiento es obligatoria."
                        );


                        return;

                    }


                    tipo.classList.remove(
                        "is-invalid"
                    );

                }



                /* ==========================================
                   OBSERVACIONES
                ========================================== */

                if (observaciones) {

                    observaciones.value =
                        observaciones.value.trim();


                    if (
                        observaciones.value.length
                        >
                        255
                    ) {

                        evento.preventDefault();


                        observaciones.classList.add(
                            "is-invalid"
                        );


                        mostrarValidacion(
                            "Las observaciones no pueden superar los 255 caracteres."
                        );


                        return;

                    }


                    observaciones.classList.remove(
                        "is-invalid"
                    );

                }



                /* ==========================================
                   APIARIO
                ========================================== */

                if (
                    !apiario
                    ||
                    !apiario.value
                ) {

                    evento.preventDefault();


                    if (apiario) {

                        apiario.classList.add(
                            "is-invalid"
                        );

                    }


                    mostrarValidacion(
                        "Debes seleccionar un apiario."
                    );


                    return;

                }


                apiario.classList.remove(
                    "is-invalid"
                );



                /* ==========================================
                   COLMENA
                ========================================== */

                if (
                    obtenerEntidad()
                    ===
                    "Colmena"
                ) {

                    if (
                        !colmena
                        ||
                        !colmena.value
                    ) {

                        evento.preventDefault();


                        if (colmena) {

                            colmena.classList.add(
                                "is-invalid"
                            );

                        }


                        mostrarValidacion(
                            "Debes seleccionar una colmena."
                        );


                        return;

                    }


                    const opcion =
                        colmena.options[
                            colmena.selectedIndex
                        ];


                    if (
                        opcion
                        &&
                        opcion.dataset.apiario
                        !==
                        apiario.value
                    ) {

                        evento.preventDefault();


                        colmena.classList.add(
                            "is-invalid"
                        );


                        mostrarValidacion(
                            "La colmena seleccionada no pertenece al apiario indicado."
                        );


                        return;

                    }


                    colmena.classList.remove(
                        "is-invalid"
                    );

                }



                /* ==========================================
                   FECHA
                ========================================== */

                if (fecha) {

                    const original =
                        fecha.dataset.fechaOriginal
                        ||
                        "";


                    if (
                        original
                        &&
                        original
                        <
                        fechaHoy
                    ) {

                        if (
                            fecha.value
                            !==
                            original
                        ) {

                            evento.preventDefault();


                            fecha.classList.add(
                                "is-invalid"
                            );


                            mostrarValidacion(
                                "La fecha de este mantenimiento ya venció y no puede modificarse."
                            );


                            return;

                        }

                    } else if (
                        !fecha.value
                        ||
                        fecha.value
                        <
                        fechaHoy
                    ) {

                        evento.preventDefault();


                        fecha.classList.add(
                            "is-invalid"
                        );


                        mostrarValidacion(
                            "La fecha programada no puede ser anterior a hoy."
                        );


                        return;

                    }


                    fecha.classList.remove(
                        "is-invalid"
                    );

                }



                /* ==========================================
                   EVIDENCIAS
                ========================================== */

                const resultado =
                    validarEvidencias(
                        formulario
                    );


                if (!resultado.valido) {

                    evento.preventDefault();


                    mostrarValidacion(
                        resultado.mensaje
                    );


                    return;

                }



                /* ==========================================
                   ENVIANDO
                ========================================== */

                const boton =
                    formulario.querySelector(
                        ".btn-guardar-form-mantenimiento"
                    );


                if (boton) {

                    boton.disabled =
                        true;


                    boton.innerHTML = `

                        <span>
                            Guardando...
                        </span>
                    `;

                }

            }
        );

    }



    modalesEditar.forEach(
        function (modal) {

            configurarFormularioEditar(
                modal
            );

        }
    );



    function abrirModalEditar(
        modal,
        botonOrigen = null
    ) {

        if (!modal) {

            return;

        }


        modalEditarActivo =
            modal;


        /* ==================================================
           ELEGIR BOTÓN DE RETORNO
        ================================================== */

        if (botonOrigen) {

            const idModal =
                botonOrigen.dataset
                    .modalEditarMantenimiento;


            const candidatos =
                document.querySelectorAll(
                    `[data-modal-editar-mantenimiento="${idModal}"]`
                );


            botonAbrioEditar =
                Array.from(
                    candidatos
                ).find(
                    function (boton) {

                        return !boton.closest(
                            ".mantenimiento-modal-overlay"
                        );

                    }
                )
                ||
                botonOrigen;

        }



        /* ==================================================
           SI VENIMOS DEL DETALLE
        ================================================== */

        if (
            botonOrigen
            &&
            botonOrigen.hasAttribute(
                "data-cerrar-modal-actual"
            )
        ) {

            const detalle =
                botonOrigen.closest(
                    ".mantenimiento-modal-overlay"
                );


            if (detalle) {

                cerrarModalDetalle(
                    detalle,
                    false
                );

            }

        }



        modal.classList.add(
            "activo"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        bloquearScroll();


        const body =
            modal.querySelector(
                ".mantenimiento-form-body"
            );


        if (body) {

            body.scrollTop =
                0;

        }


        const primerCampo =
            modal.querySelector(
                ".apiario-editar-mantenimiento"
            );


        if (primerCampo) {

            setTimeout(
                function () {

                    primerCampo.focus();

                },
                80
            );

        }

    }



    function cerrarModalEditar(
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


        if (
            modalEditarActivo
            ===
            modal
        ) {

            modalEditarActivo =
                null;

        }


        restaurarScroll();


        if (
            botonAbrioEditar
            &&
            document.body.contains(
                botonAbrioEditar
            )
        ) {

            botonAbrioEditar.focus();

        }


        botonAbrioEditar =
            null;

    }



    botonesAbrirEditar.forEach(
        function (boton) {

            boton.addEventListener(
                "click",
                function () {

                    const idModal =
                        this.dataset
                            .modalEditarMantenimiento;


                    if (!idModal) {

                        return;

                    }


                    const modal =
                        document.getElementById(
                            idModal
                        );


                    abrirModalEditar(
                        modal,
                        this
                    );

                }
            );

        }
    );



    botonesCerrarEditar.forEach(
        function (boton) {

            boton.addEventListener(
                "click",
                function () {

                    const modal =
                        this.closest(
                            ".modal-editar-mantenimiento-apicultor"
                        );


                    cerrarModalEditar(
                        modal
                    );

                }
            );

        }
    );



    modalesEditar.forEach(
        function (modal) {

            modal.addEventListener(
                "click",
                function (evento) {

                    if (
                        evento.target
                        ===
                        modal
                    ) {

                        cerrarModalEditar(
                            modal
                        );

                    }

                }
            );

        }
    );



    /* ======================================================
       ======================================================
       16. VALIDAR EVIDENCIAS AL SELECCIONAR
       ======================================================
       ====================================================== */

    document
        .querySelectorAll(
            ".form-mantenimiento-apicultor"
        )
        .forEach(
            function (formulario) {


                obtenerInputsEvidencias(
                    formulario
                ).forEach(
                    function (input) {


                        input.addEventListener(
                            "change",
                            function () {


                                const resultado =
                                    validarEvidencias(
                                        formulario
                                    );


                                if (
                                    !resultado.valido
                                ) {

                                    mostrarValidacion(
                                        resultado.mensaje
                                    );

                                }

                            }
                        );

                    }
                );

            }
        );



    /* ======================================================
       ======================================================
       17. MODAL DETALLE
       ======================================================
       ====================================================== */

    function cerrarEdicionesDelModal(
        modal
    ) {

        if (!modal) {

            return;

        }


        modal.querySelectorAll(
            ".form-editar-observacion.activo"
        ).forEach(
            function (formulario) {

                cerrarEdicionObservacion(
                    formulario,
                    true
                );

            }
        );

    }



    function abrirModalDetalle(
        modal,
        botonOrigen = null
    ) {

        if (!modal) {

            return;

        }


        modalesDetalle.forEach(
            function (otroModal) {

                if (
                    otroModal
                    !==
                    modal
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


        const contenido =
            modal.querySelector(
                ".mantenimiento-modal-contenido"
            );


        if (contenido) {

            contenido.scrollTop =
                0;

        }


        const cerrar =
            modal.querySelector(
                ".mantenimiento-modal-cerrar"
            );


        if (cerrar) {

            setTimeout(
                function () {

                    cerrar.focus();

                },
                70
            );

        }

    }



    function cerrarModalDetalle(
        modal,
        devolverFoco = true
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


        cerrarEdicionesDelModal(
            modal
        );


        if (
            modalDetalleActivo
            ===
            modal
        ) {

            modalDetalleActivo =
                null;

        }


        restaurarScroll();


        if (
            devolverFoco
            &&
            botonAbrioDetalle
            &&
            document.body.contains(
                botonAbrioDetalle
            )
        ) {

            botonAbrioDetalle.focus();

        }


        botonAbrioDetalle =
            null;

    }



    botonesAbrirDetalle.forEach(
        function (boton) {

            boton.addEventListener(
                "click",
                function () {


                    const idModal =
                        this.dataset
                            .modalMantenimiento;


                    if (!idModal) {

                        return;

                    }


                    abrirModalDetalle(
                        document.getElementById(
                            idModal
                        ),
                        this
                    );

                }
            );

        }
    );



    botonesCerrarDetalle.forEach(
        function (boton) {

            boton.addEventListener(
                "click",
                function () {


                    cerrarModalDetalle(
                        this.closest(
                            ".mantenimiento-modal-overlay"
                        )
                    );

                }
            );

        }
    );



    modalesDetalle.forEach(
        function (modal) {

            modal.addEventListener(
                "click",
                function (evento) {

                    if (
                        evento.target
                        ===
                        modal
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
       ======================================================
       18. OBSERVACIONES
       ======================================================
       ====================================================== */

    function obtenerObservacionActual(
        formulario
    ) {

        if (!formulario) {

            return null;

        }


        return formulario
            .previousElementSibling;

    }



    function obtenerTextarea(
        formulario
    ) {

        if (!formulario) {

            return null;

        }


        return formulario.querySelector(
            "textarea[name='observaciones']"
        );

    }



    function actualizarContador(
        textarea
    ) {

        if (!textarea) {

            return;

        }


        const formulario =
            textarea.closest(
                ".form-editar-observacion"
            );


        if (!formulario) {

            return;

        }


        const contador =
            formulario.querySelector(
                ".contador-observacion"
            );


        if (!contador) {

            return;

        }


        const maximo =
            Number(
                textarea.getAttribute(
                    "maxlength"
                )
            )
            ||
            255;


        contador.textContent =
            textarea.value.length
            +
            " / "
            +
            maximo
            +
            " caracteres";

    }



    function guardarValorOriginal(
        textarea
    ) {

        if (textarea) {

            textarea.dataset.valorOriginal =
                textarea.value;

        }

    }



    function restaurarValorOriginal(
        textarea
    ) {

        if (!textarea) {

            return;

        }


        if (
            textarea.dataset.valorOriginal
            !==
            undefined
        ) {

            textarea.value =
                textarea.dataset.valorOriginal;

        }


        actualizarContador(
            textarea
        );

    }



    function abrirEdicionObservacion(
        formulario
    ) {

        if (!formulario) {

            return;

        }


        const actual =
            obtenerObservacionActual(
                formulario
            );


        const textarea =
            obtenerTextarea(
                formulario
            );


        formulario.classList.add(
            "activo"
        );


        if (actual) {

            actual.classList.add(
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

                },
                50
            );

        }

    }



    function cerrarEdicionObservacion(
        formulario,
        restaurarContenido = true
    ) {

        if (!formulario) {

            return;

        }


        const actual =
            obtenerObservacionActual(
                formulario
            );


        const textarea =
            obtenerTextarea(
                formulario
            );


        formulario.classList.remove(
            "activo"
        );


        if (actual) {

            actual.classList.remove(
                "oculto"
            );

        }


        if (
            restaurarContenido
            &&
            textarea
        ) {

            restaurarValorOriginal(
                textarea
            );

        }

    }



    botonesEditarObservacion.forEach(
        function (boton) {

            boton.addEventListener(
                "click",
                function () {


                    const id =
                        this.dataset
                            .editarObservacion;


                    if (!id) {

                        return;

                    }


                    abrirEdicionObservacion(
                        document.getElementById(
                            id
                        )
                    );

                }
            );

        }
    );



    botonesCancelarObservacion.forEach(
        function (boton) {

            boton.addEventListener(
                "click",
                function () {

                    cerrarEdicionObservacion(
                        this.closest(
                            ".form-editar-observacion"
                        ),
                        true
                    );

                }
            );

        }
    );



    formulariosObservacion.forEach(
        function (formulario) {


            const textarea =
                obtenerTextarea(
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


            formulario.addEventListener(
                "submit",
                function (evento) {


                    textarea.value =
                        textarea.value.trim();


                    const maximo =
                        Number(
                            textarea.getAttribute(
                                "maxlength"
                            )
                        )
                        ||
                        255;


                    if (
                        textarea.value.length
                        >
                        maximo
                    ) {

                        evento.preventDefault();


                        mostrarValidacion(
                            `Las observaciones pueden tener máximo ${maximo} caracteres.`
                        );


                        return;

                    }


                    const boton =
                        formulario.querySelector(
                            ".btn-guardar-observacion"
                        );


                    if (boton) {

                        boton.disabled =
                            true;


                        boton.innerHTML = `

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
       ======================================================
       19. COMPLETAR MANTENIMIENTO
       ======================================================
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



    function abrirConfirmacionCompletado(
        formulario
    ) {

        if (
            !formulario
            ||
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


        const nombre =
            (
                formulario.dataset
                    .nombreMantenimiento
                ||
                "Mantenimiento"
            ).trim();


        const ubicacion =
            (
                formulario.dataset
                    .colmenaMantenimiento
                ||
                "Sin ubicación asociada"
            ).trim();


        if (textoNombreMantenimiento) {

            textoNombreMantenimiento.textContent =
                nombre;

        }


        if (textoUbicacionMantenimiento) {

            textoUbicacionMantenimiento.textContent =
                ubicacion;

        }


        restaurarBotonConfirmar();


        modalConfirmarCompletado
            .classList
            .add(
                "activo"
            );


        modalConfirmarCompletado
            .setAttribute(
                "aria-hidden",
                "false"
            );


        bloquearScroll();


        if (botonConfirmarCompletado) {

            setTimeout(
                function () {

                    botonConfirmarCompletado.focus();

                },
                70
            );

        }

    }



    function cerrarConfirmacionCompletado() {

        if (!modalConfirmarCompletado) {

            return;

        }


        modalConfirmarCompletado
            .classList
            .remove(
                "activo"
            );


        modalConfirmarCompletado
            .setAttribute(
                "aria-hidden",
                "true"
            );


        restaurarBotonConfirmar();


        restaurarScroll();


        if (
            botonCompletarOrigen
            &&
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



    if (botonCancelarCompletado) {

        botonCancelarCompletado.addEventListener(
            "click",
            cerrarConfirmacionCompletado
        );

    }



    if (botonConfirmarCompletado) {

        botonConfirmarCompletado.addEventListener(
            "click",
            function () {


                if (!formularioCompletarActivo) {

                    return;

                }


                const formulario =
                    formularioCompletarActivo;


                botonConfirmarCompletado.disabled =
                    true;


                botonConfirmarCompletado.innerHTML = `

                    <span>
                        Completando...
                    </span>
                `;


                HTMLFormElement
                    .prototype
                    .submit
                    .call(
                        formulario
                    );

            }
        );

    }



    if (modalConfirmarCompletado) {

        modalConfirmarCompletado.addEventListener(
            "click",
            function (evento) {

                if (
                    evento.target
                    ===
                    modalConfirmarCompletado
                ) {

                    cerrarConfirmacionCompletado();

                }

            }
        );

    }



    /* ======================================================
       ======================================================
       20. VISOR DE EVIDENCIAS
       ======================================================
       ====================================================== */

    function abrirVisor(
        url,
        botonOrigen = null
    ) {

        if (
            !visorEvidencia
            ||
            !imagenVisor
            ||
            !url
        ) {

            return;

        }


        elementoFocoAntesVisor =
            botonOrigen;


        imagenVisor.src =
            url;


        visorEvidencia.classList.add(
            "activo"
        );


        visorEvidencia.setAttribute(
            "aria-hidden",
            "false"
        );


        bloquearScroll();


        if (botonCerrarVisor) {

            setTimeout(
                function () {

                    botonCerrarVisor.focus();

                },
                60
            );

        }

    }



    function cerrarVisor() {

        if (!visorEvidencia) {

            return;

        }


        visorEvidencia.classList.remove(
            "activo"
        );


        visorEvidencia.setAttribute(
            "aria-hidden",
            "true"
        );


        if (imagenVisor) {

            imagenVisor.src =
                "";

        }


        restaurarScroll();


        if (
            elementoFocoAntesVisor
            &&
            document.body.contains(
                elementoFocoAntesVisor
            )
        ) {

            elementoFocoAntesVisor.focus();

        }


        elementoFocoAntesVisor =
            null;

    }



    botonesImagenEvidencia.forEach(
        function (boton) {

            boton.addEventListener(
                "click",
                function () {


                    const url =
                        this.dataset
                            .imagenEvidencia;


                    abrirVisor(
                        url,
                        this
                    );

                }
            );

        }
    );



    if (botonCerrarVisor) {

        botonCerrarVisor.addEventListener(
            "click",
            cerrarVisor
        );

    }



    if (visorEvidencia) {

        visorEvidencia.addEventListener(
            "click",
            function (evento) {

                if (
                    evento.target
                    ===
                    visorEvidencia
                ) {

                    cerrarVisor();

                }

            }
        );

    }



    /* ======================================================
       ======================================================
       21. FILTROS
       ======================================================
       ====================================================== */

    function enviarFiltros() {

        if (!formularioFiltros) {

            return;

        }


        if (
            typeof formularioFiltros
                .requestSubmit
            ===
            "function"
        ) {

            formularioFiltros
                .requestSubmit();

        } else {

            formularioFiltros.submit();

        }

    }



    if (
        formularioFiltros
        &&
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



    if (
        buscador
        &&
        formularioFiltros
    ) {

        buscador.addEventListener(
            "keydown",
            function (evento) {

                if (
                    evento.key
                    !==
                    "Enter"
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



    selectsFiltros.forEach(
        function (select) {

            select.addEventListener(
                "change",
                enviarFiltros
            );

        }
    );



    /* ======================================================
       ======================================================
       22. TECLA ESCAPE
       ======================================================
       ====================================================== */

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



            /* ==============================================
               1. VISOR
            ============================================== */

            if (
                visorEvidencia
                &&
                visorEvidencia
                    .classList
                    .contains(
                        "activo"
                    )
            ) {

                cerrarVisor();

                return;

            }



            /* ==============================================
               2. VALIDACIÓN
            ============================================== */

            const validacion =
                document.getElementById(
                    "modalValidacionMantenimientoApicultor"
                );


            if (
                validacion
                &&
                validacion
                    .classList
                    .contains(
                        "activo"
                    )
            ) {

                cerrarValidacion();

                return;

            }



            /* ==============================================
               3. CONFIRMACIÓN
            ============================================== */

            if (
                modalConfirmarCompletado
                &&
                modalConfirmarCompletado
                    .classList
                    .contains(
                        "activo"
                    )
            ) {

                cerrarConfirmacionCompletado();

                return;

            }



            /* ==============================================
               4. EDITAR
            ============================================== */

            if (modalEditarActivo) {

                cerrarModalEditar(
                    modalEditarActivo
                );

                return;

            }



            /* ==============================================
               5. CREAR
            ============================================== */

            if (
                modalCrear
                &&
                modalCrear
                    .classList
                    .contains(
                        "activo"
                    )
            ) {

                cerrarModalCrear();

                return;

            }



            /* ==============================================
               6. OBSERVACIÓN
            ============================================== */

            if (modalDetalleActivo) {

                const formulario =
                    modalDetalleActivo.querySelector(
                        ".form-editar-observacion.activo"
                    );


                if (formulario) {

                    cerrarEdicionObservacion(
                        formulario,
                        true
                    );

                    return;

                }

            }



            /* ==============================================
               7. DETALLE
            ============================================== */

            if (modalDetalleActivo) {

                cerrarModalDetalle(
                    modalDetalleActivo
                );

            }

        }
    );



    /* ======================================================
       ======================================================
       23. RESTAURAR BOTONES
       ======================================================
       ====================================================== */

    function restaurarBotonesObservacion() {

        formulariosObservacion.forEach(
            function (formulario) {


                const boton =
                    formulario.querySelector(
                        ".btn-guardar-observacion"
                    );


                if (!boton) {

                    return;

                }


                boton.disabled =
                    false;


                boton.innerHTML = `

                    <i class="bi bi-check-lg"></i>

                    <span>
                        Guardar cambio
                    </span>
                `;

            }
        );

    }



    function restaurarBotonesFormularios() {

        document
            .querySelectorAll(
                ".form-mantenimiento-apicultor .btn-guardar-form-mantenimiento"
            )
            .forEach(
                function (boton) {


                    boton.disabled =
                        false;


                    if (
                        boton.closest(
                            "#formCrearMantenimiento"
                        )
                    ) {

                        boton.innerHTML = `

                            <i class="bi bi-check-lg"></i>

                            Registrar mantenimiento
                        `;

                    } else {

                        boton.innerHTML = `

                            <i class="bi bi-check-lg"></i>

                            Guardar cambios
                        `;

                    }

                }
            );

    }



    /* ======================================================
       ======================================================
       24. PAGESHOW
       ======================================================
       ====================================================== */

    window.addEventListener(
        "pageshow",
        function () {


            /* ==============================================
               DETALLES
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
               CREAR
            ============================================== */

            if (modalCrear) {

                modalCrear.classList.remove(
                    "activo"
                );


                modalCrear.setAttribute(
                    "aria-hidden",
                    "true"
                );

            }



            /* ==============================================
               EDITAR
            ============================================== */

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



            /* ==============================================
               COMPLETAR
            ============================================== */

            if (modalConfirmarCompletado) {

                modalConfirmarCompletado
                    .classList
                    .remove(
                        "activo"
                    );


                modalConfirmarCompletado
                    .setAttribute(
                        "aria-hidden",
                        "true"
                    );

            }



            /* ==============================================
               VISOR
            ============================================== */

            if (visorEvidencia) {

                visorEvidencia.classList.remove(
                    "activo"
                );


                visorEvidencia.setAttribute(
                    "aria-hidden",
                    "true"
                );

            }



            /* ==============================================
               VALIDACIÓN
            ============================================== */

            const validacion =
                document.getElementById(
                    "modalValidacionMantenimientoApicultor"
                );


            if (validacion) {

                validacion.classList.remove(
                    "activo"
                );


                validacion.setAttribute(
                    "aria-hidden",
                    "true"
                );

            }



            /* ==============================================
               BOTONES
            ============================================== */

            restaurarBotonConfirmar();

            restaurarBotonesObservacion();

            restaurarBotonesFormularios();



            /* ==============================================
               VARIABLES
            ============================================== */

            modalDetalleActivo =
                null;


            botonAbrioDetalle =
                null;


            modalEditarActivo =
                null;


            botonAbrioEditar =
                null;


            formularioCompletarActivo =
                null;


            botonCompletarOrigen =
                null;



            /* ==============================================
               SCROLL
            ============================================== */

            document.body.classList.remove(
                "modal-mantenimiento-abierto"
            );

        }
    );



    /* ======================================================
    ======================================================
    25. ESTADO INICIAL
    ======================================================
    ====================================================== */

    filtrarColmenasCrear();



    /* ======================================================
    ======================================================
    26. ABRIR REGISTRO DESDE MIS COLMENAS
    ======================================================
    ====================================================== */

    function prepararMantenimientoDesdeColmena() {


        /* ==================================================
        PARÁMETROS DE LA URL
        ================================================== */

        const parametros =
            new URLSearchParams(
                window.location.search
            );


        const abrirNuevo =
            parametros.get(
                "nuevo"
            );


        const idApiario =
            parametros.get(
                "apiario_nuevo"
            );


        const idColmena =
            parametros.get(
                "colmena_nueva"
            );



        /* ==================================================
        SOLO CONTINUAR SI VIENE DE REGISTRAR
        ================================================== */

        if (
            abrirNuevo
            !==
            "1"
        ) {

            return;

        }


        if (
            !modalCrear
            ||
            !formularioCrear
        ) {

            return;

        }



        /* ==================================================
        SELECCIONAR APIARIO
        ================================================== */

        if (
            apiarioCrear
            &&
            idApiario
        ) {

            const opcionApiario =
                Array.from(
                    apiarioCrear.options
                ).find(
                    function (opcion) {

                        return (
                            opcion.value
                            ===
                            idApiario
                        );

                    }
                );


            if (opcionApiario) {

                apiarioCrear.value =
                    idApiario;

            }

        }



        /* ==================================================
        SELECCIONAR ALCANCE COLMENA
        ================================================== */

        const radioColmena =
            formularioCrear.querySelector(
                '.alcance-mantenimiento-radio-apicultor[value="Colmena"]'
            );


        if (radioColmena) {

            radioColmena.checked =
                true;

        }



        /* ==================================================
        MOSTRAR Y FILTRAR COLMENAS
        ================================================== */

        filtrarColmenasCrear();



        /* ==================================================
        SELECCIONAR COLMENA
        ================================================== */

        if (
            colmenaCrear
            &&
            idColmena
        ) {

            const opcionColmena =
                Array.from(
                    colmenaCrear.options
                ).find(
                    function (opcion) {

                        return (
                            opcion.value
                            ===
                            idColmena
                            &&
                            !opcion.disabled
                        );

                    }
                );


            if (opcionColmena) {

                colmenaCrear.value =
                    idColmena;

            }

        }



        /* ==================================================
        ABRIR MODAL
        ================================================== */

        abrirModalCrear();



        /* ==================================================
        LIMPIAR URL
        Evitamos que al refrescar vuelva a abrirse.
        ================================================== */

        const urlLimpia =
            window.location.pathname;


        window.history.replaceState(
            {},
            document.title,
            urlLimpia
        );

    }


});