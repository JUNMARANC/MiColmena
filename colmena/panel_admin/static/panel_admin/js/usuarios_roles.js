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

            inicializarVerificacionDuplicadosAdministrador();

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

            const feedbackUser = document.getElementById("feedbackUsernameAdministrador");
            const feedbackCorreo = document.getElementById("feedbackCorreoAdministrador");
            if (feedbackUser) feedbackUser.textContent = "";
            if (feedbackCorreo) feedbackCorreo.textContent = "";

            const inputUserReg = formulario.querySelector('[name="username"]');
            const inputCorreoReg = formulario.querySelector('[name="correo"]');
            if (inputUserReg) { inputUserReg.dataset.duplicado = "0"; inputUserReg.dataset.verificando = "0"; }
            if (inputCorreoReg) { inputCorreoReg.dataset.duplicado = "0"; inputCorreoReg.dataset.verificando = "0"; }

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

    const REGEX_NOMBRE =
        /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñÀ-ÿ]+(?:[ '\-][A-Za-zÁÉÍÓÚÜÑáéíóúüñÀ-ÿ]+)*$/;

    const REGEX_CELULAR =
        /^3[0-9]{9}$/;

    const REGEX_GMAIL =
        /^[A-Za-z0-9._%+-]+@gmail\.com$/i;

    const REGEX_USERNAME =
        /^[A-Za-z0-9_@.+-]+$/;


    /* ========================================================
       FEEDBACK
    ======================================================== */

    function obtenerFeedback(campo) {

        if (!campo) {
            return null;
        }

        const mapa = {
            usernameAdministrador:
                "feedbackUsernameAdministrador",

            correoAdministrador:
                "feedbackCorreoAdministrador"
        };


        if (
            campo.id &&
            mapa[campo.id]
        ) {

            const existente =
                document.getElementById(
                    mapa[campo.id]
                );

            if (existente) {
                return existente;
            }
        }


        const idFeedback =
            campo.id
                ? `feedbackLive_${campo.id}`
                : "";


        let feedback =
            idFeedback
                ? document.getElementById(
                    idFeedback
                )
                : null;


        if (!feedback) {

            feedback =
                document.createElement(
                    "div"
                );


            feedback.className =
                "small mt-1 d-none";


            if (idFeedback) {

                feedback.id =
                    idFeedback;

            }


            const grupo =
                campo.closest(
                    ".input-group"
                );


            const referencia =
                grupo ||
                campo;


            referencia.insertAdjacentElement(
                "afterend",
                feedback
            );

        }


        return feedback;
    }


    function mostrarFeedback(
        campo,
        estado,
        mensaje
    ) {

        const feedback =
            obtenerFeedback(
                campo
            );


        if (!feedback) {
            return;
        }


        feedback.classList.remove(
            "invalid-feedback",
            "text-danger",
            "text-success",
            "text-muted",
            "d-none"
        );


        feedback.classList.add(
            "small",
            "mt-1"
        );


        if (!mensaje) {

            feedback.textContent =
                "";

            feedback.classList.add(
                "d-none"
            );

            return;
        }


        if (estado === "valido") {

            feedback.classList.add(
                "text-success"
            );

        }

        else if (
            estado === "invalido"
        ) {

            feedback.classList.add(
                "text-danger"
            );

        }

        else {

            feedback.classList.add(
                "text-muted"
            );

        }


        feedback.textContent =
            mensaje;
    }


    function marcarCampo(
        campo,
        valido,
        mensaje = ""
    ) {

        if (!campo) {
            return;
        }


        campo.classList.remove(
            "is-valid",
            "is-invalid"
        );


        if (valido === null) {

            campo.setCustomValidity(
                ""
            );

            mostrarFeedback(
                campo,
                null,
                ""
            );

            return;
        }


        if (valido) {

            campo.setCustomValidity(
                ""
            );

            campo.classList.add(
                "is-valid"
            );

            mostrarFeedback(
                campo,
                "valido",
                mensaje
            );

        }

        else {

            campo.setCustomValidity(
                mensaje ||
                "El valor ingresado no es válido."
            );

            campo.classList.add(
                "is-invalid"
            );

            mostrarFeedback(
                campo,
                "invalido",
                mensaje
            );

        }

    }


    /* ========================================================
       NOMBRES Y APELLIDOS
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


        const maximo =
            campo.maxLength > 0
                ? campo.maxLength
                : 150;


        if (!valor) {

            if (obligatorio) {

                marcarCampo(
                    campo,
                    false,
                    `${nombreCampo} es obligatorio.`
                );

                return false;
            }


            marcarCampo(
                campo,
                null
            );

            return true;
        }


        if (
            valor.length <
            2
        ) {

            marcarCampo(
                campo,
                false,
                `${nombreCampo} debe tener mínimo 2 caracteres.`
            );

            return false;
        }


        if (
            valor.length >
            maximo
        ) {

            marcarCampo(
                campo,
                false,
                `${nombreCampo} no puede superar los ${maximo} caracteres.`
            );

            return false;
        }


        if (
            !REGEX_NOMBRE.test(
                valor
            )
        ) {

            marcarCampo(
                campo,
                false,
                `${nombreCampo} solo puede contener letras, espacios, guiones y apóstrofes.`
            );

            return false;
        }


        marcarCampo(
            campo,
            true,
            `${nombreCampo} es válido.`
        );


        return true;
    }


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


                validarNombre(
                    campo,
                    nombreCampo,
                    obligatorio
                );

            }
        );

    }


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

        const campo =
            campos.celular;


        if (!campo) {
            return true;
        }


        const valor =
            campo.value.trim();


        if (!valor) {

            marcarCampo(
                campo,
                null
            );

            return true;
        }


        if (
            !/^[0-9]+$/.test(
                valor
            )
        ) {

            marcarCampo(
                campo,
                false,
                "El celular solo puede contener números."
            );

            return false;
        }


        if (
            !valor.startsWith(
                "3"
            )
        ) {

            marcarCampo(
                campo,
                false,
                "El celular debe comenzar por 3."
            );

            return false;
        }


        if (
            valor.length <
            10
        ) {

            const faltan =
                10 -
                valor.length;


            marcarCampo(
                campo,
                false,
                `Faltan ${faltan} número${faltan === 1 ? "" : "s"}.`
            );

            return false;
        }


        if (
            !REGEX_CELULAR.test(
                valor
            )
        ) {

            marcarCampo(
                campo,
                false,
                (
                    "El celular debe tener exactamente "
                    + "10 números y comenzar por 3."
                )
            );

            return false;
        }


        marcarCampo(
            campo,
            true,
            "Número celular válido."
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
            validarCelular
        );

    }


    /* ========================================================
       CORREO - SOLO GMAIL
    ======================================================== */

    function validarCorreo() {

        const campo =
            campos.correo;


        if (!campo) {
            return true;
        }


        const valor =
            campo.value
                .trim()
                .toLowerCase();


        if (!valor) {

            marcarCampo(
                campo,
                false,
                "El correo electrónico es obligatorio."
            );

            return false;
        }


        if (
            valor.length >
            254
        ) {

            marcarCampo(
                campo,
                false,
                "El correo electrónico no puede superar los 254 caracteres."
            );

            return false;
        }


        if (
            !REGEX_GMAIL.test(
                valor
            )
        ) {

            marcarCampo(
                campo,
                false,
                "Debes ingresar una dirección válida terminada en @gmail.com."
            );

            return false;
        }


        marcarCampo(
            campo,
            true,
            "Formato de Gmail válido."
        );


        return true;
    }


    if (campos.correo) {

        campos.correo.addEventListener(
            "input",
            function () {

                campos.correo.value =
                    campos.correo.value

                        .replace(
                            /\s/g,
                            ""
                        )

                        .toLowerCase();


                validarCorreo();

            }
        );


        campos.correo.addEventListener(
            "blur",
            function () {

                campos.correo.value =
                    campos.correo.value

                        .trim()

                        .toLowerCase();


                validarCorreo();

            }
        );

    }


    /* ========================================================
       USERNAME
    ======================================================== */

    function validarUsername() {

        const campo =
            campos.username;


        if (!campo) {
            return true;
        }


        const valor =
            campo.value.trim();


        if (!valor) {

            marcarCampo(
                campo,
                false,
                "El nombre de usuario es obligatorio."
            );

            return false;
        }


        if (
            valor.length >
            150
        ) {

            marcarCampo(
                campo,
                false,
                "El nombre de usuario no puede superar los 150 caracteres."
            );

            return false;
        }


        if (
            !REGEX_USERNAME.test(
                valor
            )
        ) {

            marcarCampo(
                campo,
                false,
                "Solo se permiten letras, números y los símbolos _ @ . + -."
            );

            return false;
        }


        marcarCampo(
            campo,
            true,
            "Formato de nombre de usuario válido."
        );


        return true;
    }


    if (campos.username) {

        campos.username.addEventListener(
            "input",
            function () {

                campos.username.value =
                    campos.username.value

                        .replace(
                            /\s/g,
                            ""
                        )

                        .slice(
                            0,
                            150
                        );


                validarUsername();

            }
        );


        campos.username.addEventListener(
            "blur",
            validarUsername
        );

    }


    /* ========================================================
       CONTRASEÑA
    ======================================================== */

    function validarPassword() {

        const campo =
            campos.password;


        if (!campo) {
            return true;
        }


        const valor =
            campo.value;


        if (!valor) {

            marcarCampo(
                campo,
                false,
                "La contraseña es obligatoria."
            );

            return false;
        }


        if (
            valor.length <
            8
        ) {

            marcarCampo(
                campo,
                false,
                "La contraseña debe tener mínimo 8 caracteres."
            );

            return false;
        }


        if (
            valor.length >
            128
        ) {

            marcarCampo(
                campo,
                false,
                "La contraseña no puede superar los 128 caracteres."
            );

            return false;
        }


        marcarCampo(
            campo,
            true,
            "Longitud de contraseña válida."
        );


        return true;
    }


    function validarConfirmacionPassword() {

        const password =
            campos.password;


        const confirmar =
            campos.confirmarPassword;


        if (!confirmar) {
            return true;
        }


        const valor =
            confirmar.value;


        if (!valor) {

            marcarCampo(
                confirmar,
                false,
                "Debes confirmar la contraseña."
            );


            mostrarMensajePasswords(
                campos,
                false
            );


            return false;
        }


        if (
            password &&
            valor !==
            password.value
        ) {

            marcarCampo(
                confirmar,
                false,
                "Las contraseñas no coinciden."
            );


            mostrarMensajePasswords(
                campos,
                true
            );


            return false;
        }


        marcarCampo(
            confirmar,
            true,
            "Las contraseñas coinciden."
        );


        mostrarMensajePasswords(
            campos,
            false
        );


        return true;
    }


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

    }


    if (
        campos.confirmarPassword
    ) {

        campos.confirmarPassword
            .addEventListener(
                "input",
                validarConfirmacionPassword
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


            if (campos.correo) {

                campos.correo.value =
                    campos.correo.value
                        .trim()
                        .toLowerCase();

            }


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


            const correoValido =
                validarCorreo();


            const usernameValido =
                validarUsername();


            const passwordValido =
                validarPassword();


            const confirmacionValida =
                validarConfirmacionPassword();


            const hayVerificando =
                formulario.querySelector(
                    '[data-verificando="1"]'
                );


            const hayDuplicado =
                formulario.querySelector(
                    '[data-duplicado="1"]'
                );


            if (
                !nombresValidos ||
                !celularValido ||
                !correoValido ||
                !usernameValido ||
                !passwordValido ||
                !confirmacionValida ||
                hayVerificando ||
                hayDuplicado ||
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
    VALIDACIONES - EDITAR ADMINISTRADOR
    ======================================================== */

    const REGEX_NOMBRE_EDITAR =
        /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñÀ-ÿ]+(?:[ '\-][A-Za-zÁÉÍÓÚÜÑáéíóúüñÀ-ÿ]+)*$/;

    const REGEX_CELULAR_EDITAR =
        /^3[0-9]{9}$/;

    const REGEX_GMAIL_EDITAR =
        /^[A-Za-z0-9._%+-]+@gmail\.com$/i;

    const REGEX_USERNAME_EDITAR =
        /^[A-Za-z0-9_@.+-]+$/;


    /* --------------------------------------------------------
    ESTADO VISUAL
    --------------------------------------------------------- */

    function marcarEditar(
        campo,
        valido,
        mensaje = ""
    ) {

        if (!campo) {
            return;
        }


        campo.classList.remove(
            "is-valid",
            "is-invalid"
        );


        if (valido === null) {

            campo.setCustomValidity(
                ""
            );

            return;
        }


        if (valido) {

            campo.setCustomValidity(
                ""
            );

            campo.classList.add(
                "is-valid"
            );

        }

        else {

            campo.setCustomValidity(
                mensaje ||
                "El valor ingresado no es válido."
            );

            campo.classList.add(
                "is-invalid"
            );

        }

    }


    /* ========================================================
    NOMBRES
    ======================================================== */

    function validarNombreEditar(
        campo,
        nombreCampo
    ) {

        if (!campo) {
            return true;
        }


        const valor =
            campo.value.trim();


        if (!valor) {

            marcarEditar(
                campo,
                false,
                `${nombreCampo} son obligatorios.`
            );

            return false;
        }


        if (
            valor.length <
            2
        ) {

            marcarEditar(
                campo,
                false,
                `${nombreCampo} deben tener mínimo 2 caracteres.`
            );

            return false;
        }


        if (
            valor.length >
            150
        ) {

            marcarEditar(
                campo,
                false,
                `${nombreCampo} no pueden superar los 150 caracteres.`
            );

            return false;
        }


        if (
            !REGEX_NOMBRE_EDITAR.test(
                valor
            )
        ) {

            marcarEditar(
                campo,
                false,
                `${nombreCampo} solo pueden contener letras, espacios, guiones y apóstrofes.`
            );

            return false;
        }


        marcarEditar(
            campo,
            true
        );


        return true;
    }


    function prepararNombreEditar(
        campo,
        nombreCampo
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


                validarNombreEditar(
                    campo,
                    nombreCampo
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


                validarNombreEditar(
                    campo,
                    nombreCampo
                );

            }
        );

    }


    prepararNombreEditar(
        campos.nombres,
        "Los nombres"
    );


    prepararNombreEditar(
        campos.apellidos,
        "Los apellidos"
    );


    /* ========================================================
    CELULAR
    ======================================================== */

    function validarCelularEditar() {

        const campo =
            campos.celular;


        if (!campo) {
            return true;
        }


        const valor =
            campo.value.trim();


        if (!valor) {

            marcarEditar(
                campo,
                null
            );

            return true;
        }


        if (
            !valor.startsWith(
                "3"
            )
        ) {

            marcarEditar(
                campo,
                false,
                "El celular debe comenzar por 3."
            );

            return false;
        }


        if (
            valor.length <
            10
        ) {

            const faltan =
                10 -
                valor.length;


            marcarEditar(
                campo,
                false,
                `Faltan ${faltan} número${faltan === 1 ? "" : "s"}.`
            );

            return false;
        }


        if (
            !REGEX_CELULAR_EDITAR.test(
                valor
            )
        ) {

            marcarEditar(
                campo,
                false,
                "El celular debe tener exactamente 10 números y comenzar por 3."
            );

            return false;
        }


        marcarEditar(
            campo,
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


                validarCelularEditar();

            }
        );


        campos.celular.addEventListener(
            "blur",
            validarCelularEditar
        );

    }


    /* ========================================================
    CORREO GMAIL
    ======================================================== */

    function validarCorreoEditar() {

        const campo =
            campos.correo;


        if (!campo) {
            return true;
        }


        const valor =
            campo.value
                .trim()
                .toLowerCase();


        if (!valor) {

            marcarEditar(
                campo,
                false,
                "El correo electrónico es obligatorio."
            );

            return false;
        }


        if (
            valor.length >
            254
        ) {

            marcarEditar(
                campo,
                false,
                "El correo electrónico no puede superar los 254 caracteres."
            );

            return false;
        }


        if (
            !REGEX_GMAIL_EDITAR.test(
                valor
            )
        ) {

            marcarEditar(
                campo,
                false,
                "Debes ingresar una dirección válida terminada en @gmail.com."
            );

            return false;
        }


        marcarEditar(
            campo,
            true
        );


        return true;
    }


    if (campos.correo) {

        campos.correo.addEventListener(
            "input",
            function () {

                campos.correo.value =
                    campos.correo.value

                        .replace(
                            /\s/g,
                            ""
                        )

                        .toLowerCase();


                validarCorreoEditar();

            }
        );


        campos.correo.addEventListener(
            "blur",
            validarCorreoEditar
        );

    }


    /* ========================================================
    USERNAME
    ======================================================== */

    function validarUsernameEditar() {

        const campo =
            campos.username;


        if (!campo) {
            return true;
        }


        const valor =
            campo.value.trim();


        if (!valor) {

            marcarEditar(
                campo,
                false,
                "El nombre de usuario es obligatorio."
            );

            return false;
        }


        if (
            valor.length >
            150
        ) {

            marcarEditar(
                campo,
                false,
                "El nombre de usuario no puede superar los 150 caracteres."
            );

            return false;
        }


        if (
            !REGEX_USERNAME_EDITAR.test(
                valor
            )
        ) {

            marcarEditar(
                campo,
                false,
                "Solo se permiten letras, números y los símbolos _ @ . + -."
            );

            return false;
        }


        marcarEditar(
            campo,
            true
        );


        return true;
    }


    if (campos.username) {

        campos.username.addEventListener(
            "input",
            function () {

                campos.username.value =
                    campos.username.value

                        .replace(
                            /\s/g,
                            ""
                        )

                        .slice(
                            0,
                            150
                        );


                validarUsernameEditar();

            }
        );


        campos.username.addEventListener(
            "blur",
            validarUsernameEditar
        );

    }


    /* ========================================================
    CONTRASEÑA OPCIONAL
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


        password.classList.remove(
            "is-valid",
            "is-invalid"
        );


        confirmar.classList.remove(
            "is-valid",
            "is-invalid"
        );


        /* ----------------------------------------------------
        NO QUIERE CAMBIAR CONTRASEÑA
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
        FALTA NUEVA CONTRASEÑA
        ---------------------------------------------------- */

        if (!clave) {

            password.setCustomValidity(
                "Debes ingresar la nueva contraseña."
            );


            password.classList.add(
                "is-invalid"
            );


            return false;
        }


        /* ----------------------------------------------------
        LONGITUD
        ---------------------------------------------------- */

        if (
            clave.length <
            8
        ) {

            password.setCustomValidity(
                "La nueva contraseña debe tener mínimo 8 caracteres."
            );


            password.classList.add(
                "is-invalid"
            );


            return false;
        }


        if (
            clave.length >
            128
        ) {

            password.setCustomValidity(
                "La nueva contraseña no puede superar los 128 caracteres."
            );


            password.classList.add(
                "is-invalid"
            );


            return false;
        }


        password.classList.add(
            "is-valid"
        );


        /* ----------------------------------------------------
        CONFIRMACIÓN
        ---------------------------------------------------- */

        if (!confirmacion) {

            confirmar.setCustomValidity(
                "Debes confirmar la nueva contraseña."
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


        if (
            clave !==
            confirmacion
        ) {

            confirmar.setCustomValidity(
                "Las nuevas contraseñas no coinciden."
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


    if (campos.password) {

        campos.password.addEventListener(
            "input",
            validarPasswordEditar
        );

    }


    if (
        campos.confirmarPassword
    ) {

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

            if (campos.nombres) {

                campos.nombres.value =
                    campos.nombres.value

                        .trim()

                        .replace(
                            /\s{2,}/g,
                            " "
                        );

            }


            if (campos.apellidos) {

                campos.apellidos.value =
                    campos.apellidos.value

                        .trim()

                        .replace(
                            /\s{2,}/g,
                            " "
                        );

            }


            if (campos.correo) {

                campos.correo.value =
                    campos.correo.value

                        .trim()

                        .toLowerCase();

            }


            if (campos.username) {

                campos.username.value =
                    campos.username.value.trim();

            }


            const nombresValidos =
                validarNombreEditar(
                    campos.nombres,
                    "Los nombres"
                );


            const apellidosValidos =
                validarNombreEditar(
                    campos.apellidos,
                    "Los apellidos"
                );


            const celularValido =
                validarCelularEditar();


            const correoValido =
                validarCorreoEditar();


            const usernameValido =
                validarUsernameEditar();


            const passwordValido =
                validarPasswordEditar();


            const hayVerificando =
                formulario.querySelector(
                    '[data-verificando="1"]'
                );


            const hayDuplicado =
                formulario.querySelector(
                    '[data-duplicado="1"]'
                );


            if (
                !nombresValidos ||
                !apellidosValidos ||
                !celularValido ||
                !correoValido ||
                !usernameValido ||
                !passwordValido ||
                hayVerificando ||
                hayDuplicado ||
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

        },
        true
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

            const feedbackUserEditar = document.getElementById("feedbackUsernameEditarAdministrador");
            const feedbackCorreoEditar = document.getElementById("feedbackCorreoEditarAdministrador");
            if (feedbackUserEditar) feedbackUserEditar.textContent = "";
            if (feedbackCorreoEditar) feedbackCorreoEditar.textContent = "";

            const inputUserEdit = document.getElementById("usernameEditarAdministrador");
            const inputCorreoEdit = document.getElementById("correoEditarAdministrador");
            if (inputUserEdit) { inputUserEdit.dataset.duplicado = "0"; inputUserEdit.dataset.verificando = "0"; }
            if (inputCorreoEdit) { inputCorreoEdit.dataset.duplicado = "0"; inputCorreoEdit.dataset.verificando = "0"; }

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

/* ============================================================
   9. VERIFICACIÓN EN VIVO - DATOS DUPLICADOS (ADMINISTRADOR)

   Mientras se escribe el username o el correo (en Agregar o en
   Editar), se le pregunta al backend si ese dato ya existe, en
   vez de esperar a que se le dé "Guardar" y perder lo escrito
   con un mensaje de error.

   Se integra con lo que ya existe: en vez de un bloqueo propio
   en el submit, usa setCustomValidity() sobre el mismo campo —
   los submit handlers de Agregar/Editar ya llaman a
   formulario.checkValidity(), así que lo detectan solos.
============================================================ */

function inicializarVerificacionDuplicadosAdministrador() {

    if (
        typeof URL_VERIFICAR_DATO_ADMINISTRADOR ===
        "undefined"
    ) {

        return;
    }


    const RETRASO_DEBOUNCE_MS =
        300;


    const REGEX_GMAIL =
        /^[A-Za-z0-9._%+-]+@gmail\.com$/i;


    const REGEX_USERNAME =
        /^[A-Za-z0-9_@.+-]+$/;


    /* ========================================================
       DEBOUNCE
    ======================================================== */

    function debounce(
        funcion,
        espera
    ) {

        let temporizador =
            null;


        const ejecutar =
            function (...args) {

                clearTimeout(
                    temporizador
                );


                temporizador =
                    setTimeout(
                        function () {

                            funcion.apply(
                                this,
                                args
                            );

                        },
                        espera
                    );

            };


        ejecutar.cancelar =
            function () {

                clearTimeout(
                    temporizador
                );

            };


        return ejecutar;
    }


    /* ========================================================
       FEEDBACK
    ======================================================== */

    function obtenerFeedback(
        campo
    ) {

        if (!campo) {
            return null;
        }


        const mapa = {

            usernameAdministrador:
                "feedbackUsernameAdministrador",

            correoAdministrador:
                "feedbackCorreoAdministrador",

            usernameEditarAdministrador:
                "feedbackUsernameEditarAdministrador",

            correoEditarAdministrador:
                "feedbackCorreoEditarAdministrador"

        };


        if (
            campo.id &&
            mapa[campo.id]
        ) {

            const existente =
                document.getElementById(
                    mapa[campo.id]
                );


            if (existente) {
                return existente;
            }

        }


        return null;
    }


    function mostrarFeedback(
        campo,
        estado,
        mensaje
    ) {

        const feedback =
            obtenerFeedback(
                campo
            );


        if (!feedback) {
            return;
        }


        feedback.classList.remove(
            "invalid-feedback",
            "text-danger",
            "text-success",
            "text-muted",
            "d-none"
        );


        feedback.classList.add(
            "small",
            "mt-1"
        );


        if (!mensaje) {

            feedback.textContent =
                "";

            feedback.classList.add(
                "d-none"
            );

            return;
        }


        if (
            estado ===
            "valido"
        ) {

            feedback.classList.add(
                "text-success"
            );

        }

        else if (
            estado ===
            "invalido"
        ) {

            feedback.classList.add(
                "text-danger"
            );

        }

        else {

            feedback.classList.add(
                "text-muted"
            );

        }


        feedback.textContent =
            mensaje;
    }


    /* ========================================================
       BOTÓN
    ======================================================== */

    function actualizarBoton(
        boton,
        formulario
    ) {

        if (
            !boton ||
            !formulario
        ) {

            return;
        }


        const verificando =
            formulario.querySelector(
                '[data-verificando="1"]'
            );


        const duplicado =
            formulario.querySelector(
                '[data-duplicado="1"]'
            );


        boton.disabled =
            Boolean(
                verificando ||
                duplicado
            );

    }


    /* ========================================================
       VALIDAR FORMATO ANTES DE CONSULTAR DJANGO
    ======================================================== */

    function formatoLocalValido(
        campo,
        tipoCampo
    ) {

        const valor =
            campo.value.trim();


        if (!valor) {
            return false;
        }


        if (
            tipoCampo ===
            "correo"
        ) {

            return (
                valor.length <= 254 &&
                REGEX_GMAIL.test(
                    valor
                )
            );

        }


        if (
            tipoCampo ===
            "username"
        ) {

            return (
                valor.length <= 150 &&
                REGEX_USERNAME.test(
                    valor
                )
            );

        }


        return false;
    }


    /* ========================================================
       LIMPIAR SOLO ERROR PRODUCIDO POR AJAX
    ======================================================== */

    function limpiarErrorAjax(
        campo
    ) {

        const mensajeAjax =
            campo.dataset.mensajeErrorAjax ||
            "";


        /*
        * Solo quitamos setCustomValidity()
        * si el error actual realmente fue creado
        * por la petición AJAX.
        *
        * Así evitamos borrar un error local de
        * Gmail, username, required, etc.
        */

        if (
            campo.dataset.errorAjax ===
            "1"
        ) {

            if (
                mensajeAjax &&
                campo.validationMessage ===
                mensajeAjax
            ) {

                campo.setCustomValidity(
                    ""
                );

            }


            campo.dataset.errorAjax =
                "0";


            campo.dataset.mensajeErrorAjax =
                "";

        }


        campo.dataset.duplicado =
            "0";
    }


    /* ========================================================
       CONSULTA
    ======================================================== */

    async function verificar(
        campo,
        tipoCampo,
        idUsuarioActual,
        boton
    ) {

        const formulario =
            campo.closest(
                "form"
            );


        let valor =
            campo.value.trim();


        if (
            tipoCampo ===
            "correo"
        ) {

            valor =
                valor.toLowerCase();

        }


        if (!valor) {

            limpiarErrorAjax(
                campo
            );


            campo.dataset.verificando =
                "0";


            mostrarFeedback(
                campo,
                null,
                ""
            );


            actualizarBoton(
                boton,
                formulario
            );


            return;
        }


        /* ----------------------------------------------------
           NO CONSULTAR SI EL FORMATO LOCAL ES MALO
        ---------------------------------------------------- */

        if (
            !formatoLocalValido(
                campo,
                tipoCampo
            )
        ) {

            campo.dataset.verificando =
                "0";


            campo.dataset.duplicado =
                "0";


            actualizarBoton(
                boton,
                formulario
            );


            return;
        }


        /* ----------------------------------------------------
           IDENTIFICADOR DE PETICIÓN
        ---------------------------------------------------- */

        const secuencia =
            Number(
                campo.dataset.secuenciaAjax ||
                "0"
            ) +
            1;


        campo.dataset.secuenciaAjax =
            String(
                secuencia
            );


        campo.dataset.verificando =
            "1";


        campo.dataset.duplicado =
            "0";


        mostrarFeedback(
            campo,
            "verificando",
            "Verificando disponibilidad..."
        );


        actualizarBoton(
            boton,
            formulario
        );


        let url =
            URL_VERIFICAR_DATO_ADMINISTRADOR
            +
            "?campo="
            +
            encodeURIComponent(
                tipoCampo
            )
            +
            "&valor="
            +
            encodeURIComponent(
                valor
            );


        if (idUsuarioActual) {

            url +=
                "&id_usuario="
                +
                encodeURIComponent(
                    idUsuarioActual
                );

        }


        try {

            const respuesta =
                await fetch(
                    url,
                    {
                        headers: {
                            "X-Requested-With":
                                "XMLHttpRequest"
                        }
                    }
                );


            const datos =
                await respuesta.json();


            /* ------------------------------------------------
               IGNORAR RESPUESTAS VIEJAS
            ------------------------------------------------ */

            if (
                Number(
                    campo.dataset.secuenciaAjax ||
                    "0"
                )
                !==
                secuencia
            ) {

                return;
            }


            let valorActual =
                campo.value.trim();


            if (
                tipoCampo ===
                "correo"
            ) {

                valorActual =
                    valorActual.toLowerCase();

            }


            if (
                valorActual !==
                valor
            ) {

                return;
            }


            campo.dataset.verificando =
                "0";


            /* ------------------------------------------------
               BACKEND DICE: FORMATO INVÁLIDO
            ------------------------------------------------ */

            if (
                datos.valido ===
                false
            ) {

                const mensaje =
                    datos.mensaje ||
                    "El valor ingresado no es válido.";


                campo.setCustomValidity(
                    mensaje
                );


                campo.classList.remove(
                    "is-valid"
                );


                campo.classList.add(
                    "is-invalid"
                );


                campo.dataset.errorAjax =
                    "1";


                campo.dataset.mensajeErrorAjax =
                    mensaje;


                campo.dataset.duplicado =
                    "0";


                mostrarFeedback(
                    campo,
                    "invalido",
                    mensaje
                );


                actualizarBoton(
                    boton,
                    formulario
                );


                return;
            }


            /* ------------------------------------------------
               DUPLICADO
            ------------------------------------------------ */

            if (
                datos.existe
            ) {

                const mensaje =
                    datos.mensaje ||
                    "Este dato ya está registrado.";


                campo.setCustomValidity(
                    mensaje
                );


                campo.classList.remove(
                    "is-valid"
                );


                campo.classList.add(
                    "is-invalid"
                );


                campo.dataset.errorAjax =
                    "1";


                campo.dataset.mensajeErrorAjax =
                    mensaje;


                campo.dataset.duplicado =
                    "1";


                mostrarFeedback(
                    campo,
                    "invalido",
                    mensaje
                );

            }

            else {

                limpiarErrorAjax(
                    campo
                );


                campo.classList.remove(
                    "is-invalid"
                );


                campo.classList.add(
                    "is-valid"
                );


                mostrarFeedback(
                    campo,
                    "valido",
                    datos.mensaje ||
                    "Dato disponible."
                );

            }


            actualizarBoton(
                boton,
                formulario
            );

        }

        catch (error) {

            console.error(
                "[usuarios_roles] Error verificando disponibilidad:",
                error
            );


            if (
                Number(
                    campo.dataset.secuenciaAjax ||
                    "0"
                )
                !==
                secuencia
            ) {

                return;
            }


            campo.dataset.verificando =
                "0";


            /*
             * No marcamos disponible ni duplicado.
             * Django hará la validación definitiva al guardar.
             */

            mostrarFeedback(
                campo,
                "verificando",
                (
                    "No se pudo verificar la disponibilidad "
                    + "en este momento. Se comprobará al guardar."
                )
            );


            actualizarBoton(
                boton,
                formulario
            );

        }

    }


    /* ========================================================
       ACTIVAR CAMPO
    ======================================================== */

    function activar(
        campo,
        tipoCampo,
        obtenerIdUsuario,
        boton
    ) {

        if (!campo) {
            return;
        }


        campo.dataset.duplicado =
            "0";


        campo.dataset.verificando =
            "0";


        campo.dataset.errorAjax =
            "0";


        campo.dataset.mensajeErrorAjax =
            "";


        campo.dataset.secuenciaAjax =
            "0";


        const verificarConRetraso =
            debounce(
                function () {

                    verificar(
                        campo,
                        tipoCampo,
                        obtenerIdUsuario(),
                        boton
                    );

                },
                RETRASO_DEBOUNCE_MS
            );


        campo.addEventListener(
            "input",
            function () {

                /*
                 * Invalida cualquier petición anterior.
                 */

                campo.dataset.secuenciaAjax =
                    String(
                        Number(
                            campo.dataset.secuenciaAjax ||
                            "0"
                        )
                        +
                        1
                    );


                limpiarErrorAjax(
                    campo
                );


                campo.dataset.verificando =
                    "0";


                if (
                    !formatoLocalValido(
                        campo,
                        tipoCampo
                    )
                ) {

                    actualizarBoton(
                        boton,
                        campo.closest(
                            "form"
                        )
                    );


                    return;
                }


                verificarConRetraso();

            }
        );


        campo.addEventListener(
            "blur",
            function () {

                verificarConRetraso.cancelar();


                if (
                    formatoLocalValido(
                        campo,
                        tipoCampo
                    )
                ) {

                    verificar(
                        campo,
                        tipoCampo,
                        obtenerIdUsuario(),
                        boton
                    );

                }

            }
        );

    }


    /* ========================================================
       AGREGAR ADMINISTRADOR
    ======================================================== */

    const formAgregar =
        document.getElementById(
            "formAgregarAdministrador"
        );


    const botonAgregar =
        document.getElementById(
            "btnGuardarAdministrador"
        );


    activar(
        formAgregar
            ? formAgregar.querySelector(
                '[name="username"]'
            )
            : null,

        "username",

        function () {
            return "";
        },

        botonAgregar
    );


    activar(
        formAgregar
            ? formAgregar.querySelector(
                '[name="correo"]'
            )
            : null,

        "correo",

        function () {
            return "";
        },

        botonAgregar
    );


    /* ========================================================
       EDITAR ADMINISTRADOR
    ======================================================== */

    const formEditar =
        document.getElementById(
            "formEditarAdministrador"
        );


    const botonEditar =
        document.getElementById(
            "btnGuardarEdicionAdministrador"
        );


    const modalEditar =
        document.getElementById(
            "modalEditarAdministrador"
        );


    if (
        modalEditar &&
        formEditar
    ) {

        modalEditar.addEventListener(
            "show.bs.modal",
            function (evento) {

                const boton =
                    evento.relatedTarget;


                let idUsuario =
                    boton
                        ? (
                            boton.dataset.id ||
                            ""
                        )
                        : "";


                /*
                 * Respaldo:
                 * si no hay data-id, intentar sacar el ID
                 * desde la URL de edición.
                 */

                if (
                    !idUsuario &&
                    boton &&
                    boton.dataset.url
                ) {

                    const coincidencias =
                        boton.dataset.url.match(
                            /\/(\d+)\/?$/
                        );


                    if (
                        coincidencias
                    ) {

                        idUsuario =
                            coincidencias[1];

                    }

                }


                formEditar.dataset.idUsuario =
                    idUsuario;

            }
        );

    }


    activar(
        document.getElementById(
            "usernameEditarAdministrador"
        ),

        "username",

        function () {

            return formEditar
                ? (
                    formEditar.dataset.idUsuario ||
                    ""
                )
                : "";

        },

        botonEditar
    );


    activar(
        document.getElementById(
            "correoEditarAdministrador"
        ),

        "correo",

        function () {

            return formEditar
                ? (
                    formEditar.dataset.idUsuario ||
                    ""
                )
                : "";

        },

        botonEditar
    );

}