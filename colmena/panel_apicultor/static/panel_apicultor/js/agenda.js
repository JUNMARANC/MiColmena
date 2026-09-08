/* ==========================================================
   AGENDA - PANEL APICULTOR
   MI COLMENA

   Funciones:
   - Calendario mensual.
   - Filtros.
   - Modales de detalle.
   - Modal dinámico para eventos fuera de la página actual.
   - Cambio de estado del evento.
   - El apicultor solo confirma Completado / Cancelado.
========================================================== */

document.addEventListener("DOMContentLoaded", function () {


    /* ======================================================
       1. ELEMENTOS PRINCIPALES
    ====================================================== */

    const calendario =
        document.getElementById(
            "calendarioAgenda"
        );


    const tituloMes =
        document.getElementById(
            "tituloMesAgenda"
        );


    const btnMesAnterior =
        document.getElementById(
            "btnMesAnterior"
        );


    const btnMesSiguiente =
        document.getElementById(
            "btnMesSiguiente"
        );


    const btnHoy =
        document.getElementById(
            "btnHoyAgenda"
        );



    /* ======================================================
       FILTROS
    ====================================================== */

    const formularioFiltros =
        document.querySelector(
            ".agenda-filtros-form"
        );


    const buscador =
        document.querySelector(
            ".agenda-buscador input"
        );


    const selectsFiltros =
        document.querySelectorAll(
            ".agenda-select"
        );


    const inputFechaFiltro =
        document.querySelector(
            '.agenda-fecha-filtro input[name="fecha"]'
        );



    /* ======================================================
       DATOS ENVIADOS DESDE DJANGO
    ====================================================== */

    const scriptEventos =
        document.getElementById(
            "eventosAgendaData"
        );



    /* ======================================================
       2. MODAL DE CONFIRMACIÓN DEL ESTADO
    ====================================================== */

    const modalConfirmarEstadoEvento =
        document.getElementById(
            "modalConfirmarEstadoEvento"
        );


    const formCambiarEstadoEvento =
        document.getElementById(
            "formCambiarEstadoEvento"
        );


    const inputNuevoEstadoEvento =
        document.getElementById(
            "nuevoEstadoEvento"
        );


    const nombreEventoConfirmarEstado =
        document.getElementById(
            "nombreEventoConfirmarEstado"
        );


    const tituloConfirmarEstadoEvento =
        document.getElementById(
            "tituloConfirmarEstadoEvento"
        );


    const mensajeConfirmarEstadoEvento =
        document.getElementById(
            "mensajeConfirmarEstadoEvento"
        );


    const iconoConfirmarEstadoEvento =
        document.getElementById(
            "iconoConfirmarEstadoEvento"
        );


    const iconoConfirmarEstadoEventoI =
        document.getElementById(
            "iconoConfirmarEstadoEventoI"
        );


    const btnConfirmarEstadoEvento =
        document.getElementById(
            "btnConfirmarEstadoEvento"
        );



    /* ======================================================
       3. CARGAR EVENTOS
    ====================================================== */

    let eventos = [];


    if (scriptEventos) {

        try {

            eventos =
                JSON.parse(
                    scriptEventos.textContent
                );

        } catch (error) {

            console.error(
                "No fue posible cargar los eventos de la agenda.",
                error
            );


            eventos = [];

        }

    }



    /* ======================================================
       4. FECHA ACTUAL
    ====================================================== */

    const fechaActual =
        new Date();


    let fechaVista =
        new Date(
            fechaActual.getFullYear(),
            fechaActual.getMonth(),
            1
        );


    let fechaSeleccionada =
        null;



    /* ======================================================
       5. NOMBRES DE MESES
    ====================================================== */

    const nombresMeses = [

        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre"

    ];



    /* ======================================================
       6. TIPOS DE EVENTOS
    ====================================================== */

    const nombresTipos = {

        mantenimiento:
            "Mantenimiento",

        revision:
            "Revisión",

        incidencia:
            "Incidencia",

        evento:
            "Evento general"

    };


    const iconosTipos = {

        mantenimiento:
            "bi-tools",

        revision:
            "bi-search",

        incidencia:
            "bi-exclamation-triangle-fill",

        evento:
            "bi-calendar-event-fill"

    };



    /* ======================================================
       7. ESTADOS
    ====================================================== */

    const nombresEstados = {

        programado:
            "Programado",

        completado:
            "Completado",

        cancelado:
            "Cancelado"

    };



    /* ======================================================
       8. ESTADO INTERNO DE MODALES
    ====================================================== */

    let modalActivo =
        null;


    let botonOrigenModal =
        null;


    /*
     * Se utilizan cuando abrimos la ventana de confirmación
     * desde el modal de detalle.
     */

    let modalEventoAntesConfirmacion =
        null;


    let botonCambioEstadoOrigen =
        null;


    let botonOrigenDetalleGuardado =
        null;



    /* ======================================================
       9. ESCAPAR HTML
    ====================================================== */

    function escaparHTML(
        valor
    ) {

        if (
            valor === null
            ||
            valor === undefined
        ) {

            return "";

        }


        return String(
            valor
        )

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /'/g,
                "&#039;"
            );

    }



    /* ======================================================
       10. RELLENAR CERO
    ====================================================== */

    function rellenarCero(
        numero
    ) {

        return String(
            numero
        ).padStart(
            2,
            "0"
        );

    }



    /* ======================================================
       11. FECHA A YYYY-MM-DD
    ====================================================== */

    function fechaAISO(
        fecha
    ) {

        return (
            fecha.getFullYear()

            +

            "-"

            +

            rellenarCero(
                fecha.getMonth() + 1
            )

            +

            "-"

            +

            rellenarCero(
                fecha.getDate()
            )
        );

    }



    /* ======================================================
       12. PARSEAR FECHA LOCAL
    ====================================================== */

    function parsearFechaLocal(
        textoFecha
    ) {

        if (!textoFecha) {

            return null;

        }


        const partes =
            textoFecha.split(
                "-"
            );


        if (
            partes.length
            !==
            3
        ) {

            return null;

        }


        const anio =
            Number(
                partes[0]
            );


        const mes =
            Number(
                partes[1]
            )
            -
            1;


        const dia =
            Number(
                partes[2]
            );


        return new Date(
            anio,
            mes,
            dia
        );

    }



    /* ======================================================
       13. COMPARAR FECHAS
    ====================================================== */

    function fechasIguales(
        fecha1,
        fecha2
    ) {

        if (
            !fecha1
            ||
            !fecha2
        ) {

            return false;

        }


        return (

            fecha1.getFullYear()
            ===
            fecha2.getFullYear()

            &&

            fecha1.getMonth()
            ===
            fecha2.getMonth()

            &&

            fecha1.getDate()
            ===
            fecha2.getDate()

        );

    }



    /* ======================================================
       14. FORMATEAR FECHA VISUAL
    ====================================================== */

    function formatearFechaVisual(
        fechaISO
    ) {

        const fecha =
            parsearFechaLocal(
                fechaISO
            );


        if (!fecha) {

            return "Sin fecha";

        }


        return (

            rellenarCero(
                fecha.getDate()
            )

            +

            "/"

            +

            rellenarCero(
                fecha.getMonth() + 1
            )

            +

            "/"

            +

            fecha.getFullYear()

        );

    }



    /* ======================================================
       15. BLOQUEAR SCROLL
    ====================================================== */

    function bloquearScroll() {

        document.body.style.overflow =
            "hidden";

    }



    /* ======================================================
       16. RESTAURAR SCROLL
    ====================================================== */

    function restaurarScroll() {

        const existeModalActivo =
            document.querySelector(
                ".agenda-modal-overlay.activo"
            );


        if (!existeModalActivo) {

            document.body.style.overflow =
                "";

        }

    }



    /* ======================================================
       17. OBTENER EVENTOS POR FECHA
    ====================================================== */

    function obtenerEventosFecha(
        fechaISO
    ) {

        return eventos

            .filter(
                function (evento) {

                    return (
                        evento.fecha
                        ===
                        fechaISO
                    );

                }
            )

            .sort(
                function (
                    a,
                    b
                ) {

                    return String(
                        a.hora || ""
                    ).localeCompare(
                        String(
                            b.hora || ""
                        )
                    );

                }
            );

    }



    /* ======================================================
       18. CREAR BOTÓN DEL EVENTO
    ====================================================== */

    function crearEventoCalendario(
        evento
    ) {

        const boton =
            document.createElement(
                "button"
            );


        boton.type =
            "button";


        boton.className =
            "agenda-dia-evento "
            +
            (
                evento.tipo
                ||
                "evento"
            );


        boton.dataset.eventoId =
            evento.id;


        boton.title =
            (
                evento.hora
                    ?
                    evento.hora
                    +
                    " · "
                    :
                    ""
            )

            +

            (
                evento.titulo
                ||
                "Evento"
            );


        const icono =
            iconosTipos[
                evento.tipo
            ]

            ||

            "bi-calendar-event-fill";


        boton.innerHTML = `

            <i
                class="
                    bi
                    ${icono}
                "
            ></i>


            <span>

                ${
                    escaparHTML(
                        evento.hora
                        ||
                        ""
                    )
                }

                ${
                    escaparHTML(
                        evento.titulo
                        ||
                        "Evento"
                    )
                }

            </span>
        `;


        return boton;

    }



    /* ======================================================
       19. CREAR DÍA DEL CALENDARIO
    ====================================================== */

    function crearDiaCalendario(
        fecha,
        perteneceMesActual
    ) {

        const dia =
            document.createElement(
                "div"
            );


        dia.className =
            "agenda-dia";


        /* ==================================================
           OTRO MES
        ================================================== */

        if (
            !perteneceMesActual
        ) {

            dia.classList.add(
                "otro-mes"
            );

        }



        /* ==================================================
           HOY
        ================================================== */

        if (
            fechasIguales(
                fecha,
                fechaActual
            )
        ) {

            dia.classList.add(
                "hoy"
            );

        }



        /* ==================================================
           DÍA SELECCIONADO
        ================================================== */

        if (
            fechaSeleccionada
            &&
            fechasIguales(
                fecha,
                fechaSeleccionada
            )
        ) {

            dia.classList.add(
                "seleccionado"
            );

        }



        const fechaISO =
            fechaAISO(
                fecha
            );


        dia.dataset.fecha =
            fechaISO;



        /* ==================================================
           NÚMERO
        ================================================== */

        const numero =
            document.createElement(
                "span"
            );


        numero.className =
            "agenda-dia-numero";


        numero.textContent =
            fecha.getDate();


        dia.appendChild(
            numero
        );



        /* ==================================================
           EVENTOS
        ================================================== */

        const eventosDelDia =
            obtenerEventosFecha(
                fechaISO
            );


        if (
            eventosDelDia.length
            >
            0
        ) {

            const contenedorEventos =
                document.createElement(
                    "div"
                );


            contenedorEventos.className =
                "agenda-dia-eventos";


            /*
             * Máximo dos eventos visibles.
             */

            eventosDelDia

                .slice(
                    0,
                    2
                )

                .forEach(
                    function (evento) {

                        contenedorEventos.appendChild(

                            crearEventoCalendario(
                                evento
                            )

                        );

                    }
                );



            /* ==================================================
               MÁS EVENTOS
            ================================================== */

            if (
                eventosDelDia.length
                >
                2
            ) {

                const masEventos =
                    document.createElement(
                        "span"
                    );


                masEventos.className =
                    "agenda-dia-mas";


                masEventos.textContent =
                    "+"
                    +
                    (
                        eventosDelDia.length
                        -
                        2
                    )
                    +
                    " más";


                contenedorEventos.appendChild(
                    masEventos
                );

            }


            dia.appendChild(
                contenedorEventos
            );

        }



        /* ==================================================
           SELECCIONAR DÍA
        ================================================== */

        dia.addEventListener(
            "click",
            function (
                eventoClick
            ) {

                /*
                 * Si pulsó sobre un evento
                 * no seleccionamos el cuadro.
                 */

                if (
                    eventoClick.target.closest(
                        ".agenda-dia-evento"
                    )
                ) {

                    return;

                }


                seleccionarDia(
                    fecha
                );

            }
        );


        return dia;

    }



    /* ======================================================
       20. RENDERIZAR CALENDARIO
    ====================================================== */

    function renderizarCalendario() {

        if (
            !calendario
            ||
            !tituloMes
        ) {

            return;

        }


        calendario.innerHTML =
            "";


        const anio =
            fechaVista.getFullYear();


        const mes =
            fechaVista.getMonth();



        /* ==================================================
           TÍTULO
        ================================================== */

        tituloMes.textContent =
            nombresMeses[
                mes
            ]

            +

            " "

            +

            anio;



        /* ==================================================
           PRIMER DÍA
        ================================================== */

        const primerDiaMes =
            new Date(
                anio,
                mes,
                1
            );


        /*
         * JavaScript:
         * Domingo = 0
         *
         * Nuestra agenda:
         * Lunes primero.
         */

        const indicePrimerDia =
            (
                primerDiaMes.getDay()
                +
                6
            )

            %

            7;



        /* ==================================================
           FECHA DE INICIO
        ================================================== */

        const fechaInicio =
            new Date(
                anio,
                mes,
                1
                -
                indicePrimerDia
            );



        /* ==================================================
           42 DÍAS = 6 SEMANAS
        ================================================== */

        for (
            let i = 0;
            i < 42;
            i++
        ) {

            const fechaDia =
                new Date(
                    fechaInicio.getFullYear(),
                    fechaInicio.getMonth(),
                    fechaInicio.getDate() + i
                );


            const perteneceMes =
                fechaDia.getMonth()
                ===
                mes;


            calendario.appendChild(

                crearDiaCalendario(
                    fechaDia,
                    perteneceMes
                )

            );

        }

    }



    /* ======================================================
       21. SELECCIONAR DÍA
    ====================================================== */

    function seleccionarDia(
        fecha
    ) {

        fechaSeleccionada =
            new Date(
                fecha.getFullYear(),
                fecha.getMonth(),
                fecha.getDate()
            );


        document.querySelectorAll(
            ".agenda-dia.seleccionado"
        ).forEach(
            function (dia) {

                dia.classList.remove(
                    "seleccionado"
                );

            }
        );


        const fechaISO =
            fechaAISO(
                fechaSeleccionada
            );


        if (calendario) {

            const diaSeleccionado =
                calendario.querySelector(
                    `[data-fecha="${fechaISO}"]`
                );


            if (diaSeleccionado) {

                diaSeleccionado.classList.add(
                    "seleccionado"
                );

            }

        }


        /*
         * Dejamos la fecha en el filtro,
         * pero NO enviamos automáticamente.
         */

        if (inputFechaFiltro) {

            inputFechaFiltro.value =
                fechaISO;

        }

    }



    /* ======================================================
       22. MES ANTERIOR
    ====================================================== */

    if (btnMesAnterior) {

        btnMesAnterior.addEventListener(
            "click",
            function () {

                fechaVista =
                    new Date(
                        fechaVista.getFullYear(),
                        fechaVista.getMonth() - 1,
                        1
                    );


                renderizarCalendario();

            }
        );

    }



    /* ======================================================
       23. MES SIGUIENTE
    ====================================================== */

    if (btnMesSiguiente) {

        btnMesSiguiente.addEventListener(
            "click",
            function () {

                fechaVista =
                    new Date(
                        fechaVista.getFullYear(),
                        fechaVista.getMonth() + 1,
                        1
                    );


                renderizarCalendario();

            }
        );

    }



    /* ======================================================
       24. BOTÓN HOY
    ====================================================== */

    if (btnHoy) {

        btnHoy.addEventListener(
            "click",
            function () {

                fechaVista =
                    new Date(
                        fechaActual.getFullYear(),
                        fechaActual.getMonth(),
                        1
                    );


                fechaSeleccionada =
                    new Date(
                        fechaActual.getFullYear(),
                        fechaActual.getMonth(),
                        fechaActual.getDate()
                    );


                renderizarCalendario();


                if (inputFechaFiltro) {

                    inputFechaFiltro.value =
                        fechaAISO(
                            fechaActual
                        );

                }

            }
        );

    }



    /* ======================================================
       25. ABRIR MODAL
    ====================================================== */

    function abrirModal(
        modal,
        botonOrigen = null
    ) {

        if (!modal) {

            return;

        }


        /*
         * Cerrar cualquier otro modal.
         */

        document.querySelectorAll(
            ".agenda-modal-overlay.activo"
        ).forEach(
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


        modalActivo =
            modal;


        botonOrigenModal =
            botonOrigen;


        modal.classList.add(
            "activo"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        bloquearScroll();



        /* ==================================================
           FOCO
        ================================================== */

        const botonCerrar =
            modal.querySelector(
                ".agenda-modal-cerrar"
            );


        if (botonCerrar) {

            setTimeout(
                function () {

                    botonCerrar.focus();

                },
                70
            );

        }

    }



    /* ======================================================
       26. CERRAR MODAL
    ====================================================== */

    function cerrarModal(
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
            modalActivo
            ===
            modal
        ) {

            modalActivo =
                null;

        }


        restaurarScroll();


        if (
            botonOrigenModal
            &&
            document.body.contains(
                botonOrigenModal
            )
        ) {

            botonOrigenModal.focus();

        }


        botonOrigenModal =
            null;

    }



    /* ======================================================
       27. BUSCAR EVENTO
    ====================================================== */

    function obtenerEventoPorId(
        idEvento
    ) {

        return eventos.find(
            function (evento) {

                return (
                    String(
                        evento.id
                    )
                    ===
                    String(
                        idEvento
                    )
                );

            }
        );

    }



    /* ======================================================
       28. CONSTRUIR URL PARA CAMBIAR ESTADO
    ====================================================== */

    function construirUrlEstadoEvento(
        idEvento
    ) {

        if (!idEvento) {

            return "";

        }


        let rutaAgenda =
            window.location.pathname;


        if (
            !rutaAgenda.endsWith(
                "/"
            )
        ) {

            rutaAgenda +=
                "/";

        }


        return (

            rutaAgenda

            +

            "evento/"

            +

            encodeURIComponent(
                idEvento
            )

            +

            "/estado/"

        );

    }



    /* ======================================================
       29. ¿PUEDE CAMBIAR ESTADO?
    ====================================================== */

    function eventoPuedeCambiarEstado(
        evento
    ) {

        if (!evento) {

            return false;

        }


        /*
         * Solamente un evento programado.
         */

        if (
            evento.estado
            !==
            "programado"
        ) {

            return false;

        }


        if (!evento.fecha) {

            return false;

        }


        const hoyISO =
            fechaAISO(
                fechaActual
            );


        /*
         * REGLA PRINCIPAL:
         *
         * La fecha del evento debe ser
         * hoy o una fecha anterior.
         */

        return (
            evento.fecha
            <=
            hoyISO
        );

    }



    /* ======================================================
       30. CONSTRUIR CONTROL DE ESTADO
       PARA MODALES DINÁMICOS
    ====================================================== */

    function construirGestionEstadoDinamico(
        evento
    ) {

        if (!evento) {

            return "";

        }


        const estado =
            evento.estado
            ||
            "";


        const titulo =
            escaparHTML(
                evento.titulo
                ||
                "Evento"
            );


        const urlEstado =
            construirUrlEstadoEvento(
                evento.id
            );



        /* ==================================================
           PROGRAMADO
        ================================================== */

        if (
            estado
            ===
            "programado"
        ) {


            /* ==============================================
               HOY O PASADO
            ============================================== */

            if (
                eventoPuedeCambiarEstado(
                    evento
                )
            ) {

                return `

                    <section
                        class="
                            agenda-gestion-estado
                            agenda-gestion-estado-disponible
                        "
                    >


                        <div class="agenda-gestion-estado-header">


                            <div class="agenda-gestion-estado-icono">

                                <i class="bi bi-check2-square"></i>

                            </div>


                            <div class="agenda-gestion-estado-contenido">


                                <span class="agenda-gestion-estado-etiqueta">

                                    Actualizar actividad

                                </span>


                                <strong>

                                    ¿Cómo terminó este evento?

                                </strong>


                                <p>

                                    La fecha programada ya llegó.

                                    Registra el resultado de la actividad.

                                </p>


                            </div>


                        </div>



                        <div class="agenda-gestion-estado-acciones">


                            <button
                                type="button"
                                class="
                                    btn-evento-estado
                                    btn-evento-completado
                                "
                                data-cambiar-estado-evento
                                data-evento-url="${urlEstado}"
                                data-evento-estado="completado"
                                data-evento-titulo="${titulo}"
                            >

                                <i class="bi bi-check-circle-fill"></i>

                                <span>
                                    Marcar completado
                                </span>

                            </button>



                            <button
                                type="button"
                                class="
                                    btn-evento-estado
                                    btn-evento-cancelado
                                "
                                data-cambiar-estado-evento
                                data-evento-url="${urlEstado}"
                                data-evento-estado="cancelado"
                                data-evento-titulo="${titulo}"
                            >

                                <i class="bi bi-x-circle-fill"></i>

                                <span>
                                    Cancelar evento
                                </span>

                            </button>


                        </div>


                    </section>
                `;

            }



            /* ==============================================
               EVENTO FUTURO
            ============================================== */

            return `

                <section
                    class="
                        agenda-gestion-estado
                        agenda-gestion-estado-bloqueado
                    "
                >


                    <div class="agenda-gestion-estado-icono">

                        <i class="bi bi-lock-fill"></i>

                    </div>


                    <div class="agenda-gestion-estado-contenido">


                        <span class="agenda-gestion-estado-etiqueta">

                            Cambio de estado bloqueado

                        </span>


                        <strong>

                            El evento todavía no ha llegado

                        </strong>


                        <p>

                            Podrás modificar su estado a partir del

                            <b>

                                ${
                                    formatearFechaVisual(
                                        evento.fecha
                                    )
                                }

                            </b>.

                        </p>


                    </div>


                </section>
            `;

        }



        /* ==================================================
           COMPLETADO
        ================================================== */

        if (
            estado
            ===
            "completado"
        ) {

            return `

                <section
                    class="
                        agenda-gestion-estado
                        agenda-gestion-estado-finalizado
                        completado
                    "
                >


                    <div class="agenda-gestion-estado-icono">

                        <i class="bi bi-check-circle-fill"></i>

                    </div>


                    <div class="agenda-gestion-estado-contenido">


                        <span class="agenda-gestion-estado-etiqueta">

                            Actividad finalizada

                        </span>


                        <strong>

                            Evento completado

                        </strong>


                        <p>

                            El evento ya fue marcado como completado
                            y no puede volver a modificarse desde tu panel.

                        </p>


                    </div>


                </section>
            `;

        }



        /* ==================================================
           CANCELADO
        ================================================== */

        if (
            estado
            ===
            "cancelado"
        ) {

            return `

                <section
                    class="
                        agenda-gestion-estado
                        agenda-gestion-estado-finalizado
                        cancelado
                    "
                >


                    <div class="agenda-gestion-estado-icono">

                        <i class="bi bi-x-circle-fill"></i>

                    </div>


                    <div class="agenda-gestion-estado-contenido">


                        <span class="agenda-gestion-estado-etiqueta">

                            Actividad cerrada

                        </span>


                        <strong>

                            Evento cancelado

                        </strong>


                        <p>

                            El evento fue cancelado y no puede
                            volver a modificarse desde tu panel.

                        </p>


                    </div>


                </section>
            `;

        }


        return "";

    }



    /* ======================================================
       31. CREAR MODAL DINÁMICO
    ====================================================== */

    function crearModalDinamico(
        evento
    ) {

        if (!evento) {

            return null;

        }



        /* ==================================================
           ELIMINAR MODAL DINÁMICO ANTERIOR
        ================================================== */

        const anterior =
            document.getElementById(
                "modalEventoAgendaDinamico"
            );


        if (anterior) {

            anterior.remove();

        }



        const tipo =
            evento.tipo
            ||
            "evento";


        const nombreTipo =
            nombresTipos[
                tipo
            ]

            ||

            "Evento";


        const nombreEstado =
            nombresEstados[
                evento.estado
            ]

            ||

            evento.estado

            ||

            "Sin definir";


        const icono =
            iconosTipos[
                tipo
            ]

            ||

            "bi-calendar-event-fill";



        /* ==================================================
           UBICACIÓN
        ================================================== */

        const ubicacion =
            evento.colmena
                ?
                "Colmena "
                +
                escaparHTML(
                    evento.colmena
                )
                :
                "Apiario "
                +
                escaparHTML(
                    evento.apiario
                    ||
                    ""
                );



        /* ==================================================
           GESTIÓN DEL ESTADO
        ================================================== */

        const gestionEstado =
            construirGestionEstadoDinamico(
                evento
            );



        /* ==================================================
           OVERLAY
        ================================================== */

        const overlay =
            document.createElement(
                "div"
            );


        overlay.id =
            "modalEventoAgendaDinamico";


        overlay.className =
            "agenda-modal-overlay";


        overlay.setAttribute(
            "aria-hidden",
            "true"
        );



        /* ==================================================
           CONTENIDO
        ================================================== */

        overlay.innerHTML = `

            <div
                class="agenda-modal"
                role="dialog"
                aria-modal="true"
            >


                <!-- =========================================
                     HEADER
                ========================================== -->

                <div class="agenda-modal-header">


                    <div
                        class="
                            agenda-modal-icono
                            ${escaparHTML(tipo)}
                        "
                    >

                        <i class="bi ${icono}"></i>

                    </div>


                    <div class="agenda-modal-header-info">


                        <span>

                            ${escaparHTML(nombreTipo)}

                            ·

                            Evento #${escaparHTML(evento.id)}

                        </span>


                        <h2>

                            ${
                                escaparHTML(
                                    evento.titulo
                                    ||
                                    "Evento"
                                )
                            }

                        </h2>


                    </div>


                    <button
                        type="button"
                        class="agenda-modal-cerrar"
                        data-cerrar-modal-evento
                        aria-label="Cerrar"
                    >

                        <i class="bi bi-x-lg"></i>

                    </button>


                </div>



                <!-- =========================================
                     DATOS
                ========================================== -->

                <div class="agenda-modal-body">


                    <div class="agenda-modal-dato">

                        <span>
                            Apiario
                        </span>

                        <strong>

                            ${
                                escaparHTML(
                                    evento.apiario
                                    ||
                                    "Sin apiario"
                                )
                            }

                        </strong>

                    </div>



                    <div class="agenda-modal-dato">

                        <span>
                            Ubicación
                        </span>

                        <strong>
                            ${ubicacion}
                        </strong>

                    </div>



                    <div class="agenda-modal-dato">

                        <span>
                            Fecha
                        </span>

                        <strong>

                            ${
                                formatearFechaVisual(
                                    evento.fecha
                                )
                            }

                        </strong>

                    </div>



                    <div class="agenda-modal-dato">

                        <span>
                            Hora
                        </span>

                        <strong>

                            ${
                                escaparHTML(
                                    evento.hora
                                    ||
                                    "Sin hora"
                                )
                            }

                        </strong>

                    </div>



                    <div class="agenda-modal-dato">

                        <span>
                            Tipo
                        </span>

                        <strong>
                            ${escaparHTML(nombreTipo)}
                        </strong>

                    </div>



                    <div class="agenda-modal-dato">

                        <span>
                            Estado
                        </span>


                        <div>

                            <span
                                class="
                                    agenda-estado
                                    ${escaparHTML(evento.estado || "")}
                                "
                            >

                                <span></span>

                                ${escaparHTML(nombreEstado)}

                            </span>

                        </div>

                    </div>


                </div>



                <!-- =========================================
                     DESCRIPCIÓN
                ========================================== -->

                <div class="agenda-modal-descripcion">


                    <h3>
                        Descripción
                    </h3>


                    <p
                        class="${
                            evento.descripcion
                                ?
                                ""
                                :
                                "sin-descripcion"
                        }"
                    >

                        ${
                            evento.descripcion
                                ?
                                escaparHTML(
                                    evento.descripcion
                                )
                                :
                                "Este evento no tiene una descripción registrada."
                        }

                    </p>


                </div>



                <!-- =========================================
                     GESTIÓN DEL ESTADO
                ========================================== -->

                ${gestionEstado}



                <!-- =========================================
                     FOOTER
                ========================================== -->

                <div class="agenda-modal-footer">


                    <button
                        type="button"
                        class="btn-agenda-cerrar"
                        data-cerrar-modal-evento
                    >

                        Cerrar

                    </button>


                </div>


            </div>
        `;


        document.body.appendChild(
            overlay
        );


        return overlay;

    }



    /* ======================================================
       32. ABRIR EVENTO
    ====================================================== */

    function abrirEvento(
        idEvento,
        botonOrigen
    ) {


        /* ==================================================
           BUSCAR MODAL RENDERIZADO POR DJANGO
        ================================================== */

        const modalExistente =
            document.getElementById(
                "modalEvento"
                +
                idEvento
            );


        if (modalExistente) {

            abrirModal(
                modalExistente,
                botonOrigen
            );


            return;

        }



        /* ==================================================
           SI NO ESTÁ EN LA PÁGINA ACTUAL
        ================================================== */

        const evento =
            obtenerEventoPorId(
                idEvento
            );


        if (!evento) {

            return;

        }


        const modalDinamico =
            crearModalDinamico(
                evento
            );


        abrirModal(
            modalDinamico,
            botonOrigen
        );

    }



    /* ======================================================
       33. RESTAURAR BOTÓN DE CONFIRMACIÓN
    ====================================================== */

    function restaurarBotonConfirmacionEstado() {

        if (!btnConfirmarEstadoEvento) {

            return;

        }


        btnConfirmarEstadoEvento.disabled =
            false;


        btnConfirmarEstadoEvento.classList.remove(
            "completado",
            "cancelado"
        );


        btnConfirmarEstadoEvento.innerHTML = `

            <i
                class="
                    bi
                    bi-check-lg
                "
            ></i>


            <span>
                Confirmar
            </span>
        `;

    }



    /* ======================================================
       34. ABRIR CONFIRMACIÓN
    ====================================================== */

    function abrirConfirmacionEstado(
        boton
    ) {

        if (
            !boton
            ||
            !modalConfirmarEstadoEvento
            ||
            !formCambiarEstadoEvento
            ||
            !inputNuevoEstadoEvento
        ) {

            return;

        }



        /* ==================================================
           DATOS DEL BOTÓN
        ================================================== */

        const url =
            (
                boton.dataset.eventoUrl
                ||
                ""
            ).trim();


        const estado =
            (
                boton.dataset.eventoEstado
                ||
                ""
            ).trim();


        const titulo =
            (
                boton.dataset.eventoTitulo
                ||
                "Evento"
            ).trim();



        /* ==================================================
           VALIDAR
        ================================================== */

        if (
            !url

            ||

            ![
                "completado",
                "cancelado"
            ].includes(
                estado
            )
        ) {

            console.error(
                "No fue posible preparar el cambio de estado."
            );


            return;

        }



        /* ==================================================
           GUARDAR MODAL DEL EVENTO
        ================================================== */

        modalEventoAntesConfirmacion =
            boton.closest(
                ".agenda-modal-overlay"
            );


        botonCambioEstadoOrigen =
            boton;


        botonOrigenDetalleGuardado =
            botonOrigenModal;



        /* ==================================================
           OCULTAR MODAL DEL EVENTO
        ================================================== */

        if (
            modalEventoAntesConfirmacion
        ) {

            modalEventoAntesConfirmacion
                .classList
                .remove(
                    "activo"
                );


            modalEventoAntesConfirmacion
                .setAttribute(
                    "aria-hidden",
                    "true"
                );

        }



        /* ==================================================
           CONFIGURAR FORMULARIO
        ================================================== */

        formCambiarEstadoEvento.action =
            url;


        inputNuevoEstadoEvento.value =
            estado;


        if (
            nombreEventoConfirmarEstado
        ) {

            nombreEventoConfirmarEstado.textContent =
                titulo;

        }



        /* ==================================================
           RESTAURAR BOTÓN
        ================================================== */

        restaurarBotonConfirmacionEstado();



        const iconoBotonActual =
            btnConfirmarEstadoEvento
                ?
                btnConfirmarEstadoEvento.querySelector(
                    "i"
                )
                :
                null;


        const textoBotonActual =
            btnConfirmarEstadoEvento
                ?
                btnConfirmarEstadoEvento.querySelector(
                    "span"
                )
                :
                null;



        if (
            iconoConfirmarEstadoEvento
        ) {

            iconoConfirmarEstadoEvento.classList.remove(
                "completado",
                "cancelado"
            );

        }



        /* ==================================================
           COMPLETADO
        ================================================== */

        if (
            estado
            ===
            "completado"
        ) {

            if (
                tituloConfirmarEstadoEvento
            ) {

                tituloConfirmarEstadoEvento.textContent =
                    "¿Completar evento?";

            }


            if (
                mensajeConfirmarEstadoEvento
            ) {

                mensajeConfirmarEstadoEvento.textContent =
                    "Confirma que la actividad fue realizada correctamente.";

            }


            if (
                iconoConfirmarEstadoEvento
            ) {

                iconoConfirmarEstadoEvento.classList.add(
                    "completado"
                );

            }


            if (
                iconoConfirmarEstadoEventoI
            ) {

                iconoConfirmarEstadoEventoI.className =
                    "bi bi-check-circle-fill";

            }


            if (
                btnConfirmarEstadoEvento
            ) {

                btnConfirmarEstadoEvento.classList.add(
                    "completado"
                );

            }


            if (
                iconoBotonActual
            ) {

                iconoBotonActual.className =
                    "bi bi-check-lg";

            }


            if (
                textoBotonActual
            ) {

                textoBotonActual.textContent =
                    "Sí, completar";

            }

        }



        /* ==================================================
           CANCELADO
        ================================================== */

        else {

            if (
                tituloConfirmarEstadoEvento
            ) {

                tituloConfirmarEstadoEvento.textContent =
                    "¿Cancelar evento?";

            }


            if (
                mensajeConfirmarEstadoEvento
            ) {

                mensajeConfirmarEstadoEvento.textContent =
                    "Confirma que deseas registrar esta actividad como cancelada.";

            }


            if (
                iconoConfirmarEstadoEvento
            ) {

                iconoConfirmarEstadoEvento.classList.add(
                    "cancelado"
                );

            }


            if (
                iconoConfirmarEstadoEventoI
            ) {

                iconoConfirmarEstadoEventoI.className =
                    "bi bi-x-circle-fill";

            }


            if (
                btnConfirmarEstadoEvento
            ) {

                btnConfirmarEstadoEvento.classList.add(
                    "cancelado"
                );

            }


            if (
                iconoBotonActual
            ) {

                iconoBotonActual.className =
                    "bi bi-x-lg";

            }


            if (
                textoBotonActual
            ) {

                textoBotonActual.textContent =
                    "Sí, cancelar";

            }

        }



        /* ==================================================
           MOSTRAR MODAL
        ================================================== */

        modalConfirmarEstadoEvento
            .classList
            .add(
                "activo"
            );


        modalConfirmarEstadoEvento
            .setAttribute(
                "aria-hidden",
                "false"
            );


        modalActivo =
            modalConfirmarEstadoEvento;


        bloquearScroll();



        /* ==================================================
           FOCO
        ================================================== */

        if (
            btnConfirmarEstadoEvento
        ) {

            setTimeout(
                function () {

                    btnConfirmarEstadoEvento.focus();

                },
                70
            );

        }

    }



    /* ======================================================
       35. CERRAR CONFIRMACIÓN
    ====================================================== */

    function cerrarConfirmacionEstado(
        volverAlEvento = true
    ) {

        if (
            !modalConfirmarEstadoEvento
        ) {

            return;

        }



        /* ==================================================
           CERRAR CONFIRMACIÓN
        ================================================== */

        modalConfirmarEstadoEvento
            .classList
            .remove(
                "activo"
            );


        modalConfirmarEstadoEvento
            .setAttribute(
                "aria-hidden",
                "true"
            );


        restaurarBotonConfirmacionEstado();



        /* ==================================================
           VOLVER AL EVENTO
        ================================================== */

        if (
            volverAlEvento

            &&

            modalEventoAntesConfirmacion

            &&

            document.body.contains(
                modalEventoAntesConfirmacion
            )
        ) {

            modalEventoAntesConfirmacion
                .classList
                .add(
                    "activo"
                );


            modalEventoAntesConfirmacion
                .setAttribute(
                    "aria-hidden",
                    "false"
                );


            modalActivo =
                modalEventoAntesConfirmacion;


            botonOrigenModal =
                botonOrigenDetalleGuardado;


            bloquearScroll();


            if (
                botonCambioEstadoOrigen

                &&

                document.body.contains(
                    botonCambioEstadoOrigen
                )
            ) {

                setTimeout(
                    function () {

                        botonCambioEstadoOrigen.focus();

                    },
                    60
                );

            }

        }



        /* ==================================================
           CERRAR TODO
        ================================================== */

        else {

            modalActivo =
                null;


            botonOrigenModal =
                null;


            restaurarScroll();


            if (
                botonOrigenDetalleGuardado

                &&

                document.body.contains(
                    botonOrigenDetalleGuardado
                )
            ) {

                botonOrigenDetalleGuardado.focus();

            }

        }



        /* ==================================================
           LIMPIAR VARIABLES
        ================================================== */

        modalEventoAntesConfirmacion =
            null;


        botonCambioEstadoOrigen =
            null;


        botonOrigenDetalleGuardado =
            null;

    }



    /* ======================================================
       36. ENVIAR CAMBIO DE ESTADO
    ====================================================== */

    if (
        formCambiarEstadoEvento
    ) {

        formCambiarEstadoEvento.addEventListener(
            "submit",
            function (
                eventoSubmit
            ) {

                const estado =
                    inputNuevoEstadoEvento
                        ?
                        inputNuevoEstadoEvento.value
                        :
                        "";



                /* ==================================================
                   VALIDAR ESTADO
                ================================================== */

                if (
                    ![
                        "completado",
                        "cancelado"
                    ].includes(
                        estado
                    )
                ) {

                    eventoSubmit.preventDefault();


                    return;

                }



                /* ==================================================
                   EVITAR DOBLE ENVÍO
                ================================================== */

                if (
                    btnConfirmarEstadoEvento
                ) {

                    btnConfirmarEstadoEvento.disabled =
                        true;


                    btnConfirmarEstadoEvento.innerHTML = `

                        <span>
                            Actualizando...
                        </span>
                    `;

                }

            }
        );

    }



    /* ======================================================
       37. CLIC GLOBAL
    ====================================================== */

    document.addEventListener(
        "click",
        function (
            eventoClick
        ) {


            /* ==================================================
               CAMBIAR ESTADO
            ================================================== */

            const botonCambiarEstado =
                eventoClick.target.closest(
                    "[data-cambiar-estado-evento]"
                );


            if (
                botonCambiarEstado
            ) {

                eventoClick.preventDefault();

                eventoClick.stopPropagation();


                abrirConfirmacionEstado(
                    botonCambiarEstado
                );


                return;

            }



            /* ==================================================
               CERRAR CONFIRMACIÓN
            ================================================== */

            const botonCerrarConfirmacion =
                eventoClick.target.closest(
                    "[data-cerrar-confirmacion-estado]"
                );


            if (
                botonCerrarConfirmacion
            ) {

                eventoClick.preventDefault();


                cerrarConfirmacionEstado(
                    true
                );


                return;

            }



            /* ==================================================
               EVENTO DEL CALENDARIO
            ================================================== */

            const botonEventoDinamico =
                eventoClick.target.closest(
                    "[data-evento-id]"
                );


            if (
                botonEventoDinamico
            ) {

                eventoClick.preventDefault();

                eventoClick.stopPropagation();


                abrirEvento(
                    botonEventoDinamico.dataset.eventoId,
                    botonEventoDinamico
                );


                return;

            }



            /* ==================================================
               EVENTO ESTÁTICO
            ================================================== */

            const botonModal =
                eventoClick.target.closest(
                    "[data-modal-evento]"
                );


            if (
                botonModal
            ) {

                eventoClick.preventDefault();


                const idModal =
                    botonModal.dataset.modalEvento;


                if (!idModal) {

                    return;

                }



                const modal =
                    document.getElementById(
                        idModal
                    );


                if (modal) {

                    abrirModal(
                        modal,
                        botonModal
                    );


                    return;

                }



                /* ==================================================
                   FALLBACK
                ================================================== */

                const idEvento =
                    idModal.replace(
                        "modalEvento",
                        ""
                    );


                abrirEvento(
                    idEvento,
                    botonModal
                );


                return;

            }



            /* ==================================================
               CERRAR MODAL
            ================================================== */

            const botonCerrar =
                eventoClick.target.closest(
                    "[data-cerrar-modal-evento]"
                );


            if (
                botonCerrar
            ) {

                const modal =
                    botonCerrar.closest(
                        ".agenda-modal-overlay"
                    );


                cerrarModal(
                    modal
                );


                return;

            }

        }
    );



    /* ======================================================
       38. CERRAR TOCANDO EL FONDO
    ====================================================== */

    document.addEventListener(
        "click",
        function (
            eventoClick
        ) {

            if (
                !eventoClick.target.classList

                ||

                !eventoClick.target.classList.contains(
                    "agenda-modal-overlay"
                )
            ) {

                return;

            }



            /* ==================================================
               CONFIRMACIÓN
            ================================================== */

            if (
                eventoClick.target.id
                ===
                "modalConfirmarEstadoEvento"
            ) {

                cerrarConfirmacionEstado(
                    true
                );


                return;

            }



            /* ==================================================
               MODAL NORMAL
            ================================================== */

            cerrarModal(
                eventoClick.target
            );

        }
    );



    /* ======================================================
       39. CERRAR CON ESCAPE
    ====================================================== */

    document.addEventListener(
        "keydown",
        function (
            eventoTeclado
        ) {

            if (
                eventoTeclado.key
                !==
                "Escape"
            ) {

                return;

            }



            /* ==================================================
               CONFIRMACIÓN
            ================================================== */

            if (
                modalConfirmarEstadoEvento

                &&

                modalConfirmarEstadoEvento
                    .classList
                    .contains(
                        "activo"
                    )
            ) {

                cerrarConfirmacionEstado(
                    true
                );


                return;

            }



            /* ==================================================
               MODAL NORMAL
            ================================================== */

            if (
                modalActivo
            ) {

                cerrarModal(
                    modalActivo
                );

            }

        }
    );



    /* ======================================================
       40. ENVIAR FILTROS
    ====================================================== */

    function enviarFiltros() {

        if (
            !formularioFiltros
        ) {

            return;

        }


        if (
            typeof formularioFiltros.requestSubmit
            ===
            "function"
        ) {

            formularioFiltros.requestSubmit();

        }

        else {

            formularioFiltros.submit();

        }

    }



    /* ======================================================
       41. SELECTS AUTOMÁTICOS
    ====================================================== */

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



    /* ======================================================
       42. FILTRO POR FECHA
    ====================================================== */

    if (
        inputFechaFiltro
    ) {

        inputFechaFiltro.addEventListener(
            "change",
            enviarFiltros
        );

    }



    /* ======================================================
       43. BUSCAR CON ENTER
    ====================================================== */

    if (
        buscador
        &&
        formularioFiltros
    ) {

        buscador.addEventListener(
            "keydown",
            function (
                eventoTeclado
            ) {

                if (
                    eventoTeclado.key
                    !==
                    "Enter"
                ) {

                    return;

                }


                eventoTeclado.preventDefault();


                buscador.value =
                    buscador.value.trim();


                enviarFiltros();

            }
        );



        /* ==================================================
           LIMPIAR TEXTO ANTES DE ENVIAR
        ================================================== */

        formularioFiltros.addEventListener(
            "submit",
            function () {

                buscador.value =
                    buscador.value.trim();

            }
        );

    }



    /* ======================================================
       44. SI VIENE FECHA POR GET
    ====================================================== */

    if (
        inputFechaFiltro
        &&
        inputFechaFiltro.value
    ) {

        const fechaFiltro =
            parsearFechaLocal(
                inputFechaFiltro.value
            );


        if (
            fechaFiltro
        ) {

            fechaVista =
                new Date(
                    fechaFiltro.getFullYear(),
                    fechaFiltro.getMonth(),
                    1
                );


            fechaSeleccionada =
                fechaFiltro;

        }

    }



    /* ======================================================
       45. RESTAURAR ESTADO AL VOLVER
    ====================================================== */

    window.addEventListener(
        "pageshow",
        function () {


            /* ==================================================
               CERRAR MODALES
            ================================================== */

            document.querySelectorAll(
                ".agenda-modal-overlay.activo"
            ).forEach(
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



            /* ==================================================
               VARIABLES
            ================================================== */

            modalActivo =
                null;


            botonOrigenModal =
                null;


            modalEventoAntesConfirmacion =
                null;


            botonCambioEstadoOrigen =
                null;


            botonOrigenDetalleGuardado =
                null;



            /* ==================================================
               FORMULARIO DE ESTADO
            ================================================== */

            if (
                inputNuevoEstadoEvento
            ) {

                inputNuevoEstadoEvento.value =
                    "";

            }


            if (
                formCambiarEstadoEvento
            ) {

                formCambiarEstadoEvento.removeAttribute(
                    "action"
                );

            }


            restaurarBotonConfirmacionEstado();



            /* ==================================================
               SCROLL
            ================================================== */

            document.body.style.overflow =
                "";



            /* ==================================================
               RENDER
            ================================================== */

            renderizarCalendario();

        }
    );



    /* ======================================================
       46. RENDER INICIAL
    ====================================================== */

    renderizarCalendario();


});