/* ==========================================================
   DASHBOARD APICULTOR
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /* ==================================================
           LEER JSON GENERADO POR DJANGO
        ================================================== */

        function leerJsonScript(
            id,
            valorDefecto
        ) {

            const elemento = document.getElementById(
                id
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
                    `No se pudo leer ${id}:`,
                    error
                );


                return valorDefecto;

            }

        }



        /* ==================================================
           NORMALIZAR ARRAY
        ================================================== */

        function normalizarArray(
            valor
        ) {

            if (
                Array.isArray(valor)
            ) {

                return valor;

            }


            return [];

        }



        /* ==================================================
           NORMALIZAR NÚMERO
        ================================================== */

        function normalizarNumero(
            valor
        ) {

            const numero = Number(
                valor
            );


            if (
                Number.isNaN(numero)
            ) {

                return 0;

            }


            return numero;

        }



        /* ==================================================
           DATOS DE ACTIVIDAD
        ================================================== */

        let actividadLabels = normalizarArray(
            leerJsonScript(
                "actividad-labels",
                []
            )
        );


        let actividadRevisiones = normalizarArray(
            leerJsonScript(
                "actividad-revisiones",
                []
            )
        );


        let actividadMantenimientos = normalizarArray(
            leerJsonScript(
                "actividad-mantenimientos",
                []
            )
        );


        let actividadIncidencias = normalizarArray(
            leerJsonScript(
                "actividad-incidencias",
                []
            )
        );



        /* ==================================================
           SI TODAVÍA NO HAY ACTIVIDAD
        ================================================== */

        if (
            actividadLabels.length === 0
        ) {

            actividadLabels = [
                "Semana 1",
                "Semana 2",
                "Semana 3",
                "Semana 4"
            ];


            actividadRevisiones = [
                0,
                0,
                0,
                0
            ];


            actividadMantenimientos = [
                0,
                0,
                0,
                0
            ];


            actividadIncidencias = [
                0,
                0,
                0,
                0
            ];

        }



        /* ==================================================
           ESTADO DE COLMENAS
        ================================================== */

        const colmenasActivas = normalizarNumero(
            leerJsonScript(
                "colmenas-activas",
                0
            )
        );


        const colmenasRiesgo = normalizarNumero(
            leerJsonScript(
                "colmenas-riesgo",
                0
            )
        );


        const colmenasRevision = normalizarNumero(
            leerJsonScript(
                "colmenas-revision",
                0
            )
        );


        const colmenasInactivas = normalizarNumero(
            leerJsonScript(
                "colmenas-inactivas",
                0
            )
        );



        /* ==================================================
           CHART.JS DISPONIBLE
        ================================================== */

        if (
            typeof Chart === "undefined"
        ) {

            console.error(
                "Chart.js no está disponible."
            );


            return;

        }



        /* ==================================================
           CONFIGURACIÓN GENERAL DE FUENTE
        ================================================== */

        Chart.defaults.font.family =
            '"Montserrat Alternates", sans-serif';


        Chart.defaults.color =
            "#68776E";



        /* ==================================================
           GRÁFICA ACTIVIDAD DEL APICULTOR
        ================================================== */

        const canvasActividad = (
            document.getElementById(
                "graficaActividadApicultor"
            )
        );


        if (canvasActividad) {

            new Chart(
                canvasActividad,
                {

                    type: "line",


                    data: {

                        labels:
                            actividadLabels,


                        datasets: [

                            /* =================================
                               REVISIONES
                            ================================= */

                            {

                                label:
                                    "Revisiones",

                                data:
                                    actividadRevisiones,

                                borderColor:
                                    "#E6B93E",

                                backgroundColor:
                                    "rgba(230, 185, 62, 0.12)",

                                pointBackgroundColor:
                                    "#E6B93E",

                                pointBorderColor:
                                    "#FFFFFF",

                                pointBorderWidth:
                                    2,

                                pointRadius:
                                    4,

                                pointHoverRadius:
                                    6,

                                borderWidth:
                                    3,

                                tension:
                                    0.35,

                                fill:
                                    false

                            },


                            /* =================================
                               MANTENIMIENTOS
                            ================================= */

                            {

                                label:
                                    "Mantenimientos",

                                data:
                                    actividadMantenimientos,

                                borderColor:
                                    "#78A965",

                                backgroundColor:
                                    "rgba(120, 169, 101, 0.12)",

                                pointBackgroundColor:
                                    "#78A965",

                                pointBorderColor:
                                    "#FFFFFF",

                                pointBorderWidth:
                                    2,

                                pointRadius:
                                    4,

                                pointHoverRadius:
                                    6,

                                borderWidth:
                                    3,

                                tension:
                                    0.35,

                                fill:
                                    false

                            },


                            /* =================================
                               INCIDENCIAS
                            ================================= */

                            {

                                label:
                                    "Incidencias",

                                data:
                                    actividadIncidencias,

                                borderColor:
                                    "#F08A6A",

                                backgroundColor:
                                    "rgba(240, 138, 106, 0.12)",

                                pointBackgroundColor:
                                    "#F08A6A",

                                pointBorderColor:
                                    "#FFFFFF",

                                pointBorderWidth:
                                    2,

                                pointRadius:
                                    4,

                                pointHoverRadius:
                                    6,

                                borderWidth:
                                    3,

                                tension:
                                    0.35,

                                fill:
                                    false

                            }

                        ]

                    },


                    options: {

                        responsive:
                            true,

                        maintainAspectRatio:
                            false,


                        interaction: {

                            intersect:
                                false,

                            mode:
                                "index"

                        },


                        plugins: {

                            /* =============================
                               LEYENDA
                            ============================== */

                            legend: {

                                position:
                                    "bottom",

                                labels: {

                                    usePointStyle:
                                        true,

                                    pointStyle:
                                        "circle",

                                    boxWidth:
                                        8,

                                    boxHeight:
                                        8,

                                    padding:
                                        22,

                                    color:
                                        "#214F3B",

                                    font: {

                                        size:
                                            10,

                                        weight:
                                            "600"

                                    }

                                }

                            },


                            /* =============================
                               TOOLTIP
                            ============================== */

                            tooltip: {

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

                                displayColors:
                                    true

                            }

                        },


                        scales: {

                            /* =============================
                               EJE X
                            ============================== */

                            x: {

                                grid: {

                                    display:
                                        false

                                },

                                border: {

                                    display:
                                        false

                                },

                                ticks: {

                                    color:
                                        "#77857D",

                                    font: {

                                        size:
                                            10

                                    }

                                }

                            },


                            /* =============================
                               EJE Y
                            ============================== */

                            y: {

                                beginAtZero:
                                    true,

                                suggestedMax:
                                    5,

                                ticks: {

                                    precision:
                                        0,

                                    stepSize:
                                        1,

                                    color:
                                        "#77857D",

                                    font: {

                                        size:
                                            10

                                    }

                                },

                                grid: {

                                    color:
                                        "rgba(33, 79, 59, 0.07)"

                                },

                                border: {

                                    display:
                                        false

                                }

                            }

                        }

                    }

                }
            );

        }



        /* ==================================================
           GRÁFICA ESTADO GENERAL DE COLMENAS
        ================================================== */

        const canvasEstado = (
            document.getElementById(
                "graficaEstadoColmenas"
            )
        );


        if (canvasEstado) {


            const totalColmenas = (

                colmenasActivas
                +
                colmenasRiesgo
                +
                colmenasRevision
                +
                colmenasInactivas

            );



            /* ==================================================
               SI NO HAY COLMENAS

               Mostramos un círculo neutro para que la gráfica
               no desaparezca completamente.
            ================================================== */

            const sinDatos = (
                totalColmenas === 0
            );


            const datosDona = (
                sinDatos

                ? [1]

                : [
                    colmenasActivas,
                    colmenasRiesgo,
                    colmenasRevision,
                    colmenasInactivas
                ]
            );


            const coloresDona = (
                sinDatos

                ? [
                    "#E8E8D8"
                ]

                : [
                    "#78A965",
                    "#F2C94C",
                    "#C6B86D",
                    "#F08A6A"
                ]
            );


            const etiquetasDona = (
                sinDatos

                ? [
                    "Sin datos"
                ]

                : [
                    "Activas",
                    "Riesgo",
                    "Revisión",
                    "Inactivas"
                ]
            );



            /* ==================================================
               PLUGIN TEXTO CENTRO
            ================================================== */

            const textoCentroColmenas = {

                id:
                    "textoCentroColmenas",


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


                    const centro = (
                        meta.data[0]
                    );


                    if (!centro) {

                        return;

                    }


                    const ctx = (
                        chart.ctx
                    );


                    ctx.save();


                    ctx.textAlign =
                        "center";


                    ctx.textBaseline =
                        "middle";


                    /* =============================
                       NÚMERO
                    ============================== */

                    ctx.fillStyle =
                        "#214F3B";


                    ctx.font =
                        '800 23px "Montserrat Alternates"';


                    ctx.fillText(
                        totalColmenas,
                        centro.x,
                        centro.y - 7
                    );


                    /* =============================
                       TEXTO
                    ============================== */

                    ctx.fillStyle =
                        "#68776E";


                    ctx.font =
                        '600 9px "Montserrat Alternates"';


                    ctx.fillText(
                        "Colmenas",
                        centro.x,
                        centro.y + 15
                    );


                    ctx.restore();

                }

            };



            /* ==================================================
               CREAR DONA
            ================================================== */

            new Chart(
                canvasEstado,
                {

                    type:
                        "doughnut",


                    data: {

                        labels:
                            etiquetasDona,


                        datasets: [

                            {

                                data:
                                    datosDona,

                                backgroundColor:
                                    coloresDona,

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

                            legend: {

                                display:
                                    false

                            },


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

                        textoCentroColmenas

                    ]

                }
            );

        }

    }
);