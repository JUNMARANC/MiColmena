document.addEventListener("DOMContentLoaded", function () {

    // =========================================================
    // DETALLE APIARIO - PANEL APICULTOR
    // =========================================================


    // =========================================================
    // 1. UTILIDADES GENERALES
    // =========================================================

    function leerJsonScript(
        id,
        valorDefecto = 0
    ) {

        const elemento =
            document.getElementById(
                id
            );


        if (!elemento) {

            return valorDefecto;

        }


        try {

            const valor =
                JSON.parse(
                    elemento.textContent
                );


            if (
                valor === null
                ||
                valor === undefined
                ||
                valor === ""
            ) {

                return valorDefecto;

            }


            return valor;

        } catch (error) {

            console.error(
                `Error leyendo ${id}:`,
                error
            );


            return valorDefecto;

        }

    }



    function convertirNumero(
        valor
    ) {

        const numero =
            Number(
                valor
            );


        return Number.isNaN(
            numero
        )
            ? 0
            : numero;

    }



    function obtenerExtension(
        nombreArchivo
    ) {

        if (
            !nombreArchivo
            ||
            !nombreArchivo.includes(".")
        ) {

            return "";

        }


        return nombreArchivo
            .toLowerCase()
            .split(".")
            .pop();

    }



    // =========================================================
    // 2. DATOS DE ESTADO DE LAS COLMENAS
    // =========================================================

    let colmenasActivas =
        convertirNumero(
            leerJsonScript(
                "detalle-colmenas-activas",
                0
            )
        );


    let colmenasRevision =
        convertirNumero(
            leerJsonScript(
                "detalle-colmenas-revision",
                0
            )
        );


    let colmenasRiesgo =
        convertirNumero(
            leerJsonScript(
                "detalle-colmenas-riesgo",
                0
            )
        );


    let colmenasInactivas =
        convertirNumero(
            leerJsonScript(
                "detalle-colmenas-inactivas",
                0
            )
        );


    let totalColmenas = (
        colmenasActivas
        +
        colmenasRevision
        +
        colmenasRiesgo
        +
        colmenasInactivas
    );


    // =========================================================
    // ELEMENTOS DE LAS TARJETAS
    // =========================================================

    const contadorTotal =
        document.getElementById(
            "detalleTotalColmenas"
        );


    const contadorActivas =
        document.getElementById(
            "detalleColmenasActivas"
        );


    const contadorRevision =
        document.getElementById(
            "detalleColmenasRevision"
        );


    const contadorRiesgo =
        document.getElementById(
            "detalleColmenasRiesgo"
        );


    const contadorInactivas =
        document.getElementById(
            "detalleColmenasInactivas"
        );


    // =========================================================
    // ELEMENTOS DE LA LEYENDA
    // =========================================================

    const leyendaActivas =
        document.getElementById(
            "leyendaColmenasActivas"
        );


    const leyendaRevision =
        document.getElementById(
            "leyendaColmenasRevision"
        );


    const leyendaRiesgo =
        document.getElementById(
            "leyendaColmenasRiesgo"
        );


    const leyendaInactivas =
        document.getElementById(
            "leyendaColmenasInactivas"
        );


    // =========================================================
    // 3. GRÁFICA DE ESTADO DEL APIARIO
    // =========================================================

    const canvasEstadoApiario =
        document.getElementById(
            "graficaEstadoApiario"
        );


    let graficaEstadoApiario =
        null;


    // =========================================================
    // CONFIGURACIÓN ACTUAL DE LA GRÁFICA
    // =========================================================

    function obtenerDatosGraficaApiario() {

        const sinDatos =
            totalColmenas === 0;


        return {

            sinDatos:
                sinDatos,


            datos:
                sinDatos

                    ? [
                        1
                    ]

                    : [
                        colmenasActivas,
                        colmenasRevision,
                        colmenasRiesgo,
                        colmenasInactivas
                    ],


            etiquetas:
                sinDatos

                    ? [
                        "Sin colmenas"
                    ]

                    : [
                        "Activas",
                        "Revisión",
                        "Riesgo",
                        "Inactivas"
                    ],


            colores:
                sinDatos

                    ? [
                        "#E7E9DF"
                    ]

                    : [
                        "#78A965",
                        "#F2C94C",
                        "#F08A6A",
                        "#BFC7C2"
                    ],

        };

    }


    // =========================================================
    // TEXTO CENTRAL DE LA DONA
    // =========================================================

    const textoCentroApiario = {

        id:
            "textoCentroApiario",


        afterDraw(
            chart
        ) {

            const meta =
                chart.getDatasetMeta(
                    0
                );


            if (
                !meta
                ||
                !meta.data
                ||
                meta.data.length === 0
            ) {

                return;

            }


            const arco =
                meta.data[0];


            if (!arco) {

                return;

            }


            const ctx =
                chart.ctx;


            ctx.save();


            ctx.textAlign =
                "center";


            ctx.textBaseline =
                "middle";


            ctx.fillStyle =
                "#214F3B";


            ctx.font =
                '800 24px "Montserrat Alternates"';


            ctx.fillText(
                totalColmenas,
                arco.x,
                arco.y - 7
            );


            ctx.fillStyle =
                "#68776E";


            ctx.font =
                '600 9px "Montserrat Alternates"';


            ctx.fillText(

                totalColmenas === 1
                    ? "Colmena"
                    : "Colmenas",

                arco.x,

                arco.y + 15

            );


            ctx.restore();

        }

    };


    // =========================================================
    // CREAR GRÁFICA
    // =========================================================

    function crearGraficaEstadoApiario() {

        if (
            !canvasEstadoApiario
            ||
            typeof Chart === "undefined"
        ) {

            return;

        }


        const configuracion =
            obtenerDatosGraficaApiario();


        graficaEstadoApiario =
            new Chart(
                canvasEstadoApiario,
                {

                    type:
                        "doughnut",


                    data: {

                        labels:
                            configuracion.etiquetas,


                        datasets: [

                            {

                                data:
                                    configuracion.datos,


                                backgroundColor:
                                    configuracion.colores,


                                borderColor:
                                    "#FFFFFF",


                                borderWidth:
                                    3,


                                hoverOffset:
                                    configuracion.sinDatos
                                        ? 0
                                        : 6

                            }

                        ]

                    },


                    options: {

                        responsive:
                            true,


                        maintainAspectRatio:
                            false,


                        cutout:
                            "67%",


                        interaction: {

                            intersect:
                                true,


                            mode:
                                "nearest"

                        },


                        plugins: {


                            legend: {

                                display:
                                    false

                            },


                            tooltip: {

                                enabled:
                                    !configuracion.sinDatos,


                                backgroundColor:
                                    "#214F3B",


                                titleColor:
                                    "#FFFFFF",


                                bodyColor:
                                    "#FFFFFF",


                                padding:
                                    12,


                                cornerRadius:
                                    10,


                                callbacks: {

                                    label:
                                        function (
                                            context
                                        ) {

                                            const valor =
                                                Number(
                                                    context.raw
                                                );


                                            const porcentaje =
                                                totalColmenas > 0

                                                    ? (
                                                        (
                                                            valor
                                                            /
                                                            totalColmenas
                                                        )
                                                        *
                                                        100
                                                    ).toFixed(
                                                        1
                                                    )

                                                    : 0;


                                            return (
                                                context.label
                                                +
                                                ": "
                                                +
                                                valor
                                                +
                                                " ("
                                                +
                                                porcentaje
                                                +
                                                "%)"
                                            );

                                        }

                                }

                            }

                        }

                    },


                    plugins: [

                        textoCentroApiario

                    ]

                }
            );

    }


    // =========================================================
    // ACTUALIZAR TARJETAS Y LEYENDA
    // =========================================================

    function actualizarContadoresDetalleApiario() {

        if (contadorTotal) {

            contadorTotal.textContent =
                totalColmenas;

        }


        if (contadorActivas) {

            contadorActivas.textContent =
                colmenasActivas;

        }


        if (contadorRevision) {

            contadorRevision.textContent =
                colmenasRevision;

        }


        if (contadorRiesgo) {

            contadorRiesgo.textContent =
                colmenasRiesgo;

        }


        if (contadorInactivas) {

            contadorInactivas.textContent =
                colmenasInactivas;

        }


        if (leyendaActivas) {

            leyendaActivas.textContent =
                colmenasActivas;

        }


        if (leyendaRevision) {

            leyendaRevision.textContent =
                colmenasRevision;

        }


        if (leyendaRiesgo) {

            leyendaRiesgo.textContent =
                colmenasRiesgo;

        }


        if (leyendaInactivas) {

            leyendaInactivas.textContent =
                colmenasInactivas;

        }

    }


    // =========================================================
    // ACTUALIZAR DONA EXISTENTE
    // =========================================================

    function actualizarGraficaEstadoApiario() {

        if (!graficaEstadoApiario) {

            return;

        }


        const configuracion =
            obtenerDatosGraficaApiario();


        graficaEstadoApiario.data.labels =
            configuracion.etiquetas;


        graficaEstadoApiario
            .data
            .datasets[0]
            .data =
                configuracion.datos;


        graficaEstadoApiario
            .data
            .datasets[0]
            .backgroundColor =
                configuracion.colores;


        graficaEstadoApiario
            .data
            .datasets[0]
            .hoverOffset =
                configuracion.sinDatos
                    ? 0
                    : 6;


        graficaEstadoApiario
            .options
            .plugins
            .tooltip
            .enabled =
                !configuracion.sinDatos;


        graficaEstadoApiario.update();

    }


    // =========================================================
    // APLICAR DATOS DEL SERVIDOR
    // =========================================================

    function aplicarResumenDetalleApiario(
        resumen
    ) {

        if (!resumen) {

            return;

        }


        totalColmenas =
            convertirNumero(
                resumen.total
            );


        colmenasActivas =
            convertirNumero(
                resumen.activas
            );


        colmenasRevision =
            convertirNumero(
                resumen.revision
            );


        colmenasRiesgo =
            convertirNumero(
                resumen.riesgo
            );


        colmenasInactivas =
            convertirNumero(
                resumen.inactivas
            );


        actualizarContadoresDetalleApiario();


        actualizarGraficaEstadoApiario();

    }


    // =========================================================
    // CARGAR DATOS DINÁMICOS
    // =========================================================

    let cargandoDatosDetalle =
        false;


    async function cargarDatosDetalleApiario() {

        if (
            typeof URL_DATOS_DETALLE_APIARIO
            ===
            "undefined"
            ||
            !URL_DATOS_DETALLE_APIARIO
        ) {

            return;

        }


        if (cargandoDatosDetalle) {

            return;

        }


        cargandoDatosDetalle =
            true;


        try {

            const respuesta =
                await fetch(
                    URL_DATOS_DETALLE_APIARIO,
                    {

                        method:
                            "GET",

                        headers: {

                            "X-Requested-With":
                                "XMLHttpRequest"

                        },

                        credentials:
                            "same-origin",

                        cache:
                            "no-store",

                    }
                );


            if (!respuesta.ok) {

                throw new Error(
                    "No fue posible actualizar "
                    +
                    "el resumen del apiario."
                );

            }


            const datos =
                await respuesta.json();


            if (
                !datos
                ||
                datos.ok !== true
            ) {

                throw new Error(
                    datos?.error
                    ||
                    "Respuesta inválida del servidor."
                );

            }


            aplicarResumenDetalleApiario(
                datos.resumen
            );

        } catch (error) {

            console.warn(
                "No se pudieron actualizar "
                +
                "los datos del detalle del apiario:",
                error
            );

        } finally {

            cargandoDatosDetalle =
                false;

        }

    }


    // =========================================================
    // INICIALIZACIÓN DE LA GRÁFICA
    // =========================================================

    if (
        canvasEstadoApiario
        &&
        typeof Chart !== "undefined"
    ) {

        crearGraficaEstadoApiario();

    } else if (
        canvasEstadoApiario
        &&
        typeof Chart === "undefined"
    ) {

        console.error(
            "Chart.js no está disponible. "
            +
            "Verifica que el CDN esté cargando."
        );

    }


    // =========================================================
    // PRIMERA SINCRONIZACIÓN CON EL SERVIDOR
    // =========================================================

    cargarDatosDetalleApiario();


    // =========================================================
    // ACTUALIZACIÓN AUTOMÁTICA
    // CADA 10 SEGUNDOS
    // =========================================================

    const intervaloDetalleApiario =
        window.setInterval(
            function () {

                if (
                    document.visibilityState
                    ===
                    "visible"
                ) {

                    cargarDatosDetalleApiario();

                }

            },
            10000
        );


    // =========================================================
    // LIMPIAR INTERVALO AL SALIR
    // =========================================================

    window.addEventListener(
        "pagehide",
        function () {

            window.clearInterval(
                intervaloDetalleApiario
            );

        }
    );



    // =========================================================
    // 4. REFERENCIAS DE LOS MODALES
    // =========================================================

    const botonesVerColmena =
        document.querySelectorAll(
            "[data-modal-colmena]"
        );


    const overlaysColmena =
        document.querySelectorAll(
            ".modal-colmena-overlay"
        );


    const botonesCerrarColmena =
        document.querySelectorAll(
            "[data-cerrar-modal-colmena]"
        );


    const botonesGestionarColmena =
        document.querySelectorAll(
            "[data-editar-colmena-detalle]"
        );


    const botonesCancelarEdicionColmena =
        document.querySelectorAll(
            "[data-cancelar-edicion-colmena]"
        );


    const formulariosEditarColmena =
        document.querySelectorAll(
            ".form-editar-colmena-detalle"
        );


    let modalColmenaActivo =
        null;


    let botonOrigenColmena =
        null;



    // =========================================================
    // 5. GUARDAR ESTADO ORIGINAL DEL FORMULARIO
    // =========================================================

    const datosOriginalesColmena =
        new WeakMap();



    formulariosEditarColmena.forEach(
        function (
            formulario
        ) {

            const estado =
                formulario.querySelector(
                    '[name="estado"]'
                );


            const descripcion =
                formulario.querySelector(
                    '[name="descripcion"]'
                );


            datosOriginalesColmena.set(
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

        }
    );



    // =========================================================
    // RESTAURAR FORMULARIO
    // =========================================================

    function restaurarFormularioColmena(
        formulario
    ) {

        if (!formulario) {

            return;

        }


        const originales =
            datosOriginalesColmena.get(
                formulario
            );


        if (!originales) {

            return;

        }


        const estado =
            formulario.querySelector(
                '[name="estado"]'
            );


        const descripcion =
            formulario.querySelector(
                '[name="descripcion"]'
            );


        const imagen =
            formulario.querySelector(
                ".input-imagen-colmena-detalle"
            );


        const botonGuardar =
            formulario.querySelector(
                ".btn-guardar-apiario"
            );



        if (estado) {

            estado.value =
                originales.estado;


            estado.classList.remove(
                "is-invalid"
            );

        }



        if (descripcion) {

            descripcion.value =
                originales.descripcion;


            descripcion.classList.remove(
                "is-invalid"
            );

        }



        if (imagen) {

            imagen.value =
                "";


            imagen.classList.remove(
                "is-invalid"
            );

        }



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
    // 6. CONTROL DEL SCROLL
    // =========================================================

    function existeOverlayAbierto() {

        return Boolean(

            document.querySelector(
                ".modal-colmena-overlay.activo"
            )

            ||

            document.querySelector(
                ".modal-editar-apiario.activo"
            )

            ||

            document.querySelector(
                ".visor-apiario-overlay.activo"
            )

        );

    }



    function bloquearScroll() {

        document.body.style.overflow =
            "hidden";

    }



    function restaurarScroll() {

        requestAnimationFrame(
            function () {

                if (
                    !existeOverlayAbierto()
                ) {

                    document.body.style.overflow =
                        "";

                }

            }
        );

    }



    // =========================================================
    // 7. VISTA DETALLE / VISTA GESTIONAR
    // =========================================================


    // =========================================================
    // MOSTRAR DETALLE
    // =========================================================

    function mostrarVistaDetalleColmena(
        modal
    ) {

        if (!modal) {

            return;

        }


        const fotografia =
            modal.querySelector(
                ".modal-colmena-fotografia-detalle"
            );


        const contenido =
            modal.querySelector(
                ".modal-colmena-contenido"
            );


        const footer =
            modal.querySelector(
                ".modal-colmena-footer"
            );



        if (fotografia) {

            fotografia.hidden =
                false;

        }



        if (contenido) {

            contenido.hidden =
                false;

        }



        if (footer) {

            footer.hidden =
                false;

        }



        modal.classList.remove(
            "modo-edicion-colmena"
        );

    }



    // =========================================================
    // OCULTAR DETALLE
    // =========================================================

    function ocultarVistaDetalleColmena(
        modal
    ) {

        if (!modal) {

            return;

        }


        const fotografia =
            modal.querySelector(
                ".modal-colmena-fotografia-detalle"
            );


        const contenido =
            modal.querySelector(
                ".modal-colmena-contenido"
            );


        const footer =
            modal.querySelector(
                ".modal-colmena-footer"
            );



        if (fotografia) {

            fotografia.hidden =
                true;

        }



        if (contenido) {

            contenido.hidden =
                true;

        }



        if (footer) {

            footer.hidden =
                true;

        }



        modal.classList.add(
            "modo-edicion-colmena"
        );

    }



    // =========================================================
    // 8. CERRAR EDICIÓN
    // =========================================================

    function cerrarEdicionColmena(
        seccion,
        restaurar = true
    ) {

        if (!seccion) {

            return;

        }


        const formulario =
            seccion.querySelector(
                ".form-editar-colmena-detalle"
            );


        if (
            restaurar
            &&
            formulario
        ) {

            restaurarFormularioColmena(
                formulario
            );

        }


        const modal =
            seccion.closest(
                ".modal-colmena"
            );


        // =====================================================
        // OCULTAR FORMULARIO
        // =====================================================

        seccion.classList.remove(
            "activo"
        );


        seccion.hidden =
            true;


        seccion.setAttribute(
            "aria-hidden",
            "true"
        );


        // =====================================================
        // VOLVER AL DETALLE
        // =====================================================

        if (modal) {

            mostrarVistaDetalleColmena(
                modal
            );


            modal.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }

    }



    // =========================================================
    // CERRAR TODAS LAS EDICIONES
    // =========================================================

    function cerrarEdicionesColmenaDelModal(
        modal,
        restaurar = true
    ) {

        if (!modal) {

            return;

        }


        modal
            .querySelectorAll(
                ".detalle-edicion-colmena"
            )
            .forEach(
                function (
                    seccion
                ) {

                    cerrarEdicionColmena(
                        seccion,
                        restaurar
                    );

                }
            );

    }



    // =========================================================
    // 9. ABRIR GESTIÓN DE COLMENA
    //
    // FUNCIONA AUNQUE LA COLMENA ESTÉ INACTIVA.
    // =========================================================

    function abrirEdicionColmena(
        idSeccion
    ) {

        if (!idSeccion) {

            return;

        }


        const seccion =
            document.getElementById(
                idSeccion
            );


        if (!seccion) {

            console.error(
                "No se encontró el formulario de gestión de la colmena:",
                idSeccion
            );


            return;

        }


        const modal =
            seccion.closest(
                ".modal-colmena"
            );


        if (!modal) {

            console.error(
                "No se encontró el modal padre de la colmena."
            );


            return;

        }


        // =====================================================
        // CERRAR OTRA EDICIÓN
        // =====================================================

        modal
            .querySelectorAll(
                ".detalle-edicion-colmena.activo"
            )
            .forEach(
                function (
                    otraSeccion
                ) {

                    if (
                        otraSeccion
                        !==
                        seccion
                    ) {

                        cerrarEdicionColmena(
                            otraSeccion,
                            true
                        );

                    }

                }
            );



        // =====================================================
        // OCULTAR DETALLE
        // =====================================================

        ocultarVistaDetalleColmena(
            modal
        );



        // =====================================================
        // MOSTRAR FORMULARIO
        // =====================================================

        seccion.hidden =
            false;


        seccion.classList.add(
            "activo"
        );


        seccion.setAttribute(
            "aria-hidden",
            "false"
        );



        // =====================================================
        // LLEVAR ARRIBA EL MODAL
        // =====================================================

        modal.scrollTo({
            top: 0,
            behavior: "smooth"
        });



        // =====================================================
        // ENFOCAR ESTADO
        // =====================================================

        const estado =
            seccion.querySelector(
                'select[name="estado"]'
            );


        if (estado) {

            setTimeout(
                function () {

                    estado.focus();

                },
                100
            );

        }

    }



    // =========================================================
    // BOTONES GESTIONAR
    // =========================================================

    botonesGestionarColmena.forEach(
        function (
            boton
        ) {

            boton.addEventListener(
                "click",
                function () {

                    const idSeccion =
                        boton.getAttribute(
                            "data-editar-colmena-detalle"
                        );


                    abrirEdicionColmena(
                        idSeccion
                    );

                }
            );

        }
    );



    // =========================================================
    // BOTONES CANCELAR EDICIÓN
    // =========================================================

    botonesCancelarEdicionColmena.forEach(
        function (
            boton
        ) {

            boton.addEventListener(
                "click",
                function () {

                    const seccion =
                        boton.closest(
                            ".detalle-edicion-colmena"
                        );


                    cerrarEdicionColmena(
                        seccion,
                        true
                    );

                }
            );

        }
    );



    // =========================================================
    // 10. VALIDACIONES
    // =========================================================

    const ESTADOS_COLMENA_VALIDOS = [

        "Activa",
        "Revisión",
        "Riesgo",
        "Inactiva"

    ];


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


    const MAX_IMAGEN_MB =
        5;


    const MAX_IMAGEN_BYTES =
        MAX_IMAGEN_MB
        *
        1024
        *
        1024;



    // =========================================================
    // VALIDAR IMAGEN
    // =========================================================

    function validarImagenColmenaFrontend(
        archivo
    ) {

        if (!archivo) {

            return {

                valido:
                    true,


                mensaje:
                    ""

            };

        }


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


        if (
            archivo.size
            >
            MAX_IMAGEN_BYTES
        ) {

            return {

                valido:
                    false,


                mensaje:
                    `La fotografía no puede superar los ${MAX_IMAGEN_MB} MB.`

            };

        }


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
    // VALIDAR FOTO AL SELECCIONAR
    // =========================================================

    document
        .querySelectorAll(
            ".input-imagen-colmena-detalle"
        )
        .forEach(
            function (
                input
            ) {

                input.addEventListener(
                    "change",
                    function () {

                        const archivo =
                            input.files
                            &&
                            input.files.length > 0

                                ? input.files[0]

                                : null;


                        if (!archivo) {

                            input.classList.remove(
                                "is-invalid"
                            );


                            return;

                        }


                        const validacion =
                            validarImagenColmenaFrontend(
                                archivo
                            );


                        if (
                            !validacion.valido
                        ) {

                            input.classList.add(
                                "is-invalid"
                            );


                            window.alert(
                                validacion.mensaje
                            );


                            input.value =
                                "";


                            return;

                        }


                        input.classList.remove(
                            "is-invalid"
                        );

                    }
                );

            }
        );



    // =========================================================
    // 11. GUARDAR EDICIÓN DE COLMENA
    // =========================================================

    formulariosEditarColmena.forEach(
        function (
            formulario
        ) {

            formulario.addEventListener(
                "submit",
                function (
                    evento
                ) {

                    // =========================================
                    // ESTADO
                    // =========================================

                    const estado =
                        formulario.querySelector(
                            '[name="estado"]'
                        );


                    const descripcion =
                        formulario.querySelector(
                            '[name="descripcion"]'
                        );


                    const inputImagen =
                        formulario.querySelector(
                            ".input-imagen-colmena-detalle"
                        );


                    const valorEstado =
                        estado
                            ? estado.value.trim()
                            : "";



                    if (
                        !ESTADOS_COLMENA_VALIDOS.includes(
                            valorEstado
                        )
                    ) {

                        evento.preventDefault();


                        if (estado) {

                            estado.classList.add(
                                "is-invalid"
                            );


                            estado.focus();

                        }


                        window.alert(
                            "Selecciona un estado válido para la colmena."
                        );


                        return;

                    }



                    if (estado) {

                        estado.classList.remove(
                            "is-invalid"
                        );

                    }



                    // =========================================
                    // DESCRIPCIÓN
                    // =========================================

                    if (descripcion) {

                        descripcion.value =
                            descripcion.value.trim();


                        if (
                            !descripcion.value
                        ) {

                            evento.preventDefault();


                            descripcion.classList.add(
                                "is-invalid"
                            );


                            descripcion.focus();


                            window.alert(
                                "Las observaciones de la colmena no pueden quedar vacías."
                            );


                            return;

                        }


                        descripcion.classList.remove(
                            "is-invalid"
                        );

                    }



                    // =========================================
                    // FOTOGRAFÍA
                    // =========================================

                    if (
                        inputImagen
                        &&
                        inputImagen.files
                        &&
                        inputImagen.files.length > 0
                    ) {

                        const validacion =
                            validarImagenColmenaFrontend(
                                inputImagen.files[0]
                            );


                        if (
                            !validacion.valido
                        ) {

                            evento.preventDefault();


                            inputImagen.classList.add(
                                "is-invalid"
                            );


                            window.alert(
                                validacion.mensaje
                            );


                            return;

                        }

                    }



                    // =========================================
                    // EVITAR DOBLE SUBMIT
                    // =========================================

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
    // 12. ABRIR MODAL DE COLMENA
    // =========================================================

    function abrirModalColmena(
        overlay,
        botonOrigen = null
    ) {

        if (!overlay) {

            return;

        }


        // =====================================================
        // CERRAR OTROS MODALES
        // =====================================================

        overlaysColmena.forEach(
            function (
                otroOverlay
            ) {

                if (
                    otroOverlay
                    !==
                    overlay
                ) {

                    const otroModal =
                        otroOverlay.querySelector(
                            ".modal-colmena"
                        );


                    if (otroModal) {

                        cerrarEdicionesColmenaDelModal(
                            otroModal,
                            true
                        );

                    }


                    otroOverlay.classList.remove(
                        "activo"
                    );


                    otroOverlay.setAttribute(
                        "aria-hidden",
                        "true"
                    );

                }

            }
        );



        modalColmenaActivo =
            overlay;


        botonOrigenColmena =
            botonOrigen;



        const modal =
            overlay.querySelector(
                ".modal-colmena"
            );


        if (modal) {

            cerrarEdicionesColmenaDelModal(
                modal,
                true
            );


            mostrarVistaDetalleColmena(
                modal
            );


            modal.scrollTop =
                0;

        }



        overlay.classList.add(
            "activo"
        );


        overlay.setAttribute(
            "aria-hidden",
            "false"
        );


        bloquearScroll();



        const botonCerrar =
            overlay.querySelector(
                ".modal-colmena-cerrar"
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



    // =========================================================
    // 13. CERRAR MODAL DE COLMENA
    // =========================================================

    function cerrarModalColmena(
        overlay
    ) {

        if (!overlay) {

            return;

        }


        const modal =
            overlay.querySelector(
                ".modal-colmena"
            );


        if (modal) {

            cerrarEdicionesColmenaDelModal(
                modal,
                true
            );


            mostrarVistaDetalleColmena(
                modal
            );


            modal.scrollTop =
                0;

        }


        overlay.classList.remove(
            "activo"
        );


        overlay.setAttribute(
            "aria-hidden",
            "true"
        );


        if (
            modalColmenaActivo
            ===
            overlay
        ) {

            modalColmenaActivo =
                null;

        }


        restaurarScroll();



        if (
            botonOrigenColmena
            &&
            document.body.contains(
                botonOrigenColmena
            )
        ) {

            botonOrigenColmena.focus();

        }


        botonOrigenColmena =
            null;

    }



    // =========================================================
    // 14. BOTONES VER COLMENA
    // =========================================================

    botonesVerColmena.forEach(
        function (
            boton
        ) {

            boton.addEventListener(
                "click",
                function () {

                    const idModal =
                        boton.getAttribute(
                            "data-modal-colmena"
                        );


                    if (!idModal) {

                        return;

                    }


                    const overlay =
                        document.getElementById(
                            idModal
                        );


                    abrirModalColmena(
                        overlay,
                        boton
                    );

                }
            );

        }
    );



    // =========================================================
    // 15. BOTONES CERRAR
    // =========================================================

    botonesCerrarColmena.forEach(
        function (
            boton
        ) {

            boton.addEventListener(
                "click",
                function () {

                    const overlay =
                        boton.closest(
                            ".modal-colmena-overlay"
                        );


                    cerrarModalColmena(
                        overlay
                    );

                }
            );

        }
    );



    // =========================================================
    // 16. CERRAR AL HACER CLICK EN EL FONDO
    // =========================================================

    overlaysColmena.forEach(
        function (
            overlay
        ) {

            overlay.addEventListener(
                "mousedown",
                function (
                    evento
                ) {

                    if (
                        evento.target
                        ===
                        overlay
                    ) {

                        cerrarModalColmena(
                            overlay
                        );

                    }

                }
            );

        }
    );



    // =========================================================
    // NO CERRAR AL HACER CLICK DENTRO
    // =========================================================

    document
        .querySelectorAll(
            ".modal-colmena"
        )
        .forEach(
            function (
                modal
            ) {

                modal.addEventListener(
                    "mousedown",
                    function (
                        evento
                    ) {

                        evento.stopPropagation();

                    }
                );

            }
        );



    // =========================================================
    // 17. TECLA ESCAPE
    // =========================================================

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



            // =================================================
            // VISOR DE FOTO DEL APIARIO
            //
            // Lo controla apiarios.js
            // =================================================

            if (
                document.querySelector(
                    ".visor-apiario-overlay.activo"
                )
            ) {

                return;

            }



            // =================================================
            // MODAL GESTIONAR APIARIO
            //
            // Lo controla apiarios.js
            // =================================================

            if (
                document.querySelector(
                    ".modal-editar-apiario.activo"
                )
            ) {

                return;

            }



            // =================================================
            // SI ESTAMOS EDITANDO COLMENA
            //
            // Primer ESC vuelve al detalle.
            // =================================================

            const edicionActiva =
                document.querySelector(
                    ".detalle-edicion-colmena.activo"
                );


            if (edicionActiva) {

                cerrarEdicionColmena(
                    edicionActiva,
                    true
                );


                return;

            }



            // =================================================
            // SI ESTÁ ABIERTO EL DETALLE
            //
            // Segundo ESC cierra el modal.
            // =================================================

            const overlayActivo =
                document.querySelector(
                    ".modal-colmena-overlay.activo"
                );


            if (overlayActivo) {

                cerrarModalColmena(
                    overlayActivo
                );

            }

        }
    );



    // =========================================================
    // 18. COLMENAS INACTIVAS
    //
    // Pueden visualizarse y gestionarse.
    // Solo se bloquean actividades nuevas.
    // =========================================================

    document
        .querySelectorAll(
            ".fila-colmena-inactiva"
        )
        .forEach(
            function (
                fila
            ) {

                fila.setAttribute(
                    "aria-label",
                    (
                        "Colmena inactiva. "
                        +
                        "Puede visualizarse y gestionarse, "
                        +
                        "pero no permite nuevas actividades."
                    )
                );

            }
        );



    // =========================================================
    // INDICADORES BLOQUEADOS
    // =========================================================

    document
        .querySelectorAll(
            ".btn-accion-colmena-detalle.bloqueado"
        )
        .forEach(
            function (
                elemento
            ) {

                elemento.setAttribute(
                    "aria-disabled",
                    "true"
                );

            }
        );



    // =========================================================
    // 19. PAGESHOW
    //
    // Evita que al regresar con Atrás quede un modal abierto.
    // =========================================================

    window.addEventListener(
        "pageshow",
        function () {

            overlaysColmena.forEach(
                function (
                    overlay
                ) {

                    const modal =
                        overlay.querySelector(
                            ".modal-colmena"
                        );


                    if (modal) {

                        cerrarEdicionesColmenaDelModal(
                            modal,
                            true
                        );


                        mostrarVistaDetalleColmena(
                            modal
                        );


                        modal.scrollTop =
                            0;

                    }


                    overlay.classList.remove(
                        "activo"
                    );


                    overlay.setAttribute(
                        "aria-hidden",
                        "true"
                    );

                }
            );



            formulariosEditarColmena.forEach(
                function (
                    formulario
                ) {

                    restaurarFormularioColmena(
                        formulario
                    );

                }
            );



            modalColmenaActivo =
                null;


            botonOrigenColmena =
                null;



            if (
                !existeOverlayAbierto()
            ) {

                document.body.style.overflow =
                    "";

            }

        }
    );



    // =========================================================
    // 20. PAGEHIDE
    // =========================================================

    window.addEventListener(
        "pagehide",
        function () {

            const modalApiario =
                document.querySelector(
                    ".modal-editar-apiario.activo"
                );


            const visorApiario =
                document.querySelector(
                    ".visor-apiario-overlay.activo"
                );


            if (
                !modalApiario
                &&
                !visorApiario
            ) {

                document.body.style.overflow =
                    "";

            }

        }
    );



    // =========================================================
    // FIN DETALLE APIARIO
    // =========================================================

});