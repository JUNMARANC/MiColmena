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

        let graficaActividad =
            null;


        if (canvasActividad) {

            graficaActividad = new Chart(
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


        /* ==========================================================
           ACTUALIZACIÓN DINÁMICA DEL DASHBOARD
        ========================================================== */

        let actualizandoDashboard =
            false;


        /* ==========================================================
           ESCAPAR TEXTO
        ========================================================== */

        function escaparHtml(
            valor
        ) {

            const elemento =
                document.createElement(
                    "div"
                );


            elemento.textContent =
                valor ?? "";


            return elemento.innerHTML;

        }

        /* ==========================================================
        ACTUALIZAR TARJETAS DE RESUMEN
        ========================================================== */

        function actualizarTarjetasResumen(
            resumen
        ) {

            if (!resumen) {

                return;

            }


            const tarjetas = {

                contadorApiariosAsignados:
                    resumen.total_apiarios,

                contadorColmenasActivas:
                    resumen.colmenas_activas,

                contadorMantenimientosPendientes:
                    resumen.mantenimientos_pendientes,

                contadorIncidenciasActivas:
                    resumen.incidencias_abiertas,

                contadorRevisionesMes:
                    resumen.revisiones_mes,

            };


            Object.entries(
                tarjetas
            ).forEach(
                function (
                    [
                        id,
                        valor
                    ]
                ) {

                    const elemento =
                        document.getElementById(
                            id
                        );


                    if (!elemento) {

                        return;

                    }


                    elemento.textContent =
                        normalizarNumero(
                            valor
                        );

                }
            );

        }

        /* ==========================================================
        ACTUALIZAR PRÓXIMAS ACTIVIDADES
        ========================================================== */

        function actualizarProximasActividades(
            eventos
        ) {

            const lista =
                document.getElementById(
                    "listaProximasActividades"
                );


            if (!lista) {

                return;

            }


            if (
                !Array.isArray(
                    eventos
                )
                ||
                eventos.length === 0
            ) {

                lista.innerHTML = `

                    <div class="estado-vacio">

                        <i class="bi bi-calendar-check"></i>

                        <strong>
                            No tienes actividades próximas
                        </strong>

                        <span>
                            Las actividades programadas
                            aparecerán aquí.
                        </span>

                    </div>

                `;


                return;

            }


            const meses = [
                "ENE",
                "FEB",
                "MAR",
                "ABR",
                "MAY",
                "JUN",
                "JUL",
                "AGO",
                "SEP",
                "OCT",
                "NOV",
                "DIC"
            ];


            lista.innerHTML =
                eventos
                .map(
                    function (
                        evento
                    ) {

                        const titulo =
                            escaparHtml(
                                evento.titulo
                            );


                        const apiario =
                            escaparHtml(
                                evento.apiario
                            );


                        const hora =
                            escaparHtml(
                                evento.hora
                            );


                        let dia =
                            "—";


                        let mes =
                            "";


                        if (
                            evento.fecha
                        ) {

                            const partes =
                                String(
                                    evento.fecha
                                )
                                .split("-");


                            if (
                                partes.length === 3
                            ) {

                                dia =
                                    partes[2];


                                const numeroMes =
                                    Number(
                                        partes[1]
                                    );


                                if (
                                    numeroMes >= 1
                                    &&
                                    numeroMes <= 12
                                ) {

                                    mes =
                                        meses[
                                            numeroMes - 1
                                        ];

                                }

                            }

                        }


                        return `

                            <div class="proxima-actividad">

                                <div class="proxima-fecha">

                                    <strong>
                                        ${dia}
                                    </strong>

                                    <span>
                                        ${mes}
                                    </span>

                                </div>


                                <div class="proxima-info">

                                    <strong>
                                        ${titulo}
                                    </strong>


                                    ${
                                        apiario

                                        ?

                                        `
                                            <span>

                                                <i class="bi bi-geo-alt"></i>

                                                ${apiario}

                                            </span>
                                        `

                                        :

                                        ""
                                    }


                                    ${
                                        hora

                                        ?

                                        `
                                            <small>

                                                <i class="bi bi-clock"></i>

                                                ${hora}

                                            </small>
                                        `

                                        :

                                        ""
                                    }

                                </div>

                            </div>

                        `;

                    }
                )
                .join("");

        }

        /* ==========================================================
           ACTUALIZAR GRÁFICA DE ACTIVIDAD
        ========================================================== */

        function actualizarGraficaActividad(
            actividad
        ) {

            if (
                !graficaActividad
                ||
                !actividad
            ) {

                return;

            }


            graficaActividad.data.labels =
                Array.isArray(
                    actividad.labels
                )
                    ?
                    actividad.labels
                    :
                    [];


            graficaActividad
                .data
                .datasets[0]
                .data =
                    Array.isArray(
                        actividad.revisiones
                    )
                        ?
                        actividad.revisiones
                        :
                        [];


            graficaActividad
                .data
                .datasets[1]
                .data =
                    Array.isArray(
                        actividad.mantenimientos
                    )
                        ?
                        actividad.mantenimientos
                        :
                        [];


            graficaActividad
                .data
                .datasets[2]
                .data =
                    Array.isArray(
                        actividad.incidencias
                    )
                        ?
                        actividad.incidencias
                        :
                        [];


            graficaActividad.update();

        }


        /* ==========================================================
           CLASE DE PRIORIDAD
        ========================================================== */

        function obtenerClasePrioridad(
            prioridad
        ) {

            const valor =
                String(
                    prioridad || ""
                )
                .toLowerCase();


            if (
                valor === "alta"
                ||
                valor === "crítica"
                ||
                valor === "critica"
            ) {

                return "alta";

            }


            if (
                valor === "media"
            ) {

                return "media";

            }


            return "baja";

        }


        /* ==========================================================
           ACTUALIZAR ÚLTIMAS INCIDENCIAS
        ========================================================== */

        function actualizarUltimasIncidencias(
            incidencias
        ) {

            const cuerpo =
                document.getElementById(
                    "cuerpoUltimasIncidencias"
                );


            if (!cuerpo) {

                return;

            }


            if (
                !Array.isArray(
                    incidencias
                )
                ||
                incidencias.length === 0
            ) {

                cuerpo.innerHTML = `

                    <tr>

                        <td
                            colspan="6"
                            class="tabla-vacia"
                        >

                            <i class="bi bi-check-circle-fill"></i>

                            <strong>
                                No tienes incidencias recientes
                            </strong>

                            <span>
                                Las incidencias que reportes
                                aparecerán aquí.
                            </span>

                        </td>

                    </tr>

                `;


                return;

            }


            cuerpo.innerHTML =
                incidencias
                .map(
                    function (
                        incidencia
                    ) {

                        const titulo =
                            escaparHtml(
                                incidencia.titulo
                            );


                        const apiario =
                            escaparHtml(
                                incidencia.apiario
                            );


                        const colmena =
                            escaparHtml(
                                incidencia.colmena
                            );


                        const fecha =
                            escaparHtml(
                                incidencia.fecha
                            );


                        const prioridad =
                            escaparHtml(
                                incidencia.prioridad
                            );


                        const estado =
                            escaparHtml(
                                incidencia.estado
                            );


                        const clasePrioridad =
                            obtenerClasePrioridad(
                                incidencia.prioridad
                            );


                        return `

                            <tr>

                                <td>

                                    <div class="incidencia-titulo">

                                        <i
                                            class="
                                                bi
                                                bi-exclamation-triangle
                                            "
                                        ></i>

                                        <span>
                                            ${titulo}
                                        </span>

                                    </div>

                                </td>


                                <td>
                                    ${apiario}
                                </td>


                                <td>
                                    ${colmena}
                                </td>


                                <td>
                                    ${fecha}
                                </td>


                                <td>

                                    <span
                                        class="
                                            badge-prioridad
                                            ${clasePrioridad}
                                        "
                                    >
                                        ${prioridad}
                                    </span>

                                </td>


                                <td>

                                    <span
                                        class="badge-estado-incidencia"
                                    >
                                        ${estado}
                                    </span>

                                </td>

                            </tr>

                        `;

                    }
                )
                .join("");

        }


        /* ==========================================================
           CONSULTAR DATOS ACTUALIZADOS
        ========================================================== */

        async function actualizarDatosDashboard() {

            if (
                actualizandoDashboard
                ||
                document.hidden
            ) {

                return;

            }


            actualizandoDashboard =
                true;


            try {

                const respuesta =
                    await fetch(
                        URL_DATOS_DASHBOARD_APICULTOR,
                        {

                            method:
                                "GET",

                            credentials:
                                "same-origin",

                            cache:
                                "no-store",

                            headers: {

                                "X-Requested-With":
                                    "XMLHttpRequest"

                            }

                        }
                    );


                if (!respuesta.ok) {

                    throw new Error(
                        "No fue posible actualizar el dashboard."
                    );

                }


                const datos =
                    await respuesta.json();


                if (!datos.ok) {

                    return;

                }


                /* ==================================================
                TARJETAS
                ================================================== */

                actualizarTarjetasResumen(
                    datos.resumen
                );


                /* ==================================================
                GRÁFICA DE ACTIVIDAD
                ================================================== */

                actualizarGraficaActividad(
                    datos.actividad
                );

                /* ==================================================
                PRÓXIMAS ACTIVIDADES
                ================================================== */

                actualizarProximasActividades(
                    datos.proximos_eventos
                );

                /* ==================================================
                ÚLTIMAS INCIDENCIAS
                ================================================== */

                actualizarUltimasIncidencias(
                    datos.incidencias
                );


            } catch (error) {

                console.error(
                    "[dashboard_apicultor] Error actualizando datos:",
                    error
                );

            } finally {

                actualizandoDashboard =
                    false;

            }

        }


        /* ==========================================================
           ACTUALIZAR CADA 10 SEGUNDOS
        ========================================================== */

        setInterval(
            actualizarDatosDashboard,
            10000
        );


        /* ==========================================================
           ACTUALIZAR AL REGRESAR A LA PESTAÑA
        ========================================================== */

        document.addEventListener(
            "visibilitychange",
            function () {

                if (!document.hidden) {

                    actualizarDatosDashboard();

                }

            }
        );


    }

);


/* ==========================================================
   ==========================================================
   ANIMACIONES DEL PANEL

   Bloque nuevo, al final del archivo. Todo lo de arriba queda
   igual: no se modificó ni una línea de la lógica anterior.

   Va fuera del DOMContentLoaded de arriba a propósito, con su
   propio listener, para que sea independiente. Si algo aquí
   fallara, el panel sigue funcionando.

   Si quieren quitarlo, borren de este comentario hacia abajo.
   ========================================================== */

(function () {

    "use strict";


    var CONTADORES = [
        "contadorApiariosAsignados",
        "contadorColmenasActivas",
        "contadorMantenimientosPendientes",
        "contadorIncidenciasActivas",
        "contadorRevisionesMes"
    ];

    var DURACION_CONTEO = 700;

    var prefiereMenosMovimiento =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;


    /* ======================================================
       CONTEO ANIMADO

       Sube de un número a otro con una curva que desacelera
       al final, que es como se siente natural.
    ====================================================== */

    function animarConteo(elemento, desde, hasta, alTerminar) {

        var inicio = null;

        function paso(ahora) {

            if (inicio === null) {
                inicio = ahora;
            }

            var avance = Math.min((ahora - inicio) / DURACION_CONTEO, 1);

            // easeOutCubic: rápido al principio, suave al final
            var suavizado = 1 - Math.pow(1 - avance, 3);

            elemento.textContent = Math.round(
                desde + (hasta - desde) * suavizado
            );

            if (avance < 1) {
                window.requestAnimationFrame(paso);
            } else {
                elemento.textContent = hasta;
                if (alTerminar) {
                    alTerminar();
                }
            }
        }

        window.requestAnimationFrame(paso);
    }


    /* ======================================================
       DESTACAR LA TARJETA QUE CAMBIÓ
    ====================================================== */

    function destacar(elemento) {

        var tarjeta = elemento.closest(".resumen-card");

        if (!tarjeta) {
            return;
        }

        tarjeta.classList.remove("resumen-card--actualizada");

        // Fuerza el reinicio de la animación
        void tarjeta.offsetWidth;

        tarjeta.classList.add("resumen-card--actualizada");

        window.setTimeout(function () {
            tarjeta.classList.remove("resumen-card--actualizada");
        }, 1400);
    }


    /* ======================================================
       ARRANQUE
    ====================================================== */

    document.addEventListener("DOMContentLoaded", function () {

        CONTADORES.forEach(function (id) {

            var elemento = document.getElementById(id);

            if (!elemento) {
                return;
            }

            var valorActual = parseInt(elemento.textContent, 10);

            if (isNaN(valorActual)) {
                return;
            }


            /* Bandera para distinguir nuestras escrituras de las
               del refresco. El observador se dispara también
               mientras el número está contando: sin esto se
               llamaría a sí mismo en bucle.

               Se declara ANTES de usarse. Con `var` funcionaría
               igual por el hoisting, pero deja una trampa: si
               alguien baja el retardo de 350ms a 0, el valor
               todavía sería undefined. */

            var escribiendoNosotros = false;
            var ultimoValor = valorActual;


            /* ----- Conteo inicial: de 0 al valor real ----- */

            if (!prefiereMenosMovimiento && valorActual > 0) {

                elemento.textContent = "0";

                // Espera a que termine la entrada escalonada de
                // las tarjetas para que no compitan
                window.setTimeout(function () {
                    escribiendoNosotros = true;
                    animarConteo(elemento, 0, valorActual, function () {
                        escribiendoNosotros = false;
                    });
                }, 350);
            }


            /* ----- Vigilar los cambios del refresco ----- */

            var observador = new MutationObserver(function () {

                if (escribiendoNosotros) {
                    return;
                }

                var nuevoValor = parseInt(elemento.textContent, 10);

                if (isNaN(nuevoValor) || nuevoValor === ultimoValor) {
                    return;
                }

                var anterior = ultimoValor;
                ultimoValor = nuevoValor;

                destacar(elemento);

                if (prefiereMenosMovimiento) {
                    return;
                }

                escribiendoNosotros = true;

                animarConteo(elemento, anterior, nuevoValor, function () {
                    escribiendoNosotros = false;
                });
            });

            observador.observe(elemento, {
                childList: true,
                characterData: true,
                subtree: true
            });

        });

    });

})();