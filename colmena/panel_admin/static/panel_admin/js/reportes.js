document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       ELEMENTOS PRINCIPALES
    ====================================================== */

    const modal = document.getElementById(
        "modalConfigurarReporte"
    );

    const formulario = document.getElementById(
        "formGenerarReporte"
    );

    const tipoReporte = document.getElementById(
        "tipoReporteSeleccionado"
    );

    const tituloModal = document.getElementById(
        "tituloModalReporte"
    );

    const botonGenerar = document.getElementById(
        "btnGenerarReporte"
    );

    const opcionSoloMantenimientos = document.getElementById(
        "opcionSoloMantenimientos"
    );


    /* =====================================================
       CAMPOS EXCLUSIVOS DE INCIDENCIAS
    ====================================================== */

    const campoPrioridad = document.getElementById(
        "campoPrioridadIncidencia"
    );

    const campoEstado = document.getElementById(
        "campoEstadoIncidencia"
    );

    const selectorPrioridad = document.getElementById(
        "prioridadIncidenciaReporte"
    );

    const selectorEstado = document.getElementById(
        "estadoIncidenciaReporte"
    );

    const opcionComparar = document.getElementById(
        "opcionCompararPeriodo"
    );

    const checkboxComparar = opcionComparar
        ? opcionComparar.querySelector(
            'input[name="comparar_periodo"]'
        )
        : null;


    /* =====================================================
       OPCIÓN EXCLUSIVA DE COLMENAS
    ====================================================== */

    const opcionSoloColmenas = document.getElementById(
        "opcionSoloColmenasActivas"
    );

    const checkboxSoloColmenas = opcionSoloColmenas
        ? opcionSoloColmenas.querySelector(
            'input[name="solo_activas"]'
        )
        : null;


    if (
        !modal ||
        !formulario ||
        !tipoReporte ||
        !tituloModal
    ) {
        console.error(
            "No se encontraron los elementos del módulo de reportes."
        );

        return;
    }

    /*======================================================
        CONSTANTES NUEVAS
    ======================================================*/
    const opcionSoloColmenas = document.getElementById(
        "opcionSoloColmenas"
    );

    const opcionSoloIncidencias = document.getElementById(
        "opcionSoloIncidencias"
    );

    const opcionCompararPeriodo = document.getElementById(
        "opcionCompararPeriodo"
    );

    /* =====================================================
       ABRIR MODAL Y CONFIGURAR EL TIPO DE REPORTE
    ====================================================== */

    modal.addEventListener(
        "show.bs.modal",
        function (evento) {

            const boton = evento.relatedTarget;

            if (!boton) {
                return;
            }

            const tipo =
                boton.dataset.tipo || "";

            tipoReporte.value = tipo;

            tituloModal.textContent =
                boton.dataset.nombre
                || "Generar reporte";

            if (opcionSoloColmenas) {

                opcionSoloColmenas.classList.toggle(
                    "d-none",
                    tipo !== "estado_colmenas"
                );

            }

            if (opcionSoloIncidencias) {

                opcionSoloIncidencias.classList.toggle(
                    "d-none",
                    tipo !== "incidencias"
                );

            }

            if (opcionSoloMantenimientos) {

                opcionSoloMantenimientos.classList.toggle(
                    "d-none",
                    tipo !== "mantenimientos"
                );

            }

            if (opcionCompararPeriodo) {

                const permiteComparacion = [
                    "incidencias",
                    "mantenimientos"
                ].includes(tipo);

                opcionCompararPeriodo.classList.toggle(
                    "d-none",
                    !permiteComparacion
                );

            }

        }
    );


    /* =====================================================
       MOSTRAR U OCULTAR CAMPOS
    ====================================================== */

    function configurarCamposPorReporte(tipoSeleccionado) {

        const esIncidencias =
            tipoSeleccionado === "incidencias";

        const esEstadoColmenas =
            tipoSeleccionado === "estado_colmenas";


        /* Prioridad de incidencia */

        if (campoPrioridad) {

            campoPrioridad.classList.toggle(
                "d-none",
                !esIncidencias
            );

        }


        /* Estado de incidencia */

        if (campoEstado) {

            campoEstado.classList.toggle(
                "d-none",
                !esIncidencias
            );

        }


        /* Comparación del periodo */

        if (opcionComparar) {

            opcionComparar.classList.toggle(
                "d-none",
                !esIncidencias
            );

        }


        /* Solo colmenas activas */

        if (opcionSoloColmenas) {

            opcionSoloColmenas.classList.toggle(
                "d-none",
                !esEstadoColmenas
            );

        }


        /* Limpiar campos que no correspondan */

        if (!esIncidencias) {

            if (selectorPrioridad) {
                selectorPrioridad.value = "";
            }

            if (selectorEstado) {
                selectorEstado.value = "";
            }

            if (checkboxComparar) {
                checkboxComparar.checked = false;
            }

        }

        if (!esEstadoColmenas) {

            if (checkboxSoloColmenas) {
                checkboxSoloColmenas.checked = false;
            }

        }

    }


    /* =====================================================
       VALIDAR FECHAS
    ====================================================== */

    formulario.addEventListener(
        "submit",
        function (evento) {

            const fechaDesde = document.getElementById(
                "fechaDesdeReporte"
            );

            const fechaHasta = document.getElementById(
                "fechaHastaReporte"
            );

            if (
                fechaDesde &&
                fechaHasta &&
                fechaDesde.value &&
                fechaHasta.value &&
                fechaDesde.value > fechaHasta.value
            ) {

                evento.preventDefault();

                fechaHasta.setCustomValidity(
                    "La fecha final no puede ser anterior a la fecha inicial."
                );

                fechaHasta.reportValidity();

                return;

            }

            if (fechaHasta) {
                fechaHasta.setCustomValidity("");
            }

            mostrarEstadoGenerando();

        }
    );


    /* =====================================================
       ESTADO DEL BOTÓN
    ====================================================== */

    function mostrarEstadoGenerando() {

        if (!botonGenerar) {
            return;
        }

        botonGenerar.disabled = true;

        botonGenerar.innerHTML = `
            <span
                class="spinner-border spinner-border-sm me-2"
                aria-hidden="true"
            ></span>
            Generando PDF...
        `;

        /*
         * El formulario abre el PDF en otra pestaña,
         * por eso la página original no se recarga.
         */
        window.setTimeout(function () {

            botonGenerar.disabled = false;

            botonGenerar.innerHTML = `
                <i class="bi bi-file-earmark-pdf-fill me-2"></i>
                Generar reporte
            `;

        }, 5000);

    }


    /* =====================================================
       LIMPIAR AL CERRAR
    ====================================================== */

    modal.addEventListener(
        "hidden.bs.modal",
        function () {

            formulario.reset();

            tipoReporte.value = "";

            tituloModal.textContent =
                "Generar reporte";

            if (campoPrioridad) {
                campoPrioridad.classList.add("d-none");
            }

            if (campoEstado) {
                campoEstado.classList.add("d-none");
            }

            if (opcionComparar) {
                opcionComparar.classList.add("d-none");
            }

            /*
             * Se deja visible por defecto porque el primer
             * reporte implementado fue Estado de colmenas.
             */
            if (opcionSoloColmenas) {
                opcionSoloColmenas.classList.remove("d-none");
            }

            if (botonGenerar) {

                botonGenerar.disabled = false;

                botonGenerar.innerHTML = `
                    <i class="bi bi-file-earmark-pdf-fill me-2"></i>
                    Generar reporte
                `;

            }

        }
    );

});