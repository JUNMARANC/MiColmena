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

            asignarTexto(
                "detalleFechaEvento",
                `${eventoSeleccionado.dataset.fechaTexto}, ` +
                `${eventoSeleccionado.dataset.hora}`
            );

            asignarTexto(
                "detalleEstadoEvento",
                eventoSeleccionado.dataset.estadoTexto
            );

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

        }
    );


    /* =====================================================
       ABRIR EDICIÓN DESDE DETALLE
    ====================================================== */

    document.getElementById(
        "btnEditarEventoDetalle"
    )?.addEventListener("click", function () {

        if (!eventoSeleccionado) {
            return;
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

        filtrarColmenas(
            document.getElementById("editarApiarioEvento"),
            document.getElementById("editarColmenaEvento")
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

        if (!eventoSeleccionado) {
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

        if (!selectorApiario || !selectorColmena) {
            return;
        }

        const apiarioSeleccionado =
            selectorApiario.value;

        Array.from(
            selectorColmena.options
        ).forEach(function (opcion) {

            if (!opcion.value) {
                opcion.hidden = false;
                return;
            }

            opcion.hidden = (
                opcion.dataset.apiario !==
                apiarioSeleccionado
            );

        });

        const opcionActual =
            selectorColmena.selectedOptions[0];

        if (
            opcionActual &&
            opcionActual.hidden
        ) {
            selectorColmena.value = "";
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


        form.addEventListener("submit", function (e) {

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

            // 2) La fecha no puede ser anterior a hoy — salvo que el
            //    evento ya haya vencido (ver el bloque de Editar más
            //    abajo, que marca fecha.dataset.vencido = "1" y en
            //    ese caso no se valida aquí).
            if (fecha) {

                if (fecha.dataset.vencido !== "1") {

                    if (!fecha.value || fecha.value < hoyTexto) {
                        fecha.setCustomValidity("La fecha del evento no puede ser anterior a hoy.");
                    } else {
                        fecha.setCustomValidity("");
                    }

                } else {
                    fecha.setCustomValidity("");
                }
            }

            // 3) Si la fecha elegida es HOY, la hora no puede haber
            //    pasado ya. Si el campo está vacío o incompleto (el
            //    usuario aún está escribiendo), no es un caso de
            //    "ya pasó" — eso lo maneja el propio required nativo
            //    del campo con su mensaje normal.
            if (hora) {

                if (fecha && fecha.value === hoyTexto && hora.value) {

                    if (hora.value < horaActualComoTexto()) {
                        hora.setCustomValidity(
                            "La hora ya pasó para el día de hoy."
                        );
                    } else {
                        hora.setCustomValidity("");
                    }

                } else {
                    hora.setCustomValidity("");
                }
            }

            // 4) Refuerzo silencioso: la colmena elegida debe
            //    pertenecer al apiario elegido (por si el filtrado no
            //    llegó a aplicarse a tiempo). No bloquea el envío,
            //    solo limpia el valor si no corresponde.
            if (apiario && colmena && colmena.value) {

                const opcionColmena = colmena.selectedOptions[0];

                if (
                    opcionColmena &&
                    opcionColmena.dataset.apiario !== apiario.value
                ) {
                    colmena.value = "";
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

    // Para Editar: cuando el modal termina de abrirse (agenda.js ya
    // cargó los datos del evento seleccionado en los campos), se
    // decide si la fecha original ya venció. Si venció, se bloquea
    // el campo para que no se pueda mover, pero el resto del
    // formulario se puede seguir editando con normalidad.
    const modalEditarElemento = document.getElementById("modalEditarEvento");
    const fechaEditar = document.getElementById("editarFechaEvento");

    if (modalEditarElemento && fechaEditar) {

        modalEditarElemento.addEventListener("shown.bs.modal", function () {

            if (fechaEditar.value && fechaEditar.value < hoyTexto) {

                fechaEditar.dataset.vencido = "1";
                fechaEditar.readOnly = true;
                fechaEditar.title = "Este evento ya pasó y su fecha no puede modificarse.";

            } else {

                fechaEditar.dataset.vencido = "0";
                fechaEditar.readOnly = false;
                fechaEditar.min = hoyTexto;
                fechaEditar.removeAttribute("title");
            }
        });
    }
});