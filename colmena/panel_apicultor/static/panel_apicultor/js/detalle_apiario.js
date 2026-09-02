/* ==========================================================
   DETALLE APIARIO - PANEL APICULTOR
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* ==================================================
           UTILIDAD - LEER JSON DE DJANGO
        ================================================== */

        function leerJsonScript(
            id,
            valorDefecto = 0
        ) {

            const elemento = (
                document.getElementById(
                    id
                )
            );


            if (!elemento) {

                return valorDefecto;

            }


            try {

                const valor = JSON.parse(
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



        /* ==================================================
           UTILIDAD - CONVERTIR A NÚMERO
        ================================================== */

        function convertirNumero(
            valor
        ) {

            const numero = Number(
                valor
            );


            if (
                Number.isNaN(
                    numero
                )
            ) {

                return 0;

            }


            return numero;

        }



        /* ==================================================
           DATOS DE ESTADO DE COLMENAS
        ================================================== */

        const colmenasActivas = convertirNumero(
            leerJsonScript(
                "detalle-colmenas-activas",
                0
            )
        );


        const colmenasRevision = convertirNumero(
            leerJsonScript(
                "detalle-colmenas-revision",
                0
            )
        );


        const colmenasRiesgo = convertirNumero(
            leerJsonScript(
                "detalle-colmenas-riesgo",
                0
            )
        );


        const colmenasInactivas = convertirNumero(
            leerJsonScript(
                "detalle-colmenas-inactivas",
                0
            )
        );



        /* ==================================================
           TOTAL DE COLMENAS
        ================================================== */

        const totalColmenas = (

            colmenasActivas
            +
            colmenasRevision
            +
            colmenasRiesgo
            +
            colmenasInactivas

        );



        /* ==================================================
           GRÁFICA DONA
        ================================================== */

        const canvasEstadoApiario = (
            document.getElementById(
                "graficaEstadoApiario"
            )
        );


        if (
            canvasEstadoApiario
            &&
            typeof Chart !== "undefined"
        ) {


            /* ==============================================
               SIN DATOS
            ============================================== */

            const sinDatos = (
                totalColmenas === 0
            );


            const datosGrafica = (
                sinDatos

                ? [
                    1
                ]

                : [
                    colmenasActivas,
                    colmenasRevision,
                    colmenasRiesgo,
                    colmenasInactivas
                ]
            );


            const etiquetasGrafica = (
                sinDatos

                ? [
                    "Sin colmenas"
                ]

                : [
                    "Activas",
                    "Revisión",
                    "Riesgo",
                    "Inactivas"
                ]
            );


            const coloresGrafica = (
                sinDatos

                ? [
                    "#E7E9DF"
                ]

                : [
                    "#78A965",
                    "#F2C94C",
                    "#F08A6A",
                    "#BFC7C2"
                ]
            );



            /* ==============================================
               TEXTO EN EL CENTRO DE LA DONA
            ============================================== */

            const textoCentroApiario = {

                id:
                    "textoCentroApiario",


                afterDraw(
                    chart
                ) {

                    const meta = (
                        chart.getDatasetMeta(
                            0
                        )
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


                    const arco = (
                        meta.data[0]
                    );


                    if (!arco) {

                        return;

                    }


                    const ctx = (
                        chart.ctx
                    );


                    ctx.save();


                    /* ==============================
                       CENTRADO
                    ============================== */

                    ctx.textAlign =
                        "center";


                    ctx.textBaseline =
                        "middle";



                    /* ==============================
                       NÚMERO
                    ============================== */

                    ctx.fillStyle =
                        "#214F3B";


                    ctx.font =
                        '800 24px "Montserrat Alternates"';


                    ctx.fillText(
                        totalColmenas,
                        arco.x,
                        arco.y - 7
                    );



                    /* ==============================
                       TEXTO
                    ============================== */

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



            /* ==============================================
               CREAR GRÁFICA
            ============================================== */

            new Chart(
                canvasEstadoApiario,
                {

                    type:
                        "doughnut",


                    data: {

                        labels:
                            etiquetasGrafica,


                        datasets: [

                            {

                                data:
                                    datosGrafica,

                                backgroundColor:
                                    coloresGrafica,

                                borderColor:
                                    "#FFFFFF",

                                borderWidth:
                                    3,

                                hoverOffset:
                                    sinDatos
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


                        plugins: {


                            /* =========================
                               LEYENDA
                            ========================== */

                            legend: {

                                display:
                                    false

                            },


                            /* =========================
                               TOOLTIP
                            ========================== */

                            tooltip: {

                                enabled:
                                    !sinDatos,

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

                                            const valor = (
                                                Number(
                                                    context.raw
                                                )
                                            );


                                            let porcentaje = 0;


                                            if (
                                                totalColmenas
                                                >
                                                0
                                            ) {

                                                porcentaje = (

                                                    valor
                                                    /
                                                    totalColmenas
                                                    *
                                                    100

                                                ).toFixed(
                                                    1
                                                );

                                            }


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



        /* ==================================================
           ERROR SI CHART.JS NO CARGÓ
        ================================================== */

        if (
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



        /* ==================================================
           MODALES DE COLMENAS
        ================================================== */

        const botonesVerColmena = (
            document.querySelectorAll(
                "[data-modal-colmena]"
            )
        );


        const overlaysColmena = (
            document.querySelectorAll(
                ".modal-colmena-overlay"
            )
        );



        /* ==================================================
           ABRIR MODAL
        ================================================== */

        function abrirModalColmena(
            modal
        ) {

            if (!modal) {

                return;

            }


            /* ==============================================
               CERRAR CUALQUIER OTRO MODAL
            ============================================== */

            overlaysColmena.forEach(
                function (
                    otroModal
                ) {

                    if (
                        otroModal !== modal
                    ) {

                        otroModal.classList.remove(
                            "activo"
                        );

                    }

                }
            );


            /* ==============================================
               ABRIR
            ============================================== */

            modal.classList.add(
                "activo"
            );


            /* ==============================================
               BLOQUEAR SCROLL DEL BODY
            ============================================== */

            document.body.style.overflow =
                "hidden";


            /* ==============================================
               ENFOCAR X
            ============================================== */

            const botonCerrar = (
                modal.querySelector(
                    ".modal-colmena-cerrar"
                )
            );


            if (botonCerrar) {

                setTimeout(
                    function () {

                        botonCerrar.focus();

                    },
                    100
                );

            }

        }



        /* ==================================================
           CERRAR MODAL
        ================================================== */

        function cerrarModalColmena(
            modal
        ) {

            if (!modal) {

                return;

            }


            modal.classList.remove(
                "activo"
            );


            /* ==============================================
               DESBLOQUEAR SCROLL
            ============================================== */

            const existeOtroModalAbierto = (
                document.querySelector(
                    ".modal-colmena-overlay.activo"
                )
            );


            if (
                !existeOtroModalAbierto
            ) {

                document.body.style.overflow =
                    "";

            }

        }



        /* ==================================================
           BOTONES "VER COLMENA"
        ================================================== */

        botonesVerColmena.forEach(
            function (
                boton
            ) {

                boton.addEventListener(
                    "click",
                    function () {

                        const idModal = (
                            this.dataset
                                .modalColmena
                        );


                        if (!idModal) {

                            return;

                        }


                        const modal = (
                            document.getElementById(
                                idModal
                            )
                        );


                        abrirModalColmena(
                            modal
                        );

                    }
                );

            }
        );



        /* ==================================================
           BOTONES CERRAR MODAL
        ================================================== */

        document
            .querySelectorAll(
                "[data-cerrar-modal-colmena]"
            )
            .forEach(
                function (
                    boton
                ) {

                    boton.addEventListener(
                        "click",
                        function () {

                            const modal = (
                                this.closest(
                                    ".modal-colmena-overlay"
                                )
                            );


                            cerrarModalColmena(
                                modal
                            );

                        }
                    );

                }
            );



        /* ==================================================
           CERRAR AL HACER CLIC EN EL FONDO
        ================================================== */

        overlaysColmena.forEach(
            function (
                modal
            ) {

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

                            cerrarModalColmena(
                                modal
                            );

                        }

                    }
                );

            }
        );



        /* ==================================================
           CERRAR CON ESC
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


                const modalActivo = (
                    document.querySelector(
                        ".modal-colmena-overlay.activo"
                    )
                );


                if (
                    modalActivo
                ) {

                    cerrarModalColmena(
                        modalActivo
                    );

                }

            }
        );

    }
);