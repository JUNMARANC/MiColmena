"use strict";

/* ============================================================
   USUARIOS Y ROLES
   ------------------------------------------------------------
   Responsabilidades:
   1. Gestión visual de permisos
   2. Persistencia de pestañas en la URL
   3. Selección del tipo de usuario
   4. Registro de administrador
      - Foto de perfil
      - Mostrar/ocultar contraseña
      - Validar contraseñas
      - Validación del formulario
      - Estado de envío
      - Limpieza del modal
============================================================ */


document.addEventListener(
    "DOMContentLoaded",
    function () {

        inicializarPermisosRoles();

        inicializarPestanas();

        inicializarSelectorTipoUsuario();

        inicializarModalAdministrador();

        inicializarModalEditarAdministrador();

        inicializarModalEstadoAdministrador();

        inicializarModalEliminarAdministrador();
    }
);


/* ============================================================
   1. PERMISOS DE ROLES
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

    const checkboxes =
        document.querySelectorAll(
            ".checkbox-permiso"
        );


    /*
    Esta funcionalidad solamente existe
    si estamos mostrando el formulario de roles.
    */

    if (
        !formulario ||
        !botonGuardar
    ) {
        return;
    }


    /* --------------------------------------------------------
       Estado visual inicial
    -------------------------------------------------------- */

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


    /* --------------------------------------------------------
       Estado de guardado
    -------------------------------------------------------- */

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


/* ------------------------------------------------------------
   Actualizar aspecto visual de un permiso
------------------------------------------------------------ */

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
   2. PESTAÑAS USUARIOS / ROLES
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


/* ------------------------------------------------------------
   Guardar pestaña activa en la URL
------------------------------------------------------------ */

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
   3. SELECCIONAR TIPO DE USUARIO
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


    /* --------------------------------------------------------
       Administrador
    -------------------------------------------------------- */

    if (
        botonAdministrador &&
        modalSeleccionElemento &&
        modalAdministradorElemento &&
        typeof bootstrap !== "undefined"
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


    /* --------------------------------------------------------
       Apicultor
    -------------------------------------------------------- */

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


/* ------------------------------------------------------------
   Cerrar selector y abrir modal Administrador
------------------------------------------------------------ */

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


    /*
    Bootstrap necesita terminar de cerrar
    el primer modal antes de abrir el segundo.
    */

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


/* ------------------------------------------------------------
   Ir al módulo de Apicultores
------------------------------------------------------------ */

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


    /*
    apicultor.js detectará este parámetro
    y abrirá modalAgregarApicultor.
    */

    url.searchParams.set(
        "nuevo",
        "1"
    );


    window.location.href =
        url.toString();

}


/* ============================================================
   4. MODAL REGISTRAR ADMINISTRADOR
============================================================ */

function inicializarModalAdministrador() {

    const modalElemento =
        document.getElementById(
            "modalAgregarAdministrador"
        );


    const formulario =
        document.getElementById(
            "formAgregarAdministrador"
        );


    if (
        !modalElemento ||
        !formulario
    ) {
        return;
    }


    /* --------------------------------------------------------
       Elementos
    -------------------------------------------------------- */

    const elementos = {

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

        botonGuardar:
            document.getElementById(
                "btnGuardarAdministrador"
            )

    };


    /* --------------------------------------------------------
       Foto
    -------------------------------------------------------- */

    inicializarFotoAdministrador(
        elementos
    );


    /* --------------------------------------------------------
       Mostrar / ocultar contraseña
    -------------------------------------------------------- */

    inicializarPasswordAdministrador(
        modalElemento
    );


    /* --------------------------------------------------------
       Validación de contraseñas
    -------------------------------------------------------- */

    inicializarValidacionPasswordAdministrador(
        elementos
    );


    /* --------------------------------------------------------
       Enviar formulario
    -------------------------------------------------------- */

    inicializarSubmitAdministrador(
        formulario,
        elementos
    );


    /* --------------------------------------------------------
       Limpiar al cerrar
    -------------------------------------------------------- */

    modalElemento.addEventListener(
        "hidden.bs.modal",
        function () {

            limpiarModalAdministrador(
                modalElemento,
                formulario,
                elementos
            );

        }
    );

}


/* ============================================================
   5. FOTO DEL ADMINISTRADOR
============================================================ */

function inicializarFotoAdministrador(
    elementos
) {

    const {
        inputFoto,
        botonQuitarFoto
    } = elementos;


    if (inputFoto) {

        inputFoto.addEventListener(
            "change",
            function () {

                procesarFotoAdministrador(
                    elementos
                );

            }
        );

    }


    if (botonQuitarFoto) {

        botonQuitarFoto.addEventListener(
            "click",
            function () {

                limpiarFotoAdministrador(
                    elementos
                );

            }
        );

    }

}


/* ------------------------------------------------------------
   Validar y mostrar foto
------------------------------------------------------------ */

function procesarFotoAdministrador(
    elementos
) {

    const {
        inputFoto,
        imagenPreview,
        iconoPreview,
        botonQuitarFoto
    } = elementos;


    if (!inputFoto) {
        return;
    }


    const archivo =
        inputFoto.files &&
        inputFoto.files[0];


    if (!archivo) {

        limpiarFotoAdministrador(
            elementos
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


    /* --------------------------------------------------------
       Validar tipo
    -------------------------------------------------------- */

    if (
        !tiposPermitidos.includes(
            archivo.type
        )
    ) {

        alert(
            "Selecciona una imagen en formato JPG, PNG o WEBP."
        );


        limpiarFotoAdministrador(
            elementos
        );

        return;

    }


    /* --------------------------------------------------------
       Validar tamaño
    -------------------------------------------------------- */

    if (
        archivo.size >
        tamanoMaximo
    ) {

        alert(
            "La imagen no puede superar los 5 MB."
        );


        limpiarFotoAdministrador(
            elementos
        );

        return;

    }


    /* --------------------------------------------------------
       Mostrar vista previa
    -------------------------------------------------------- */

    const lector =
        new FileReader();


    lector.addEventListener(
        "load",
        function (evento) {

            if (!imagenPreview) {
                return;
            }


            imagenPreview.src =
                evento.target.result;


            imagenPreview.classList.remove(
                "d-none"
            );


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


            limpiarFotoAdministrador(
                elementos
            );

        }
    );


    lector.readAsDataURL(
        archivo
    );

}


/* ------------------------------------------------------------
   Limpiar fotografía
------------------------------------------------------------ */

function limpiarFotoAdministrador(
    elementos
) {

    const {
        inputFoto,
        imagenPreview,
        iconoPreview,
        botonQuitarFoto
    } = elementos;


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
   6. MOSTRAR / OCULTAR CONTRASEÑAS
============================================================ */

function inicializarPasswordAdministrador(
    modalElemento
) {

    /*
    Utilizamos delegación de eventos.

    Ventaja:
    No necesitamos crear un listener
    independiente para cada botón.
    */

    modalElemento.addEventListener(
        "click",
        function (evento) {

            const boton =
                evento.target.closest(
                    ".btn-password-administrador"
                );


            if (!boton) {
                return;
            }


            evento.preventDefault();

            evento.stopPropagation();


            cambiarVisibilidadPassword(
                modalElemento,
                boton
            );

        }
    );

}


/* ------------------------------------------------------------
   Cambiar visibilidad de un campo
------------------------------------------------------------ */

function cambiarVisibilidadPassword(
    modalElemento,
    boton
) {

    const idInput =
        boton.dataset
            .passwordTarget;


    if (!idInput) {

        console.error(
            "El botón no tiene data-password-target."
        );

        return;

    }


    const input =
        modalElemento.querySelector(
            `#${idInput}`
        );


    if (!input) {

        console.error(
            `No se encontró el input ${idInput}.`
        );

        return;

    }


    const icono =
        boton.querySelector(
            "i"
        );


    const estaOculta =
        input.type ===
        "password";


    /* --------------------------------------------------------
       Cambiar input
    -------------------------------------------------------- */

    input.type =
        estaOculta
            ? "text"
            : "password";


    /* --------------------------------------------------------
       Cambiar icono
    -------------------------------------------------------- */

    if (icono) {

        icono.classList.toggle(
            "bi-eye-fill",
            !estaOculta
        );


        icono.classList.toggle(
            "bi-eye-slash-fill",
            estaOculta
        );

    }


    /* --------------------------------------------------------
       Accesibilidad
    -------------------------------------------------------- */

    const textoAccion =
        estaOculta
            ? "Ocultar contraseña"
            : "Mostrar contraseña";


    boton.setAttribute(
        "aria-label",
        textoAccion
    );


    boton.setAttribute(
        "title",
        textoAccion
    );

}


/* ============================================================
   7. VALIDAR CONTRASEÑAS
============================================================ */

function inicializarValidacionPasswordAdministrador(
    elementos
) {

    const {
        password,
        confirmarPassword
    } = elementos;


    if (password) {

        password.addEventListener(
            "input",
            function () {

                validarContrasenasAdministrador(
                    elementos
                );

            }
        );

    }


    if (confirmarPassword) {

        confirmarPassword.addEventListener(
            "input",
            function () {

                validarContrasenasAdministrador(
                    elementos
                );

            }
        );

    }

}


/* ------------------------------------------------------------
   Comparar contraseña y confirmación
------------------------------------------------------------ */

function validarContrasenasAdministrador(
    elementos
) {

    const {
        password,
        confirmarPassword,
        mensajePassword
    } = elementos;


    if (
        !password ||
        !confirmarPassword
    ) {
        return true;
    }


    const clave =
        password.value;


    const confirmacion =
        confirmarPassword.value;


    confirmarPassword.setCustomValidity(
        ""
    );


    confirmarPassword.classList.remove(
        "is-invalid",
        "is-valid"
    );


    /* --------------------------------------------------------
       Confirmación vacía
    -------------------------------------------------------- */

    if (!confirmacion) {

        if (mensajePassword) {

            mensajePassword.classList.add(
                "d-none"
            );

        }


        return true;

    }


    /* --------------------------------------------------------
       No coinciden
    -------------------------------------------------------- */

    if (
        clave !==
        confirmacion
    ) {

        confirmarPassword.setCustomValidity(
            "Las contraseñas no coinciden."
        );


        confirmarPassword.classList.add(
            "is-invalid"
        );


        if (mensajePassword) {

            mensajePassword.classList.remove(
                "d-none"
            );

        }


        return false;

    }


    /* --------------------------------------------------------
       Correctas
    -------------------------------------------------------- */

    confirmarPassword.classList.add(
        "is-valid"
    );


    if (mensajePassword) {

        mensajePassword.classList.add(
            "d-none"
        );

    }


    return true;

}


/* ============================================================
   8. ENVÍO DEL FORMULARIO
============================================================ */

function inicializarSubmitAdministrador(
    formulario,
    elementos
) {

    formulario.addEventListener(
        "submit",
        function (evento) {

            const contrasenasValidas =
                validarContrasenasAdministrador(
                    elementos
                );


            const formularioValido =
                formulario.checkValidity();


            if (
                !contrasenasValidas ||
                !formularioValido
            ) {

                evento.preventDefault();

                evento.stopPropagation();


                formulario.classList.add(
                    "was-validated"
                );


                /*
                Mostrar mensajes nativos
                del navegador.
                */

                formulario.reportValidity();


                return;

            }


            activarEstadoRegistrando(
                elementos.botonGuardar
            );

        }
    );

}


/* ------------------------------------------------------------
   Estado visual mientras se registra
------------------------------------------------------------ */

function activarEstadoRegistrando(
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
   9. LIMPIAR MODAL ADMINISTRADOR
============================================================ */

function limpiarModalAdministrador(
    modalElemento,
    formulario,
    elementos
) {

    /* --------------------------------------------------------
       Formulario
    -------------------------------------------------------- */

    formulario.reset();


    formulario.classList.remove(
        "was-validated"
    );


    /* --------------------------------------------------------
       Foto
    -------------------------------------------------------- */

    limpiarFotoAdministrador(
        elementos
    );


    /* --------------------------------------------------------
       Contraseñas
    -------------------------------------------------------- */

    limpiarEstadoContrasenas(
        elementos
    );


    /* --------------------------------------------------------
       Botones de mostrar contraseña
    -------------------------------------------------------- */

    restaurarBotonesPassword(
        modalElemento
    );


    /* --------------------------------------------------------
       Botón guardar
    -------------------------------------------------------- */

    restaurarBotonGuardarAdministrador(
        elementos.botonGuardar
    );

}


/* ------------------------------------------------------------
   Limpiar estado de los passwords
------------------------------------------------------------ */

function limpiarEstadoContrasenas(
    elementos
) {

    const {
        password,
        confirmarPassword,
        mensajePassword
    } = elementos;


    if (password) {

        password.type =
            "password";


        password.setCustomValidity(
            ""
        );

    }


    if (confirmarPassword) {

        confirmarPassword.type =
            "password";


        confirmarPassword.setCustomValidity(
            ""
        );


        confirmarPassword.classList.remove(
            "is-invalid",
            "is-valid"
        );

    }


    if (mensajePassword) {

        mensajePassword.classList.add(
            "d-none"
        );

    }

}


/* ------------------------------------------------------------
   Restaurar ojitos
------------------------------------------------------------ */

function restaurarBotonesPassword(
    modalElemento
) {

    const botones =
        modalElemento.querySelectorAll(
            ".btn-password-administrador"
        );


    botones.forEach(
        function (boton) {

            const idInput =
                boton.dataset
                    .passwordTarget;


            const input =
                idInput
                    ? modalElemento.querySelector(
                        `#${idInput}`
                    )
                    : null;


            const icono =
                boton.querySelector(
                    "i"
                );


            if (input) {

                input.type =
                    "password";

            }


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


/* ------------------------------------------------------------
   Restaurar botón registrar
------------------------------------------------------------ */

function restaurarBotonGuardarAdministrador(
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
   10. MODAL EDITAR ADMINISTRADOR
============================================================ */

function inicializarModalEditarAdministrador() {

    const modalElemento =
        document.getElementById(
            "modalEditarAdministrador"
        );


    const formulario =
        document.getElementById(
            "formEditarAdministrador"
        );


    if (
        !modalElemento ||
        !formulario
    ) {
        return;
    }


    /* ========================================================
       CAMPOS
    ======================================================== */

    const nombres =
        document.getElementById(
            "nombresEditarAdministrador"
        );

    const apellidos =
        document.getElementById(
            "apellidosEditarAdministrador"
        );

    const celular =
        document.getElementById(
            "celularEditarAdministrador"
        );

    const correo =
        document.getElementById(
            "correoEditarAdministrador"
        );

    const nivelAcceso =
        document.getElementById(
            "nivelAccesoEditarAdministrador"
        );

    const username =
        document.getElementById(
            "usernameEditarAdministrador"
        );


    /* --------------------------------------------------------
       Estado
    -------------------------------------------------------- */

    const usuarioActivo =
        document.getElementById(
            "usuarioActivoEditarAdministrador"
        );

    const textoEstado =
        document.getElementById(
            "textoEstadoEditarAdministrador"
        );


    /* --------------------------------------------------------
       Foto
    -------------------------------------------------------- */

    const inputFoto =
        document.getElementById(
            "fotoperfilEditarAdministrador"
        );

    const imagenPreview =
        document.getElementById(
            "imagenPreviewEditarAdministrador"
        );

    const iconoPreview =
        document.getElementById(
            "iconoPreviewEditarAdministrador"
        );

    const botonQuitarFoto =
        document.getElementById(
            "btnQuitarFotoEditarAdministrador"
        );

    const eliminarFoto =
        document.getElementById(
            "eliminarFotoEditarAdministrador"
        );


    /* --------------------------------------------------------
       Contraseña
    -------------------------------------------------------- */

    const password =
        document.getElementById(
            "passwordEditarAdministrador"
        );

    const confirmarPassword =
        document.getElementById(
            "confirmarPasswordEditarAdministrador"
        );

    const mensajePassword =
        document.getElementById(
            "mensajePasswordEditarAdministrador"
        );


    /* --------------------------------------------------------
       Guardar
    -------------------------------------------------------- */

    const botonGuardar =
        document.getElementById(
            "btnGuardarEdicionAdministrador"
        );


    let fotoOriginal = "";


    /* ========================================================
       ABRIR MODAL Y CARGAR DATOS
    ======================================================== */

    modalElemento.addEventListener(
        "show.bs.modal",
        function (evento) {

            const boton =
                evento.relatedTarget;


            if (!boton) {
                return;
            }


            /* ------------------------------------------------
               URL DEL FORMULARIO
            ------------------------------------------------ */

            formulario.action =
                boton.dataset.url
                || "";


            /* ------------------------------------------------
               DATOS PERSONALES
            ------------------------------------------------ */

            asignarValorCampo(
                nombres,
                boton.dataset.nombres
            );


            asignarValorCampo(
                apellidos,
                boton.dataset.apellidos
            );


            asignarValorCampo(
                celular,
                boton.dataset.celular
            );


            asignarValorCampo(
                correo,
                boton.dataset.correo
            );


            asignarValorCampo(
                username,
                boton.dataset.username
            );


            if (nivelAcceso) {

                nivelAcceso.value =
                    boton.dataset.nivelAcceso
                    || "Alto";

            }


            /* ------------------------------------------------
               ESTADO
            ------------------------------------------------ */

            if (usuarioActivo) {

                usuarioActivo.checked =
                    boton.dataset.activo
                    === "1";

            }


            actualizarTextoEstadoAdministrador();


            /* ------------------------------------------------
               FOTO
            ------------------------------------------------ */

            fotoOriginal =
                boton.dataset.foto
                || "";


            if (eliminarFoto) {

                eliminarFoto.value =
                    "0";

            }


            if (inputFoto) {

                inputFoto.value =
                    "";

            }


            mostrarFotoEditarAdministrador(
                fotoOriginal
            );


            /* ------------------------------------------------
               CONTRASEÑAS
            ------------------------------------------------ */

            if (password) {

                password.value =
                    "";

                password.type =
                    "password";

            }


            if (confirmarPassword) {

                confirmarPassword.value =
                    "";

                confirmarPassword.type =
                    "password";

                confirmarPassword
                    .setCustomValidity(
                        ""
                    );


                confirmarPassword
                    .classList.remove(
                        "is-invalid",
                        "is-valid"
                    );

            }


            if (mensajePassword) {

                mensajePassword
                    .classList.add(
                        "d-none"
                    );

            }


            restaurarBotonesPasswordEditarAdministrador();

        }
    );


    /* ========================================================
       ESTADO ACTIVO
    ======================================================== */

    function actualizarTextoEstadoAdministrador() {

        if (
            !usuarioActivo ||
            !textoEstado
        ) {
            return;
        }


        textoEstado.textContent =
            usuarioActivo.checked
                ? "Usuario activo"
                : "Usuario inactivo";

    }


    if (usuarioActivo) {

        usuarioActivo.addEventListener(
            "change",
            actualizarTextoEstadoAdministrador
        );

    }


    /* ========================================================
       FOTO
    ======================================================== */

    function mostrarFotoEditarAdministrador(
        urlFoto
    ) {

        if (urlFoto) {

            if (imagenPreview) {

                imagenPreview.src =
                    urlFoto;

                imagenPreview
                    .classList.remove(
                        "d-none"
                    );

            }


            if (iconoPreview) {

                iconoPreview
                    .classList.add(
                        "d-none"
                    );

            }


            if (botonQuitarFoto) {

                botonQuitarFoto
                    .classList.remove(
                        "d-none"
                    );

            }


            return;
        }


        if (imagenPreview) {

            imagenPreview
                .removeAttribute(
                    "src"
                );

            imagenPreview
                .classList.add(
                    "d-none"
                );

        }


        if (iconoPreview) {

            iconoPreview
                .classList.remove(
                    "d-none"
                );

        }


        if (botonQuitarFoto) {

            botonQuitarFoto
                .classList.add(
                    "d-none"
                );

        }

    }


    /* --------------------------------------------------------
       Seleccionar nueva foto
    -------------------------------------------------------- */

    if (inputFoto) {

        inputFoto.addEventListener(
            "change",
            function () {

                const archivo =
                    inputFoto.files &&
                    inputFoto.files[0];


                if (!archivo) {

                    mostrarFotoEditarAdministrador(
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


                    inputFoto.value =
                        "";


                    mostrarFotoEditarAdministrador(
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


                    inputFoto.value =
                        "";


                    mostrarFotoEditarAdministrador(
                        fotoOriginal
                    );


                    return;

                }


                const lector =
                    new FileReader();


                lector.addEventListener(
                    "load",
                    function (eventoLectura) {

                        mostrarFotoEditarAdministrador(
                            eventoLectura.target.result
                        );


                        if (eliminarFoto) {

                            eliminarFoto.value =
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


                        inputFoto.value =
                            "";


                        mostrarFotoEditarAdministrador(
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


    /* --------------------------------------------------------
       Quitar foto
    -------------------------------------------------------- */

    if (botonQuitarFoto) {

        botonQuitarFoto.addEventListener(
            "click",
            function () {

                if (inputFoto) {

                    inputFoto.value =
                        "";

                }


                if (eliminarFoto) {

                    eliminarFoto.value =
                        "1";

                }


                mostrarFotoEditarAdministrador(
                    ""
                );

            }
        );

    }


    /* ========================================================
       MOSTRAR / OCULTAR CONTRASEÑA
    ======================================================== */

    modalElemento.addEventListener(
        "click",
        function (evento) {

            const boton =
                evento.target.closest(
                    ".btn-password-editar-administrador"
                );


            if (!boton) {
                return;
            }


            evento.preventDefault();


            const idInput =
                boton.dataset
                    .passwordTarget;


            const input =
                document.getElementById(
                    idInput
                );


            if (!input) {
                return;
            }


            const icono =
                boton.querySelector(
                    "i"
                );


            const estaOculta =
                input.type ===
                "password";


            input.type =
                estaOculta
                    ? "text"
                    : "password";


            if (icono) {

                icono.classList.toggle(
                    "bi-eye-fill",
                    !estaOculta
                );


                icono.classList.toggle(
                    "bi-eye-slash-fill",
                    estaOculta
                );

            }

        }
    );


    /* ========================================================
       VALIDAR CONTRASEÑAS
    ======================================================== */

    function validarPasswordEditarAdministrador() {

        if (
            !password ||
            !confirmarPassword
        ) {
            return true;
        }


        const clave =
            password.value;


        const confirmacion =
            confirmarPassword.value;


        password.setCustomValidity(
            ""
        );


        confirmarPassword
            .setCustomValidity(
                ""
            );


        confirmarPassword
            .classList.remove(
                "is-invalid",
                "is-valid"
            );


        /*
        No desea cambiar contraseña.
        */

        if (
            !clave &&
            !confirmacion
        ) {

            if (mensajePassword) {

                mensajePassword
                    .classList.add(
                        "d-none"
                    );

            }


            return true;

        }


        /*
        Contraseña demasiado corta.
        */

        if (
            clave.length <
            8
        ) {

            password.setCustomValidity(
                "La contraseña debe tener mínimo 8 caracteres."
            );


            return false;

        }


        /*
        No coinciden.
        */

        if (
            !confirmacion ||
            clave !==
            confirmacion
        ) {

            confirmarPassword
                .setCustomValidity(
                    "Las contraseñas no coinciden."
                );


            confirmarPassword
                .classList.add(
                    "is-invalid"
                );


            if (mensajePassword) {

                mensajePassword
                    .classList.remove(
                        "d-none"
                    );

            }


            return false;

        }


        confirmarPassword
            .classList.add(
                "is-valid"
            );


        if (mensajePassword) {

            mensajePassword
                .classList.add(
                    "d-none"
                );

        }


        return true;

    }


    if (password) {

        password.addEventListener(
            "input",
            validarPasswordEditarAdministrador
        );

    }


    if (confirmarPassword) {

        confirmarPassword.addEventListener(
            "input",
            validarPasswordEditarAdministrador
        );

    }


    /* ========================================================
       SUBMIT
    ======================================================== */

    formulario.addEventListener(
        "submit",
        function (evento) {

            const passwordValido =
                validarPasswordEditarAdministrador();


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


            if (botonGuardar) {

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

        }
    );


    /* ========================================================
       LIMPIAR AL CERRAR
    ======================================================== */

    modalElemento.addEventListener(
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


            if (inputFoto) {

                inputFoto.value =
                    "";

            }


            if (eliminarFoto) {

                eliminarFoto.value =
                    "0";

            }


            mostrarFotoEditarAdministrador(
                ""
            );


            if (password) {

                password.value =
                    "";

                password.type =
                    "password";

                password.setCustomValidity(
                    ""
                );

            }


            if (confirmarPassword) {

                confirmarPassword.value =
                    "";

                confirmarPassword.type =
                    "password";

                confirmarPassword
                    .setCustomValidity(
                        ""
                    );


                confirmarPassword
                    .classList.remove(
                        "is-invalid",
                        "is-valid"
                    );

            }


            if (mensajePassword) {

                mensajePassword
                    .classList.add(
                        "d-none"
                    );

            }


            restaurarBotonesPasswordEditarAdministrador();


            if (botonGuardar) {

                botonGuardar.disabled =
                    false;


                botonGuardar.innerHTML = `
                    <i class="
                        bi
                        bi-floppy-fill
                        me-2
                    "></i>

                    Guardar cambios
                `;

            }

        }
    );


    /* ========================================================
       FUNCIONES AUXILIARES
    ======================================================== */

    function asignarValorCampo(
        elemento,
        valor
    ) {

        if (!elemento) {
            return;
        }


        elemento.value =
            valor || "";

    }


    function restaurarBotonesPasswordEditarAdministrador() {

        const botones =
            modalElemento
                .querySelectorAll(
                    ".btn-password-editar-administrador"
                );


        botones.forEach(
            function (boton) {

                const icono =
                    boton.querySelector(
                        "i"
                    );


                if (icono) {

                    icono.classList.remove(
                        "bi-eye-slash-fill"
                    );


                    icono.classList.add(
                        "bi-eye-fill"
                    );

                }

            }
        );

    }

}

/* ============================================================
   11. ACTIVAR / DESACTIVAR ADMINISTRADOR
============================================================ */

function inicializarModalEstadoAdministrador() {

    const modalElemento =
        document.getElementById(
            "modalEstadoAdministrador"
        );


    const formulario =
        document.getElementById(
            "formEstadoAdministrador"
        );


    if (
        !modalElemento ||
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

    modalElemento.addEventListener(
        "show.bs.modal",
        function (evento) {

            const boton =
                evento.relatedTarget;


            if (!boton) {
                return;
            }


            const url =
                boton.dataset.url
                || "";


            const nombre =
                boton.dataset.nombre
                || "Administrador";


            const actualmenteActivo =
                boton.dataset.activo
                === "1";


            /*
            Si actualmente está activo,
            la acción será desactivarlo.

            Si actualmente está inactivo,
            la acción será activarlo.
            */

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

    modalElemento.addEventListener(
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
   12. ELIMINAR ADMINISTRADOR
============================================================ */

function inicializarModalEliminarAdministrador() {

    const modalElemento =
        document.getElementById(
            "modalEliminarAdministrador"
        );


    const formulario =
        document.getElementById(
            "formEliminarAdministrador"
        );


    if (
        !modalElemento ||
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

    modalElemento.addEventListener(
        "show.bs.modal",
        function (evento) {

            const boton =
                evento.relatedTarget;


            if (!boton) {
                return;
            }


            const url =
                boton.dataset.url
                || "";


            const nombre =
                boton.dataset.nombre
                || "Administrador";


            const username =
                boton.dataset.username
                || "";


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

    modalElemento.addEventListener(
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