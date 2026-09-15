document.addEventListener("DOMContentLoaded", function () {

    const modalDetalleElemento = document.getElementById(
        "modalDetalleEvento"
    );

    const modalEditarElemento = document.getElementById(
        "modalEditarEvento"
    );

    const modalEliminarElemento = document.getElementById(
        "modalEliminarEvento"
    );

    const formEditar = document.getElementById(
        "formEditarEvento"
    );

    const formEliminar = document.getElementById(
        "formEliminarEvento"
    );

    if (
        !modalDetalleElemento ||
        !modalEditarElemento ||
        !modalEliminarElemento
    ) {
        return;
    }

    const modalDetalle = bootstrap.Modal.getOrCreateInstance(
        modalDetalleElemento
    );

    const modalEditar = bootstrap.Modal.getOrCreateInstance(
        modalEditarElemento
    );

    const modalEliminar = bootstrap.Modal.getOrCreateInstance(
        modalEliminarElemento
    );

    let eventoSeleccionado = null;


    /* =====================================================
       DETALLE DEL EVENTO
    ====================================================== */

    modalDetalleElemento.addEventListener(
        "show.bs.modal",
        function (eventoModal) {

            eventoSeleccionado =
                eventoModal.relatedTarget;

            if (!eventoSeleccionado) {
                return;
            }

            // =====================================================
            // TIPO DE REGISTRO ABIERTO
            // =====================================================

            const esMantenimiento = (
                eventoSeleccionado.dataset.fuente
                ===
                "mantenimiento"
            );

            // =====================================================
            // ESTADO REAL DEL EVENTO
            // =====================================================

            const estadoReal = (
                eventoSeleccionado.dataset.estado
                ||
                ""
            );

            const esEstadoFinal = (
                estadoReal === "completado"
                ||
                estadoReal === "cancelado"
            );

            // =====================================================
            // REGISTRO HISTÓRICO DE INCIDENCIA
            // =====================================================

            const esIncidenciaHistorica = (
                eventoSeleccionado.dataset.fuente
                ===
                "evento"
                &&
                eventoSeleccionado.dataset.tipo
                ===
                "incidencia"
            );


            // =====================================================
            // BOTONES DEL DETALLE
            // =====================================================

            const botonEditarDetalle = document.getElementById(
                "btnEditarEventoDetalle"
            );

            const botonEliminarDetalle = document.getElementById(
                "btnEliminarEventoDetalle"
            );


            // =====================================================
            // LOS MANTENIMIENTOS SE GESTIONAN DESDE SU MÓDULO
            // =====================================================
            //
            // Agenda solamente los muestra como información.
            //
            // classList.toggle(..., true)  -> oculta
            // classList.toggle(..., false) -> vuelve a mostrar
            //
            // Así, al abrir después un evento normal, los botones
            // reaparecen automáticamente.
            // =====================================================

            if (botonEditarDetalle) {

                botonEditarDetalle.classList.toggle(
                    "d-none",
                    esMantenimiento
                    ||
                    esEstadoFinal
                    ||
                    esIncidenciaHistorica
                );

            }


            if (botonEliminarDetalle) {

                botonEliminarDetalle.classList.toggle(
                    "d-none",
                    esMantenimiento
                    ||
                    esEstadoFinal
                    ||
                    esIncidenciaHistorica
                );

            }

            asignarTexto(
                "detalleTipoEvento",
                eventoSeleccionado.dataset.tipoTexto
            );

            asignarTexto(
                "detalleTituloEvento",
                eventoSeleccionado.dataset.titulo
            );

            asignarTexto(
                "detalleApiarioEvento",
                eventoSeleccionado.dataset.apiario
            );

            asignarTexto(
                "detalleColmenaEvento",
                eventoSeleccionado.dataset.colmena
            );

            asignarTexto(
                "detalleResponsableEvento",
                eventoSeleccionado.dataset.responsable
            );

            const fechaTexto = (
                eventoSeleccionado.dataset.fechaTexto
                ||
                ""
            );

            const horaTexto = (
                eventoSeleccionado.dataset.hora
                ||
                ""
            );


            asignarTexto(
                "detalleFechaEvento",
                horaTexto
                    ? `${fechaTexto}, ${horaTexto}`
                    : fechaTexto
            );

            asignarTexto(
                "detalleEstadoEvento",
                eventoSeleccionado.dataset.estadoTexto
            );

            // =====================================================
            // ESTADO VISUAL DEL EVENTO
            // =====================================================

            const detalleEstado = document.getElementById(
                "detalleEstadoEvento"
            );

            if (detalleEstado) {

                const estadoVisual = (
                    eventoSeleccionado.dataset.estadoVisual
                    ||
                    eventoSeleccionado.dataset.estado
                    ||
                    "programado"
                );


                detalleEstado.className =
                    "estado-detalle-evento " +
                    `estado-${estadoVisual}`;

            }

            asignarTexto(
                "detalleDescripcionEvento",
                eventoSeleccionado.dataset.descripcion
            );

            const badgeTipo = document.getElementById(
                "detalleTipoEvento"
            );

            if (badgeTipo) {

                badgeTipo.className =
                    "badge-tipo-evento " +
                    `badge-${eventoSeleccionado.dataset.tipo}`;

            }


            /* ---------- Encabezado y su ícono, coloreados
               según el tipo del evento (igual que en el
               calendario y el badge) ---------- */

            const encabezadoDetalle = document.getElementById(
                "detalleHeaderEvento"
            );

            if (encabezadoDetalle) {

                encabezadoDetalle.className =
                    "modal-header modal-header-evento-detalle " +
                    `tipo-${eventoSeleccionado.dataset.tipo}`;

            }

            const iconoDetalle = document.getElementById(
                "detalleIconoEvento"
            );

            if (iconoDetalle) {

                const iconosPorTipo = {
                    mantenimiento: "bi-tools",
                    revision: "bi-clipboard2-check",
                    incidencia: "bi-exclamation-triangle-fill",
                    evento: "bi-calendar-event"
                };

                const nombreIcono =
                    iconosPorTipo[eventoSeleccionado.dataset.tipo] ||
                    "bi-calendar-event";

                iconoDetalle.className = `bi ${nombreIcono}`;

            }

        }
    );


    /* =====================================================
       ENTRADA ESCALONADA DE LAS FILAS DEL DETALLE
       (título, apiario, colmena, etc.), una vez que el
       modal ya terminó de mostrarse y los textos de arriba
       ya quedaron asignados.
    ====================================================== */

    modalDetalleElemento.addEventListener(
        "shown.bs.modal",
        function () {

            const filas = document.querySelectorAll(
                "#modalDetalleEvento .lista-detalle-evento > div"
            );

            filas.forEach(function (fila, indice) {

                fila.classList.remove("anim-entrada-lista");
                void fila.offsetWidth;

                fila.style.animationDelay = (indice * 50) + "ms";
                fila.classList.add("anim-entrada-lista");

            });

        }
    );


    /* =====================================================
       ABRIR EDICIÓN DESDE DETALLE
    ====================================================== */

    document.getElementById(
        "btnEditarEventoDetalle"
    )?.addEventListener("click", function () {

        if (
            !eventoSeleccionado
            ||
            eventoSeleccionado.dataset.fuente
                ===
                "mantenimiento"
            ||
            !eventoSeleccionado.dataset.editarUrl
        ) {
            return;
        }

        // =====================================================
        // ESTADO VISUAL ORIGINAL
        // =====================================================
        //
        // "vencido" no existe en la base de datos.
        // El estado real continúa siendo "programado".
        //
        // Guardamos esta información para que las validaciones
        // de edición sepan si el evento ya venció.
        // =====================================================

        formEditar.dataset.estadoVisual = (
            eventoSeleccionado.dataset.estadoVisual
            ||
            eventoSeleccionado.dataset.estado
        );


        const fechaEditar = document.getElementById(
            "editarFechaEvento"
        );

        if (fechaEditar) {

            fechaEditar.dataset.vencido = (
                eventoSeleccionado.dataset.estadoVisual
                ===
                "vencido"
            )
                ? "1"
                : "0";

        }

        formEditar.action =
            eventoSeleccionado.dataset.editarUrl;

        asignarValor(
            "editarTituloEvento",
            eventoSeleccionado.dataset.titulo
        );

        asignarValor(
            "editarTipoEvento",
            eventoSeleccionado.dataset.tipo
        );

        asignarValor(
            "editarEstadoEvento",
            eventoSeleccionado.dataset.estado
        );

        asignarValor(
            "editarApiarioEvento",
            eventoSeleccionado.dataset.apiarioId
        );


        // =====================================================
        // COLMENA ORIGINAL DEL EVENTO
        //
        // Si el evento ya estaba asociado a una colmena que
        // posteriormente quedó Inactiva, permitimos conservar
        // ESA MISMA asociación al editar.
        // =====================================================

        const selectorColmenaEditar =
            document.getElementById(
                "editarColmenaEvento"
            );


        if (selectorColmenaEditar) {

            selectorColmenaEditar.dataset.colmenaOriginal =
                eventoSeleccionado.dataset.colmenaId
                ||
                "";

        }


        filtrarColmenas(
            document.getElementById(
                "editarApiarioEvento"
            ),
            selectorColmenaEditar
        );


        asignarValor(
            "editarColmenaEvento",
            eventoSeleccionado.dataset.colmenaId
        );

        asignarValor(
            "editarResponsableEvento",
            eventoSeleccionado.dataset.responsableId
        );

        asignarValor(
            "editarFechaEvento",
            eventoSeleccionado.dataset.fecha
        );

        asignarValor(
            "editarHoraEvento",
            eventoSeleccionado.dataset.hora
        );

        asignarValor(
            "editarDescripcionEvento",
            eventoSeleccionado.dataset.descripcion
        );

        abrirModalDespuesDeCerrar(
            modalDetalleElemento,
            modalDetalle,
            modalEditar
        );

    });


    /* =====================================================
       ABRIR ELIMINACIÓN DESDE DETALLE
    ====================================================== */

    document.getElementById(
        "btnEliminarEventoDetalle"
    )?.addEventListener("click", function () {

        if (
            !eventoSeleccionado
            ||
            eventoSeleccionado.dataset.fuente
                ===
                "mantenimiento"
            ||
            !eventoSeleccionado.dataset.eliminarUrl
        ) {
            return;
        }

        formEliminar.action =
            eventoSeleccionado.dataset.eliminarUrl;

        asignarTexto(
            "nombreEventoEliminar",
            eventoSeleccionado.dataset.titulo
        );

        abrirModalDespuesDeCerrar(
            modalDetalleElemento,
            modalDetalle,
            modalEliminar
        );

    });


    /* =====================================================
       FILTRAR COLMENAS POR APIARIO
    ====================================================== */

    document.querySelectorAll(
        ".selector-apiario-evento"
    ).forEach(function (selectorApiario) {

        const selectorColmena = document.getElementById(
            selectorApiario.dataset.colmenaTarget
        );

        selectorApiario.addEventListener(
            "change",
            function () {

                filtrarColmenas(
                    selectorApiario,
                    selectorColmena
                );

            }
        );

        filtrarColmenas(
            selectorApiario,
            selectorColmena
        );

    });


    function filtrarColmenas(
        selectorApiario,
        selectorColmena
    ) {

        if (
            !selectorApiario
            ||
            !selectorColmena
        ) {

            return;

        }


        const apiarioSeleccionado =
            selectorApiario.value;


        // =====================================================
        // COLMENA ORIGINAL
        //
        // Solo existe en el selector de Editar.
        // Permite conservar una asociación histórica con una
        // colmena Inactiva.
        // =====================================================

        const colmenaOriginal =
            selectorColmena.dataset.colmenaOriginal
            ||
            "";


        Array.from(
            selectorColmena.options
        ).forEach(
            function (opcion) {


                // =============================================
                // OPCIÓN "SIN COLMENA ESPECÍFICA"
                // =============================================

                if (!opcion.value) {

                    opcion.hidden =
                        false;

                    opcion.disabled =
                        false;

                    return;

                }


                // =============================================
                // ¿PERTENECE AL APIARIO?
                // =============================================

                const correspondeApiario =
                    opcion.dataset.apiario
                    ===
                    apiarioSeleccionado;


                // =============================================
                // ¿ESTÁ INACTIVA?
                // =============================================

                const estaInactiva =
                    opcion.dataset.inactiva
                    ===
                    "1";


                // =============================================
                // ¿ES LA COLMENA HISTÓRICA DEL EVENTO?
                // =============================================

                const esColmenaOriginal =
                    colmenaOriginal
                    &&
                    opcion.value
                    ===
                    colmenaOriginal;


                // =============================================
                // MOSTRAR SOLO LAS DEL APIARIO
                // =============================================

                opcion.hidden =
                    !correspondeApiario;


                // =============================================
                // BLOQUEAR INACTIVAS
                //
                // Excepción:
                // si estamos editando y es exactamente la
                // colmena que ya tenía ese evento.
                // =============================================

                opcion.disabled = (
                    !correspondeApiario
                    ||
                    (
                        estaInactiva
                        &&
                        !esColmenaOriginal
                    )
                );

            }
        );


        // =====================================================
        // VALIDAR LA SELECCIÓN ACTUAL
        // =====================================================

        const opcionActual =
            selectorColmena.selectedOptions[0];


        if (
            opcionActual
            &&
            opcionActual.value
            &&
            (
                opcionActual.hidden
                ||
                opcionActual.disabled
            )
        ) {

            selectorColmena.value =
                "";

        }

    }


    function abrirModalDespuesDeCerrar(
        elementoActual,
        modalActual,
        modalNuevo
    ) {

        elementoActual.addEventListener(
            "hidden.bs.modal",
            function mostrarSiguiente() {

                modalNuevo.show();

            },
            { once: true }
        );

        modalActual.hide();

    }


    function asignarTexto(id, valor) {

        const elemento = document.getElementById(id);

        if (elemento) {
            elemento.textContent = valor || "—";
        }

    }


    function asignarValor(id, valor) {

        const elemento = document.getElementById(id);

        if (elemento) {
            elemento.value = valor || "";
        }

    }

});

/* =========================================================
   TRANSICIÓN DIRECCIONAL AL CAMBIAR DE MES
========================================================= */
//
// Los botones de "mes anterior / mes siguiente" son enlaces
// normales (recargan la página), así que no podemos animar
// la salida. Lo que sí podemos hacer es recordar hacia qué
// lado se navegó (con sessionStorage) y, apenas carga la
// página nueva, hacer que el calendario "entre" desde ese
// mismo lado en vez de aparecer siempre igual.

(function () {

    const CLAVE_DIRECCION = "agendaDireccionMes";

    document.querySelectorAll(".btn-navegar-mes").forEach(
        function (boton) {

            boton.addEventListener("click", function () {

                const esAnterior = boton.querySelector(
                    ".bi-chevron-left"
                ) !== null;

                try {
                    sessionStorage.setItem(
                        CLAVE_DIRECCION,
                        esAnterior ? "anterior" : "siguiente"
                    );
                } catch (error) {
                    // sessionStorage no disponible: sin animación
                    // direccional, pero la navegación sigue igual.
                }

            });

        }
    );

    document.addEventListener("DOMContentLoaded", function () {

        const tarjeta = document.querySelector(".tarjeta-calendario");
        if (!tarjeta) return;

        let direccion = null;

        try {
            direccion = sessionStorage.getItem(CLAVE_DIRECCION);
            sessionStorage.removeItem(CLAVE_DIRECCION);
        } catch (error) {
            return;
        }

        if (direccion === "siguiente") {
            tarjeta.classList.add("entra-mes-siguiente");
        } else if (direccion === "anterior") {
            tarjeta.classList.add("entra-mes-anterior");
        }

    });

})();

/* =========================================================
   ANIMACIONES DE ENTRADA DEL CALENDARIO
========================================================= */
//
// Bloque independiente del resto de agenda.js: si por algún
// motivo faltara algún modal en la página, esto sigue
// funcionando igual (no depende de esas validaciones).

document.addEventListener("DOMContentLoaded", function () {

    // ---------- Entrada escalonada de las celdas, tipo "ola" ----------
    //
    // Como el calendario se genera semana por semana (7 columnas),
    // usamos fila y columna para que la animación se sienta como
    // una ola diagonal en vez de una simple lista de arriba a abajo.

    const celdas = document.querySelectorAll(".celda-calendario");

    celdas.forEach(function (celda, indice) {

        const fila = Math.floor(indice / 7);
        const columna = indice % 7;

        celda.classList.remove("anim-entrada-lista");
        void celda.offsetWidth;

        celda.style.animationDelay = ((fila + columna) * 18) + "ms";
        celda.classList.add("anim-entrada-lista");
    });

    // ---------- Entrada escalonada de los eventos dentro de cada celda ----------

    celdas.forEach(function (celda) {

        const eventos = celda.querySelectorAll(".evento-calendario");

        eventos.forEach(function (evento, indice) {

            evento.classList.remove("anim-entrada-lista");
            void evento.offsetWidth;

            // Arrancan un poco después de que su celda ya haya aparecido
            const retrasoCelda = parseInt(celda.style.animationDelay, 10) || 0;
            evento.style.animationDelay = (retrasoCelda + 200 + indice * 60) + "ms";
            evento.classList.add("anim-entrada-lista");
        });
    });

});

/* ==========================================================
   VALIDACIONES NUEVAS - MÓDULO DE AGENDA
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {

    function hoyComoTexto() {
        const ahora = new Date();
        const año = ahora.getFullYear();
        const mes = String(ahora.getMonth() + 1).padStart(2, "0");
        const dia = String(ahora.getDate()).padStart(2, "0");
        return `${año}-${mes}-${dia}`;
    }

    function horaActualComoTexto() {
        const ahora = new Date();
        const horas = String(ahora.getHours()).padStart(2, "0");
        const minutos = String(ahora.getMinutes()).padStart(2, "0");
        return `${horas}:${minutos}`;
    }

    const hoyTexto = hoyComoTexto();

    function configurarValidacionEvento(prefijo, formId, esCreacion) {

        const form = document.getElementById(formId);
        if (!form) return;

        const titulo = document.getElementById(`${prefijo}TituloEvento`);
        const fecha = document.getElementById(`${prefijo}FechaEvento`);
        const hora = document.getElementById(`${prefijo}HoraEvento`);
        const apiario = document.getElementById(`${prefijo}ApiarioEvento`);
        const colmena = document.getElementById(`${prefijo}ColmenaEvento`);
        const estado = document.getElementById(
            `${prefijo}EstadoEvento`
        );

        // En Crear, la fecha siempre debe ser hoy o en adelante.
        if (esCreacion && fecha) {
            fecha.min = hoyTexto;
        }


        /* =====================================================
           CORRECCIÓN ÚNICAMENTE PARA LA HORA
        ====================================================== */

        // Si anteriormente se intentó enviar una hora que ya había
        // pasado, setCustomValidity() deja el campo marcado como
        // inválido. Por eso, cuando el usuario cambie nuevamente
        // la hora, debemos limpiar ese error anterior.

        if (hora) {

            hora.addEventListener("input", function () {
                hora.setCustomValidity("");
            });

            hora.addEventListener("change", function () {
                hora.setCustomValidity("");
            });

        }

        // También debemos limpiar el error de la hora si cambia
        // la fecha. Por ejemplo:
        //
        // Hoy 07:00 = inválido
        // Mañana 07:00 = válido
        //
        // Si no limpiamos el error anterior, el navegador seguiría
        // considerando inválido el campo de hora.

        if (fecha && hora) {

            fecha.addEventListener("input", function () {
                hora.setCustomValidity("");
            });

            fecha.addEventListener("change", function () {
                hora.setCustomValidity("");
            });

        }

        // =====================================================
        // LIMPIAR ERROR ANTERIOR DE FECHA
        // =====================================================
        //
        // setCustomValidity() permanece activo aunque el usuario
        // cambie posteriormente la fecha. Por eso debemos limpiar
        // el mensaje en cuanto modifique el campo.
        // =====================================================

        if (fecha) {

            fecha.addEventListener(
                "input",
                function () {
                    fecha.setCustomValidity("");
                }
            );

            fecha.addEventListener(
                "change",
                function () {
                    fecha.setCustomValidity("");
                }
            );

        }


        form.addEventListener("submit", function (e) {

            // =====================================================
            // ESTADO QUE SE INTENTA GUARDAR
            // =====================================================
            //
            // En Crear no existe selector de estado porque todo
            // evento nuevo nace como Programado.
            //
            // En Editar utilizamos el valor seleccionado.
            // =====================================================

            const estadoSeleccionado = (
                estado
                    ? estado.value
                    : "programado"
            );


            // Solo un evento que vaya a quedar Programado necesita
            // estar ubicado en un momento futuro.
            const exigeMomentoFuturo = (
                esCreacion
                ||
                estadoSeleccionado === "programado"
            );

            // =====================================================
            // NO COMPLETAR EVENTOS FUTUROS
            // =====================================================

            if (estado) {

                estado.setCustomValidity("");


                const eventoTodaviaNoLlega = (
                    fecha
                    &&
                    fecha.value
                    &&
                    (
                        fecha.value > hoyTexto
                        ||
                        (
                            fecha.value === hoyTexto
                            &&
                            hora
                            &&
                            hora.value
                            &&
                            hora.value > horaActualComoTexto()
                        )
                    )
                );


                if (
                    estadoSeleccionado === "completado"
                    &&
                    eventoTodaviaNoLlega
                ) {

                    estado.setCustomValidity(
                        "No puedes marcar como Completado un evento cuya fecha y hora todavía no han llegado."
                    );

                }

            }

            // 1) Título: no puede quedar vacío (solo espacios). En vez
            //    de una alerta emergente, usamos el mismo mecanismo
            //    nativo del navegador que ya usan los demás campos
            //    required (borde rojo + mensaje al enfocar/enviar).
            if (titulo) {
                const valorLimpio = titulo.value.trim();

                if (valorLimpio === "") {
                    titulo.setCustomValidity("El título no puede quedar vacío.");
                } else {
                    titulo.value = valorLimpio;
                    titulo.setCustomValidity("");
                }
            }

            // =====================================================
            // 2) VALIDAR FECHA
            // =====================================================

            if (fecha) {

                fecha.setCustomValidity("");


                if (
                    exigeMomentoFuturo
                    &&
                    (
                        !fecha.value
                        ||
                        fecha.value < hoyTexto
                    )
                ) {

                    fecha.setCustomValidity(
                        "Un evento Programado no puede quedar en una fecha pasada."
                    );

                }

            }

            // =====================================================
            // 3) VALIDAR HORA
            // =====================================================

            if (hora) {

                hora.setCustomValidity("");


                if (
                    exigeMomentoFuturo
                    &&
                    fecha
                    &&
                    fecha.value === hoyTexto
                    &&
                    hora.value
                    &&
                    hora.value <= horaActualComoTexto()
                ) {

                    hora.setCustomValidity(
                        "Un evento Programado debe tener una hora posterior a la actual."
                    );

                }

            }

            // =================================================
            // 4) VALIDAR COLMENA
            // =================================================

            if (
                apiario
                &&
                colmena
            ) {

                colmena.setCustomValidity("");


                if (colmena.value) {

                    const opcionColmena =
                        colmena.selectedOptions[0];


                    if (opcionColmena) {


                        // =====================================
                        // DEBE PERTENECER AL APIARIO
                        // =====================================

                        if (
                            opcionColmena.dataset.apiario
                            !==
                            apiario.value
                        ) {

                            colmena.setCustomValidity(
                                "La colmena seleccionada no pertenece al apiario indicado."
                            );

                        }


                        // =====================================
                        // COLMENA INACTIVA
                        // =====================================

                        else if (
                            opcionColmena.dataset.inactiva
                            ===
                            "1"
                        ) {

                            const colmenaOriginal =
                                colmena.dataset.colmenaOriginal
                                ||
                                "";


                            const esOriginalEdicion = (
                                !esCreacion
                                &&
                                colmenaOriginal
                                ===
                                opcionColmena.value
                            );


                            // =============================================
                            // OTRA COLMENA INACTIVA
                            // =============================================

                            if (!esOriginalEdicion) {

                                colmena.setCustomValidity(
                                    "No puedes asignar un evento a una colmena Inactiva."
                                );

                            }


                            // =============================================
                            // MISMA COLMENA INACTIVA + PROGRAMADO
                            // =============================================

                            else if (
                                estadoSeleccionado
                                ===
                                "programado"
                            ) {

                                colmena.setCustomValidity(
                                    "Una colmena Inactiva no puede tener eventos Programados."
                                );

                            }

                        }

                    }

                }

            }

            // El navegador ya revisa por nosotros: required, pattern,
            // type="date"/"time", y los mensajes personalizados que
            // acabamos de poner con setCustomValidity().
            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
                form.classList.add("was-validated");
                return;
            }

            form.classList.add("was-validated");
        });
    }

    configurarValidacionEvento("crear", "formCrearEvento", true);
    configurarValidacionEvento("editar", "formEditarEvento", false);

    // =========================================================
    // CONFIGURAR FECHA AL EDITAR
    // =========================================================
    //
    // Un evento vencido puede:
    //
    // - Reprogramarse.
    // - Marcarse como Completado.
    // - Marcarse como Cancelado.
    //
    // Por eso la fecha nunca debe quedar bloqueada.
    // =========================================================

    const modalEditarElemento = document.getElementById(
        "modalEditarEvento"
    );

    const fechaEditar = document.getElementById(
        "editarFechaEvento"
    );


    if (
        modalEditarElemento
        &&
        fechaEditar
    ) {

        modalEditarElemento.addEventListener(
            "shown.bs.modal",
            function () {

                // Nunca bloquear la fecha.
                fechaEditar.readOnly = false;

                fechaEditar.removeAttribute(
                    "title"
                );


                // Si el evento NO está vencido,
                // no permitimos seleccionar días anteriores.
                if (
                    fechaEditar.dataset.vencido
                    !==
                    "1"
                ) {

                    fechaEditar.min = hoyTexto;

                } else {

                    // Un vencido necesita conservar temporalmente
                    // su fecha original para poder cerrarlo como
                    // Completado o Cancelado.
                    fechaEditar.removeAttribute(
                        "min"
                    );

                }

            }
        );

    }
});