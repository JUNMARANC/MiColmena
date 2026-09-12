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
        RESUMEN DINÁMICO DE COLMENAS
        ==================================================
        ================================================== */

        const paginaColmenas =
            document.querySelector(
                ".colmenas-page"
            );


        function aplicarResumenColmenas(
            resumen
        ) {

            if (
                !resumen
            ) {

                return;

            }


            const valores = {

                totalColmenas:
                    resumen.total,

                totalColmenasActivas:
                    resumen.activas,

                totalColmenasRevision:
                    resumen.revision,

                totalColmenasRiesgo:
                    resumen.riesgo,

                totalColmenasInactivas:
                    resumen.inactivas,

            };


            Object.entries(
                valores
            ).forEach(
                function (
                    [id, valor]
                ) {

                    const elemento =
                        document.getElementById(
                            id
                        );


                    if (
                        elemento
                    ) {

                        elemento.textContent =
                            valor
                            ??
                            0;

                    }

                }
            );

        }



        async function actualizarResumenColmenas() {

            if (
                !paginaColmenas
            ) {

                return;

            }


            const url =
                paginaColmenas.dataset
                    .urlResumen;


            if (
                !url
            ) {

                return;

            }


            try {

                const respuesta =
                    await fetch(
                        url,
                        {
                            method:
                                "GET",

                            headers: {
                                "X-Requested-With":
                                    "XMLHttpRequest",
                            },

                            cache:
                                "no-store",
                        }
                    );


                if (
                    !respuesta.ok
                ) {

                    return;

                }


                const datos =
                    await respuesta.json();


                if (
                    !datos.ok
                    ||
                    !datos.resumen
                ) {

                    return;

                }


                aplicarResumenColmenas(
                    datos.resumen
                );

            }

            catch (
                error
            ) {

                console.error(
                    "No se pudo actualizar el resumen de colmenas:",
                    error
                );

            }

        }

        /* ==================================================
        ACTUALIZAR AL CARGAR
        ================================================== */

        actualizarResumenColmenas();



        /* ==================================================
        ACTUALIZAR AL VOLVER A LA PESTAÑA
        ================================================== */

        document.addEventListener(
            "visibilitychange",
            function () {

                if (
                    !document.hidden
                ) {

                    actualizarResumenColmenas();

                }

            }
        );

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
        ACTUALIZAR COLMENA DESPUÉS DEL AJAX
        ================================================== */

        function obtenerClaseEstado(
            estado
        ) {

            switch (
                estado
            ) {

                case "Activa":
                    return "activa";

                case "Revisión":
                    return "revision";

                case "Riesgo":
                    return "riesgo";

                default:
                    return "inactiva";

            }

        }



        function aplicarClaseEstado(
            elemento,
            estado
        ) {

            if (
                !elemento
            ) {

                return;

            }


            elemento.classList.remove(
                "activa",
                "revision",
                "riesgo",
                "inactiva"
            );


            elemento.classList.add(
                obtenerClaseEstado(
                    estado
                )
            );

        }



        function truncarTexto(
            texto,
            limite
        ) {

            if (
                texto.length
                <=
                limite
            ) {

                return texto;

            }


            return (
                texto.slice(
                    0,
                    limite - 1
                )
                +
                "…"
            );

        }



        function activarImagenAjax(
            boton
        ) {

            if (
                !boton
                ||
                boton.dataset.visorAjaxListo
                ===
                "true"
            ) {

                return;

            }


            boton.dataset.visorAjaxListo =
                "true";


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



        function actualizarColmenaEnPantalla(
            datos,
            formulario
        ) {

            if (
                !datos
            ) {

                return;

            }


            const id =
                String(
                    datos.id
                );


            const estado =
                datos.estado;


            const descripcion =
                datos.descripcion
                ||
                "";


            let imagenUrl =
                datos.imagen_url
                ||
                "";


            /* ==============================================
            EVITAR CACHÉ DE LA NUEVA FOTO
            ============================================== */

            if (
                imagenUrl
            ) {

                imagenUrl += (
                    imagenUrl.includes("?")
                        ?
                        "&"
                        :
                        "?"
                )
                +
                "v="
                +
                Date.now();

            }


            /* ==============================================
            TABLA
            ============================================== */

            const fila =
                document.querySelector(
                    `[data-colmena-fila="${id}"]`
                );


            if (
                fila
            ) {

                const estadoTabla =
                    fila.querySelector(
                        "[data-colmena-estado-tabla]"
                    );


                if (
                    estadoTabla
                ) {

                    aplicarClaseEstado(
                        estadoTabla,
                        estado
                    );


                    estadoTabla.innerHTML = `

                        <i
                            class="bi bi-circle-fill"
                            aria-hidden="true"
                        ></i>

                        ${estado}
                    `;

                }


                const infoTabla =
                    fila.querySelector(
                        "[data-colmena-tabla-info]"
                    );


                if (
                    infoTabla
                ) {

                    let descripcionTabla =
                        infoTabla.querySelector(
                            ".colmenas-tabla-descripcion"
                        );


                    if (
                        !descripcionTabla
                    ) {

                        descripcionTabla =
                            document.createElement(
                                "span"
                            );


                        descripcionTabla.className =
                            "colmenas-tabla-descripcion";


                        infoTabla.appendChild(
                            descripcionTabla
                        );

                    }


                    descripcionTabla.textContent =
                        truncarTexto(
                            descripcion,
                            45
                        );

                }


                if (
                    imagenUrl
                ) {

                    const celdaImagen =
                        fila.querySelector(
                            "[data-colmena-tabla-imagen]"
                        );


                    if (
                        celdaImagen
                    ) {

                        celdaImagen.innerHTML = `

                            <img
                                src="${imagenUrl}"
                                alt="Fotografía de ${datos.codigo}"
                                class="colmenas-tabla-miniatura"
                                loading="lazy"
                            >
                        `;

                    }

                }

            }


            /* ==============================================
            TARJETA
            ============================================== */

            const tarjeta =
                document.querySelector(
                    `[data-colmena-card="${id}"]`
                );


            if (
                tarjeta
            ) {

                const estadoCard =
                    tarjeta.querySelector(
                        "[data-colmena-estado-card]"
                    );


                if (
                    estadoCard
                ) {

                    aplicarClaseEstado(
                        estadoCard,
                        estado
                    );


                    estadoCard.textContent =
                        estado;

                }


                const descripcionCard =
                    tarjeta.querySelector(
                        "[data-colmena-descripcion-card]"
                    );


                if (
                    descripcionCard
                ) {

                    descripcionCard.textContent =
                        truncarTexto(
                            descripcion,
                            100
                        );

                }


                if (
                    imagenUrl
                ) {

                    const contenedorImagen =
                        tarjeta.querySelector(
                            "[data-colmena-card-imagen]"
                        );


                    if (
                        contenedorImagen
                    ) {

                        contenedorImagen.innerHTML = `

                            <button
                                type="button"
                                class="btn-imagen-colmena"
                                data-imagen-colmena="${imagenUrl}"
                                data-imagen-titulo="${datos.codigo}"
                                title="Ver fotografía"
                            >

                                <img
                                    src="${imagenUrl}"
                                    alt="Fotografía de la colmena ${datos.codigo}"
                                    loading="lazy"
                                >

                            </button>
                        `;


                        activarImagenAjax(
                            contenedorImagen.querySelector(
                                "[data-imagen-colmena]"
                            )
                        );

                    }

                }

            }


            /* ==============================================
            MODAL VER DETALLE
            ============================================== */

            const detalle =
                document.querySelector(
                    `[data-colmena-detalle="${id}"]`
                );


            if (
                detalle
            ) {

                const estadoDetalle =
                    detalle.querySelector(
                        "[data-colmena-estado-detalle]"
                    );


                if (
                    estadoDetalle
                ) {

                    aplicarClaseEstado(
                        estadoDetalle,
                        estado
                    );


                    estadoDetalle.innerHTML = `

                        <span></span>

                        ${estado}
                    `;

                }


                const descripcionDetalle =
                    detalle.querySelector(
                        "[data-colmena-descripcion-detalle]"
                    );


                if (
                    descripcionDetalle
                ) {

                    descripcionDetalle.textContent =
                        descripcion;


                    descripcionDetalle.classList.remove(
                        "sin-descripcion-colmena"
                    );

                }


                /* ==========================================
                FOTO DEL DETALLE
                ========================================== */

                if (
                    imagenUrl
                ) {

                    const fotografiaActual =
                        detalle.querySelector(
                            ".colmena-modal-imagen, .colmena-modal-sin-imagen"
                        );


                    if (
                        fotografiaActual
                    ) {

                        const botonFoto =
                            document.createElement(
                                "button"
                            );


                        botonFoto.type =
                            "button";


                        botonFoto.className =
                            "colmena-modal-imagen";


                        botonFoto.dataset.imagenColmena =
                            imagenUrl;


                        botonFoto.dataset.imagenTitulo =
                            datos.codigo;


                        botonFoto.innerHTML = `

                            <img
                                src="${imagenUrl}"
                                alt="Fotografía de la colmena ${datos.codigo}"
                            >

                            <span>

                                <i class="bi bi-arrows-fullscreen"></i>

                                Ampliar fotografía

                            </span>
                        `;


                        fotografiaActual.replaceWith(
                            botonFoto
                        );


                        activarImagenAjax(
                            botonFoto
                        );

                    }

                }


                /* ==========================================
                MANTENIMIENTO / INCIDENCIA
                ========================================== */

                const acciones =
                    detalle.querySelector(
                        "[data-colmena-acciones-principales]"
                    );


                if (
                    acciones
                ) {

                    if (
                        datos.permite_nuevas_actividades
                    ) {

                        acciones.innerHTML = `

                            <a
                                href="${datos.url_mantenimiento}"
                                class="btn-modal-mantenimiento"
                            >

                                <i class="bi bi-tools"></i>

                                <span>
                                    Registrar mantenimiento
                                </span>

                            </a>


                            <a
                                href="${datos.url_incidencia}"
                                class="btn-modal-incidencia"
                            >

                                <i class="bi bi-exclamation-triangle-fill"></i>

                                <span>
                                    Reportar incidencia
                                </span>

                            </a>
                        `;

                    }

                    else {

                        acciones.innerHTML = `

                            <button
                                type="button"
                                class="btn-modal-mantenimiento"
                                disabled
                                aria-disabled="true"
                                title="La colmena está inactiva"
                            >

                                <i class="bi bi-tools"></i>

                                <span>
                                    Registrar mantenimiento
                                </span>

                            </button>


                            <button
                                type="button"
                                class="btn-modal-incidencia"
                                disabled
                                aria-disabled="true"
                                title="La colmena está inactiva"
                            >

                                <i class="bi bi-exclamation-triangle-fill"></i>

                                <span>
                                    Reportar incidencia
                                </span>

                            </button>
                        `;

                    }

                }

            }


            /* ==============================================
            ACTUALIZAR FORMULARIO GESTIONAR
            ============================================== */

            if (
                formulario
            ) {

                formulario.dataset.estadoOriginal =
                    estado;


                const inputImagen =
                    formulario.querySelector(
                        'input[name="imagen"]'
                    );


                if (
                    inputImagen
                ) {

                    inputImagen.value =
                        "";

                }


                if (
                    imagenUrl
                ) {

                    const preview =
                        formulario.querySelector(
                            ".colmena-preview-imagen"
                        );


                    if (
                        preview
                    ) {

                        preview.innerHTML = `

                            <img
                                src="${imagenUrl}"
                                alt="Fotografía actual de ${datos.codigo}"
                                data-imagen-original="${imagenUrl}"
                            >

                            <div class="colmena-preview-overlay">

                                <i class="bi bi-camera"></i>

                                <span>
                                    Fotografía actual
                                </span>

                            </div>
                        `;

                    }

                }

            }

        }



        /* ==================================================
           ==================================================
           17. VALIDAR FORMULARIO EDITAR
           ==================================================
           ================================================== */

        formulariosEditar.forEach(
            function (
                formulario
            ) {

                /* ==============================================
                VALIDAR CAMBIO A INACTIVA EN TIEMPO REAL
                ============================================== */

                const estadoSelect =
                    formulario.querySelector(
                        'select[name="estado"]'
                    );


                if (
                    estadoSelect
                ) {

                    estadoSelect.addEventListener(
                        "change",
                        function () {


                            /* ==========================================
                            SOLO CUANDO ELIJA INACTIVA
                            ========================================== */

                            if (
                                this.value !== "Inactiva"
                            ) {

                                return;

                            }


                            const estadoOriginal =
                                (
                                    formulario.dataset.estadoOriginal
                                    ||
                                    ""
                                ).trim();


                            /* ==========================================
                            SI YA ESTABA INACTIVA, PERMITIR
                            ========================================== */

                            if (
                                estadoOriginal === "Inactiva"
                            ) {

                                return;

                            }


                            const tieneMantenimientoPendiente =
                                formulario.dataset.mantenimientoPendiente
                                ===
                                "true";


                            const tieneIncidenciaAbierta =
                                formulario.dataset.incidenciaAbierta
                                ===
                                "true";


                            /* ==========================================
                            NO TIENE BLOQUEOS
                            ========================================== */

                            if (
                                !tieneMantenimientoPendiente
                                &&
                                !tieneIncidenciaAbierta
                            ) {

                                return;

                            }


                            /* ==========================================
                            MOTIVOS
                            ========================================== */

                            const motivos = [];


                            if (
                                tieneMantenimientoPendiente
                            ) {

                                motivos.push(
                                    "mantenimientos pendientes"
                                );

                            }


                            if (
                                tieneIncidenciaAbierta
                            ) {

                                motivos.push(
                                    "incidencias pendientes o en proceso"
                                );

                            }


                            const codigoColmena =
                                formulario.dataset.codigoColmena
                                ||
                                "seleccionada";


                            /* ==========================================
                            MOSTRAR MENSAJE
                            ========================================== */

                            mostrarValidacion(
                                `La colmena "${codigoColmena}" no puede cambiar a Inactiva porque tiene ${motivos.join(" e ")}. Finaliza esos registros antes de inactivarla.`,
                                "No se puede inactivar la colmena"
                            );


                            /* ==========================================
                            VOLVER AL ESTADO ORIGINAL
                            ========================================== */

                            this.value =
                                estadoOriginal;

                        }
                    );

                }

                formulario.addEventListener(
                    "submit",
                    async function (
                        evento
                    ) {

                        evento.preventDefault();


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
                        BOTÓN
                        ====================================== */

                        const botonGuardar =
                            formulario.querySelector(
                                ".btn-guardar-colmena"
                            );


                        const contenidoOriginal =
                            botonGuardar
                                ?
                                botonGuardar.innerHTML
                                :
                                "";


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


                        try {

                            /* ==================================
                            FORM DATA
                            ================================== */

                            const datosFormulario =
                                new FormData(
                                    formulario
                                );


                            /* ==================================
                            PETICIÓN
                            ================================== */

                            const respuesta =
                                await fetch(
                                    formulario.action,
                                    {
                                        method:
                                            "POST",

                                        body:
                                            datosFormulario,

                                        headers: {
                                            "X-Requested-With":
                                                "XMLHttpRequest",
                                        },
                                    }
                                );


                            const datos =
                                await respuesta.json();


                            /* ==================================
                            ERROR DEL BACKEND
                            ================================== */

                            if (
                                !respuesta.ok
                                ||
                                !datos.ok
                            ) {

                                mostrarValidacion(
                                    datos.error
                                    ||
                                    "No fue posible actualizar la colmena."
                                );


                                return;

                            }


                            /* ==================================
                            ACTUALIZAR TODA LA INTERFAZ
                            ================================== */

                            actualizarColmenaEnPantalla(
                                datos.colmena,
                                formulario
                            );


                            /* ==================================
                            CONTADORES
                            ================================== */

                            aplicarResumenColmenas(
                                datos.resumen
                            );


                            /* ==================================
                            CERRAR GESTIONAR
                            ================================== */

                            const modal =
                                formulario.closest(
                                    ".modal-editar-colmena"
                                );


                            cerrarModalEditar(
                                modal
                            );


                            /* ==================================
                            MENSAJE
                            ================================== */

                            mostrarValidacion(
                                datos.mensaje,
                                "Cambios guardados"
                            );

                        }

                        catch (
                            error
                        ) {

                            console.error(
                                "Error actualizando la colmena:",
                                error
                            );


                            mostrarValidacion(
                                "Ocurrió un error al guardar los cambios. Inténtalo nuevamente."
                            );

                        }

                        finally {

                            if (
                                botonGuardar
                            ) {

                                botonGuardar.disabled =
                                    false;


                                botonGuardar.innerHTML =
                                    contenidoOriginal;

                            }

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

    /* Antes los select filtraban al cambiarlos. Se quitó porque
       cada filtro provoca una recarga completa de la página: al
       poner dos o tres filtros seguidos se recargaba dos o tres
       veces, y perdías el que estabas eligiendo mientras la
       página se iba.

       Ahora se elige todo y se aplica una sola vez con el botón
       Filtrar, o con Enter desde el buscador. */





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