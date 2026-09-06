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
 
            // CORREGIDO: la clave real de este tipo de reporte
            // (definida en reportes_admin, views.py) es
            // "comparativo", no "reporte_corporativo".
            const esReporteComparativo =
                tipo === "comparativo";
 
            const permiteComparacion = [
                "incidencias",
                "mantenimientos",
                "actividad_apicultores",
                "actividad_mensual",
                "comparativo"
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
           LIMPIAR VALIDACIÓN PERSONALIZADA AL EDITAR
           ------------------------------------------------------
           setCustomValidity() deja el campo marcado como
           inválido para el navegador de forma PERSISTENTE.
           Si no se limpia también en el evento "input", el
           navegador bloquea el próximo submit en silencio
           aunque el usuario haya corregido el valor (incluso
           si vuelve a poner el mismo valor "válido" de antes,
           que es justo el bug reportado).
        ====================================================== */
 
        if (fechaDesdeReporte) {
 
            fechaDesdeReporte.addEventListener(
                "input",
                function () {
                    fechaDesdeReporte.setCustomValidity("");
                }
            );
        }
 
        if (fechaHastaReporte) {
 
            fechaHastaReporte.addEventListener(
                "input",
                function () {
                    fechaHastaReporte.setCustomValidity("");
                }
            );
        }
 
        if (mesActividadReporte) {
 
            mesActividadReporte.addEventListener(
                "input",
                function () {
                    mesActividadReporte.setCustomValidity("");
                }
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
 
                configurarReporte(tipo);
            }
        );

        /* =====================================================
           ACTUALIZACIÓN AUTOMÁTICA
           DEL HISTORIAL DE REPORTES
        ====================================================== */

        function iniciarActualizacionHistorialReportes() {


            const historialActual =
                document.getElementById(
                    "historialReportes"
                );


            if (!historialActual) {

                return;

            }


            const totalInicial = Number(
                historialActual.dataset.totalReportes
                ||
                0
            );


            let intentos = 0;

            const MAXIMO_INTENTOS = 60;

            let actualizacionTerminada = false;


            /* =================================================
               CONSULTAR SI YA SE GUARDÓ EL NUEVO REPORTE
            ================================================== */

            async function comprobarHistorial() {


                if (actualizacionTerminada) {

                    return;

                }


                intentos++;


                try {


                    /* =========================================
                       SIEMPRE CONSULTAR LA PÁGINA 1
                       PORQUE AHÍ APARECE EL NUEVO REPORTE
                    ========================================== */

                    const url = new URL(
                        window.location.href
                    );


                    url.searchParams.set(
                        "page_reportes",
                        "1"
                    );


                    url.hash = "";


                    /* =========================================
                       OBTENER HTML ACTUALIZADO DESDE DJANGO
                    ========================================== */

                    const respuesta = await fetch(
                        url.toString(),
                        {
                            method: "GET",

                            cache: "no-store",

                            credentials: "same-origin",

                            headers: {
                                "X-Requested-With":
                                    "XMLHttpRequest"
                            }
                        }
                    );


                    if (!respuesta.ok) {

                        throw new Error(
                            "No fue posible consultar el historial."
                        );

                    }


                    const html =
                        await respuesta.text();


                    const documento =
                        new DOMParser()
                        .parseFromString(
                            html,
                            "text/html"
                        );


                    const historialNuevo =
                        documento.getElementById(
                            "historialReportes"
                        );


                    if (!historialNuevo) {

                        throw new Error(
                            "No se encontró el historial actualizado."
                        );

                    }


                    const totalNuevo = Number(
                        historialNuevo.dataset.totalReportes
                        ||
                        0
                    );


                    /* =========================================
                       ¿YA APARECIÓ EL NUEVO REPORTE?
                    ========================================== */

                    if (
                        totalNuevo
                        >
                        totalInicial
                    ) {


                        actualizacionTerminada =
                            true;


                        /* =====================================
                           REEMPLAZAR SOLAMENTE EL HISTORIAL
                        ====================================== */

                        const historialEnPantalla =
                            document.getElementById(
                                "historialReportes"
                            );


                        if (historialEnPantalla) {

                            historialEnPantalla.replaceWith(
                                historialNuevo
                            );

                        }


                        /* =====================================
                           ACTUALIZAR URL A PÁGINA 1
                           SIN RECARGAR
                        ====================================== */

                        const urlActual = new URL(
                            window.location.href
                        );


                        urlActual.searchParams.set(
                            "page_reportes",
                            "1"
                        );


                        urlActual.hash =
                            "historialReportes";


                        window.history.replaceState(
                            {},
                            "",
                            urlActual.toString()
                        );


                        return;

                    }


                }
                catch (error) {


                    console.error(
                        "Error actualizando historial de reportes:",
                        error
                    );


                }


                /* =============================================
                   SEGUIR COMPROBANDO
                   DURANTE MÁXIMO 60 SEGUNDOS
                ============================================== */

                if (
                    intentos
                    <
                    MAXIMO_INTENTOS
                ) {

                    window.setTimeout(
                        comprobarHistorial,
                        1000
                    );

                }


            }


            /* =================================================
               PRIMERA CONSULTA
            ================================================== */

            window.setTimeout(
                comprobarHistorial,
                1000
            );


        }
 
 
        /* =====================================================
           VALIDAR FORMULARIO
        ====================================================== */
 
        formulario.addEventListener(
            "submit",
            function (evento) {
 
                const tipo =
                    tipoReporte.value.trim();
 
                if (!tipo) {
 
                    evento.preventDefault();
 
                    alert(
                        "No se pudo identificar el tipo "
                        + "de reporte seleccionado."
                    );
 
                    return;
                }
 
                /* -------------------------------------------
                   1. MES OBLIGATORIO (solo actividad mensual)
                ------------------------------------------- */
 
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
 
                /* -------------------------------------------
                   2. MES NO PUEDE SER FUTURO
                ------------------------------------------- */
 
                if (
                    tipo === "actividad_mensual"
                    && mesActividadReporte
                    && mesActividadReporte.value
                ) {
 
                    const mesActual =
                        new Date().toISOString().slice(0, 7);
                    // Formato "YYYY-MM", igual al de un <input type="month">
 
                    if (mesActividadReporte.value > mesActual) {
 
                        evento.preventDefault();
 
                        mesActividadReporte.setCustomValidity(
                            "No puedes generar un reporte de un mes futuro."
                        );
 
                        mesActividadReporte.reportValidity();
 
                        return;
                    }
                }
 
                /* -------------------------------------------
                   3. FECHA INICIAL NO PUEDE SER MAYOR
                      QUE LA FECHA FINAL
                ------------------------------------------- */
 
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
 
                /* -------------------------------------------
                   4. NINGUNA FECHA PUEDE SER FUTURA
                ------------------------------------------- */
 
                const hoyTexto =
                    new Date().toISOString().slice(0, 10);
                // Formato "YYYY-MM-DD", igual al de un <input type="date">
 
                if (
                    fechaDesdeReporte
                    && fechaDesdeReporte.value > hoyTexto
                ) {
                    evento.preventDefault();
 
                    fechaDesdeReporte.setCustomValidity(
                        "La fecha inicial no puede ser una fecha futura."
                    );
 
                    fechaDesdeReporte.reportValidity();
 
                    return;
                }
 
                if (fechaDesdeReporte) {
                    fechaDesdeReporte.setCustomValidity("");
                }
 
                if (
                    fechaHastaReporte
                    && fechaHastaReporte.value > hoyTexto
                ) {
                    evento.preventDefault();
 
                    fechaHastaReporte.setCustomValidity(
                        "La fecha final no puede ser una fecha futura."
                    );
 
                    fechaHastaReporte.reportValidity();
 
                    return;
                }

                mostrarEstadoGenerando();

                /* =============================================
                   ESPERAR EL NUEVO REGISTRO DEL HISTORIAL
                ============================================== */

                iniciarActualizacionHistorialReportes();
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
            botonGenerar.classList.add("btn-generando-reporte");
 
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
                    botonGenerar.classList.remove("btn-generando-reporte");
 
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
 
                // Limpiar también la validación personalizada:
                // reset() NO borra el customValidity de los
                // campos, así que si el modal se cierra justo
                // después de un error de validación, quedaría
                // el mismo bug al volver a abrirlo.
                if (fechaDesdeReporte) {
                    fechaDesdeReporte.setCustomValidity("");
                }
 
                if (fechaHastaReporte) {
                    fechaHastaReporte.setCustomValidity("");
                }
 
                if (mesActividadReporte) {
                    mesActividadReporte.setCustomValidity("");
                }
 
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
 
/* =========================================================
   ANIMACIÓN DE ENTRADA: TARJETAS DE TIPO DE REPORTE + HISTORIAL
========================================================= */
//
// Bloque independiente: no depende de los elementos del modal,
// así que funciona aunque cambie el resto de la lógica de arriba.
 
document.addEventListener("DOMContentLoaded", function () {

    function aplicarEntradaEscalonadaReportes(selector, retraso, claseAnimacion) {

        const clase = claseAnimacion || "anim-entrada-lista";

        document.querySelectorAll(selector).forEach(function (elemento, indice) {

            elemento.classList.remove(clase);
            void elemento.offsetWidth;

            elemento.style.animationDelay = (indice * retraso) + "ms";
            elemento.classList.add(clase);
        });
    }

    aplicarEntradaEscalonadaReportes(".tarjeta-tipo-reporte", 80, "anim-entrada-tarjeta");
    aplicarEntradaEscalonadaReportes(".tabla-reportes tbody tr", 45);

    // =========================================================
    // ENTRADA ESCALONADA DENTRO DEL MODAL DE REPORTE
    // =========================================================
    //
    // Igual que en Colmenas/Apicultores: al abrir el modal de
    // configuracion, sus bloques (.row > div) entran uno tras
    // otro en vez de aparecer todos de golpe. Reutiliza la clase
    // .anim-entrada-modal ya definida en estilos_admin.css.

    const modalReporte = document.getElementById("modalConfigurarReporte");

    if (modalReporte) {

        modalReporte.addEventListener("shown.bs.modal", function () {

            const cuerpoModal = modalReporte.querySelector(".modal-body");

            if (cuerpoModal) {
                cuerpoModal
                    .querySelectorAll(".row > div")
                    .forEach(function (hijo, indice) {
                        hijo.classList.remove("anim-entrada-modal");
                        void hijo.offsetWidth;
                        hijo.style.animationDelay = (indice * 35) + "ms";
                        hijo.classList.add("anim-entrada-modal");
                    });
            }

        });

    }

    // =========================================================
    // RAFAGA DE POLEN AL GENERAR EL REPORTE
    // =========================================================
    //
    // Mismo recurso visual de Colmenas/Apicultores: al hacer clic
    // en "Generar reporte", salen particulas doradas del boton.
    // Reutiliza la clase .particula-rafaga-polen ya definida en
    // estilos_admin.css.

    const botonGenerarPolen = document.getElementById("btnGenerarReporte");

    if (botonGenerarPolen) {

        botonGenerarPolen.addEventListener("click", function () {

            const rect = botonGenerarPolen.getBoundingClientRect();
            const centroX = rect.left + rect.width / 2;
            const centroY = rect.top + rect.height / 2;
            const CANTIDAD_PARTICULAS = 12;

            for (let i = 0; i < CANTIDAD_PARTICULAS; i++) {

                const angulo = (Math.PI * 2 * i) / CANTIDAD_PARTICULAS;
                const distancia = 40 + Math.random() * 30;
                const dx = Math.cos(angulo) * distancia;
                const dy = Math.sin(angulo) * distancia;

                const particula = document.createElement("span");
                particula.className = "particula-rafaga-polen";
                particula.style.left = centroX + "px";
                particula.style.top = centroY + "px";
                particula.style.setProperty("--dx", dx.toFixed(1) + "px");
                particula.style.setProperty("--dy", dy.toFixed(1) + "px");

                document.body.appendChild(particula);

                window.setTimeout(function () {
                    particula.remove();
                }, 700);

            }

        });

    }

});

