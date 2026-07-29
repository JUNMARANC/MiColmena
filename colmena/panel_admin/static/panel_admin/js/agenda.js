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