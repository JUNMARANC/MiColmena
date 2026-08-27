"use strict";


/* ============================================================
   CONFIGURACIÓN - MI COLMENA
   ------------------------------------------------------------
   Funciones actuales:
   1. Controlar las pestañas de configuración
   2. Mantener la tarjeta activa
   3. Guardar la pestaña seleccionada en la URL
   4. Recuperar la pestaña después de recargar
============================================================ */


document.addEventListener(
    "DOMContentLoaded",
    function () {

        inicializarPestanasConfiguracion();

        inicializarConfiguracionGeneral();

        inicializarConfiguracionNotificaciones();
        
        inicializarConfiguracionSeguridad();
    }
);


/* ============================================================
   PESTAÑAS PRINCIPALES
============================================================ */

function inicializarPestanasConfiguracion() {

    const botones = document.querySelectorAll(
        ".configuracion-opcion[data-bs-toggle='pill']"
    );


    if (!botones.length) {
        return;
    }


    /* --------------------------------------------------------
       Revisar pestaña indicada en la URL
    -------------------------------------------------------- */

    const parametros =
        new URLSearchParams(
            window.location.search
        );


    const tabSolicitada =
        parametros.get("tab");


    const mapaTabs = {

        general:
            "config-general-tab",

        notificaciones:
            "config-notificaciones-tab",

        seguridad:
            "config-seguridad-tab"

    };


    /* --------------------------------------------------------
       Abrir pestaña indicada
    -------------------------------------------------------- */

    if (
        tabSolicitada &&
        mapaTabs[tabSolicitada]
    ) {

        const botonInicial =
            document.getElementById(
                mapaTabs[tabSolicitada]
            );


        if (botonInicial) {

            const tabBootstrap =
                bootstrap.Tab.getOrCreateInstance(
                    botonInicial
                );


            tabBootstrap.show();

        }

    }


    /* --------------------------------------------------------
       Eventos de cada tarjeta
    -------------------------------------------------------- */

    botones.forEach(
        function (boton) {

            boton.addEventListener(
                "shown.bs.tab",
                function () {

                    actualizarTarjetaActiva(
                        boton,
                        botones
                    );


                    actualizarURLConfiguracion(
                        boton.id
                    );

                }
            );

        }
    );

}


/* ============================================================
   ACTUALIZAR TARJETA ACTIVA
============================================================ */

function actualizarTarjetaActiva(
    botonActivo,
    botones
) {

    botones.forEach(
        function (boton) {

            boton.classList.remove(
                "active"
            );


            boton.setAttribute(
                "aria-selected",
                "false"
            );

        }
    );


    botonActivo.classList.add(
        "active"
    );


    botonActivo.setAttribute(
        "aria-selected",
        "true"
    );

}


/* ============================================================
   ACTUALIZAR URL
============================================================ */

function actualizarURLConfiguracion(
    idBoton
) {

    const mapaURL = {

        "config-general-tab":
            "general",

        "config-notificaciones-tab":
            "notificaciones",

        "config-seguridad-tab":
            "seguridad"

    };


    const nombreTab =
        mapaURL[idBoton];


    if (!nombreTab) {
        return;
    }


    const url =
        new URL(
            window.location.href
        );


    url.searchParams.set(
        "tab",
        nombreTab
    );


    window.history.replaceState(
        {},
        "",
        url
    );

}


/* ============================================================
   CONFIGURACIÓN GENERAL
============================================================ */

function inicializarConfiguracionGeneral() {

    const formulario =
        document.getElementById(
            "formConfiguracionGeneral"
        );


    const botonGuardar =
        document.getElementById(
            "btnGuardarConfiguracionGeneral"
        );


    const descripcion =
        document.getElementById(
            "descripcionSistema"
        );


    const contador =
        document.getElementById(
            "contadorDescripcionConfiguracion"
        );


    const telefono =
        document.getElementById(
            "telefonoContacto"
        );


    /* ========================================================
       CONTADOR DE DESCRIPCIÓN
    ======================================================== */

    if (
        descripcion &&
        contador
    ) {

        actualizarContadorDescripcion(
            descripcion,
            contador
        );


        descripcion.addEventListener(
            "input",
            function () {

                actualizarContadorDescripcion(
                    descripcion,
                    contador
                );

            }
        );

    }


    /* ========================================================
       TELÉFONO SOLO NÚMEROS
    ======================================================== */

    if (telefono) {

        telefono.addEventListener(
            "input",
            function () {

                telefono.value =
                    telefono.value.replace(
                        /\D/g,
                        ""
                    );

            }
        );

    }


    /* ========================================================
       VALIDACIÓN DEL FORMULARIO
    ======================================================== */

    if (
        !formulario ||
        !botonGuardar
    ) {

        return;

    }


    formulario.addEventListener(
        "submit",
        function (evento) {

            if (
                !formulario.checkValidity()
            ) {

                evento.preventDefault();

                evento.stopPropagation();


                formulario.classList.add(
                    "was-validated"
                );


                formulario.reportValidity();


                return;

            }


            botonGuardar.disabled =
                true;


            botonGuardar.innerHTML = `
                <span
                    class="
                        spinner-border
                        spinner-border-sm
                        me-2
                    "
                    aria-hidden="true"
                ></span>

                Guardando...
            `;

        }
    );

}


/* ============================================================
   CONTADOR DE CARACTERES
============================================================ */

function actualizarContadorDescripcion(
    textarea,
    contador
) {

    const cantidad =
        textarea.value.length;


    const maximo =
        textarea.maxLength || 500;


    contador.textContent =
        `${cantidad} / ${maximo}`;

}


/* ============================================================
   CONFIGURACIÓN DE NOTIFICACIONES
============================================================ */

function inicializarConfiguracionNotificaciones() {

    const formulario =
        document.getElementById(
            "formConfiguracionNotificaciones"
        );


    const switchPrincipal =
        document.getElementById(
            "activarNotificaciones"
        );


    const lista =
        document.getElementById(
            "listaTiposNotificaciones"
        );


    const switches =
        document.querySelectorAll(
            ".notificacion-switch-secundario"
        );


    const botonGuardar =
        document.getElementById(
            "btnGuardarNotificaciones"
        );


    if (
        !formulario ||
        !switchPrincipal
    ) {
        return;
    }


    /* ========================================================
       ESTADO INICIAL
    ======================================================== */

    actualizarEstadoNotificaciones(
        switchPrincipal,
        lista,
        switches
    );


    /* ========================================================
       SWITCH PRINCIPAL
    ======================================================== */

    switchPrincipal.addEventListener(
        "change",
        function () {

            actualizarEstadoNotificaciones(
                switchPrincipal,
                lista,
                switches
            );

        }
    );


    /* ========================================================
       GUARDAR
    ======================================================== */

    formulario.addEventListener(
        "submit",
        function () {

            if (!botonGuardar) {
                return;
            }


            botonGuardar.disabled =
                true;


            botonGuardar.innerHTML = `
                <span
                    class="
                        spinner-border
                        spinner-border-sm
                        me-2
                    "
                    aria-hidden="true"
                ></span>

                Guardando...
            `;

        }
    );

}


/* ============================================================
   ACTIVAR / DESACTIVAR TIPOS
============================================================ */

function actualizarEstadoNotificaciones(
    principal,
    lista,
    switches
) {

    const activo =
        principal.checked;


    switches.forEach(
        function (switchNotificacion) {

            switchNotificacion.disabled =
                !activo;

        }
    );


    if (lista) {

        lista.classList.toggle(
            "notificaciones-deshabilitadas",
            !activo
        );

    }

}


function inicializarConfiguracionSeguridad() {

    const switchInactividad = (
        document.getElementById(
            "cerrarSesionInactividad"
        )
    );


    const contenedorTiempo = (
        document.getElementById(
            "contenedorTiempoInactividad"
        )
    );


    const inputMinutos = (
        document.getElementById(
            "minutosInactividad"
        )
    );


    if (
        !switchInactividad
        ||
        !contenedorTiempo
        ||
        !inputMinutos
    ) {

        return;

    }


    function actualizarEstado() {

        const activo = (
            switchInactividad.checked
        );


        inputMinutos.disabled = (
            !activo
        );


        contenedorTiempo.classList.toggle(
            "inactivo",
            !activo
        );

    }


    switchInactividad.addEventListener(
        "change",
        actualizarEstado
    );


    actualizarEstado();

}




// ============================================================
// VALIDACIÓN DE CAMPOS NUMÉRICOS DE SEGURIDAD
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    const inputInactividad = document.getElementById(
        "minutosInactividad"
    );

    const inputIntentos = document.getElementById(
        "intentosMaximosLogin"
    );

    const inputMinutosBloqueo = document.getElementById(
        "minutosBloqueoLogin"
    );


    // ========================================================
    // SOLO NÚMEROS ENTEROS
    // ========================================================

    function permitirSoloNumeros(input) {

        if (!input) {
            return;
        }


        input.addEventListener("input", function () {

            this.value = this.value.replace(
                /[^0-9]/g,
                ""
            );

        });


        // También limpia texto pegado
        input.addEventListener("paste", function () {

            setTimeout(() => {

                this.value = this.value.replace(
                    /[^0-9]/g,
                    ""
                );

            }, 0);

        });

    }


    // ========================================================
    // VALIDAR RANGO
    // ========================================================

    function validarRango(
        input,
        minimo,
        maximo,
        valorPorDefecto
    ) {

        if (!input) {
            return;
        }


        input.addEventListener("blur", function () {

            let valor = parseInt(
                this.value,
                10
            );


            if (isNaN(valor)) {

                valor = valorPorDefecto;

            }


            if (valor < minimo) {

                valor = minimo;

            }


            if (valor > maximo) {

                valor = maximo;

            }


            this.value = valor;

        });

    }


    // ========================================================
    // SOLO NÚMEROS
    // ========================================================

    permitirSoloNumeros(
        inputInactividad
    );

    permitirSoloNumeros(
        inputIntentos
    );

    permitirSoloNumeros(
        inputMinutosBloqueo
    );


    // ========================================================
    // CIERRE POR INACTIVIDAD
    // 5 - 480 MINUTOS
    // ========================================================

    validarRango(
        inputInactividad,
        5,
        480,
        30
    );


    // ========================================================
    // INTENTOS DE LOGIN
    // 3 - 10 INTENTOS
    // ========================================================

    validarRango(
        inputIntentos,
        3,
        10,
        5
    );


    // ========================================================
    // DURACIÓN DEL BLOQUEO
    // 5 - 1440 MINUTOS
    // ========================================================

    validarRango(
        inputMinutosBloqueo,
        5,
        1440,
        15
    );


    // ============================================================
    // CONFIGURACIÓN GLOBAL 2FA
    // ============================================================

    const permitir2FA = (
        document.getElementById(
            "permitir2FA"
        )
    );


    const obligarAdmins = (
        document.getElementById(
            "obligar2FAAdministradores"
        )
    );


    const obligarTodos = (
        document.getElementById(
            "obligar2FATodos"
        )
    );


    function actualizarControles2FA() {

        if (!permitir2FA) {
            return;
        }


        const habilitado = (
            permitir2FA.checked
        );


        if (obligarAdmins) {

            obligarAdmins.disabled =
                !habilitado;


            if (!habilitado) {

                obligarAdmins.checked =
                    false;

            }

        }


        if (obligarTodos) {

            obligarTodos.disabled =
                !habilitado;


            if (!habilitado) {

                obligarTodos.checked =
                    false;

            }

        }

    }


    if (permitir2FA) {

        permitir2FA.addEventListener(
            "change",
            actualizarControles2FA
        );


        actualizarControles2FA();

    }

});