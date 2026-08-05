document.addEventListener(
    "DOMContentLoaded",
    function () {

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

        if (
            !modal
            || !formulario
            || !tipoReporte
            || !tituloModal
        ) {
            console.error(
                "No se encontraron los elementos principales "
                + "del módulo de reportes."
            );

            return;
        }


        /* =====================================================
           FECHAS Y MES
        ====================================================== */

        const campoFechaDesdeReporte =
            document.getElementById(
                "campoFechaDesdeReporte"
            );

        const campoFechaHastaReporte =
            document.getElementById(
                "campoFechaHastaReporte"
            );

        const fechaDesdeReporte =
            document.getElementById(
                "fechaDesdeReporte"
            );

        const fechaHastaReporte =
            document.getElementById(
                "fechaHastaReporte"
            );

        const campoMesActividad =
            document.getElementById(
                "campoMesActividad"
            );

        const mesActividadReporte =
            document.getElementById(
                "mesActividadReporte"
            );


        /* =====================================================
           CAMPOS DE INCIDENCIAS
        ====================================================== */

        const campoPrioridad =
            document.getElementById(
                "campoPrioridadIncidencia"
            );

        const campoEstado =
            document.getElementById(
                "campoEstadoIncidencia"
            );

        const selectorPrioridad =
            document.getElementById(
                "prioridadIncidenciaReporte"
            );

        const selectorEstado =
            document.getElementById(
                "estadoIncidenciaReporte"
            );


        /* =====================================================
           FILTRO DE APICULTOR
        ====================================================== */

        const contenedorFiltroApicultor =
            document.getElementById(
                "contenedorFiltroApicultor"
            );

        const filtroApicultor =
            document.getElementById(
                "filtroApicultor"
            );


        /* =====================================================
           OPCIONES ESPECIALES
        ====================================================== */

        const opcionSoloColmenas =
            document.getElementById(
                "opcionSoloColmenas"
            );

        const opcionSoloIncidencias =
            document.getElementById(
                "opcionSoloIncidencias"
            );

        const opcionSoloMantenimientos =
            document.getElementById(
                "opcionSoloMantenimientos"
            );

        const opcionCompararPeriodo =
            document.getElementById(
                "opcionCompararPeriodo"
            );


        /* =====================================================
           CHECKBOXES
        ====================================================== */

        const checkboxSoloColmenas =
            opcionSoloColmenas
                ? opcionSoloColmenas.querySelector(
                    'input[name="solo_activas"]'
                )
                : null;

        const checkboxSoloIncidencias =
            opcionSoloIncidencias
                ? opcionSoloIncidencias.querySelector(
                    'input[name="solo_abiertas"]'
                )
                : null;

        const checkboxSoloMantenimientos =
            opcionSoloMantenimientos
                ? opcionSoloMantenimientos.querySelector(
                    'input[name="solo_pendientes"]'
                )
                : null;

        const checkboxCompararPeriodo =
            opcionCompararPeriodo
                ? opcionCompararPeriodo.querySelector(
                    'input[name="comparar_periodo_anterior"]'
                )
                : null;


        /* =====================================================
           FUNCIONES AUXILIARES
        ====================================================== */

        function mostrarElemento(
            elemento,
            mostrar
        ) {
            if (!elemento) {
                return;
            }

            elemento.classList.toggle(
                "d-none",
                !mostrar
            );
        }


        function limpiarCheckbox(
            checkbox,
            conservar
        ) {
            if (
                checkbox
                && !conservar
            ) {
                checkbox.checked = false;
            }
        }


        function configurarReporte(tipo) {

            const esEstadoColmenas =
                tipo === "estado_colmenas";

            const esIncidencias =
                tipo === "incidencias";

            const esMantenimientos =
                tipo === "mantenimientos";

            const esActividadApicultores =
                tipo === "actividad_apicultores";

            const esActividadMensual =
                tipo === "actividad_mensual";

            const esReporteCorporativo =
                tipo === "reporte_corporativo";

            const permiteComparacion = [
                "incidencias",
                "mantenimientos",
                "actividad_apicultores",
                "actividad_mensual",
                "reporte_corporativo"
            ].includes(tipo);


            /* =============================================
               FECHAS Y MES
            ============================================== */

            mostrarElemento(
                campoFechaDesdeReporte,
                !esActividadMensual
            );

            mostrarElemento(
                campoFechaHastaReporte,
                !esActividadMensual
            );

            mostrarElemento(
                campoMesActividad,
                esActividadMensual
            );

            if (fechaDesdeReporte) {

                fechaDesdeReporte.disabled =
                    esActividadMensual;

                if (esActividadMensual) {
                    fechaDesdeReporte.value = "";
                }

            }

            if (fechaHastaReporte) {

                fechaHastaReporte.disabled =
                    esActividadMensual;

                if (esActividadMensual) {
                    fechaHastaReporte.value = "";
                }

            }

            if (mesActividadReporte) {

                mesActividadReporte.disabled =
                    !esActividadMensual;

                mesActividadReporte.required =
                    esActividadMensual;

                if (!esActividadMensual) {
                    mesActividadReporte.value = "";
                }

            }


            /* =============================================
               CAMPOS DE INCIDENCIAS
            ============================================== */

            mostrarElemento(
                campoPrioridad,
                esIncidencias
            );

            mostrarElemento(
                campoEstado,
                esIncidencias
            );

            if (!esIncidencias) {

                if (selectorPrioridad) {
                    selectorPrioridad.value = "";
                }

                if (selectorEstado) {
                    selectorEstado.value = "";
                }

            }


            /* =============================================
               FILTRO DE APICULTOR
            ============================================== */

            mostrarElemento(
                contenedorFiltroApicultor,
                esActividadApicultores
            );

            if (
                !esActividadApicultores
                && filtroApicultor
            ) {
                filtroApicultor.value = "";
            }


            /* =============================================
               OPCIONES ESPECIALES
            ============================================== */

            mostrarElemento(
                opcionSoloColmenas,
                esEstadoColmenas
            );

            mostrarElemento(
                opcionSoloIncidencias,
                esIncidencias
            );

            mostrarElemento(
                opcionSoloMantenimientos,
                esMantenimientos
            );

            mostrarElemento(
                opcionCompararPeriodo,
                permiteComparacion
            );

            limpiarCheckbox(
                checkboxSoloColmenas,
                esEstadoColmenas
            );

            limpiarCheckbox(
                checkboxSoloIncidencias,
                esIncidencias
            );

            limpiarCheckbox(
                checkboxSoloMantenimientos,
                esMantenimientos
            );

            limpiarCheckbox(
                checkboxCompararPeriodo,
                permiteComparacion
            );
        }


        /* =====================================================
           ABRIR MODAL
        ====================================================== */

        modal.addEventListener(
            "show.bs.modal",
            function (evento) {

                const boton = evento.relatedTarget;

                if (!boton) {
                    console.error(
                        "No se encontró el botón que abrió el modal."
                    );

                    return;
                }

                const tipo =
                    boton.dataset.tipo || "";

                const nombre =
                    boton.dataset.nombre
                    || "Generar reporte";

                tipoReporte.value = tipo;

                tituloModal.textContent =
                    nombre;

                console.log(
                    "Reporte seleccionado:",
                    tipo
                );

                configurarReporte(tipo);
            }
        );


        /* =====================================================
           VALIDAR FORMULARIO
        ====================================================== */

        formulario.addEventListener(
            "submit",
            function (evento) {

                const tipo =
                    tipoReporte.value.trim();

                console.log(
                    "Tipo enviado:",
                    tipo
                );

                console.log(
                    "Mes enviado:",
                    mesActividadReporte
                        ? mesActividadReporte.value
                        : ""
                );

                if (!tipo) {

                    evento.preventDefault();

                    alert(
                        "No se pudo identificar el tipo "
                        + "de reporte seleccionado."
                    );

                    return;
                }

                if (
                    tipo === "actividad_mensual"
                    && mesActividadReporte
                    && !mesActividadReporte.value
                ) {
                    evento.preventDefault();

                    mesActividadReporte.setCustomValidity(
                        "Debes seleccionar el mes del reporte."
                    );

                    mesActividadReporte.reportValidity();

                    return;
                }

                if (mesActividadReporte) {
                    mesActividadReporte.setCustomValidity("");
                }

                if (
                    tipo !== "actividad_mensual"
                    && fechaDesdeReporte
                    && fechaHastaReporte
                    && fechaDesdeReporte.value
                    && fechaHastaReporte.value
                    && fechaDesdeReporte.value
                        > fechaHastaReporte.value
                ) {
                    evento.preventDefault();

                    fechaHastaReporte.setCustomValidity(
                        "La fecha final no puede ser "
                        + "anterior a la fecha inicial."
                    );

                    fechaHastaReporte.reportValidity();

                    return;
                }

                if (fechaHastaReporte) {
                    fechaHastaReporte.setCustomValidity("");
                }

                mostrarEstadoGenerando();
            }
        );


        /* =====================================================
           BOTÓN GENERAR
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

            window.setTimeout(
                function () {

                    botonGenerar.disabled = false;

                    botonGenerar.innerHTML = `
                        <i class="bi bi-file-earmark-pdf-fill me-2"></i>
                        Generar reporte
                    `;

                },
                5000
            );
        }


        /* =====================================================
           LIMPIAR MODAL
        ====================================================== */

        modal.addEventListener(
            "hidden.bs.modal",
            function () {

                formulario.reset();

                tipoReporte.value = "";

                tituloModal.textContent =
                    "Generar reporte";

                configurarReporte("");

                if (botonGenerar) {

                    botonGenerar.disabled = false;

                    botonGenerar.innerHTML = `
                        <i class="bi bi-file-earmark-pdf-fill me-2"></i>
                        Generar reporte
                    `;

                }

            }
        );


        /* Estado inicial */

        configurarReporte("");
    }
);