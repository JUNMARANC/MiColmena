"use strict";

/* ============================================================
   USUARIOS Y ROLES
   ============================================================

   Organización:
   1. Arranque seguro del módulo
   2. Mostrar / ocultar contraseñas
   3. Permisos y pestañas
   4. Selector de tipo de usuario
   5. Registrar administrador
   6. Editar administrador
   7. Activar / desactivar administrador
   8. Eliminar administrador
============================================================ */


/* ============================================================
   1. ARRANQUE SEGURO DEL MÓDULO

   IMPORTANTE:
   Evita registrar los mismos eventos dos veces si este archivo
   JavaScript se incluye accidentalmente más de una vez.
============================================================ */

(function arrancarModuloUsuariosRoles() {

    if (window.__usuariosRolesInicializado) {

        console.warn(
            "[usuarios_roles] El archivo ya había sido inicializado. Se evitó duplicar eventos."
        );

        return;
    }


    window.__usuariosRolesInicializado =
        true;


    /* ========================================================
       EVENTO GLOBAL DE LOS OJOS

       Se usa fase de captura para que este evento se ejecute
       antes que cualquier otro listener conflictivo.
    ======================================================== */

    document.addEventListener(
        "click",
        manejarClickPasswordAdministrador,
        true
    );


    /* ========================================================
       INICIALIZAR RESTO DEL MÓDULO
    ======================================================== */

    const iniciar =
        function () {

            inicializarPermisosRoles();

            inicializarPestanas();

            inicializarSelectorTipoUsuario();

            inicializarModalAdministrador();

            inicializarModalEditarAdministrador();

            inicializarModalEstadoAdministrador();

            inicializarModalEliminarAdministrador();


            console.log(
                "[usuarios_roles] Módulo inicializado correctamente."
            );

        };


    /*
     * Si el DOM todavía está cargando,
     * esperamos DOMContentLoaded.
     *
     * Si ya cargó, inicializamos directamente.
     */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            iniciar,
            {
                once: true
            }
        );

    } else {

        iniciar();

    }

})();


/* ============================================================
   2. MOSTRAR / OCULTAR CONTRASEÑAS

   Este es el ÚNICO evento para los ojos.

   Funciona para:

   Registrar administrador:
   .btn-password-administrador

   Editar administrador:
   .btn-password-editar-administrador
============================================================ */

function manejarClickPasswordAdministrador(
    evento
) {

    const boton =
        evento.target.closest(
            ".btn-password-administrador, .btn-password-editar-administrador"
        );


    /*
     * Si el clic no fue sobre un botón de contraseña,
     * no hacemos nada.
     */

    if (!boton) {

        return;
    }


    /*
     * MUY IMPORTANTE:
     *
     * Detenemos cualquier otro listener que intente
     * cambiar nuevamente el type.
     *
     * Esto evita:
     *
     * password -> text
     * text -> password
     *
     * dentro del mismo clic.
     */

    evento.preventDefault();

    evento.stopPropagation();

    evento.stopImmediatePropagation();


    /* ========================================================
       IDENTIFICAR EL INPUT
    ======================================================== */

    const idInput =
        boton.dataset.passwordTarget;


    let inputPassword =
        null;


    /*
     * PRIMER MÉTODO
     *
     * Usamos:
     *
     * data-password-target="passwordAdministrador"
     */

    if (idInput) {

        inputPassword =
            document.getElementById(
                idInput
            );

    }


    /*
     * SEGUNDO MÉTODO DE RESPALDO
     *
     * Si por algún motivo no encuentra el ID,
     * buscamos el input dentro del mismo input-group.
     */

    if (!inputPassword) {

        const grupo =
            boton.closest(
                ".input-group"
            );


        if (grupo) {

            inputPassword =
                grupo.querySelector(
                    'input[type="password"], input[type="text"]'
                );

        }

    }


    /* ========================================================
       VALIDAR QUE EXISTA
    ======================================================== */

    if (!inputPassword) {

        console.error(
            "[usuarios_roles] No se encontró el input asociado al botón del ojo."
        );

        return;
    }


    const icono =
        boton.querySelector(
            "i"
        );


    /* ========================================================
       SABER SI DEBEMOS MOSTRAR U OCULTAR
    ======================================================== */

    const mostrar =
        inputPassword.type ===
        "password";


    /* ========================================================
       CAMBIAR TYPE
    ======================================================== */

    inputPassword.type =
        mostrar
            ? "text"
            : "password";


    /* ========================================================
       CAMBIAR ICONO
    ======================================================== */

    if (icono) {

        icono.classList.toggle(
            "bi-eye-fill",
            !mostrar
        );


        icono.classList.toggle(
            "bi-eye-slash-fill",
            mostrar
        );

    }


    /* ========================================================
       ACCESIBILIDAD
    ======================================================== */

    boton.setAttribute(
        "aria-label",
        mostrar
            ? "Ocultar contraseña"
            : "Mostrar contraseña"
    );


    boton.setAttribute(
        "title",
        mostrar
            ? "Ocultar contraseña"
            : "Mostrar contraseña"
    );


    /* ========================================================
       MENSAJE PARA PRUEBAS
    ======================================================== */

    console.log(
        "[usuarios_roles] Ojo ejecutado:",
        inputPassword.id,
        "=>",
        inputPassword.type
    );

}


/* ============================================================
   RESTAURAR OJOS
============================================================ */

function restaurarOjosPassword(
    contenedor,
    selectorBotones
) {

    if (!contenedor) {

        return;
    }


    const botones =
        contenedor.querySelectorAll(
            selectorBotones
        );


    botones.forEach(
        function (boton) {

            const idInput =
                boton.dataset.passwordTarget;


            const input =
                idInput
                    ? document.getElementById(
                        idInput
                    )
                    : null;


            const icono =
                boton.querySelector(
                    "i"
                );


            /* ------------------------------------------------
               Ocultar contraseña
            ------------------------------------------------ */

            if (input) {

                input.type =
                    "password";

            }


            /* ------------------------------------------------
               Restaurar ojo
            ------------------------------------------------ */

            if (icono) {

                icono.classList.remove(
                    "bi-eye-slash-fill"
                );


                icono.classList.add(
                    "bi-eye-fill"
                );

            }


            boton.setAttribute(
                "aria-label",
                "Mostrar contraseña"
            );


            boton.setAttribute(
                "title",
                "Mostrar contraseña"
            );

        }
    );

}


/* ============================================================
   3. PERMISOS DE ROLES
============================================================ */

function inicializarPermisosRoles() {

    const formulario =
        document.getElementById(
            "formPermisosRoles"
        );


    const botonGuardar =
        document.getElementById(
            "btnGuardarPermisos"
        );


    if (
        !formulario ||
        !botonGuardar
    ) {

        return;
    }


    const checkboxes =
        formulario.querySelectorAll(
            ".checkbox-permiso"
        );


    /* ========================================================
       ESTADO INICIAL
    ======================================================== */

    checkboxes.forEach(
        function (checkbox) {

            actualizarVisualPermiso(
                checkbox
            );


            checkbox.addEventListener(
                "change",
                function () {

                    actualizarVisualPermiso(
                        checkbox
                    );


                    botonGuardar.disabled =
                        false;

                }
            );

        }
    );


    /* ========================================================
       GUARDAR
    ======================================================== */

    formulario.addEventListener(
        "submit",
        function () {

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
   ACTUALIZAR PERMISO
============================================================ */

function actualizarVisualPermiso(
    checkbox
) {

    const item =
        checkbox.closest(
            ".permiso-item"
        );


    if (!item) {

        return;
    }


    const icono =
        item.querySelector(
            ".check-visual i"
        );


    /* ========================================================
       ACTIVADO
    ======================================================== */

    if (checkbox.checked) {

        item.classList.remove(
            "permiso-desactivado"
        );


        if (icono) {

            icono.classList.remove(
                "bi-x-lg"
            );


            icono.classList.add(
                "bi-check-lg"
            );

        }


        return;
    }


    /* ========================================================
       DESACTIVADO
    ======================================================== */

    item.classList.add(
        "permiso-desactivado"
    );


    if (icono) {

        icono.classList.remove(
            "bi-check-lg"
        );


        icono.classList.add(
            "bi-x-lg"
        );

    }

}


/* ============================================================
   PESTAÑAS USUARIOS / ROLES
============================================================ */

function inicializarPestanas() {

    const tabUsuarios =
        document.getElementById(
            "usuarios-tab"
        );


    const tabRoles =
        document.getElementById(
            "roles-tab"
        );


    if (tabUsuarios) {

        tabUsuarios.addEventListener(
            "shown.bs.tab",
            function () {

                actualizarParametroTab(
                    "usuarios"
                );

            }
        );

    }


    if (tabRoles) {

        tabRoles.addEventListener(
            "shown.bs.tab",
            function () {

                actualizarParametroTab(
                    "roles"
                );

            }
        );

    }

}


/* ============================================================
   ACTUALIZAR TAB EN URL
============================================================ */

function actualizarParametroTab(
    tab
) {

    const url =
        new URL(
            window.location.href
        );


    url.searchParams.set(
        "tab",
        tab
    );


    window.history.replaceState(
        {},
        "",
        url
    );

}


/* ============================================================
   4. SELECTOR DE TIPO DE USUARIO
============================================================ */

function inicializarSelectorTipoUsuario() {

    const modalSeleccionElemento =
        document.getElementById(
            "modalSeleccionarTipoUsuario"
        );


    const modalAdministradorElemento =
        document.getElementById(
            "modalAgregarAdministrador"
        );


    const botonAdministrador =
        document.getElementById(
            "btnSeleccionarAdministrador"
        );


    const botonApicultor =
        document.getElementById(
            "btnSeleccionarApicultor"
        );


    /* ========================================================
       ADMINISTRADOR
    ======================================================== */

    if (
        botonAdministrador &&
        modalSeleccionElemento &&
        modalAdministradorElemento &&
        typeof bootstrap !==
            "undefined"
    ) {

        botonAdministrador.addEventListener(
            "click",
            function () {

                abrirModalAdministradorDesdeSelector(
                    modalSeleccionElemento,
                    modalAdministradorElemento
                );

            }
        );

    }


    /* ========================================================
       APICULTOR
    ======================================================== */

    if (botonApicultor) {

        botonApicultor.addEventListener(
            "click",
            function () {

                redirigirNuevoApicultor(
                    botonApicultor
                );

            }
        );

    }

}


/* ============================================================
   ABRIR MODAL ADMINISTRADOR
============================================================ */

function abrirModalAdministradorDesdeSelector(
    modalSeleccionElemento,
    modalAdministradorElemento
) {

    if (
        typeof bootstrap ===
        "undefined"
    ) {

        return;
    }


    const modalSeleccion =
        bootstrap.Modal
            .getOrCreateInstance(
                modalSeleccionElemento
            );


    const abrirAdministrador =
        function () {

            modalSeleccionElemento
                .removeEventListener(
                    "hidden.bs.modal",
                    abrirAdministrador
                );


            const modalAdministrador =
                bootstrap.Modal
                    .getOrCreateInstance(
                        modalAdministradorElemento
                    );


            modalAdministrador.show();

        };


    modalSeleccionElemento
        .addEventListener(
            "hidden.bs.modal",
            abrirAdministrador
        );


    modalSeleccion.hide();

}


/* ============================================================
   REDIRIGIR A NUEVO APICULTOR
============================================================ */

function redirigirNuevoApicultor(
    boton
) {

    const urlApicultores =
        boton.dataset.url;


    if (!urlApicultores) {

        console.error(
            "No se encontró la URL del módulo de Apicultores."
        );


        return;
    }


    const url =
        new URL(
            urlApicultores,
            window.location.origin
        );


    url.searchParams.set(
        "nuevo",
        "1"
    );


    window.location.href =
        url.toString();

}


/* ============================================================
   5. REGISTRAR ADMINISTRADOR
============================================================ */

function inicializarModalAdministrador() {

    const modal =
        document.getElementById(
            "modalAgregarAdministrador"
        );


    const formulario =
        document.getElementById(
            "formAgregarAdministrador"
        );


    if (
        !modal ||
        !formulario
    ) {

        return;
    }


    /* ========================================================
       CAMPOS
    ======================================================== */

    const campos = {

        primerNombre:
            formulario.querySelector(
                '[name="primer_nombre"]'
            ),

        segundoNombre:
            formulario.querySelector(
                '[name="segundo_nombre"]'
            ),

        primerApellido:
            formulario.querySelector(
                '[name="primer_apellido"]'
            ),

        segundoApellido:
            formulario.querySelector(
                '[name="segundo_apellido"]'
            ),

        celular:
            formulario.querySelector(
                '[name="celular"]'
            ),

        identificacion:
            formulario.querySelector(
                '[name="identificacion"]'
            ) ||
            formulario.querySelector(
                '[name="numero_identificacion"]'
            ),

        correo:
            formulario.querySelector(
                '[name="correo"]'
            ),

        username:
            formulario.querySelector(
                '[name="username"]'
            ),

        password:
            document.getElementById(
                "passwordAdministrador"
            ),

        confirmarPassword:
            document.getElementById(
                "confirmarPasswordAdministrador"
            ),

        mensajePassword:
            document.getElementById(
                "mensajePasswordAdministrador"
            ),

        inputFoto:
            document.getElementById(
                "fotoperfilAdministrador"
            ),

        imagenPreview:
            document.getElementById(
                "imagenPreviewAdministrador"
            ),

        iconoPreview:
            document.getElementById(
                "iconoPreviewAdministrador"
            ),

        botonQuitarFoto:
            document.getElementById(
                "btnQuitarFotoAdministrador"
            ),

        botonGuardar:
            document.getElementById(
                "btnGuardarAdministrador"
            )

    };


    /* ========================================================
       FOTO
    ======================================================== */

    inicializarFotoRegistroAdministrador(
        campos
    );


    /* ========================================================
       VALIDACIONES
    ======================================================== */

    inicializarValidacionesRegistroAdministrador(
        formulario,
        campos
    );


    /* ========================================================
       LIMPIAR AL CERRAR
    ======================================================== */

    modal.addEventListener(
        "hidden.bs.modal",
        function () {

            formulario.reset();


            formulario.classList.remove(
                "was-validated"
            );


            limpiarFotoRegistroAdministrador(
                campos
            );


            limpiarEstadoPasswordsRegistroAdministrador(
                campos
            );


            restaurarOjosPassword(
                modal,
                ".btn-password-administrador"
            );


            restaurarBotonRegistrarAdministrador(
                campos.botonGuardar
            );

        }
    );

}


/* ============================================================
   FOTO - REGISTRAR ADMINISTRADOR
============================================================ */

function inicializarFotoRegistroAdministrador(
    campos
) {

    const {
        inputFoto,
        botonQuitarFoto
    } = campos;


    if (inputFoto) {

        inputFoto.addEventListener(
            "change",
            function () {

                procesarFotoRegistroAdministrador(
                    campos
                );

            }
        );

    }


    if (botonQuitarFoto) {

        botonQuitarFoto.addEventListener(
            "click",
            function () {

                limpiarFotoRegistroAdministrador(
                    campos
                );

            }
        );

    }

}


/* ============================================================
   PROCESAR FOTO
============================================================ */

function procesarFotoRegistroAdministrador(
    campos
) {

    const {
        inputFoto,
        imagenPreview,
        iconoPreview,
        botonQuitarFoto
    } = campos;


    if (!inputFoto) {

        return;
    }


    const archivo =
        inputFoto.files &&
        inputFoto.files[0];


    if (!archivo) {

        limpiarFotoRegistroAdministrador(
            campos
        );


        return;
    }


    const tiposPermitidos = [

        "image/jpeg",

        "image/png",

        "image/webp"

    ];


    const tamanoMaximo =
        5 * 1024 * 1024;


    /* ========================================================
       TIPO
    ======================================================== */

    if (
        !tiposPermitidos.includes(
            archivo.type
        )
    ) {

        alert(
            "Selecciona una imagen en formato JPG, PNG o WEBP."
        );


        limpiarFotoRegistroAdministrador(
            campos
        );


        return;
    }


    /* ========================================================
       TAMAÑO
    ======================================================== */

    if (
        archivo.size >
        tamanoMaximo
    ) {

        alert(
            "La imagen no puede superar los 5 MB."
        );


        limpiarFotoRegistroAdministrador(
            campos
        );


        return;
    }


    const lector =
        new FileReader();


    /* ========================================================
       PREVISUALIZAR
    ======================================================== */

    lector.addEventListener(
        "load",
        function (evento) {

            if (imagenPreview) {

                imagenPreview.src =
                    evento.target.result;


                imagenPreview.classList.remove(
                    "d-none"
                );

            }


            if (iconoPreview) {

                iconoPreview.classList.add(
                    "d-none"
                );

            }


            if (botonQuitarFoto) {

                botonQuitarFoto.classList.remove(
                    "d-none"
                );

            }

        }
    );


    lector.addEventListener(
        "error",
        function () {

            alert(
                "No fue posible cargar la vista previa de la imagen."
            );


            limpiarFotoRegistroAdministrador(
                campos
            );

        }
    );


    lector.readAsDataURL(
        archivo
    );

}


/* ============================================================
   LIMPIAR FOTO
============================================================ */

function limpiarFotoRegistroAdministrador(
    campos
) {

    const {
        inputFoto,
        imagenPreview,
        iconoPreview,
        botonQuitarFoto
    } = campos;


    if (inputFoto) {

        inputFoto.value =
            "";

    }


    if (imagenPreview) {

        imagenPreview.removeAttribute(
            "src"
        );


        imagenPreview.classList.add(
            "d-none"
        );

    }


    if (iconoPreview) {

        iconoPreview.classList.remove(
            "d-none"
        );

    }


    if (botonQuitarFoto) {

        botonQuitarFoto.classList.add(
            "d-none"
        );

    }

}


/* ============================================================
   VALIDACIONES - REGISTRAR ADMINISTRADOR
============================================================ */

function inicializarValidacionesRegistroAdministrador(
    formulario,
    campos
) {

    /* ========================================================
       EXPRESIONES REGULARES
    ======================================================== */

    const REGEX_NOMBRE =
        /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñÀ-ÿ]+(?:[ '\-][A-Za-zÁÉÍÓÚÜÑáéíóúüñÀ-ÿ]+)*$/;


    const REGEX_CELULAR =
        /^3[0-9]{9}$/;


    const REGEX_CORREO =
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;


    const REGEX_USERNAME =
        /^[A-Za-z0-9_@.+-]+$/;


    /* ========================================================
       SABER SI HAY VALOR
    ======================================================== */

    function tieneValor(
        campo
    ) {

        if (!campo) {

            return false;
        }


        /*
         * Si es contraseña usamos value directamente.
         */

        if (
            campo.name ===
                "password" ||
            campo.name ===
                "confirmar_password"
        ) {

            return campo.value.length >
                0;

        }


        return campo.value
            .trim()
            .length >
            0;

    }


    /* ========================================================
       ESTADO VERDE / ROJO
    ======================================================== */

    function actualizarEstadoCampo(
        campo,
        valido
    ) {

        if (!campo) {

            return;
        }


        campo.classList.remove(
            "is-valid",
            "is-invalid"
        );


        if (!tieneValor(campo)) {

            return;
        }


        campo.classList.add(
            valido
                ? "is-valid"
                : "is-invalid"
        );

    }


    /* ========================================================
       NOMBRES / APELLIDOS
    ======================================================== */

    function validarNombre(
        campo,
        nombreCampo,
        obligatorio
    ) {

        if (!campo) {

            return true;
        }


        const valor =
            campo.value.trim();


        campo.setCustomValidity(
            ""
        );


        /* ----------------------------------------------------
           VACÍO
        ---------------------------------------------------- */

        if (!valor) {

            if (obligatorio) {

                campo.setCustomValidity(
                    `${nombreCampo} es obligatorio.`
                );


                actualizarEstadoCampo(
                    campo,
                    false
                );


                return false;

            }


            campo.classList.remove(
                "is-valid",
                "is-invalid"
            );


            return true;
        }


        /* ----------------------------------------------------
           MÍNIMO
        ---------------------------------------------------- */

        if (
            valor.length <
            2
        ) {

            campo.setCustomValidity(
                `${nombreCampo} debe tener mínimo 2 caracteres.`
            );


            actualizarEstadoCampo(
                campo,
                false
            );


            return false;
        }


        /* ----------------------------------------------------
           FORMATO
        ---------------------------------------------------- */

        if (
            !REGEX_NOMBRE.test(
                valor
            )
        ) {

            campo.setCustomValidity(
                `${nombreCampo} solo puede contener letras, espacios, guiones y apóstrofes.`
            );


            actualizarEstadoCampo(
                campo,
                false
            );


            return false;
        }


        actualizarEstadoCampo(
            campo,
            true
        );


        return true;
    }


    /* ========================================================
       CONFIGURAR NOMBRE
    ======================================================== */

    function configurarNombre(
        campo,
        nombreCampo,
        obligatorio
    ) {

        if (!campo) {

            return;
        }


        campo.addEventListener(
            "input",
            function () {

                campo.value =
                    campo.value

                        .replace(
                            /[^A-Za-zÁÉÍÓÚÜÑáéíóúüñÀ-ÿ '\-]/g,
                            ""
                        )

                        .replace(
                            /\s{2,}/g,
                            " "
                        );


                validarNombre(
                    campo,
                    nombreCampo,
                    obligatorio
                );

            }
        );


        campo.addEventListener(
            "blur",
            function () {

                campo.value =
                    campo.value

                        .trim()

                        .replace(
                            /\s{2,}/g,
                            " "
                        );


                if (
                    !validarNombre(
                        campo,
                        nombreCampo,
                        obligatorio
                    )
                ) {

                    campo.reportValidity();

                }

            }
        );

    }


    /* ========================================================
       CAMPOS DE NOMBRE
    ======================================================== */

    const configuracionNombres = [

        {
            campo:
                campos.primerNombre,

            texto:
                "El primer nombre",

            obligatorio:
                true
        },

        {
            campo:
                campos.segundoNombre,

            texto:
                "El segundo nombre",

            obligatorio:
                false
        },

        {
            campo:
                campos.primerApellido,

            texto:
                "El primer apellido",

            obligatorio:
                true
        },

        {
            campo:
                campos.segundoApellido,

            texto:
                "El segundo apellido",

            obligatorio:
                false
        }

    ];


    configuracionNombres.forEach(
        function (configuracion) {

            configurarNombre(
                configuracion.campo,
                configuracion.texto,
                configuracion.obligatorio
            );

        }
    );


    /* ========================================================
       CELULAR
    ======================================================== */

    function validarCelular() {

        const celular =
            campos.celular;


        if (!celular) {

            return true;
        }


        const valor =
            celular.value.trim();


        celular.setCustomValidity(
            ""
        );


        /*
         * Actualmente en tu HTML el celular
         * no es obligatorio.
         */

        if (!valor) {

            celular.classList.remove(
                "is-valid",
                "is-invalid"
            );


            return true;
        }


        if (
            !/^[0-9]+$/.test(
                valor
            )
        ) {

            celular.setCustomValidity(
                "El celular solo puede contener números."
            );


            actualizarEstadoCampo(
                celular,
                false
            );


            return false;
        }


        if (
            valor.length !==
            10
        ) {

            celular.setCustomValidity(
                "El celular debe contener exactamente 10 números."
            );


            actualizarEstadoCampo(
                celular,
                false
            );


            return false;
        }


        if (
            !REGEX_CELULAR.test(
                valor
            )
        ) {

            celular.setCustomValidity(
                "Ingresa un número de celular válido. Debe comenzar por 3."
            );


            actualizarEstadoCampo(
                celular,
                false
            );


            return false;
        }


        actualizarEstadoCampo(
            celular,
            true
        );


        return true;
    }


    if (campos.celular) {

        campos.celular.addEventListener(
            "input",
            function () {

                campos.celular.value =
                    campos.celular.value

                        .replace(
                            /[^0-9]/g,
                            ""
                        )

                        .slice(
                            0,
                            10
                        );


                validarCelular();

            }
        );


        campos.celular.addEventListener(
            "blur",
            function () {

                if (!validarCelular()) {

                    campos.celular
                        .reportValidity();

                }

            }
        );

    }


    /* ========================================================
       IDENTIFICACIÓN
       Solo se usa si agregas ese campo al HTML.
    ======================================================== */

    function validarIdentificacion() {

        const identificacion =
            campos.identificacion;


        if (!identificacion) {

            return true;
        }


        const valor =
            identificacion.value.trim();


        identificacion.setCustomValidity(
            ""
        );


        if (!valor) {

            identificacion.classList.remove(
                "is-valid",
                "is-invalid"
            );


            return true;
        }


        if (
            !/^[0-9]+$/.test(
                valor
            )
        ) {

            identificacion.setCustomValidity(
                "El número de identificación solo puede contener números."
            );


            actualizarEstadoCampo(
                identificacion,
                false
            );


            return false;
        }


        if (
            valor.length <
                6 ||
            valor.length >
                15
        ) {

            identificacion.setCustomValidity(
                "El número de identificación debe contener entre 6 y 15 números."
            );


            actualizarEstadoCampo(
                identificacion,
                false
            );


            return false;
        }


        actualizarEstadoCampo(
            identificacion,
            true
        );


        return true;
    }


    if (campos.identificacion) {

        campos.identificacion.addEventListener(
            "input",
            function () {

                campos.identificacion.value =
                    campos.identificacion.value

                        .replace(
                            /[^0-9]/g,
                            ""
                        )

                        .slice(
                            0,
                            15
                        );


                validarIdentificacion();

            }
        );


        campos.identificacion.addEventListener(
            "blur",
            function () {

                if (
                    !validarIdentificacion()
                ) {

                    campos.identificacion
                        .reportValidity();

                }

            }
        );

    }


    /* ========================================================
       CORREO
    ======================================================== */

    function validarCorreo() {

        const correo =
            campos.correo;


        if (!correo) {

            return true;
        }


        const valor =
            correo.value.trim();


        correo.setCustomValidity(
            ""
        );


        /* ----------------------------------------------------
           OBLIGATORIO
        ---------------------------------------------------- */

        if (!valor) {

            correo.setCustomValidity(
                "El correo electrónico es obligatorio."
            );


            actualizarEstadoCampo(
                correo,
                false
            );


            return false;
        }


        /* ----------------------------------------------------
           ESPACIOS
        ---------------------------------------------------- */

        if (
            /\s/.test(
                valor
            )
        ) {

            correo.setCustomValidity(
                "El correo electrónico no puede contener espacios."
            );


            actualizarEstadoCampo(
                correo,
                false
            );


            return false;
        }


        /* ----------------------------------------------------
           FORMATO
        ---------------------------------------------------- */

        if (
            !REGEX_CORREO.test(
                valor
            )
        ) {

            correo.setCustomValidity(
                "Ingresa un correo electrónico válido. Ejemplo: usuario@correo.com"
            );


            actualizarEstadoCampo(
                correo,
                false
            );


            return false;
        }


        /* ----------------------------------------------------
           LONGITUD
        ---------------------------------------------------- */

        if (
            valor.length >
            254
        ) {

            correo.setCustomValidity(
                "El correo electrónico no puede superar los 254 caracteres."
            );


            actualizarEstadoCampo(
                correo,
                false
            );


            return false;
        }


        actualizarEstadoCampo(
            correo,
            true
        );


        return true;
    }


    if (campos.correo) {

        campos.correo.addEventListener(
            "input",
            function () {

                campos.correo.value =
                    campos.correo.value.replace(
                        /\s/g,
                        ""
                    );


                validarCorreo();

            }
        );


        campos.correo.addEventListener(
            "blur",
            function () {

                campos.correo.value =
                    campos.correo.value.trim();


                if (!validarCorreo()) {

                    campos.correo
                        .reportValidity();

                }

            }
        );

    }


    /* ========================================================
       USERNAME
    ======================================================== */

    function validarUsername() {

        const username =
            campos.username;


        if (!username) {

            return true;
        }


        const valor =
            username.value.trim();


        username.setCustomValidity(
            ""
        );


        if (!valor) {

            username.setCustomValidity(
                "El nombre de usuario es obligatorio."
            );


            actualizarEstadoCampo(
                username,
                false
            );


            return false;
        }


        if (
            valor.length <
            4
        ) {

            username.setCustomValidity(
                "El nombre de usuario debe tener mínimo 4 caracteres."
            );


            actualizarEstadoCampo(
                username,
                false
            );


            return false;
        }


        if (
            valor.length >
            150
        ) {

            username.setCustomValidity(
                "El nombre de usuario no puede superar los 150 caracteres."
            );


            actualizarEstadoCampo(
                username,
                false
            );


            return false;
        }


        if (
            !REGEX_USERNAME.test(
                valor
            )
        ) {

            username.setCustomValidity(
                "El nombre de usuario solo puede contener letras, números y los símbolos _ @ . + -"
            );


            actualizarEstadoCampo(
                username,
                false
            );


            return false;
        }


        if (
            !/[A-Za-z0-9]/.test(
                valor
            )
        ) {

            username.setCustomValidity(
                "El nombre de usuario debe contener al menos una letra o un número."
            );


            actualizarEstadoCampo(
                username,
                false
            );


            return false;
        }


        actualizarEstadoCampo(
            username,
            true
        );


        return true;
    }


    if (campos.username) {

        campos.username.addEventListener(
            "input",
            function () {

                campos.username.value =
                    campos.username.value.replace(
                        /\s/g,
                        ""
                    );


                validarUsername();

            }
        );


        campos.username.addEventListener(
            "blur",
            function () {

                campos.username.value =
                    campos.username.value.trim();


                if (!validarUsername()) {

                    campos.username
                        .reportValidity();

                }

            }
        );

    }


    /* ========================================================
       CONTRASEÑA
    ======================================================== */

    function validarPassword() {

        const password =
            campos.password;


        if (!password) {

            return true;
        }


        const valor =
            password.value;


        password.setCustomValidity(
            ""
        );


        /* ----------------------------------------------------
           OBLIGATORIA
        ---------------------------------------------------- */

        if (!valor) {

            password.setCustomValidity(
                "La contraseña es obligatoria."
            );


            actualizarEstadoCampo(
                password,
                false
            );


            return false;
        }


        /* ----------------------------------------------------
           MÍNIMO 8
        ---------------------------------------------------- */

        if (
            valor.length <
            8
        ) {

            password.setCustomValidity(
                "La contraseña debe tener mínimo 8 caracteres."
            );


            actualizarEstadoCampo(
                password,
                false
            );


            return false;
        }


        /* ----------------------------------------------------
           LETRA
        ---------------------------------------------------- */

        if (
            !/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(
                valor
            )
        ) {

            password.setCustomValidity(
                "La contraseña debe contener al menos una letra."
            );


            actualizarEstadoCampo(
                password,
                false
            );


            return false;
        }


        /* ----------------------------------------------------
           NÚMERO
        ---------------------------------------------------- */

        if (
            !/[0-9]/.test(
                valor
            )
        ) {

            password.setCustomValidity(
                "La contraseña debe contener al menos un número."
            );


            actualizarEstadoCampo(
                password,
                false
            );


            return false;
        }


        actualizarEstadoCampo(
            password,
            true
        );


        return true;
    }


    /* ========================================================
       CONFIRMAR CONTRASEÑA
    ======================================================== */

    function validarConfirmacionPassword() {

        const password =
            campos.password;


        const confirmar =
            campos.confirmarPassword;


        if (!confirmar) {

            return true;
        }


        confirmar.setCustomValidity(
            ""
        );


        const valor =
            confirmar.value;


        /* ----------------------------------------------------
           OBLIGATORIA
        ---------------------------------------------------- */

        if (!valor) {

            confirmar.setCustomValidity(
                "Debes confirmar la contraseña."
            );


            actualizarEstadoCampo(
                confirmar,
                false
            );


            mostrarMensajePasswords(
                campos,
                false
            );


            return false;
        }


        /* ----------------------------------------------------
           COINCIDENCIA
        ---------------------------------------------------- */

        if (
            password &&
            valor !==
                password.value
        ) {

            confirmar.setCustomValidity(
                "Las contraseñas no coinciden."
            );


            actualizarEstadoCampo(
                confirmar,
                false
            );


            mostrarMensajePasswords(
                campos,
                true
            );


            return false;
        }


        actualizarEstadoCampo(
            confirmar,
            true
        );


        mostrarMensajePasswords(
            campos,
            false
        );


        return true;
    }


    /* ========================================================
       EVENTOS PASSWORD
    ======================================================== */

    if (campos.password) {

        campos.password.addEventListener(
            "input",
            function () {

                validarPassword();


                if (
                    campos.confirmarPassword &&
                    campos.confirmarPassword.value
                ) {

                    validarConfirmacionPassword();

                }

            }
        );


        campos.password.addEventListener(
            "blur",
            function () {

                if (!validarPassword()) {

                    campos.password
                        .reportValidity();

                }

            }
        );

    }


    if (campos.confirmarPassword) {

        campos.confirmarPassword.addEventListener(
            "input",
            validarConfirmacionPassword
        );


        campos.confirmarPassword.addEventListener(
            "blur",
            function () {

                if (
                    !validarConfirmacionPassword()
                ) {

                    campos.confirmarPassword
                        .reportValidity();

                }

            }
        );

    }


    /* ========================================================
       SUBMIT
    ======================================================== */

    formulario.addEventListener(
        "submit",
        function (evento) {

            normalizarRegistroAdministrador(
                campos
            );


            const nombresValidos =
                configuracionNombres.every(
                    function (configuracion) {

                        return validarNombre(
                            configuracion.campo,
                            configuracion.texto,
                            configuracion.obligatorio
                        );

                    }
                );


            const celularValido =
                validarCelular();


            const identificacionValida =
                validarIdentificacion();


            const correoValido =
                validarCorreo();


            const usernameValido =
                validarUsername();


            const passwordValido =
                validarPassword();


            const confirmacionValida =
                validarConfirmacionPassword();


            const formularioValido =
                formulario.checkValidity();


            if (
                !nombresValidos ||
                !celularValido ||
                !identificacionValida ||
                !correoValido ||
                !usernameValido ||
                !passwordValido ||
                !confirmacionValida ||
                !formularioValido
            ) {

                evento.preventDefault();

                evento.stopPropagation();


                formulario.classList.add(
                    "was-validated"
                );


                formulario.reportValidity();


                return;
            }


            activarBotonRegistrando(
                campos.botonGuardar
            );

        },
        true
    );


    /* ========================================================
       RESET
    ======================================================== */

    formulario.addEventListener(
        "reset",
        function () {

            const listaCampos = [

                campos.primerNombre,

                campos.segundoNombre,

                campos.primerApellido,

                campos.segundoApellido,

                campos.celular,

                campos.identificacion,

                campos.correo,

                campos.username,

                campos.password,

                campos.confirmarPassword

            ];


            listaCampos.forEach(
                function (campo) {

                    if (!campo) {

                        return;
                    }


                    campo.setCustomValidity(
                        ""
                    );


                    campo.classList.remove(
                        "is-valid",
                        "is-invalid"
                    );

                }
            );


            mostrarMensajePasswords(
                campos,
                false
            );


            const modal =
                document.getElementById(
                    "modalAgregarAdministrador"
                );


            restaurarOjosPassword(
                modal,
                ".btn-password-administrador"
            );

        }
    );

}


/* ============================================================
   MENSAJE DE PASSWORD
============================================================ */

function mostrarMensajePasswords(
    campos,
    mostrar
) {

    if (!campos.mensajePassword) {

        return;
    }


    campos.mensajePassword
        .classList
        .toggle(
            "d-none",
            !mostrar
        );

}


/* ============================================================
   NORMALIZAR CAMPOS
============================================================ */

function normalizarRegistroAdministrador(
    campos
) {

    const camposNombre = [

        campos.primerNombre,

        campos.segundoNombre,

        campos.primerApellido,

        campos.segundoApellido

    ];


    camposNombre.forEach(
        function (campo) {

            if (!campo) {

                return;
            }


            campo.value =
                campo.value

                    .trim()

                    .replace(
                        /\s{2,}/g,
                        " "
                    );

        }
    );


    if (campos.correo) {

        campos.correo.value =
            campos.correo.value.trim();

    }


    if (campos.username) {

        campos.username.value =
            campos.username.value.trim();

    }


    if (campos.celular) {

        campos.celular.value =
            campos.celular.value.trim();

    }


    if (campos.identificacion) {

        campos.identificacion.value =
            campos.identificacion.value.trim();

    }

}


/* ============================================================
   LIMPIAR PASSWORDS DEL REGISTRO
============================================================ */

function limpiarEstadoPasswordsRegistroAdministrador(
    campos
) {

    const passwords = [

        campos.password,

        campos.confirmarPassword

    ];


    passwords.forEach(
        function (campo) {

            if (!campo) {

                return;
            }


            campo.type =
                "password";


            campo.setCustomValidity(
                ""
            );


            campo.classList.remove(
                "is-invalid",
                "is-valid"
            );

        }
    );


    mostrarMensajePasswords(
        campos,
        false
    );

}


/* ============================================================
   BOTÓN REGISTRANDO
============================================================ */

function activarBotonRegistrando(
    boton
) {

    if (!boton) {

        return;
    }


    boton.disabled =
        true;


    boton.innerHTML = `
        <span
            class="
                spinner-border
                spinner-border-sm
                me-2
            "
            aria-hidden="true"
        ></span>

        Registrando...
    `;

}


/* ============================================================
   RESTAURAR BOTÓN REGISTRAR
============================================================ */

function restaurarBotonRegistrarAdministrador(
    boton
) {

    if (!boton) {

        return;
    }


    boton.disabled =
        false;


    boton.innerHTML = `
        <i
            class="
                bi
                bi-person-check-fill
                me-2
            "
        ></i>

        Registrar administrador
    `;

}


/* ============================================================
   6. EDITAR ADMINISTRADOR
============================================================ */

function inicializarModalEditarAdministrador() {

    const modal =
        document.getElementById(
            "modalEditarAdministrador"
        );


    const formulario =
        document.getElementById(
            "formEditarAdministrador"
        );


    if (
        !modal ||
        !formulario
    ) {

        return;
    }


    /* ========================================================
       CAMPOS
    ======================================================== */

    const campos = {

        nombres:
            document.getElementById(
                "nombresEditarAdministrador"
            ),

        apellidos:
            document.getElementById(
                "apellidosEditarAdministrador"
            ),

        celular:
            document.getElementById(
                "celularEditarAdministrador"
            ),

        correo:
            document.getElementById(
                "correoEditarAdministrador"
            ),

        nivelAcceso:
            document.getElementById(
                "nivelAccesoEditarAdministrador"
            ),

        username:
            document.getElementById(
                "usernameEditarAdministrador"
            ),

        usuarioActivo:
            document.getElementById(
                "usuarioActivoEditarAdministrador"
            ),

        textoEstado:
            document.getElementById(
                "textoEstadoEditarAdministrador"
            ),

        inputFoto:
            document.getElementById(
                "fotoperfilEditarAdministrador"
            ),

        imagenPreview:
            document.getElementById(
                "imagenPreviewEditarAdministrador"
            ),

        iconoPreview:
            document.getElementById(
                "iconoPreviewEditarAdministrador"
            ),

        botonQuitarFoto:
            document.getElementById(
                "btnQuitarFotoEditarAdministrador"
            ),

        eliminarFoto:
            document.getElementById(
                "eliminarFotoEditarAdministrador"
            ),

        password:
            document.getElementById(
                "passwordEditarAdministrador"
            ),

        confirmarPassword:
            document.getElementById(
                "confirmarPasswordEditarAdministrador"
            ),

        mensajePassword:
            document.getElementById(
                "mensajePasswordEditarAdministrador"
            ),

        botonGuardar:
            document.getElementById(
                "btnGuardarEdicionAdministrador"
            )

    };


    let fotoOriginal =
        "";


    /* ========================================================
       CARGAR INFORMACIÓN AL ABRIR
    ======================================================== */

    modal.addEventListener(
        "show.bs.modal",
        function (evento) {

            const boton =
                evento.relatedTarget;


            if (!boton) {

                return;
            }


            formulario.action =
                boton.dataset.url ||
                "";


            asignarValor(
                campos.nombres,
                boton.dataset.nombres
            );


            asignarValor(
                campos.apellidos,
                boton.dataset.apellidos
            );


            asignarValor(
                campos.celular,
                boton.dataset.celular
            );


            asignarValor(
                campos.correo,
                boton.dataset.correo
            );


            asignarValor(
                campos.username,
                boton.dataset.username
            );


            if (campos.nivelAcceso) {

                campos.nivelAcceso.value =
                    boton.dataset.nivelAcceso ||
                    "Alto";

            }


            if (campos.usuarioActivo) {

                campos.usuarioActivo.checked =
                    boton.dataset.activo ===
                    "1";

            }


            actualizarTextoEstadoEditarAdministrador(
                campos
            );


            /* =================================================
               FOTO
            ================================================= */

            fotoOriginal =
                boton.dataset.foto ||
                "";


            if (campos.eliminarFoto) {

                campos.eliminarFoto.value =
                    "0";

            }


            if (campos.inputFoto) {

                campos.inputFoto.value =
                    "";

            }


            mostrarFotoEditarAdministrador(
                campos,
                fotoOriginal
            );


            /* =================================================
               PASSWORDS
            ================================================= */

            limpiarPasswordsEditarAdministrador(
                campos
            );


            restaurarOjosPassword(
                modal,
                ".btn-password-editar-administrador"
            );

        }
    );


    /* ========================================================
       ESTADO ACTIVO
    ======================================================== */

    if (campos.usuarioActivo) {

        campos.usuarioActivo.addEventListener(
            "change",
            function () {

                actualizarTextoEstadoEditarAdministrador(
                    campos
                );

            }
        );

    }


    /* ========================================================
       NUEVA FOTO
    ======================================================== */

    if (campos.inputFoto) {

        campos.inputFoto.addEventListener(
            "change",
            function () {

                const archivo =
                    campos.inputFoto.files &&
                    campos.inputFoto.files[0];


                if (!archivo) {

                    mostrarFotoEditarAdministrador(
                        campos,
                        fotoOriginal
                    );


                    return;
                }


                const tiposPermitidos = [

                    "image/jpeg",

                    "image/png",

                    "image/webp"

                ];


                if (
                    !tiposPermitidos.includes(
                        archivo.type
                    )
                ) {

                    alert(
                        "La imagen debe estar en formato JPG, PNG o WEBP."
                    );


                    campos.inputFoto.value =
                        "";


                    mostrarFotoEditarAdministrador(
                        campos,
                        fotoOriginal
                    );


                    return;
                }


                const tamanoMaximo =
                    5 * 1024 * 1024;


                if (
                    archivo.size >
                    tamanoMaximo
                ) {

                    alert(
                        "La imagen no puede superar los 5 MB."
                    );


                    campos.inputFoto.value =
                        "";


                    mostrarFotoEditarAdministrador(
                        campos,
                        fotoOriginal
                    );


                    return;
                }


                const lector =
                    new FileReader();


                lector.addEventListener(
                    "load",
                    function (
                        eventoLectura
                    ) {

                        mostrarFotoEditarAdministrador(
                            campos,
                            eventoLectura
                                .target
                                .result
                        );


                        if (
                            campos.eliminarFoto
                        ) {

                            campos.eliminarFoto.value =
                                "0";

                        }

                    }
                );


                lector.addEventListener(
                    "error",
                    function () {

                        alert(
                            "No fue posible cargar la vista previa de la fotografía."
                        );


                        campos.inputFoto.value =
                            "";


                        mostrarFotoEditarAdministrador(
                            campos,
                            fotoOriginal
                        );

                    }
                );


                lector.readAsDataURL(
                    archivo
                );

            }
        );

    }


    /* ========================================================
       QUITAR FOTO
    ======================================================== */

    if (campos.botonQuitarFoto) {

        campos.botonQuitarFoto
            .addEventListener(
                "click",
                function () {

                    if (
                        campos.inputFoto
                    ) {

                        campos.inputFoto.value =
                            "";

                    }


                    if (
                        campos.eliminarFoto
                    ) {

                        campos.eliminarFoto.value =
                            "1";

                    }


                    mostrarFotoEditarAdministrador(
                        campos,
                        ""
                    );

                }
            );

    }


    /* ========================================================
       VALIDAR PASSWORD EDITAR
    ======================================================== */

    function validarPasswordEditar() {

        const password =
            campos.password;


        const confirmar =
            campos.confirmarPassword;


        if (
            !password ||
            !confirmar
        ) {

            return true;
        }


        const clave =
            password.value;


        const confirmacion =
            confirmar.value;


        password.setCustomValidity(
            ""
        );


        confirmar.setCustomValidity(
            ""
        );


        confirmar.classList.remove(
            "is-invalid",
            "is-valid"
        );


        /* ----------------------------------------------------
           NO QUIERE CAMBIAR PASSWORD
        ---------------------------------------------------- */

        if (
            !clave &&
            !confirmacion
        ) {

            mostrarMensajePasswordEditar(
                campos,
                false
            );


            return true;
        }


        /* ----------------------------------------------------
           MÍNIMO
        ---------------------------------------------------- */

        if (
            clave.length <
            8
        ) {

            password.setCustomValidity(
                "La contraseña debe tener mínimo 8 caracteres."
            );


            return false;
        }


        /* ----------------------------------------------------
           COINCIDENCIA
        ---------------------------------------------------- */

        if (
            !confirmacion ||
            clave !==
                confirmacion
        ) {

            confirmar.setCustomValidity(
                "Las contraseñas no coinciden."
            );


            confirmar.classList.add(
                "is-invalid"
            );


            mostrarMensajePasswordEditar(
                campos,
                true
            );


            return false;
        }


        confirmar.classList.add(
            "is-valid"
        );


        mostrarMensajePasswordEditar(
            campos,
            false
        );


        return true;
    }


    /* ========================================================
       EVENTOS PASSWORD
    ======================================================== */

    if (campos.password) {

        campos.password.addEventListener(
            "input",
            validarPasswordEditar
        );

    }


    if (campos.confirmarPassword) {

        campos.confirmarPassword
            .addEventListener(
                "input",
                validarPasswordEditar
            );

    }


    /* ========================================================
       SUBMIT
    ======================================================== */

    formulario.addEventListener(
        "submit",
        function (evento) {

            const passwordValido =
                validarPasswordEditar();


            if (
                !passwordValido ||
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


            if (campos.botonGuardar) {

                campos.botonGuardar.disabled =
                    true;


                campos.botonGuardar.innerHTML = `
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

        }
    );


    /* ========================================================
       LIMPIAR AL CERRAR
    ======================================================== */

    modal.addEventListener(
        "hidden.bs.modal",
        function () {

            formulario.reset();


            formulario.action =
                "";


            formulario.classList.remove(
                "was-validated"
            );


            fotoOriginal =
                "";


            if (campos.eliminarFoto) {

                campos.eliminarFoto.value =
                    "0";

            }


            mostrarFotoEditarAdministrador(
                campos,
                ""
            );


            limpiarPasswordsEditarAdministrador(
                campos
            );


            restaurarOjosPassword(
                modal,
                ".btn-password-editar-administrador"
            );


            if (campos.botonGuardar) {

                campos.botonGuardar.disabled =
                    false;


                campos.botonGuardar.innerHTML = `
                    <i
                        class="
                            bi
                            bi-floppy-fill
                            me-2
                        "
                    ></i>

                    Guardar cambios
                `;

            }

        }
    );

}


/* ============================================================
   ASIGNAR VALOR
============================================================ */

function asignarValor(
    elemento,
    valor
) {

    if (!elemento) {

        return;
    }


    elemento.value =
        valor ||
        "";

}


/* ============================================================
   TEXTO ESTADO EDITAR
============================================================ */

function actualizarTextoEstadoEditarAdministrador(
    campos
) {

    if (
        !campos.usuarioActivo ||
        !campos.textoEstado
    ) {

        return;
    }


    campos.textoEstado.textContent =
        campos.usuarioActivo.checked
            ? "Usuario activo"
            : "Usuario inactivo";

}


/* ============================================================
   FOTO EDITAR
============================================================ */

function mostrarFotoEditarAdministrador(
    campos,
    urlFoto
) {

    if (urlFoto) {

        if (campos.imagenPreview) {

            campos.imagenPreview.src =
                urlFoto;


            campos.imagenPreview
                .classList
                .remove(
                    "d-none"
                );

        }


        if (campos.iconoPreview) {

            campos.iconoPreview
                .classList
                .add(
                    "d-none"
                );

        }


        if (campos.botonQuitarFoto) {

            campos.botonQuitarFoto
                .classList
                .remove(
                    "d-none"
                );

        }


        return;
    }


    if (campos.imagenPreview) {

        campos.imagenPreview
            .removeAttribute(
                "src"
            );


        campos.imagenPreview
            .classList
            .add(
                "d-none"
            );

    }


    if (campos.iconoPreview) {

        campos.iconoPreview
            .classList
            .remove(
                "d-none"
            );

    }


    if (campos.botonQuitarFoto) {

        campos.botonQuitarFoto
            .classList
            .add(
                "d-none"
            );

    }

}


/* ============================================================
   MENSAJE PASSWORD EDITAR
============================================================ */

function mostrarMensajePasswordEditar(
    campos,
    mostrar
) {

    if (!campos.mensajePassword) {

        return;
    }


    campos.mensajePassword
        .classList
        .toggle(
            "d-none",
            !mostrar
        );

}


/* ============================================================
   LIMPIAR PASSWORDS EDITAR
============================================================ */

function limpiarPasswordsEditarAdministrador(
    campos
) {

    const passwords = [

        campos.password,

        campos.confirmarPassword

    ];


    passwords.forEach(
        function (campo) {

            if (!campo) {

                return;
            }


            campo.value =
                "";


            campo.type =
                "password";


            campo.setCustomValidity(
                ""
            );


            campo.classList.remove(
                "is-invalid",
                "is-valid"
            );

        }
    );


    mostrarMensajePasswordEditar(
        campos,
        false
    );

}


/* ============================================================
   7. ACTIVAR / DESACTIVAR ADMINISTRADOR
============================================================ */

function inicializarModalEstadoAdministrador() {

    const modal =
        document.getElementById(
            "modalEstadoAdministrador"
        );


    const formulario =
        document.getElementById(
            "formEstadoAdministrador"
        );


    if (
        !modal ||
        !formulario
    ) {

        return;
    }


    const inputEstado =
        document.getElementById(
            "nuevoEstadoAdministrador"
        );


    const titulo =
        document.getElementById(
            "tituloEstadoAdministrador"
        );


    const mensaje =
        document.getElementById(
            "mensajeEstadoAdministrador"
        );


    const icono =
        document.getElementById(
            "iconoGrandeEstadoAdministrador"
        );


    const botonConfirmar =
        document.getElementById(
            "btnConfirmarEstadoAdministrador"
        );


    /* ========================================================
       ABRIR MODAL
    ======================================================== */

    modal.addEventListener(
        "show.bs.modal",
        function (evento) {

            const boton =
                evento.relatedTarget;


            if (!boton) {

                return;
            }


            const url =
                boton.dataset.url ||
                "";


            const nombre =
                boton.dataset.nombre ||
                "Administrador";


            const actualmenteActivo =
                boton.dataset.activo ===
                "1";


            const nuevoEstado =
                actualmenteActivo
                    ? "0"
                    : "1";


            formulario.action =
                url;


            if (inputEstado) {

                inputEstado.value =
                    nuevoEstado;

            }


            /* =================================================
               DESACTIVAR
            ================================================= */

            if (actualmenteActivo) {

                if (titulo) {

                    titulo.textContent =
                        "Desactivar administrador";

                }


                if (mensaje) {

                    mensaje.textContent =
                        `¿Deseas desactivar la cuenta de ${nombre}?`;

                }


                if (icono) {

                    icono.innerHTML = `
                        <i
                            class="
                                bi
                                bi-lock-fill
                                fs-1
                            "
                        ></i>
                    `;

                }


                if (botonConfirmar) {

                    botonConfirmar.className =
                        "btn btn-warning";


                    botonConfirmar.innerHTML = `
                        <i
                            class="
                                bi
                                bi-lock-fill
                                me-2
                            "
                        ></i>

                        Desactivar
                    `;

                }


                return;
            }


            /* =================================================
               ACTIVAR
            ================================================= */

            if (titulo) {

                titulo.textContent =
                    "Activar administrador";

            }


            if (mensaje) {

                mensaje.textContent =
                    `¿Deseas activar la cuenta de ${nombre}?`;

            }


            if (icono) {

                icono.innerHTML = `
                    <i
                        class="
                            bi
                            bi-unlock-fill
                            fs-1
                        "
                    ></i>
                `;

            }


            if (botonConfirmar) {

                botonConfirmar.className =
                    "btn btn-success";


                botonConfirmar.innerHTML = `
                    <i
                        class="
                            bi
                            bi-unlock-fill
                            me-2
                        "
                    ></i>

                    Activar
                `;

            }

        }
    );


    /* ========================================================
       SUBMIT
    ======================================================== */

    formulario.addEventListener(
        "submit",
        function () {

            if (!botonConfirmar) {

                return;
            }


            botonConfirmar.disabled =
                true;


            botonConfirmar.innerHTML = `
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


    /* ========================================================
       LIMPIAR
    ======================================================== */

    modal.addEventListener(
        "hidden.bs.modal",
        function () {

            formulario.action =
                "";


            if (inputEstado) {

                inputEstado.value =
                    "";

            }


            if (botonConfirmar) {

                botonConfirmar.disabled =
                    false;

            }

        }
    );

}


/* ============================================================
   8. ELIMINAR ADMINISTRADOR
============================================================ */

function inicializarModalEliminarAdministrador() {

    const modal =
        document.getElementById(
            "modalEliminarAdministrador"
        );


    const formulario =
        document.getElementById(
            "formEliminarAdministrador"
        );


    if (
        !modal ||
        !formulario
    ) {

        return;
    }


    const nombreElemento =
        document.getElementById(
            "nombreEliminarAdministrador"
        );


    const usernameElemento =
        document.getElementById(
            "usernameEliminarAdministrador"
        );


    const botonConfirmar =
        document.getElementById(
            "btnConfirmarEliminarAdministrador"
        );


    /* ========================================================
       ABRIR MODAL
    ======================================================== */

    modal.addEventListener(
        "show.bs.modal",
        function (evento) {

            const boton =
                evento.relatedTarget;


            if (!boton) {

                return;
            }


            const url =
                boton.dataset.url ||
                "";


            const nombre =
                boton.dataset.nombre ||
                "Administrador";


            const username =
                boton.dataset.username ||
                "";


            formulario.action =
                url;


            if (nombreElemento) {

                nombreElemento.textContent =
                    nombre;

            }


            if (usernameElemento) {

                usernameElemento.textContent =
                    username
                        ? `@${username}`
                        : "";

            }

        }
    );


    /* ========================================================
       SUBMIT
    ======================================================== */

    formulario.addEventListener(
        "submit",
        function () {

            if (!botonConfirmar) {

                return;
            }


            botonConfirmar.disabled =
                true;


            botonConfirmar.innerHTML = `
                <span
                    class="
                        spinner-border
                        spinner-border-sm
                        me-2
                    "
                    aria-hidden="true"
                ></span>

                Eliminando...
            `;

        }
    );


    /* ========================================================
       LIMPIAR
    ======================================================== */

    modal.addEventListener(
        "hidden.bs.modal",
        function () {

            formulario.action =
                "";


            if (nombreElemento) {

                nombreElemento.textContent =
                    "Administrador";

            }


            if (usernameElemento) {

                usernameElemento.textContent =
                    "";

            }


            if (botonConfirmar) {

                botonConfirmar.disabled =
                    false;


                botonConfirmar.innerHTML = `
                    <i
                        class="
                            bi
                            bi-trash3-fill
                            me-2
                        "
                    ></i>

                    Eliminar definitivamente
                `;

            }

        }
    );

}