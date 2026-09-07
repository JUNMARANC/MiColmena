/* ==========================================================
   ==========================================================
   MIS COLMENAS - PANEL APICULTOR
   MI COLMENA
   ==========================================================
   ==========================================================

   FUNCIONES:

   - Abrir / cerrar detalle.
   - Abrir / cerrar Gestión de colmena.
   - Cambiar estado.
   - Editar descripción.
   - Validar fotografía.
   - Previsualizar nueva fotografía.
   - Ampliar fotografía.
   - Validaciones mediante ventana emergente.
   - Evitar doble envío.
   - Filtros.
   - Cierre mediante Escape.
   - Bloqueo de scroll.

========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* ==================================================
           ==================================================
           1. CONFIGURACIÓN
           ==================================================
           ================================================== */

        const MAX_TAMANO_MB =
            5;


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


        const ESTADOS_VALIDOS = [

            "Activa",

            "Revisión",

            "Riesgo",

            "Inactiva"

        ];



        /* ==================================================
           ==================================================
           2. MODALES DE DETALLE
           ==================================================
           ================================================== */

        const botonesAbrirDetalle =
            document.querySelectorAll(
                "[data-colmena-modal]"
            );


        const botonesCerrarDetalle =
            document.querySelectorAll(
                "[data-cerrar-colmena-modal]"
            );


        const modalesDetalle =
            document.querySelectorAll(
                ".colmena-modal-overlay"
            );



        /* ==================================================
           ==================================================
           3. MODALES EDITAR / GESTIONAR
           ==================================================
           ================================================== */

        const botonesAbrirEditar =
            document.querySelectorAll(
                "[data-editar-colmena-modal]"
            );


        const botonesCerrarEditar =
            document.querySelectorAll(
                "[data-cerrar-editar-colmena]"
            );


        const modalesEditar =
            document.querySelectorAll(
                ".modal-editar-colmena"
            );


        const formulariosEditar =
            document.querySelectorAll(
                ".form-editar-colmena"
            );



        /* ==================================================
           ==================================================
           4. FOTOGRAFÍAS
           ==================================================
           ================================================== */

        const inputsImagen =
            document.querySelectorAll(
                ".input-imagen-colmena"
            );


        const botonesImagenColmena =
            document.querySelectorAll(
                "[data-imagen-colmena]"
            );


        const visorImagen =
            document.getElementById(
                "visorImagenColmena"
            );


        const imagenVisor =
            document.getElementById(
                "imagenVisorColmena"
            );


        const tituloVisor =
            document.getElementById(
                "tituloVisorColmena"
            );


        const botonCerrarVisor =
            document.getElementById(
                "btnCerrarVisorColmena"
            );



        /* ==================================================
           ==================================================
           5. FILTROS
           ==================================================
           ================================================== */

        const formularioFiltros =
            document.querySelector(
                ".colmenas-form-filtros"
            );


        const buscador =
            document.querySelector(
                ".colmenas-buscador input"
            );


        const selectsFiltros =
            document.querySelectorAll(
                ".colmenas-select"
            );



        /* ==================================================
           ==================================================
           6. ESTADO INTERNO
           ==================================================
           ================================================== */

        let modalDetalleActivo =
            null;


        let modalEditarActivo =
            null;


        let botonOrigenDetalle =
            null;


        let botonOrigenEditar =
            null;


        let detalleAntesDeEditar =
            null;


        let botonOrigenVisor =
            null;


        let focoAntesValidacion =
            null;



        /* ==================================================
           ==================================================
           7. CONTROL DEL SCROLL
           ==================================================
           ================================================== */

        function bloquearScroll() {

            document.body.classList.add(
                "modal-colmena-abierto"
            );


            document.body.style.overflow =
                "hidden";

        }



        function existeVentanaAbierta() {

            return Boolean(

                document.querySelector(
                    ".colmena-modal-overlay.activo"
                )

                ||

                document.querySelector(
                    ".modal-editar-colmena.activo"
                )

                ||

                (
                    visorImagen
                    &&
                    visorImagen.classList.contains(
                        "activo"
                    )
                )

                ||

                document.querySelector(
                    "#modalValidacionColmena.activo"
                )

            );

        }



        function restaurarScroll() {

            if (
                existeVentanaAbierta()
            ) {

                return;

            }


            document.body.classList.remove(
                "modal-colmena-abierto"
            );


            document.body.style.overflow =
                "";

        }



        /* ==================================================
           ==================================================
           8. MODAL DE VALIDACIÓN
           ==================================================
           ================================================== */

        function obtenerModalValidacion() {

            let modal =
                document.getElementById(
                    "modalValidacionColmena"
                );


            if (modal) {

                return modal;

            }


            modal =
                document.createElement(
                    "div"
                );


            modal.id =
                "modalValidacionColmena";


            modal.className =
                "colmena-validacion-overlay";


            modal.setAttribute(
                "aria-hidden",
                "true"
            );


            modal.innerHTML = `

                <div
                    class="colmena-validacion-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="tituloValidacionColmena"
                >


                    <div class="colmena-validacion-icono">

                        <i class="bi bi-exclamation-triangle-fill"></i>

                    </div>



                    <div class="colmena-validacion-contenido">


                        <span>
                            Revisa la información
                        </span>


                        <h2 id="tituloValidacionColmena">

                            Hay un detalle por corregir

                        </h2>


                        <p
                            id="mensajeValidacionColmena"
                            style="white-space: pre-line;"
                        >
                        </p>


                    </div>



                    <div class="colmena-validacion-footer">


                        <button
                            type="button"
                            class="btn-cerrar-validacion-colmena"
                            data-cerrar-validacion-colmena
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



            /* ==============================================
               CERRAR CON BOTÓN
            ============================================== */

            const botonCerrar =
                modal.querySelector(
                    "[data-cerrar-validacion-colmena]"
                );


            if (
                botonCerrar
            ) {

                botonCerrar.addEventListener(
                    "click",
                    cerrarValidacion
                );

            }



            /* ==============================================
               CERRAR TOCANDO EL FONDO
            ============================================== */

            modal.addEventListener(
                "click",
                function (
                    evento
                ) {

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


            focoAntesValidacion =
                document.activeElement;


            const tituloElemento =
                modal.querySelector(
                    "#tituloValidacionColmena"
                );


            const mensajeElemento =
                modal.querySelector(
                    "#mensajeValidacionColmena"
                );


            if (
                tituloElemento
            ) {

                tituloElemento.textContent =
                    titulo;

            }


            if (
                mensajeElemento
            ) {

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
                    "[data-cerrar-validacion-colmena]"
                );


            if (
                boton
            ) {

                setTimeout(
                    function () {

                        boton.focus();

                    },
                    60
                );

            }

        }



        function cerrarValidacion() {

            const modal =
                document.getElementById(
                    "modalValidacionColmena"
                );


            if (
                !modal
            ) {

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
                focoAntesValidacion
                &&
                document.body.contains(
                    focoAntesValidacion
                )
            ) {

                focoAntesValidacion.focus();

            }


            focoAntesValidacion =
                null;

        }



        /* ==================================================
           ==================================================
           9. ABRIR DETALLE
           ==================================================
           ================================================== */

        function abrirModalDetalle(
            modal,
            botonOrigen = null
        ) {

            if (
                !modal
            ) {

                return;

            }



            /* ==============================================
               CERRAR OTROS DETALLES
            ============================================== */

            modalesDetalle.forEach(
                function (
                    otroModal
                ) {

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


            botonOrigenDetalle =
                botonOrigen;


            modal.classList.add(
                "activo"
            );


            modal.setAttribute(
                "aria-hidden",
                "false"
            );


            bloquearScroll();



            /* ==============================================
               SCROLL ARRIBA
            ============================================== */

            const contenido =
                modal.querySelector(
                    ".colmena-modal-contenido"
                );


            if (
                contenido
            ) {

                contenido.scrollTop =
                    0;

            }



            /* ==============================================
               FOCO
            ============================================== */

            const botonCerrar =
                modal.querySelector(
                    ".colmena-modal-x"
                );


            if (
                botonCerrar
            ) {

                setTimeout(
                    function () {

                        botonCerrar.focus();

                    },
                    70
                );

            }

        }



        /* ==================================================
           ==================================================
           10. CERRAR DETALLE
           ==================================================
           ================================================== */

        function cerrarModalDetalle(
            modal,
            devolverFoco = true
        ) {

            if (
                !modal
            ) {

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
                botonOrigenDetalle
                &&
                document.body.contains(
                    botonOrigenDetalle
                )
            ) {

                botonOrigenDetalle.focus();

            }


            if (
                devolverFoco
            ) {

                botonOrigenDetalle =
                    null;

            }

        }



        /* ==================================================
           BOTONES VER DETALLE
        ================================================== */

        botonesAbrirDetalle.forEach(
            function (
                boton
            ) {

                boton.addEventListener(
                    "click",
                    function () {

                        const idModal =
                            this.dataset
                                .colmenaModal;


                        if (
                            !idModal
                        ) {

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



        /* ==================================================
           BOTONES CERRAR DETALLE
        ================================================== */

        botonesCerrarDetalle.forEach(
            function (
                boton
            ) {

                boton.addEventListener(
                    "click",
                    function () {

                        const modal =
                            this.closest(
                                ".colmena-modal-overlay"
                            );


                        cerrarModalDetalle(
                            modal
                        );

                    }
                );

            }
        );



        /* ==================================================
           CLIC FUERA DEL DETALLE
        ================================================== */

        modalesDetalle.forEach(
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

                            cerrarModalDetalle(
                                overlay
                            );

                        }

                    }
                );

            }
        );



        /* ==================================================
           ==================================================
           11. ABRIR MODAL GESTIONAR
           ==================================================
           ================================================== */

        function abrirModalEditar(
            modal,
            botonOrigen = null
        ) {

            if (
                !modal
            ) {

                return;

            }


            modalEditarActivo =
                modal;


            botonOrigenEditar =
                botonOrigen;



            /* ==============================================
               SI VIENE DESDE EL DETALLE
            ============================================== */

            if (
                botonOrigen
                &&
                botonOrigen.hasAttribute(
                    "data-cerrar-detalle-antes-editar"
                )
            ) {

                detalleAntesDeEditar =
                    botonOrigen.closest(
                        ".colmena-modal-overlay"
                    );


                if (
                    detalleAntesDeEditar
                ) {

                    cerrarModalDetalle(
                        detalleAntesDeEditar,
                        false
                    );

                }

            }



            /* ==============================================
               MOSTRAR
            ============================================== */

            modal.classList.add(
                "activo"
            );


            modal.setAttribute(
                "aria-hidden",
                "false"
            );


            bloquearScroll();



            /* ==============================================
               SCROLL ARRIBA
            ============================================== */

            const body =
                modal.querySelector(
                    ".colmena-editar-body"
                );


            if (
                body
            ) {

                body.scrollTop =
                    0;

            }



            /* ==============================================
               FOCO
            ============================================== */

            const estado =
                modal.querySelector(
                    'select[name="estado"]'
                );


            if (
                estado
            ) {

                setTimeout(
                    function () {

                        estado.focus();

                    },
                    70
                );

            }

        }



        /* ==================================================
           ==================================================
           12. RESTAURAR PREVIEW
           ==================================================
           ================================================== */

        function restaurarPreviewFormulario(
            formulario
        ) {

            if (
                !formulario
            ) {

                return;

            }


            const input =
                formulario.querySelector(
                    ".input-imagen-colmena"
                );


            if (
                input
            ) {

                input.value =
                    "";


                input.classList.remove(
                    "is-invalid"
                );

            }


            const preview =
                formulario.querySelector(
                    ".colmena-preview-imagen"
                );


            if (
                !preview
            ) {

                return;

            }


            const imagen =
                preview.querySelector(
                    "img"
                );


            if (
                imagen
            ) {

                const original =
                    imagen.dataset
                        .imagenOriginal;


                if (
                    original
                ) {

                    imagen.src =
                        original;

                }

            }


            const overlay =
                preview.querySelector(
                    ".colmena-preview-overlay"
                );


            if (
                overlay
            ) {

                const texto =
                    overlay.querySelector(
                        "span"
                    );


                if (
                    texto
                ) {

                    texto.textContent =
                        "Fotografía actual";

                }

            }

        }



        /* ==================================================
           ==================================================
           13. CERRAR EDITAR
           ==================================================
           ================================================== */

        function cerrarModalEditar(
            modal,
            volverAlDetalle = false
        ) {

            if (
                !modal
            ) {

                return;

            }


            const formulario =
                modal.querySelector(
                    ".form-editar-colmena"
                );


            restaurarPreviewFormulario(
                formulario
            );


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



            /* ==============================================
               VOLVER AL DETALLE
            ============================================== */

            if (
                volverAlDetalle
                &&
                detalleAntesDeEditar
                &&
                document.body.contains(
                    detalleAntesDeEditar
                )
            ) {

                detalleAntesDeEditar.classList.add(
                    "activo"
                );


                detalleAntesDeEditar.setAttribute(
                    "aria-hidden",
                    "false"
                );


                modalDetalleActivo =
                    detalleAntesDeEditar;


                bloquearScroll();

            }

            else {

                restaurarScroll();

            }



            /* ==============================================
               DEVOLVER FOCO
            ============================================== */

            if (
                botonOrigenEditar
                &&
                document.body.contains(
                    botonOrigenEditar
                )
            ) {

                botonOrigenEditar.focus();

            }


            botonOrigenEditar =
                null;


            detalleAntesDeEditar =
                null;

        }



        /* ==================================================
           BOTONES ABRIR GESTIÓN
        ================================================== */

        botonesAbrirEditar.forEach(
            function (
                boton
            ) {

                boton.addEventListener(
                    "click",
                    function () {

                        const idModal =
                            this.dataset
                                .editarColmenaModal;


                        if (
                            !idModal
                        ) {

                            return;

                        }


                        abrirModalEditar(

                            document.getElementById(
                                idModal
                            ),

                            this

                        );

                    }
                );

            }
        );



        /* ==================================================
           BOTONES CERRAR GESTIÓN
        ================================================== */

        botonesCerrarEditar.forEach(
            function (
                boton
            ) {

                boton.addEventListener(
                    "click",
                    function () {

                        const modal =
                            this.closest(
                                ".modal-editar-colmena"
                            );


                        cerrarModalEditar(
                            modal,
                            Boolean(
                                detalleAntesDeEditar
                            )
                        );

                    }
                );

            }
        );



        /* ==================================================
           CLIC FUERA DEL MODAL GESTIÓN
        ================================================== */

        modalesEditar.forEach(
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

                            cerrarModalEditar(
                                overlay,
                                Boolean(
                                    detalleAntesDeEditar
                                )
                            );

                        }

                    }
                );

            }
        );



        /* ==================================================
           ==================================================
           14. VALIDAR EXTENSIÓN
           ==================================================
           ================================================== */

        function obtenerExtension(
            nombre
        ) {

            if (
                !nombre
            ) {

                return "";

            }


            const partes =
                nombre
                    .toLowerCase()
                    .split(
                        "."
                    );


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



        /* ==================================================
           ==================================================
           15. VALIDAR IMAGEN
           ==================================================
           ================================================== */

        function validarImagen(
            archivo
        ) {

            if (
                !archivo
            ) {

                return {
                    valido: true,
                    mensaje: ""
                };

            }



            /* ==============================================
               VACÍA
            ============================================== */

            if (
                archivo.size
                <=
                0
            ) {

                return {

                    valido: false,

                    mensaje:
                        `La imagen "${archivo.name}" está vacía.`

                };

            }



            /* ==============================================
               PESO
            ============================================== */

            if (
                archivo.size
                >
                MAX_TAMANO_BYTES
            ) {

                return {

                    valido: false,

                    mensaje:
                        `La imagen "${archivo.name}" supera `
                        +
                        `el límite de ${MAX_TAMANO_MB} MB.`

                };

            }



            /* ==============================================
               EXTENSIÓN
            ============================================== */

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

                    valido: false,

                    mensaje:
                        "La fotografía seleccionada tiene un "
                        +
                        "formato no permitido.\n\n"
                        +
                        "Utiliza JPG, JPEG, PNG o WEBP."

                };

            }



            /* ==============================================
               MIME
            ============================================== */

            const tipo =
                archivo.type
                ?
                archivo.type.toLowerCase()
                :
                "";


            if (
                tipo
                &&
                !TIPOS_IMAGEN_VALIDOS.includes(
                    tipo
                )
            ) {

                return {

                    valido: false,

                    mensaje:
                        "El archivo seleccionado no corresponde "
                        +
                        "a una imagen JPG, PNG o WEBP válida."

                };

            }


            return {

                valido: true,

                mensaje: ""

            };

        }



        /* ==================================================
           ==================================================
           16. PREVISUALIZACIÓN
           ==================================================
           ================================================== */

        function mostrarPreview(
            input,
            archivo
        ) {

            if (
                !input
                ||
                !archivo
            ) {

                return;

            }


            const idPreview =
                input.dataset.preview;


            if (
                !idPreview
            ) {

                return;

            }


            const preview =
                document.getElementById(
                    idPreview
                );


            if (
                !preview
            ) {

                return;

            }



            const reader =
                new FileReader();



            reader.onload =
                function (
                    evento
                ) {


                    /* ==========================================
                       BUSCAR IMAGEN
                    ========================================== */

                    let imagen =
                        preview.querySelector(
                            "img"
                        );


                    /* ==========================================
                       SI NO EXISTE, CREARLA
                    ========================================== */

                    if (
                        !imagen
                    ) {

                        preview.innerHTML =
                            "";


                        imagen =
                            document.createElement(
                                "img"
                            );


                        imagen.alt =
                            "Previsualización de la nueva fotografía";


                        preview.appendChild(
                            imagen
                        );



                        const overlay =
                            document.createElement(
                                "div"
                            );


                        overlay.className =
                            "colmena-preview-overlay";


                        overlay.innerHTML = `

                            <i class="bi bi-camera-fill"></i>

                            <span>
                                Nueva fotografía
                            </span>
                        `;


                        preview.appendChild(
                            overlay
                        );

                    }


                    imagen.src =
                        evento.target.result;



                    /* ==========================================
                       ACTUALIZAR TEXTO
                    ========================================== */

                    const texto =
                        preview.querySelector(
                            ".colmena-preview-overlay span"
                        );


                    if (
                        texto
                    ) {

                        texto.textContent =
                            "Nueva fotografía seleccionada";

                    }

                };


            reader.readAsDataURL(
                archivo
            );

        }



        /* ==================================================
           INPUTS DE FOTO
        ================================================== */

        inputsImagen.forEach(
            function (
                input
            ) {

                input.addEventListener(
                    "change",
                    function () {


                        const archivo =
                            this.files
                            &&
                            this.files.length
                                ?
                                this.files[0]
                                :
                                null;


                        if (
                            !archivo
                        ) {

                            return;

                        }



                        const resultado =
                            validarImagen(
                                archivo
                            );


                        if (
                            !resultado.valido
                        ) {

                            this.classList.add(
                                "is-invalid"
                            );


                            this.value =
                                "";


                            mostrarValidacion(
                                resultado.mensaje,
                                "Fotografía no válida"
                            );


                            restaurarPreviewFormulario(
                                this.closest(
                                    ".form-editar-colmena"
                                )
                            );


                            return;

                        }


                        this.classList.remove(
                            "is-invalid"
                        );


                        mostrarPreview(
                            this,
                            archivo
                        );

                    }
                );

            }
        );



        /* ==================================================
           ==================================================
           17. VALIDAR FORMULARIO EDITAR
           ==================================================
           ================================================== */

        formulariosEditar.forEach(
            function (
                formulario
            ) {

                formulario.addEventListener(
                    "submit",
                    function (
                        evento
                    ) {


                        const estado =
                            formulario.querySelector(
                                'select[name="estado"]'
                            );


                        const descripcion =
                            formulario.querySelector(
                                'textarea[name="descripcion"]'
                            );


                        const inputImagen =
                            formulario.querySelector(
                                'input[name="imagen"]'
                            );



                        /* ======================================
                           ESTADO
                        ====================================== */

                        if (
                            !estado
                            ||
                            !ESTADOS_VALIDOS.includes(
                                estado.value
                            )
                        ) {

                            evento.preventDefault();


                            if (
                                estado
                            ) {

                                estado.classList.add(
                                    "is-invalid"
                                );

                            }


                            mostrarValidacion(
                                "Selecciona un estado válido para la colmena."
                            );


                            return;

                        }


                        estado.classList.remove(
                            "is-invalid"
                        );



                        /* ======================================
                           DESCRIPCIÓN
                        ====================================== */

                        if (
                            descripcion
                        ) {

                            descripcion.value =
                                descripcion.value.trim();


                            if (
                                !descripcion.value
                            ) {

                                evento.preventDefault();


                                descripcion.classList.add(
                                    "is-invalid"
                                );


                                mostrarValidacion(
                                    "La descripción de la colmena no puede quedar vacía."
                                );


                                return;

                            }


                            descripcion.classList.remove(
                                "is-invalid"
                            );

                        }



                        /* ======================================
                           IMAGEN
                        ====================================== */

                        if (
                            inputImagen
                            &&
                            inputImagen.files
                            &&
                            inputImagen.files.length
                        ) {

                            const resultado =
                                validarImagen(
                                    inputImagen.files[0]
                                );


                            if (
                                !resultado.valido
                            ) {

                                evento.preventDefault();


                                inputImagen.classList.add(
                                    "is-invalid"
                                );


                                mostrarValidacion(
                                    resultado.mensaje,
                                    "Fotografía no válida"
                                );


                                return;

                            }


                            inputImagen.classList.remove(
                                "is-invalid"
                            );

                        }



                        /* ======================================
                           EVITAR DOBLE ENVÍO
                        ====================================== */

                        const botonGuardar =
                            formulario.querySelector(
                                ".btn-guardar-colmena"
                            );


                        if (
                            botonGuardar
                        ) {

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



        /* ==================================================
           ==================================================
           18. VISOR DE FOTOGRAFÍAS
           ==================================================
           ================================================== */

        function abrirVisor(
            url,
            titulo,
            botonOrigen = null
        ) {

            if (
                !visorImagen
                ||
                !imagenVisor
                ||
                !url
            ) {

                return;

            }


            botonOrigenVisor =
                botonOrigen;


            imagenVisor.src =
                url;


            imagenVisor.alt =
                titulo
                ?
                `Fotografía ampliada de ${titulo}`
                :
                "Fotografía ampliada de la colmena";


            if (
                tituloVisor
            ) {

                tituloVisor.textContent =
                    titulo
                    ||
                    "Colmena";

            }


            visorImagen.classList.add(
                "activo"
            );


            visorImagen.setAttribute(
                "aria-hidden",
                "false"
            );


            bloquearScroll();


            if (
                botonCerrarVisor
            ) {

                setTimeout(
                    function () {

                        botonCerrarVisor.focus();

                    },
                    60
                );

            }

        }



        function cerrarVisor() {

            if (
                !visorImagen
            ) {

                return;

            }


            visorImagen.classList.remove(
                "activo"
            );


            visorImagen.setAttribute(
                "aria-hidden",
                "true"
            );


            if (
                imagenVisor
            ) {

                imagenVisor.src =
                    "";

            }


            restaurarScroll();


            if (
                botonOrigenVisor
                &&
                document.body.contains(
                    botonOrigenVisor
                )
            ) {

                botonOrigenVisor.focus();

            }


            botonOrigenVisor =
                null;

        }



        botonesImagenColmena.forEach(
            function (
                boton
            ) {

                boton.addEventListener(
                    "click",
                    function () {

                        abrirVisor(

                            this.dataset.imagenColmena,

                            this.dataset.imagenTitulo,

                            this

                        );

                    }
                );

            }
        );



        if (
            botonCerrarVisor
        ) {

            botonCerrarVisor.addEventListener(
                "click",
                cerrarVisor
            );

        }



        if (
            visorImagen
        ) {

            visorImagen.addEventListener(
                "click",
                function (
                    evento
                ) {

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



        /* ==================================================
           ==================================================
           19. FILTROS
           ==================================================
           ================================================== */

        function enviarFiltros() {

            if (
                !formularioFiltros
            ) {

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

            }

            else {

                formularioFiltros
                    .submit();

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
                        !==
                        "Enter"
                    ) {

                        return;

                    }


                    evento.preventDefault();


                    this.value =
                        this.value.trim();


                    enviarFiltros();

                }
            );

        }



        /* ==================================================
           SELECTS
        ================================================== */

        selectsFiltros.forEach(
            function (
                select
            ) {

                select.addEventListener(
                    "change",
                    enviarFiltros
                );

            }
        );



        /* ==================================================
           ==================================================
           20. CERRAR CON ESCAPE
           ==================================================
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



                /* ==========================================
                   VALIDACIÓN
                ========================================== */

                const validacion =
                    document.getElementById(
                        "modalValidacionColmena"
                    );


                if (
                    validacion
                    &&
                    validacion.classList.contains(
                        "activo"
                    )
                ) {

                    cerrarValidacion();

                    return;

                }



                /* ==========================================
                   VISOR
                ========================================== */

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



                /* ==========================================
                   EDITAR
                ========================================== */

                if (
                    modalEditarActivo
                ) {

                    cerrarModalEditar(

                        modalEditarActivo,

                        Boolean(
                            detalleAntesDeEditar
                        )

                    );


                    return;

                }



                /* ==========================================
                   DETALLE
                ========================================== */

                if (
                    modalDetalleActivo
                ) {

                    cerrarModalDetalle(
                        modalDetalleActivo
                    );

                }

            }
        );



        /* ==================================================
           ==================================================
           21. RESTAURAR BOTONES
           ==================================================
           ================================================== */

        function restaurarBotonesGuardar() {

            document.querySelectorAll(
                ".btn-guardar-colmena"
            ).forEach(
                function (
                    boton
                ) {

                    boton.disabled =
                        false;


                    boton.innerHTML = `

                        <i class="bi bi-check-lg"></i>

                        <span>
                            Guardar cambios
                        </span>
                    `;

                }
            );

        }



        /* ==================================================
           ==================================================
           22. PAGESHOW
           ==================================================
           ================================================== */

        window.addEventListener(
            "pageshow",
            function () {


                /* ==========================================
                   DETALLES
                ========================================== */

                modalesDetalle.forEach(
                    function (
                        modal
                    ) {

                        modal.classList.remove(
                            "activo"
                        );


                        modal.setAttribute(
                            "aria-hidden",
                            "true"
                        );

                    }
                );



                /* ==========================================
                   EDITAR
                ========================================== */

                modalesEditar.forEach(
                    function (
                        modal
                    ) {

                        modal.classList.remove(
                            "activo"
                        );


                        modal.setAttribute(
                            "aria-hidden",
                            "true"
                        );


                        restaurarPreviewFormulario(
                            modal.querySelector(
                                ".form-editar-colmena"
                            )
                        );

                    }
                );



                /* ==========================================
                   VISOR
                ========================================== */

                if (
                    visorImagen
                ) {

                    visorImagen.classList.remove(
                        "activo"
                    );


                    visorImagen.setAttribute(
                        "aria-hidden",
                        "true"
                    );

                }



                /* ==========================================
                   VALIDACIÓN
                ========================================== */

                const validacion =
                    document.getElementById(
                        "modalValidacionColmena"
                    );


                if (
                    validacion
                ) {

                    validacion.classList.remove(
                        "activo"
                    );


                    validacion.setAttribute(
                        "aria-hidden",
                        "true"
                    );

                }



                /* ==========================================
                   VARIABLES
                ========================================== */

                modalDetalleActivo =
                    null;


                modalEditarActivo =
                    null;


                botonOrigenDetalle =
                    null;


                botonOrigenEditar =
                    null;


                detalleAntesDeEditar =
                    null;


                botonOrigenVisor =
                    null;



                /* ==========================================
                   BOTONES
                ========================================== */

                restaurarBotonesGuardar();



                /* ==========================================
                   SCROLL
                ========================================== */

                document.body.classList.remove(
                    "modal-colmena-abierto"
                );


                document.body.style.overflow =
                    "";

            }
        );


    }
);