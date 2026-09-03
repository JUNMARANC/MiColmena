/* ==========================================================
   AGENDA - PANEL APICULTOR
   MI COLMENA
========================================================== */

document.addEventListener("DOMContentLoaded", function () {


    /* ======================================================
       1. ELEMENTOS DEL CALENDARIO
    ====================================================== */

    const calendario = document.getElementById(
        "calendarioAgenda"
    );

    const tituloMes = document.getElementById(
        "tituloMesAgenda"
    );

    const btnMesAnterior = document.getElementById(
        "btnMesAnterior"
    );

    const btnMesSiguiente = document.getElementById(
        "btnMesSiguiente"
    );

    const btnHoy = document.getElementById(
        "btnHoyAgenda"
    );



    /* ======================================================
       2. FILTROS
    ====================================================== */

    const formularioFiltros = document.querySelector(
        ".agenda-filtros-form"
    );

    const buscador = document.querySelector(
        ".agenda-buscador input"
    );

    const selectsFiltros = document.querySelectorAll(
        ".agenda-select"
    );

    const inputFechaFiltro = document.querySelector(
        '.agenda-fecha-filtro input[name="fecha"]'
    );



    /* ======================================================
       3. DATOS DE EVENTOS ENVIADOS POR DJANGO
    ====================================================== */

    const scriptEventos = document.getElementById(
        "eventosAgendaData"
    );


    let eventos = [];


    if (scriptEventos) {

        try {

            eventos = JSON.parse(
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

    const fechaActual = new Date();


    /*
     * fechaVista representa el mes que se encuentra
     * actualmente visible en el calendario.
     */

    let fechaVista = new Date(
        fechaActual.getFullYear(),
        fechaActual.getMonth(),
        1
    );


    /*
     * Fecha seleccionada visualmente.
     */

    let fechaSeleccionada = null;



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
       6. TIPOS DE EVENTO
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
       8. ESCAPAR HTML
    ====================================================== */

    function escaparHTML(
        valor
    ) {

        if (
            valor === null ||
            valor === undefined
        ) {

            return "";

        }


        return String(valor)

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
       9. RELLENAR NÚMERO CON CERO
    ====================================================== */

    function rellenarCero(
        numero
    ) {

        return String(numero).padStart(
            2,
            "0"
        );

    }



    /* ======================================================
       10. CONVERTIR FECHA A YYYY-MM-DD
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
       11. PARSEAR FECHA SIN PROBLEMAS DE ZONA HORARIA
    ====================================================== */

    function parsearFechaLocal(
        textoFecha
    ) {

        if (!textoFecha) {

            return null;

        }


        const partes = textoFecha.split(
            "-"
        );


        if (partes.length !== 3) {

            return null;

        }


        const anio = Number(
            partes[0]
        );

        const mes = Number(
            partes[1]
        ) - 1;

        const dia = Number(
            partes[2]
        );


        return new Date(
            anio,
            mes,
            dia
        );

    }



    /* ======================================================
       12. COMPARAR DOS FECHAS
    ====================================================== */

    function fechasIguales(
        fecha1,
        fecha2
    ) {

        if (
            !fecha1 ||
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
       13. OBTENER EVENTOS DE UNA FECHA
    ====================================================== */

    function obtenerEventosFecha(
        fechaISO
    ) {

        return eventos

            .filter(
                function (evento) {

                    return (
                        evento.fecha === fechaISO
                    );

                }
            )

            .sort(
                function (a, b) {

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
       14. CREAR BOTÓN DE EVENTO DEL CALENDARIO
    ====================================================== */

    function crearEventoCalendario(
        evento
    ) {

        const boton = document.createElement(
            "button"
        );


        boton.type =
            "button";


        boton.className =
            "agenda-dia-evento "
            +
            (
                evento.tipo ||
                "evento"
            );


        boton.dataset.eventoId =
            evento.id;


        boton.title =
            (
                evento.hora
                    ?
                    evento.hora + " · "
                    :
                    ""
            )
            +
            (
                evento.titulo ||
                "Evento"
            );


        const icono = (
            iconosTipos[
                evento.tipo
            ]
            ||
            "bi-calendar-event-fill"
        );


        boton.innerHTML = `
            <i class="bi ${icono}"></i>

            <span>
                ${
                    escaparHTML(
                        evento.hora || ""
                    )
                }

                ${
                    escaparHTML(
                        evento.titulo || "Evento"
                    )
                }
            </span>
        `;


        return boton;

    }



    /* ======================================================
       15. CREAR DÍA DEL CALENDARIO
    ====================================================== */

    function crearDiaCalendario(
        fecha,
        perteneceMesActual
    ) {

        const dia = document.createElement(
            "div"
        );


        dia.className =
            "agenda-dia";


        if (!perteneceMesActual) {

            dia.classList.add(
                "otro-mes"
            );

        }


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


        if (
            fechaSeleccionada &&
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
           NÚMERO DEL DÍA
        ================================================== */

        const numero = document.createElement(
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
           EVENTOS DE ESE DÍA
        ================================================== */

        const eventosDelDia =
            obtenerEventosFecha(
                fechaISO
            );


        if (
            eventosDelDia.length > 0
        ) {

            const contenedorEventos =
                document.createElement(
                    "div"
                );


            contenedorEventos.className =
                "agenda-dia-eventos";


            /*
             * Mostramos máximo 2 eventos directamente
             * para evitar cargar demasiado cada cuadro.
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


            /*
             * Si existen más de dos eventos,
             * mostramos el contador.
             */

            if (
                eventosDelDia.length > 2
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
                        eventosDelDia.length -
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
            function (eventoClick) {


                /*
                 * Si el usuario presionó directamente
                 * un evento, no seleccionamos el día.
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
       16. RENDERIZAR CALENDARIO
    ====================================================== */

    function renderizarCalendario() {

        if (
            !calendario ||
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
            nombresMeses[mes]
            +
            " "
            +
            anio;



        /* ==================================================
           PRIMER DÍA DEL MES
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
         * Lunes = 1
         *
         * Nuestro calendario empieza por lunes.
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
           PRIMER DÍA QUE MOSTRAREMOS
        ================================================== */

        const fechaInicio =
            new Date(
                anio,
                mes,
                1 - indicePrimerDia
            );


        /*
         * Renderizamos 42 días:
         * 6 semanas completas.
         */

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


            const elementoDia =
                crearDiaCalendario(
                    fechaDia,
                    perteneceMes
                );


            calendario.appendChild(
                elementoDia
            );

        }

    }



    /* ======================================================
       17. SELECCIONAR DÍA
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


        const diaSeleccionado =
            calendario.querySelector(
                `[data-fecha="${fechaISO}"]`
            );


        if (diaSeleccionado) {

            diaSeleccionado.classList.add(
                "seleccionado"
            );

        }


        /*
         * También dejamos seleccionada esta fecha
         * en el filtro del listado.
         *
         * No enviamos automáticamente el formulario
         * para no sacar al usuario del calendario.
         */

        if (inputFechaFiltro) {

            inputFechaFiltro.value =
                fechaISO;

        }

    }



    /* ======================================================
       18. MES ANTERIOR
    ====================================================== */

    if (btnMesAnterior) {

        btnMesAnterior.addEventListener(
            "click",
            function () {

                fechaVista = new Date(
                    fechaVista.getFullYear(),
                    fechaVista.getMonth() - 1,
                    1
                );


                renderizarCalendario();

            }
        );

    }



    /* ======================================================
       19. MES SIGUIENTE
    ====================================================== */

    if (btnMesSiguiente) {

        btnMesSiguiente.addEventListener(
            "click",
            function () {

                fechaVista = new Date(
                    fechaVista.getFullYear(),
                    fechaVista.getMonth() + 1,
                    1
                );


                renderizarCalendario();

            }
        );

    }



    /* ======================================================
       20. BOTÓN HOY
    ====================================================== */

    if (btnHoy) {

        btnHoy.addEventListener(
            "click",
            function () {

                fechaVista = new Date(
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
       21. MODALES
    ====================================================== */

    let modalActivo = null;

    let botonOrigenModal = null;



    /* ======================================================
       22. BLOQUEAR SCROLL
    ====================================================== */

    function bloquearScroll() {

        document.body.style.overflow =
            "hidden";

    }



    /* ======================================================
       23. RESTAURAR SCROLL
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
       24. ABRIR MODAL EXISTENTE
    ====================================================== */

    function abrirModal(
        modal,
        botonOrigen = null
    ) {

        if (!modal) {

            return;

        }


        /*
         * Cerramos cualquier otro modal.
         */

        document.querySelectorAll(
            ".agenda-modal-overlay.activo"
        ).forEach(
            function (otroModal) {

                if (
                    otroModal !== modal
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
       25. CERRAR MODAL
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
            modalActivo === modal
        ) {

            modalActivo = null;

        }


        restaurarScroll();


        if (
            botonOrigenModal &&
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
       26. BUSCAR EVENTO POR ID
    ====================================================== */

    function obtenerEventoPorId(
        idEvento
    ) {

        return eventos.find(
            function (evento) {

                return String(
                    evento.id
                )
                ===
                String(
                    idEvento
                );

            }
        );

    }



    /* ======================================================
       27. MODAL DINÁMICO
       PARA EVENTOS QUE NO ESTÁN EN LA PÁGINA DE LA TABLA
    ====================================================== */

    function crearModalDinamico(
        evento
    ) {

        if (!evento) {

            return null;

        }


        /*
         * Eliminamos un modal dinámico anterior.
         */

        const anterior =
            document.getElementById(
                "modalEventoAgendaDinamico"
            );


        if (anterior) {

            anterior.remove();

        }


        const tipo =
            evento.tipo ||
            "evento";


        const nombreTipo =
            nombresTipos[tipo]
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
            iconosTipos[tipo]
            ||
            "bi-calendar-event-fill";


        const ubicacion = evento.colmena
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
                evento.apiario || ""
            );


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


        overlay.innerHTML = `

            <div
                class="agenda-modal"
                role="dialog"
                aria-modal="true"
            >

                <div class="agenda-modal-header">

                    <div
                        class="agenda-modal-icono ${escaparHTML(tipo)}"
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

                            ${escaparHTML(
                                evento.titulo ||
                                "Evento"
                            )}

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


                <div class="agenda-modal-body">


                    <div class="agenda-modal-dato">

                        <span>
                            Apiario
                        </span>

                        <strong>

                            ${escaparHTML(
                                evento.apiario ||
                                "Sin apiario"
                            )}

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

                            ${formatearFechaVisual(
                                evento.fecha
                            )}

                        </strong>

                    </div>


                    <div class="agenda-modal-dato">

                        <span>
                            Hora
                        </span>

                        <strong>

                            ${escaparHTML(
                                evento.hora ||
                                "Sin hora"
                            )}

                        </strong>

                    </div>


                    <div class="agenda-modal-dato">

                        <span>
                            Tipo
                        </span>

                        <strong>

                            ${escaparHTML(
                                nombreTipo
                            )}

                        </strong>

                    </div>


                    <div class="agenda-modal-dato">

                        <span>
                            Estado
                        </span>

                        <strong>

                            ${escaparHTML(
                                nombreEstado
                            )}

                        </strong>

                    </div>

                </div>


                <div class="agenda-modal-descripcion">

                    <h3>
                        Descripción
                    </h3>

                    <p class="${
                        evento.descripcion
                            ?
                            ""
                            :
                            "sin-descripcion"
                    }">

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
       28. FORMATEAR FECHA VISUAL
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
       29. ABRIR EVENTO
    ====================================================== */

    function abrirEvento(
        idEvento,
        botonOrigen
    ) {

        /*
         * Primero buscamos si Django ya renderizó
         * el modal completo.
         */

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


        /*
         * Si el evento está en calendario / próximos
         * pero no está dentro de la página actual de
         * la tabla, generamos el modal con JSON.
         */

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
       30. CLIC GLOBAL EN EVENTOS / MODALES
    ====================================================== */

    document.addEventListener(
        "click",
        function (eventoClick) {


            /* ==================================================
               EVENTO GENERADO POR CALENDARIO
            ================================================== */

            const botonEventoDinamico =
                eventoClick.target.closest(
                    "[data-evento-id]"
                );


            if (botonEventoDinamico) {

                eventoClick.preventDefault();

                eventoClick.stopPropagation();


                abrirEvento(
                    botonEventoDinamico.dataset.eventoId,
                    botonEventoDinamico
                );


                return;

            }



            /* ==================================================
               BOTÓN ESTÁTICO DEL HTML
            ================================================== */

            const botonModal =
                eventoClick.target.closest(
                    "[data-modal-evento]"
                );


            if (botonModal) {

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


                /*
                 * Fallback:
                 *
                 * si el botón está en "Próximos eventos"
                 * o "Actividades de hoy", pero el evento
                 * no está en la página actual de la tabla,
                 * obtenemos el número desde:
                 *
                 * modalEvento15
                 */

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


            if (botonCerrar) {

                const modal =
                    botonCerrar.closest(
                        ".agenda-modal-overlay"
                    );


                cerrarModal(
                    modal
                );

            }

        }
    );



    /* ======================================================
       31. CERRAR TOCANDO EL FONDO
    ====================================================== */

    document.addEventListener(
        "click",
        function (eventoClick) {

            if (
                eventoClick.target.classList &&
                eventoClick.target.classList.contains(
                    "agenda-modal-overlay"
                )
            ) {

                cerrarModal(
                    eventoClick.target
                );

            }

        }
    );



    /* ======================================================
       32. CERRAR CON ESCAPE
    ====================================================== */

    document.addEventListener(
        "keydown",
        function (eventoTeclado) {

            if (
                eventoTeclado.key ===
                "Escape"
                &&
                modalActivo
            ) {

                cerrarModal(
                    modalActivo
                );

            }

        }
    );



    /* ======================================================
       33. ENVIAR FILTROS
    ====================================================== */

    function enviarFiltros() {

        if (!formularioFiltros) {

            return;

        }


        if (
            typeof formularioFiltros.requestSubmit
            ===
            "function"
        ) {

            formularioFiltros.requestSubmit();

        } else {

            formularioFiltros.submit();

        }

    }



    /* ======================================================
       34. SELECTS AUTOMÁTICOS
    ====================================================== */

    selectsFiltros.forEach(
        function (select) {

            select.addEventListener(
                "change",
                function () {

                    enviarFiltros();

                }
            );

        }
    );



    /* ======================================================
       35. FILTRAR AUTOMÁTICAMENTE AL CAMBIAR FECHA
    ====================================================== */

    if (inputFechaFiltro) {

        inputFechaFiltro.addEventListener(
            "change",
            function () {

                /*
                 * Si selecciona una fecha desde el input
                 * enviamos el filtro.
                 */

                enviarFiltros();

            }
        );

    }



    /* ======================================================
       36. BUSCAR CON ENTER
    ====================================================== */

    if (
        buscador &&
        formularioFiltros
    ) {

        buscador.addEventListener(
            "keydown",
            function (eventoTeclado) {

                if (
                    eventoTeclado.key !==
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

    }



    /* ======================================================
       37. LIMPIAR BUSCADOR ANTES DEL SUBMIT
    ====================================================== */

    if (
        formularioFiltros &&
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



    /* ======================================================
       38. SI VIENE UNA FECHA POR GET
       ABRIR EL CALENDARIO EN ESE MES
    ====================================================== */

    if (
        inputFechaFiltro &&
        inputFechaFiltro.value
    ) {

        const fechaFiltro =
            parsearFechaLocal(
                inputFechaFiltro.value
            );


        if (fechaFiltro) {

            fechaVista = new Date(
                fechaFiltro.getFullYear(),
                fechaFiltro.getMonth(),
                1
            );


            fechaSeleccionada =
                fechaFiltro;

        }

    }



    /* ======================================================
       39. RESTAURAR ESTADO AL VOLVER CON NAVEGADOR
    ====================================================== */

    window.addEventListener(
        "pageshow",
        function () {


            document.querySelectorAll(
                ".agenda-modal-overlay.activo"
            ).forEach(
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


            modalActivo =
                null;


            botonOrigenModal =
                null;


            document.body.style.overflow =
                "";


            renderizarCalendario();

        }
    );



    /* ======================================================
       40. RENDER INICIAL
    ====================================================== */

    renderizarCalendario();


});