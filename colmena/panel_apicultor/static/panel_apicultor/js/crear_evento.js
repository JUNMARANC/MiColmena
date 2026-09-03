/* ==========================================================
   CREAR EVENTO - PANEL APICULTOR
   MI COLMENA
========================================================== */

document.addEventListener("DOMContentLoaded", function () {


    /* ======================================================
       1. FORMULARIO
    ====================================================== */

    const formulario = document.getElementById(
        "formCrearEvento"
    );

    if (!formulario) {
        return;
    }


    /* ======================================================
       2. ELEMENTOS - TIPO DE EVENTO
    ====================================================== */

    const radiosTipoEvento = formulario.querySelectorAll(
        ".tipo-evento-radio"
    );

    const opcionesTipoEvento = formulario.querySelectorAll(
        ".tipo-evento-opcion"
    );

    const selectorTipoEvento = formulario.querySelector(
        ".tipo-evento-selector"
    );


    /* ======================================================
       3. ELEMENTOS - UBICACIÓN
    ====================================================== */

    const selectApiario = document.getElementById(
        "apiarioEvento"
    );

    const selectColmena = document.getElementById(
        "colmenaEvento"
    );


    /* ======================================================
       4. ELEMENTOS - INFORMACIÓN
    ====================================================== */

    const inputTitulo = document.getElementById(
        "tituloEvento"
    );

    const inputFecha = document.getElementById(
        "fechaEvento"
    );

    const inputHora = document.getElementById(
        "horaEvento"
    );

    const textareaDescripcion = document.getElementById(
        "descripcionEvento"
    );


    /* ======================================================
       5. CONTADORES
    ====================================================== */

    const contadorTitulo = document.getElementById(
        "contadorTitulo"
    );

    const contadorDescripcion = document.getElementById(
        "contadorDescripcion"
    );


    /* ======================================================
       6. BOTÓN GUARDAR
    ====================================================== */

    const btnGuardar = document.getElementById(
        "btnGuardarEvento"
    );


    /* ======================================================
       7. CONFIGURACIÓN
    ====================================================== */

    const TIPOS_EVENTO_VALIDOS = [
        "mantenimiento",
        "revision",
        "incidencia",
        "evento"
    ];

    const MAX_TITULO = 150;

    const MIN_TITULO = 3;

    const MAX_DESCRIPCION = 500;


    /* ======================================================
       8. UTILIDADES
    ====================================================== */

    function obtenerCampo(elemento) {

        if (!elemento) {
            return null;
        }

        return elemento.closest(
            ".campo-evento"
        );

    }


    function obtenerTipoEvento() {

        const seleccionado = formulario.querySelector(
            'input[name="tipo_evento"]:checked'
        );

        return seleccionado
            ? seleccionado.value
            : "";

    }


    function parsearFechaLocal(valor) {

        if (!valor) {
            return null;
        }

        const partes = valor.split("-");

        if (partes.length !== 3) {
            return null;
        }

        const anio = Number(partes[0]);
        const mes = Number(partes[1]) - 1;
        const dia = Number(partes[2]);

        if (
            !Number.isInteger(anio) ||
            !Number.isInteger(mes) ||
            !Number.isInteger(dia)
        ) {
            return null;
        }

        const fecha = new Date(
            anio,
            mes,
            dia
        );

        /*
         * Confirmamos que JavaScript no haya corregido
         * automáticamente una fecha inválida.
         */

        if (
            fecha.getFullYear() !== anio ||
            fecha.getMonth() !== mes ||
            fecha.getDate() !== dia
        ) {
            return null;
        }

        return fecha;

    }


    function obtenerHoy() {

        const ahora = new Date();

        return new Date(
            ahora.getFullYear(),
            ahora.getMonth(),
            ahora.getDate()
        );

    }


    function fechaAISO(fecha) {

        const anio = fecha.getFullYear();

        const mes = String(
            fecha.getMonth() + 1
        ).padStart(2, "0");

        const dia = String(
            fecha.getDate()
        ).padStart(2, "0");

        return `${anio}-${mes}-${dia}`;

    }


    /* ======================================================
       9. MANEJO DE ERRORES DE CAMPOS
    ====================================================== */

    function limpiarError(elemento) {

        const campo = obtenerCampo(
            elemento
        );

        if (!campo) {
            return;
        }

        campo.classList.remove(
            "error"
        );

        const mensaje = campo.querySelector(
            ".campo-error-mensaje"
        );

        if (mensaje) {
            mensaje.remove();
        }

    }


    function mostrarError(
        elemento,
        mensaje
    ) {

        const campo = obtenerCampo(
            elemento
        );

        if (!campo) {
            return;
        }

        limpiarError(
            elemento
        );

        campo.classList.add(
            "error"
        );

        const mensajeError = document.createElement(
            "div"
        );

        mensajeError.className =
            "campo-error-mensaje";

        mensajeError.innerHTML = `
            <i class="bi bi-exclamation-circle-fill"></i>
            <span>${mensaje}</span>
        `;

        campo.appendChild(
            mensajeError
        );

    }


    /* ======================================================
       10. ERROR DEL TIPO DE EVENTO
    ====================================================== */

    function limpiarErrorTipo() {

        if (selectorTipoEvento) {

            selectorTipoEvento.classList.remove(
                "error"
            );

        }

        const mensaje = formulario.querySelector(
            ".tipo-evento-error"
        );

        if (mensaje) {
            mensaje.remove();
        }

    }


    function mostrarErrorTipo(mensaje) {

        if (!selectorTipoEvento) {
            return;
        }

        limpiarErrorTipo();

        selectorTipoEvento.classList.add(
            "error"
        );

        const mensajeError = document.createElement(
            "div"
        );

        mensajeError.className =
            "campo-error-mensaje tipo-evento-error";

        mensajeError.innerHTML = `
            <i class="bi bi-exclamation-circle-fill"></i>
            <span>${mensaje}</span>
        `;

        selectorTipoEvento.insertAdjacentElement(
            "afterend",
            mensajeError
        );

    }


    /* ======================================================
       11. LIMPIAR TODOS LOS ERRORES
    ====================================================== */

    function limpiarTodosLosErrores() {

        formulario.querySelectorAll(
            ".campo-evento.error"
        ).forEach(function (campo) {

            campo.classList.remove(
                "error"
            );

        });


        formulario.querySelectorAll(
            ".campo-error-mensaje"
        ).forEach(function (mensaje) {

            mensaje.remove();

        });


        if (selectorTipoEvento) {

            selectorTipoEvento.classList.remove(
                "error"
            );

        }

    }


    /* ======================================================
       12. TIPO DE EVENTO - ESTADO VISUAL
    ====================================================== */

    function actualizarTipoVisual() {

        opcionesTipoEvento.forEach(
            function (opcion) {

                const radio = opcion.querySelector(
                    ".tipo-evento-radio"
                );

                const seleccionado = Boolean(
                    radio &&
                    radio.checked
                );

                opcion.classList.toggle(
                    "activa",
                    seleccionado
                );

            }
        );

    }


    radiosTipoEvento.forEach(
        function (radio) {

            radio.addEventListener(
                "change",
                function () {

                    actualizarTipoVisual();

                    limpiarErrorTipo();

                }
            );

        }
    );


    /* ======================================================
       13. COLMENAS POR APIARIO
    ====================================================== */

    function filtrarColmenasPorApiario(
        reiniciarSeleccion = true
    ) {

        if (
            !selectApiario ||
            !selectColmena
        ) {
            return;
        }

        const idApiario =
            selectApiario.value;

        const valorSeleccionado =
            selectColmena.value;

        let seleccionSigueDisponible =
            false;


        Array.from(
            selectColmena.options
        ).forEach(
            function (opcion, indice) {


                /*
                 * Primera opción:
                 *
                 * "Evento general del apiario"
                 */

                if (indice === 0) {

                    opcion.hidden = false;

                    opcion.disabled = false;

                    return;

                }


                const idApiarioOpcion =
                    opcion.dataset.apiarioId || "";

                const perteneceAlApiario =
                    idApiario !== "" &&
                    idApiarioOpcion === idApiario;


                opcion.hidden =
                    !perteneceAlApiario;

                opcion.disabled =
                    !perteneceAlApiario;


                if (
                    perteneceAlApiario &&
                    opcion.value === valorSeleccionado
                ) {

                    seleccionSigueDisponible =
                        true;

                }

            }
        );


        /*
         * Si el usuario cambió de apiario,
         * quitamos la colmena anterior.
         */

        if (reiniciarSeleccion) {

            selectColmena.value =
                "";

        } else if (
            valorSeleccionado &&
            !seleccionSigueDisponible
        ) {

            selectColmena.value =
                "";

        }


        limpiarError(
            selectColmena
        );

    }


    /* ======================================================
       14. HABILITAR / DESHABILITAR COLMENAS
    ====================================================== */

    function actualizarEstadoColmena() {

        if (
            !selectApiario ||
            !selectColmena
        ) {
            return;
        }


        if (!selectApiario.value) {

            selectColmena.value =
                "";

            selectColmena.disabled =
                true;

            return;

        }


        selectColmena.disabled =
            false;


        filtrarColmenasPorApiario(
            false
        );

    }


    /* ======================================================
       15. CAMBIO DE APIARIO
    ====================================================== */

    if (selectApiario) {

        selectApiario.addEventListener(
            "change",
            function () {

                limpiarError(
                    selectApiario
                );


                if (!selectApiario.value) {

                    if (selectColmena) {

                        selectColmena.value =
                            "";

                        selectColmena.disabled =
                            true;

                    }

                    return;

                }


                if (selectColmena) {

                    selectColmena.disabled =
                        false;

                    filtrarColmenasPorApiario(
                        true
                    );

                }

            }
        );

    }


    /* ======================================================
       16. CAMBIO DE COLMENA
    ====================================================== */

    if (selectColmena) {

        selectColmena.addEventListener(
            "change",
            function () {

                limpiarError(
                    selectColmena
                );

            }
        );

    }


    /* ======================================================
       17. CONTADORES
    ====================================================== */

    function actualizarContador(
        elemento,
        contador,
        maximo
    ) {

        if (
            !elemento ||
            !contador
        ) {
            return;
        }


        const cantidad =
            elemento.value.length;


        contador.textContent =
            `${cantidad} / ${maximo}`;


        contador.classList.remove(
            "cerca-limite",
            "limite-alcanzado"
        );


        if (
            cantidad >= maximo * 0.8 &&
            cantidad < maximo
        ) {

            contador.classList.add(
                "cerca-limite"
            );

        }


        if (cantidad >= maximo) {

            contador.classList.add(
                "limite-alcanzado"
            );

        }

    }


    /* ======================================================
       18. EVENTO INPUT - TÍTULO
    ====================================================== */

    if (inputTitulo) {

        inputTitulo.addEventListener(
            "input",
            function () {

                actualizarContador(
                    inputTitulo,
                    contadorTitulo,
                    MAX_TITULO
                );


                if (
                    inputTitulo.value.trim().length >=
                    MIN_TITULO
                ) {

                    limpiarError(
                        inputTitulo
                    );

                }

            }
        );

    }


    /* ======================================================
       19. EVENTO INPUT - DESCRIPCIÓN
    ====================================================== */

    if (textareaDescripcion) {

        textareaDescripcion.addEventListener(
            "input",
            function () {

                actualizarContador(
                    textareaDescripcion,
                    contadorDescripcion,
                    MAX_DESCRIPCION
                );


                if (
                    textareaDescripcion.value.length <=
                    MAX_DESCRIPCION
                ) {

                    limpiarError(
                        textareaDescripcion
                    );

                }

            }
        );

    }


    /* ======================================================
       20. EVENTO CHANGE - FECHA
    ====================================================== */

    if (inputFecha) {

        inputFecha.addEventListener(
            "change",
            function () {

                if (inputFecha.value) {

                    limpiarError(
                        inputFecha
                    );

                }


                /*
                 * Si cambia la fecha, volvemos a comprobar
                 * la hora porque puede haberse elegido hoy.
                 */

                if (inputHora && inputHora.value) {

                    validarHora();

                }

            }
        );

    }


    /* ======================================================
       21. EVENTO CHANGE - HORA
    ====================================================== */

    if (inputHora) {

        inputHora.addEventListener(
            "change",
            function () {

                if (inputHora.value) {

                    validarHora();

                }

            }
        );

    }


    /* ======================================================
       22. VALIDACIÓN - TIPO
    ====================================================== */

    function validarTipoEvento() {

        const tipo =
            obtenerTipoEvento();


        if (
            !tipo ||
            !TIPOS_EVENTO_VALIDOS.includes(
                tipo
            )
        ) {

            mostrarErrorTipo(
                "Selecciona un tipo de evento válido."
            );

            return false;

        }


        limpiarErrorTipo();

        return true;

    }


    /* ======================================================
       23. VALIDACIÓN - APIARIO
    ====================================================== */

    function validarApiario() {

        if (
            !selectApiario ||
            !selectApiario.value
        ) {

            mostrarError(
                selectApiario,
                "Selecciona el apiario relacionado con el evento."
            );

            return false;

        }


        limpiarError(
            selectApiario
        );

        return true;

    }


    /* ======================================================
       24. VALIDACIÓN - COLMENA
    ====================================================== */

    function validarColmena() {

        /*
         * No seleccionar colmena es válido.
         * El evento será general del apiario.
         */

        if (
            !selectColmena ||
            !selectColmena.value
        ) {

            return true;

        }


        if (
            !selectApiario ||
            !selectApiario.value
        ) {

            mostrarError(
                selectColmena,
                "Primero selecciona un apiario."
            );

            return false;

        }


        const opcionSeleccionada =
            selectColmena.options[
                selectColmena.selectedIndex
            ];


        if (
            !opcionSeleccionada ||
            opcionSeleccionada.dataset.apiarioId
                !== selectApiario.value
        ) {

            mostrarError(
                selectColmena,
                "La colmena seleccionada no pertenece al apiario indicado."
            );

            return false;

        }


        limpiarError(
            selectColmena
        );

        return true;

    }


    /* ======================================================
       25. VALIDACIÓN - TÍTULO
    ====================================================== */

    function validarTitulo() {

        if (!inputTitulo) {
            return false;
        }


        inputTitulo.value =
            inputTitulo.value.trim();


        if (!inputTitulo.value) {

            mostrarError(
                inputTitulo,
                "Escribe un título para el evento."
            );

            return false;

        }


        if (
            inputTitulo.value.length <
            MIN_TITULO
        ) {

            mostrarError(
                inputTitulo,
                `El título debe tener al menos ${MIN_TITULO} caracteres.`
            );

            return false;

        }


        if (
            inputTitulo.value.length >
            MAX_TITULO
        ) {

            mostrarError(
                inputTitulo,
                `El título no puede superar los ${MAX_TITULO} caracteres.`
            );

            return false;

        }


        limpiarError(
            inputTitulo
        );

        return true;

    }


    /* ======================================================
       26. VALIDACIÓN - FECHA
    ====================================================== */

    function validarFecha() {

        if (
            !inputFecha ||
            !inputFecha.value
        ) {

            mostrarError(
                inputFecha,
                "Selecciona la fecha del evento."
            );

            return false;

        }


        const fechaEvento =
            parsearFechaLocal(
                inputFecha.value
            );


        if (!fechaEvento) {

            mostrarError(
                inputFecha,
                "La fecha seleccionada no es válida."
            );

            return false;

        }


        const hoy =
            obtenerHoy();


        if (fechaEvento < hoy) {

            mostrarError(
                inputFecha,
                "No puedes programar eventos en fechas anteriores."
            );

            return false;

        }


        limpiarError(
            inputFecha
        );

        return true;

    }


    /* ======================================================
       27. VALIDACIÓN - HORA
    ====================================================== */

    function validarHora() {

        if (
            !inputHora ||
            !inputHora.value
        ) {

            mostrarError(
                inputHora,
                "Selecciona la hora del evento."
            );

            return false;

        }


        const patronHora =
            /^([01]\d|2[0-3]):[0-5]\d$/;


        if (
            !patronHora.test(
                inputHora.value
            )
        ) {

            mostrarError(
                inputHora,
                "La hora seleccionada no es válida."
            );

            return false;

        }


        /*
         * Si el evento es HOY,
         * la hora debe ser posterior a la actual.
         */

        if (
            inputFecha &&
            inputFecha.value
        ) {

            const fechaEvento =
                parsearFechaLocal(
                    inputFecha.value
                );

            const hoy =
                obtenerHoy();


            if (
                fechaEvento &&
                fechaEvento.getTime() ===
                hoy.getTime()
            ) {

                const ahora =
                    new Date();

                const [
                    hora,
                    minuto
                ] = inputHora.value
                    .split(":")
                    .map(Number);


                const fechaHoraEvento =
                    new Date(
                        ahora.getFullYear(),
                        ahora.getMonth(),
                        ahora.getDate(),
                        hora,
                        minuto,
                        0,
                        0
                    );


                if (
                    fechaHoraEvento <= ahora
                ) {

                    mostrarError(
                        inputHora,
                        "Si el evento es para hoy, selecciona una hora posterior a la actual."
                    );

                    return false;

                }

            }

        }


        limpiarError(
            inputHora
        );

        return true;

    }


    /* ======================================================
       28. VALIDACIÓN - DESCRIPCIÓN
    ====================================================== */

    function validarDescripcion() {

        if (!textareaDescripcion) {
            return true;
        }


        textareaDescripcion.value =
            textareaDescripcion.value.trim();


        if (
            textareaDescripcion.value.length >
            MAX_DESCRIPCION
        ) {

            mostrarError(
                textareaDescripcion,
                `La descripción no puede superar los ${MAX_DESCRIPCION} caracteres.`
            );

            return false;

        }


        limpiarError(
            textareaDescripcion
        );

        return true;

    }


    /* ======================================================
       29. VALIDACIÓN GENERAL
    ====================================================== */

    function validarFormulario() {

        limpiarTodosLosErrores();


        const validaciones = [

            validarTipoEvento(),

            validarApiario(),

            validarColmena(),

            validarTitulo(),

            validarFecha(),

            validarHora(),

            validarDescripcion()

        ];


        return validaciones.every(
            function (resultado) {

                return resultado === true;

            }
        );

    }


    /* ======================================================
       30. ENFOCAR PRIMER ERROR
    ====================================================== */

    function enfocarPrimerError() {

        const errorTipo = formulario.querySelector(
            ".tipo-evento-error"
        );


        if (errorTipo) {

            selectorTipoEvento?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            return;

        }


        const primerCampoError =
            formulario.querySelector(
                ".campo-evento.error"
            );


        if (!primerCampoError) {
            return;
        }


        primerCampoError.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });


        const elemento =
            primerCampoError.querySelector(
                "input, select, textarea"
            );


        if (elemento) {

            setTimeout(
                function () {

                    elemento.focus();

                },
                300
            );

        }

    }


    /* ======================================================
       31. BOTÓN - ESTADO GUARDANDO
    ====================================================== */

    function activarEstadoGuardando() {

        if (!btnGuardar) {
            return;
        }


        btnGuardar.disabled =
            true;


        btnGuardar.innerHTML = `
            <i class="bi bi-arrow-repeat"></i>

            <span>
                Guardando...
            </span>
        `;

    }


    /* ======================================================
       32. RESTAURAR BOTÓN
    ====================================================== */

    function restaurarBotonGuardar() {

        if (!btnGuardar) {
            return;
        }


        btnGuardar.disabled =
            false;


        btnGuardar.innerHTML = `
            <i class="bi bi-calendar-plus-fill"></i>

            <span>
                Agregar evento
            </span>
        `;

    }


    /* ======================================================
       33. SUBMIT
    ====================================================== */

    formulario.addEventListener(
        "submit",
        function (evento) {

            evento.preventDefault();


            const formularioValido =
                validarFormulario();


            if (!formularioValido) {

                enfocarPrimerError();

                return;

            }


            /*
             * Un elemento disabled no se envía en POST.
             *
             * Si por alguna razón el select de colmena
             * está deshabilitado, lo habilitamos antes
             * del submit.
             */

            if (
                selectColmena &&
                selectColmena.disabled
            ) {

                selectColmena.disabled =
                    false;

                selectColmena.value =
                    "";

            }


            activarEstadoGuardando();


            /*
             * Envío nativo para evitar volver a ejecutar
             * este mismo listener.
             */

            HTMLFormElement.prototype.submit.call(
                formulario
            );

        }
    );


    /* ======================================================
       34. CONFIGURACIÓN DE FECHA MÍNIMA
    ====================================================== */

    if (inputFecha) {

        const hoy =
            obtenerHoy();


        inputFecha.min =
            fechaAISO(
                hoy
            );

    }


    /* ======================================================
       35. RESTAURAR ESTADO AL VOLVER ATRÁS
    ====================================================== */

    window.addEventListener(
        "pageshow",
        function () {

            restaurarBotonGuardar();

            actualizarTipoVisual();

            actualizarEstadoColmena();


            actualizarContador(
                inputTitulo,
                contadorTitulo,
                MAX_TITULO
            );


            actualizarContador(
                textareaDescripcion,
                contadorDescripcion,
                MAX_DESCRIPCION
            );

        }
    );


    /* ======================================================
       36. INICIALIZACIÓN
    ====================================================== */

    function inicializar() {

        actualizarTipoVisual();


        /*
         * Si Django devolvió el formulario por errores,
         * conservamos el apiario y la colmena seleccionados.
         */

        if (
            selectApiario &&
            selectApiario.value
        ) {

            if (selectColmena) {

                selectColmena.disabled =
                    false;


                filtrarColmenasPorApiario(
                    false
                );

            }

        } else if (selectColmena) {

            selectColmena.value =
                "";

            selectColmena.disabled =
                true;

        }


        actualizarContador(
            inputTitulo,
            contadorTitulo,
            MAX_TITULO
        );


        actualizarContador(
            textareaDescripcion,
            contadorDescripcion,
            MAX_DESCRIPCION
        );

    }


    inicializar();


});