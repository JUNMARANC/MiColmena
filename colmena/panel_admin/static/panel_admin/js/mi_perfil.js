"use strict";

/* ============================================================
   MI PERFIL
   ------------------------------------------------------------
   Responsabilidades:
   1. Vista previa y eliminación de foto
   2. Mostrar / ocultar contraseñas
   3. Validación de nueva contraseña
   4. Validación de formularios
   5. Estado de envío de botones
============================================================ */


document.addEventListener(
    "DOMContentLoaded",
    function () {

        inicializarFotoPerfil();

        inicializarVisibilidadPasswords();

        inicializarValidacionPassword();

        inicializarValidacionPasswordActual();

        inicializarValidacionPasswordDjango();

        inicializarFormularioPerfil();

        inicializarValidacionCorreoPerfil();

        inicializarValidacionDatosPersonales();

        inicializarFormularioPassword();

        inicializarAvisoCambiosPerfil();

    }
);


/* ============================================================
   1. FOTO DE PERFIL
============================================================ */

function inicializarFotoPerfil() {

    const inputFoto =
        document.getElementById(
            "fotoperfil"
        );


    const imagenPreview =
        document.getElementById(
            "imagenPreviewPerfil"
        );


    const iconoPreview =
        document.getElementById(
            "iconoPreviewPerfil"
        );


    const fotoPrincipal =
        document.getElementById(
            "fotoPerfilPrincipal"
        );


    const iconoPrincipal =
        document.getElementById(
            "iconoPerfilPrincipal"
        );


    const botonQuitar =
        document.getElementById(
            "btnQuitarFotoPerfil"
        );


    const eliminarFoto =
        document.getElementById(
            "eliminarFotoPerfil"
        );


    if (!inputFoto) {
        return;
    }


    /* --------------------------------------------------------
       Seleccionar nueva foto
    -------------------------------------------------------- */

    inputFoto.addEventListener(
        "change",
        function () {

            const archivo =
                inputFoto.files &&
                inputFoto.files[0];


            if (!archivo) {
                return;
            }


            const tiposPermitidos = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];


            const tamanoMaximo =
                5 * 1024 * 1024;


            /* ------------------------------------------------
               Validar formato
            ------------------------------------------------ */

            if (
                !tiposPermitidos.includes(
                    archivo.type
                )
            ) {

                alert(
                    "Selecciona una imagen en formato JPG, PNG o WEBP."
                );

                inputFoto.value =
                    "";

                return;

            }


            /* ------------------------------------------------
               Validar tamaño
            ------------------------------------------------ */

            if (
                archivo.size >
                tamanoMaximo
            ) {

                alert(
                    "La imagen no puede superar los 5 MB."
                );

                inputFoto.value =
                    "";

                return;

            }


            /* ------------------------------------------------
               Mostrar vista previa
            ------------------------------------------------ */

            const lector =
                new FileReader();


            lector.addEventListener(
                "load",
                function (evento) {

                    const resultado =
                        evento.target.result;


                    mostrarImagenPerfil(
                        imagenPreview,
                        iconoPreview,
                        resultado
                    );


                    mostrarImagenPerfil(
                        fotoPrincipal,
                        iconoPrincipal,
                        resultado
                    );


                    if (fotoPrincipal) {

                        const contenedorAvatar =
                            fotoPrincipal.closest(".perfil-avatar-principal");

                        if (contenedorAvatar) {

                            contenedorAvatar.classList.remove(
                                "avatar-actualizado"
                            );

                            void contenedorAvatar.offsetWidth;

                            contenedorAvatar.classList.add(
                                "avatar-actualizado"
                            );

                        }

                    }


                    if (botonQuitar) {

                        botonQuitar.classList.remove(
                            "d-none"
                        );

                    }


                    /*
                    Si había marcado eliminar foto,
                    una nueva selección lo cancela.
                    */

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
                        "No fue posible cargar la vista previa de la imagen."
                    );

                    inputFoto.value =
                        "";

                }
            );


            lector.readAsDataURL(
                archivo
            );

        }
    );


    /* --------------------------------------------------------
       Quitar foto
    -------------------------------------------------------- */

    if (botonQuitar) {

        botonQuitar.addEventListener(
            "click",
            function () {

                inputFoto.value =
                    "";


                if (eliminarFoto) {

                    eliminarFoto.value =
                        "1";

                }


                ocultarImagenPerfil(
                    imagenPreview,
                    iconoPreview
                );


                ocultarImagenPerfil(
                    fotoPrincipal,
                    iconoPrincipal
                );


                botonQuitar.classList.add(
                    "d-none"
                );

            }
        );

    }

}


/* ------------------------------------------------------------
   Mostrar imagen y ocultar icono
------------------------------------------------------------ */

function mostrarImagenPerfil(
    imagen,
    icono,
    src
) {

    if (imagen) {

        imagen.src =
            src;


        imagen.classList.remove(
            "d-none"
        );

    }


    if (icono) {

        icono.classList.add(
            "d-none"
        );

    }

}


/* ------------------------------------------------------------
   Ocultar imagen y mostrar icono
------------------------------------------------------------ */

function ocultarImagenPerfil(
    imagen,
    icono
) {

    if (imagen) {

        imagen.removeAttribute(
            "src"
        );


        imagen.classList.add(
            "d-none"
        );

    }


    if (icono) {

        icono.classList.remove(
            "d-none"
        );

    }

}


/* ============================================================
   2. MOSTRAR / OCULTAR CONTRASEÑAS
============================================================ */

function inicializarVisibilidadPasswords() {

    const botones =
        document.querySelectorAll(
            ".btn-password-perfil"
        );


    botones.forEach(
        function (boton) {

            boton.addEventListener(
                "click",
                function () {

                    const idInput =
                        boton.dataset
                            .passwordTarget;


                    if (!idInput) {
                        return;
                    }


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


                    const texto =
                        estaOculta
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña";


                    boton.setAttribute(
                        "aria-label",
                        texto
                    );


                    boton.setAttribute(
                        "title",
                        texto
                    );

                }
            );

        }
    );

}


/* ============================================================
   3. VALIDACIÓN DE CONTRASEÑA
============================================================ */

function inicializarValidacionPassword() {

    const passwordNuevo =
        document.getElementById(
            "passwordNuevoPerfil"
        );


    const confirmarPassword =
        document.getElementById(
            "confirmarPasswordPerfil"
        );


    if (
        !passwordNuevo ||
        !confirmarPassword
    ) {
        return;
    }


    passwordNuevo.addEventListener(
        "input",
        validarPasswordPerfil
    );


    confirmarPassword.addEventListener(
        "input",
        validarPasswordPerfil
    );

}


/* ------------------------------------------------------------
   Validar nueva contraseña
------------------------------------------------------------ */

function validarPasswordPerfil() {

    const passwordNuevo =
        document.getElementById(
            "passwordNuevoPerfil"
        );


    const confirmarPassword =
        document.getElementById(
            "confirmarPasswordPerfil"
        );


    const mensajeError =
        document.getElementById(
            "mensajePasswordPerfil"
        );


    const estadoPassword =
        document.getElementById(
            "estadoPasswordPerfil"
        );


    const iconoLongitud =
        document.getElementById(
            "iconoLongitudPassword"
        );


    const iconoCoincidencia =
        document.getElementById(
            "iconoCoincidenciaPassword"
        );


    if (
        !passwordNuevo ||
        !confirmarPassword
    ) {
        return false;
    }


    const clave =
        passwordNuevo.value;


    const confirmacion =
        confirmarPassword.value;


    const longitudCorrecta =
        clave.length >= 8;


    const coinciden =
        clave !== "" &&
        confirmacion !== "" &&
        clave === confirmacion;


    /* --------------------------------------------------------
       Medidor de fuerza
    -------------------------------------------------------- */

    const medidorFuerza =
        document.getElementById(
            "medidorFuerzaPassword"
        );

    const textoFuerza =
        document.getElementById(
            "perfilFuerzaTexto"
        );

    if (medidorFuerza) {

        if (!clave) {

            medidorFuerza.classList.add("d-none");

        } else {

            medidorFuerza.classList.remove("d-none");

            let puntos = 0;

            if (clave.length >= 8) puntos++;
            if (clave.length >= 12) puntos++;
            if (/[A-Z]/.test(clave) && /[a-z]/.test(clave)) puntos++;
            if (/[0-9]/.test(clave)) puntos++;
            if (/[^A-Za-z0-9]/.test(clave)) puntos++;

            medidorFuerza.classList.remove(
                "fuerza-debil",
                "fuerza-media",
                "fuerza-fuerte"
            );

            const abejaFuerte = document.getElementById("perfilAbejaFuerte");

            if (puntos <= 2) {
                medidorFuerza.classList.add("fuerza-debil");
                if (textoFuerza) textoFuerza.textContent = "Contraseña débil";
                if (abejaFuerte) abejaFuerte.classList.add("d-none");
            } else if (puntos <= 3) {
                medidorFuerza.classList.add("fuerza-media");
                if (textoFuerza) textoFuerza.textContent = "Contraseña media";
                if (abejaFuerte) abejaFuerte.classList.add("d-none");
            } else {
                medidorFuerza.classList.add("fuerza-fuerte");
                if (textoFuerza) textoFuerza.textContent = "Contraseña fuerte";
                if (abejaFuerte) abejaFuerte.classList.remove("d-none");
            }

        }

    }


    /* --------------------------------------------------------
       Mostrar bloque de validación
    -------------------------------------------------------- */

    if (estadoPassword) {

        if (
            clave ||
            confirmacion
        ) {

            estadoPassword.classList.remove(
                "d-none"
            );

        } else {

            estadoPassword.classList.add(
                "d-none"
            );

        }

    }


    /* --------------------------------------------------------
       Regla: longitud
    -------------------------------------------------------- */

    actualizarReglaPassword(
        iconoLongitud,
        longitudCorrecta
    );


    /* --------------------------------------------------------
       Regla: coincidencia
    -------------------------------------------------------- */

    actualizarReglaPassword(
        iconoCoincidencia,
        coinciden
    );


    /* --------------------------------------------------------
       Validación nativa del navegador
    -------------------------------------------------------- */

    confirmarPassword.setCustomValidity(
        ""
    );


    confirmarPassword.classList.remove(
        "is-invalid",
        "is-valid"
    );


    if (
        confirmacion &&
        clave !== confirmacion
    ) {

        confirmarPassword.setCustomValidity(
            "Las contraseñas no coinciden."
        );


        confirmarPassword.classList.add(
            "is-invalid"
        );


        if (mensajeError) {

            mensajeError.classList.remove(
                "d-none"
            );

        }


        return false;

    }


    if (
        confirmacion &&
        coinciden
    ) {

        confirmarPassword.classList.add(
            "is-valid"
        );

    }


    if (mensajeError) {

        mensajeError.classList.add(
            "d-none"
        );

    }


    return (
        longitudCorrecta &&
        coinciden
    );

}


/* ------------------------------------------------------------
   Actualizar icono de una regla
------------------------------------------------------------ */

function actualizarReglaPassword(
    icono,
    correcta
) {

    if (!icono) {
        return;
    }


    const contenedor =
        icono.closest(
            ".perfil-password-regla"
        );


    icono.classList.remove(
        "bi-circle",
        "bi-check-circle-fill",
        "bi-x-circle-fill"
    );


    if (contenedor) {

        contenedor.classList.remove(
            "regla-correcta",
            "regla-error"
        );

    }


    if (correcta) {

        icono.classList.add(
            "bi-check-circle-fill"
        );


        if (contenedor) {

            contenedor.classList.add(
                "regla-correcta"
            );

        }


        return;

    }


    icono.classList.add(
        "bi-x-circle-fill"
    );


    if (contenedor) {

        contenedor.classList.add(
            "regla-error"
        );

    }

}

/* ============================================================
   VALIDACIÓN DE CONTRASEÑA ACTUAL
============================================================ */

function inicializarValidacionPasswordActual() {

    const passwordActual =
        document.getElementById(
            "passwordActualPerfil"
        );


    const formulario =
        document.getElementById(
            "formCambiarPasswordPerfil"
        );


    const mensaje =
        document.getElementById(
            "mensajePasswordActualPerfil"
        );


    if (
        !passwordActual ||
        !formulario ||
        !mensaje
    ) {
        return;
    }


    const urlVerificar =
        passwordActual.dataset.urlVerificar;


    const csrfInput =
        formulario.querySelector(
            'input[name="csrfmiddlewaretoken"]'
        );


    if (
        !urlVerificar ||
        !csrfInput
    ) {
        return;
    }


    /* ========================================================
       VALIDAR
    ======================================================== */

    async function validarPasswordActual() {

        const clave =
            passwordActual.value;


        passwordActual.setCustomValidity("");

        passwordActual.classList.remove(
            "is-valid",
            "is-invalid"
        );


        mensaje.classList.add(
            "d-none"
        );

        mensaje.classList.remove(
            "text-success",
            "text-danger"
        );


        if (!clave) {

            passwordActual.setCustomValidity(
                "La contraseña actual es obligatoria."
            );


            passwordActual.classList.add(
                "is-invalid"
            );


            mostrarMensajePasswordActual(
                "La contraseña actual es obligatoria.",
                false
            );


            return false;
        }


        const datosFormulario =
            new FormData();


        datosFormulario.append(
            "password_actual",
            clave
        );


        try {

            const respuesta =
                await fetch(
                    urlVerificar,
                    {
                        method: "POST",

                        headers: {
                            "X-CSRFToken":
                                csrfInput.value,

                            "X-Requested-With":
                                "XMLHttpRequest"
                        },

                        body:
                            datosFormulario
                    }
                );


            if (!respuesta.ok) {

                throw new Error(
                    "No fue posible verificar la contraseña actual."
                );

            }


            const datos =
                await respuesta.json();


            if (!datos.valido) {

                passwordActual.setCustomValidity(
                    datos.mensaje
                );


                passwordActual.classList.add(
                    "is-invalid"
                );


                mostrarMensajePasswordActual(
                    datos.mensaje,
                    false
                );


                return false;
            }


            passwordActual.setCustomValidity("");


            passwordActual.classList.add(
                "is-valid"
            );


            mostrarMensajePasswordActual(
                datos.mensaje,
                true
            );


            return true;


        } catch (error) {

            passwordActual.setCustomValidity(
                "No fue posible verificar la contraseña actual."
            );


            passwordActual.classList.add(
                "is-invalid"
            );


            mostrarMensajePasswordActual(
                "No fue posible verificar la contraseña actual.",
                false
            );


            return false;

        }

    }


    /* ========================================================
       AL MODIFICARLA
    ======================================================== */

    passwordActual.addEventListener(
        "input",
        function () {

            passwordActual.setCustomValidity("");

            passwordActual.classList.remove(
                "is-valid",
                "is-invalid"
            );


            mensaje.classList.add(
                "d-none"
            );

        }
    );


    /* ========================================================
       VALIDAR AL SALIR DEL CAMPO
    ======================================================== */

    passwordActual.addEventListener(
        "blur",
        validarPasswordActual
    );


    /* ========================================================
       EXPONER PARA EL SUBMIT
    ======================================================== */

    passwordActual.validarPasswordActualPerfil =
        validarPasswordActual;


    function mostrarMensajePasswordActual(
        texto,
        valido
    ) {

        mensaje.textContent =
            texto;


        mensaje.classList.remove(
            "d-none",
            "text-success",
            "text-danger"
        );


        mensaje.classList.add(
            valido
                ? "text-success"
                : "text-danger"
        );

    }

}

/* ============================================================
   VALIDACIÓN DE CONTRASEÑA CON DJANGO
============================================================ */

function inicializarValidacionPasswordDjango() {

    const passwordNuevo =
        document.getElementById(
            "passwordNuevoPerfil"
        );


    const formulario =
        document.getElementById(
            "formCambiarPasswordPerfil"
        );


    const contenedorMensajes =
        document.getElementById(
            "mensajesPasswordDjangoPerfil"
        );


    if (
        !passwordNuevo ||
        !formulario ||
        !contenedorMensajes
    ) {
        return;
    }


    const urlVerificar =
        passwordNuevo.dataset
            .urlVerificar;


    if (!urlVerificar) {
        return;
    }


    const csrfInput =
        formulario.querySelector(
            'input[name="csrfmiddlewaretoken"]'
        );


    if (!csrfInput) {
        return;
    }


    let temporizador = null;

    let controladorPeticion = null;


    /* ========================================================
       CONSULTAR DJANGO
    ======================================================== */

    async function validarPasswordDjango() {

        clearTimeout(
            temporizador
        );

        temporizador = null;

        const clave =
            passwordNuevo.value;


        passwordNuevo.setCustomValidity("");


        contenedorMensajes.classList.add(
            "d-none"
        );


        contenedorMensajes.classList.remove(
            "text-success",
            "text-danger"
        );


        /* ----------------------------------------------------
           VACÍA
        ---------------------------------------------------- */

        if (!clave) {

            passwordNuevo.setCustomValidity(
                "La nueva contraseña es obligatoria."
            );


            passwordNuevo.classList.remove(
                "is-valid"
            );


            passwordNuevo.classList.add(
                "is-invalid"
            );


            mostrarMensajesPasswordDjango(
                contenedorMensajes,
                [
                    "La nueva contraseña es obligatoria."
                ],
                false
            );


            return false;
        }


        /* ----------------------------------------------------
           MÍNIMO LOCAL
        ---------------------------------------------------- */

        if (clave.length < 8) {

            passwordNuevo.setCustomValidity(
                "La contraseña debe tener al menos 8 caracteres."
            );


            passwordNuevo.classList.remove(
                "is-valid"
            );


            passwordNuevo.classList.add(
                "is-invalid"
            );


            mostrarMensajesPasswordDjango(
                contenedorMensajes,
                [
                    "La contraseña debe tener al menos 8 caracteres."
                ],
                false
            );


            return false;
        }


        /* ----------------------------------------------------
           CANCELAR PETICIÓN ANTERIOR
        ---------------------------------------------------- */

        if (controladorPeticion) {

            controladorPeticion.abort();

        }


        controladorPeticion =
            new AbortController();


        /* ----------------------------------------------------
           DATOS
        ---------------------------------------------------- */

        const datosFormulario =
            new FormData();


        datosFormulario.append(
            "password_nuevo",
            clave
        );


        /* ----------------------------------------------------
           CONSULTAR DJANGO
        ---------------------------------------------------- */

        try {

            const respuesta =
                await fetch(
                    urlVerificar,
                    {
                        method: "POST",

                        headers: {
                            "X-CSRFToken":
                                csrfInput.value,

                            "X-Requested-With":
                                "XMLHttpRequest"
                        },

                        body:
                            datosFormulario,

                        signal:
                            controladorPeticion.signal
                    }
                );


            if (!respuesta.ok) {

                throw new Error(
                    "No fue posible validar la contraseña."
                );

            }


            const datos =
                await respuesta.json();


            /* ------------------------------------------------
               CONTRASEÑA INVÁLIDA
            ------------------------------------------------ */

            if (!datos.valido) {

                const mensajes =
                    Array.isArray(
                        datos.mensajes
                    )
                        ? datos.mensajes
                        : [
                            "La contraseña no cumple los requisitos."
                        ];


                passwordNuevo.setCustomValidity(
                    mensajes.join(" ")
                );


                passwordNuevo.classList.remove(
                    "is-valid"
                );


                passwordNuevo.classList.add(
                    "is-invalid"
                );


                mostrarMensajesPasswordDjango(
                    contenedorMensajes,
                    mensajes,
                    false
                );


                return false;

            }


            /* ------------------------------------------------
               CONTRASEÑA VÁLIDA
            ------------------------------------------------ */

            passwordNuevo.setCustomValidity("");


            passwordNuevo.classList.remove(
                "is-invalid"
            );


            passwordNuevo.classList.add(
                "is-valid"
            );


            mostrarMensajesPasswordDjango(
                contenedorMensajes,
                datos.mensajes || [
                    (
                        "La contraseña cumple "
                        +
                        "los requisitos de seguridad."
                    )
                ],
                true
            );


            return true;


        } catch (error) {

            if (
                error.name ===
                "AbortError"
            ) {

                return false;

            }


            passwordNuevo.setCustomValidity(
                (
                    "No fue posible validar la "
                    +
                    "contraseña en este momento."
                )
            );


            passwordNuevo.classList.remove(
                "is-valid"
            );


            passwordNuevo.classList.add(
                "is-invalid"
            );


            mostrarMensajesPasswordDjango(
                contenedorMensajes,
                [
                    (
                        "No fue posible validar la "
                        +
                        "contraseña en este momento."
                    )
                ],
                false
            );


            return false;

        }

    }


    /* ========================================================
       MIENTRAS ESCRIBE
    ======================================================== */

    passwordNuevo.addEventListener(
        "input",
        function () {

            clearTimeout(
                temporizador
            );


            passwordNuevo.setCustomValidity("");


            passwordNuevo.classList.remove(
                "is-valid",
                "is-invalid"
            );


            contenedorMensajes.classList.add(
                "d-none"
            );


            temporizador =
                setTimeout(
                    validarPasswordDjango,
                    500
                );

        }
    );


    /* ========================================================
       AL SALIR DEL CAMPO
    ======================================================== */

    passwordNuevo.addEventListener(
        "blur",
        validarPasswordDjango
    );


    /* ========================================================
       EXPONER PARA EL SUBMIT
    ======================================================== */

    passwordNuevo.validarPasswordDjangoPerfil =
        validarPasswordDjango;

}


/* ============================================================
   MOSTRAR MENSAJES DE DJANGO
============================================================ */

function mostrarMensajesPasswordDjango(
    elemento,
    mensajes,
    esValido
) {

    if (!elemento) {
        return;
    }


    const listaMensajes =
        Array.isArray(mensajes)
            ? mensajes
            : [mensajes];


    elemento.innerHTML = "";


    const lista =
        document.createElement(
            "ul"
        );


    lista.className =
        "mb-0 ps-3";


    listaMensajes.forEach(
        function (mensaje) {

            const item =
                document.createElement(
                    "li"
                );


            item.textContent =
                mensaje;


            lista.appendChild(
                item
            );

        }
    );


    elemento.appendChild(
        lista
    );


    elemento.classList.remove(
        "d-none",
        "text-success",
        "text-danger"
    );


    elemento.classList.add(
        esValido
            ? "text-success"
            : "text-danger"
    );

}

/* ============================================================
   VALIDACIÓN DE CORREO ELECTRÓNICO - MI PERFIL
============================================================ */

function inicializarValidacionCorreoPerfil() {

    const correo =
        document.getElementById(
            "correoPerfil"
        );


    const mensaje =
        document.getElementById(
            "mensajeCorreoPerfil"
        );


    if (
        !correo ||
        !mensaje
    ) {
        return;
    }


    const urlVerificar =
        correo.dataset.urlVerificar;


    if (!urlVerificar) {
        return;
    }


    let temporizador = null;

    let controladorPeticion = null;


    /* --------------------------------------------------------
       VALIDAR CORREO
    -------------------------------------------------------- */

    async function validarCorreo() {

        clearTimeout(
            temporizador
        );

        temporizador = null;

        const valor =
            correo.value
                .trim()
                .toLowerCase();


        correo.value = valor;


        correo.setCustomValidity("");

        correo.classList.remove(
            "is-valid",
            "is-invalid"
        );


        mensaje.classList.add(
            "d-none"
        );

        mensaje.classList.remove(
            "text-success",
            "text-danger"
        );


        /* ----------------------------------------------------
           CAMPO VACÍO
        ---------------------------------------------------- */

        if (!valor) {

            correo.setCustomValidity(
                "El correo electrónico es obligatorio."
            );

            correo.classList.add(
                "is-invalid"
            );

            mostrarMensajeCorreo(
                mensaje,
                "El correo electrónico es obligatorio.",
                false
            );

            return false;
        }


        /* ----------------------------------------------------
           FORMATO Y PROVEEDOR
        ---------------------------------------------------- */

        const regexCorreoPermitido =
            /^[A-Za-z0-9._%+-]+@(gmail\.com|outlook\.com|hotmail\.com|yahoo\.com)$/i;


        if (
            !regexCorreoPermitido.test(
                valor
            )
        ) {

            correo.setCustomValidity(
                "El correo debe pertenecer a Gmail, Outlook, Hotmail o Yahoo."
            );

            correo.classList.add(
                "is-invalid"
            );

            mostrarMensajeCorreo(
                mensaje,
                "El correo debe pertenecer a Gmail, Outlook, Hotmail o Yahoo.",
                false
            );

            return false;
        }


        /* ----------------------------------------------------
           CANCELAR PETICIÓN ANTERIOR
        ---------------------------------------------------- */

        if (controladorPeticion) {

            controladorPeticion.abort();

        }


        controladorPeticion =
            new AbortController();


        /* ----------------------------------------------------
           CONSULTAR DJANGO
        ---------------------------------------------------- */

        try {

            const parametros =
                new URLSearchParams({
                    correo: valor
                });


            const respuesta =
                await fetch(
                    `${urlVerificar}?${parametros.toString()}`,
                    {
                        method: "GET",
                        headers: {
                            "X-Requested-With":
                                "XMLHttpRequest"
                        },
                        signal:
                            controladorPeticion.signal
                    }
                );


            if (!respuesta.ok) {

                throw new Error(
                    "No fue posible verificar el correo."
                );

            }


            const datos =
                await respuesta.json();


            /* ------------------------------------------------
               FORMATO / PROVEEDOR INVÁLIDO DESDE BACKEND
            ------------------------------------------------ */

            if (!datos.valido) {

                correo.setCustomValidity(
                    datos.mensaje ||
                    "El correo electrónico no es válido."
                );

                correo.classList.remove(
                    "is-valid"
                );

                correo.classList.add(
                    "is-invalid"
                );


                mostrarMensajeCorreo(
                    mensaje,
                    datos.mensaje ||
                    "El correo electrónico no es válido.",
                    false
                );


                return false;
            }


            /* ------------------------------------------------
               CORREO DUPLICADO
            ------------------------------------------------ */

            if (datos.existe) {

                correo.setCustomValidity(
                    datos.mensaje ||
                    "Este correo electrónico ya está registrado."
                );

                correo.classList.remove(
                    "is-valid"
                );

                correo.classList.add(
                    "is-invalid"
                );


                mostrarMensajeCorreo(
                    mensaje,
                    datos.mensaje ||
                    "Este correo electrónico ya está registrado.",
                    false
                );


                return false;
            }


            /* ------------------------------------------------
               CORREO DISPONIBLE
            ------------------------------------------------ */

            correo.setCustomValidity("");

            correo.classList.remove(
                "is-invalid"
            );

            correo.classList.add(
                "is-valid"
            );


            mostrarMensajeCorreo(
                mensaje,
                datos.mensaje ||
                "Correo electrónico disponible.",
                true
            );


            return true;


        } catch (error) {

            if (
                error.name ===
                "AbortError"
            ) {

                return false;

            }


            correo.setCustomValidity(
                "No fue posible verificar el correo en este momento."
            );

            correo.classList.remove(
                "is-valid"
            );

            correo.classList.add(
                "is-invalid"
            );


            mostrarMensajeCorreo(
                mensaje,
                "No fue posible verificar el correo en este momento.",
                false
            );


            return false;

        }

    }


    /* --------------------------------------------------------
       VALIDACIÓN MIENTRAS ESCRIBE
    -------------------------------------------------------- */

    correo.addEventListener(
        "input",
        function () {

            clearTimeout(
                temporizador
            );


            correo.setCustomValidity("");

            correo.classList.remove(
                "is-valid",
                "is-invalid"
            );


            mensaje.classList.add(
                "d-none"
            );


            temporizador =
                setTimeout(
                    validarCorreo,
                    500
                );

        }
    );


    /* --------------------------------------------------------
       VALIDAR AL SALIR DEL CAMPO
    -------------------------------------------------------- */

    correo.addEventListener(
        "blur",
        validarCorreo
    );


    /* --------------------------------------------------------
       GUARDAR FUNCIÓN PARA EL SUBMIT
    -------------------------------------------------------- */

    correo.validarCorreoPerfil =
        validarCorreo;

}


/* ============================================================
   MOSTRAR MENSAJE DEL CORREO
============================================================ */

function mostrarMensajeCorreo(
    elemento,
    mensaje,
    esValido
) {

    if (!elemento) {
        return;
    }


    elemento.textContent =
        mensaje;


    elemento.classList.remove(
        "d-none",
        "text-success",
        "text-danger"
    );


    elemento.classList.add(
        esValido
            ? "text-success"
            : "text-danger"
    );

}

/* ============================================================
   VALIDACIÓN DE DATOS PERSONALES - MI PERFIL
============================================================ */

function inicializarValidacionDatosPersonales() {

    const nombres =
        document.getElementById(
            "nombresPerfil"
        );


    const apellidos =
        document.getElementById(
            "apellidosPerfil"
        );


    const telefono =
        document.getElementById(
            "telefonoPerfil"
        );

    const mensajeTelefono =
        document.getElementById(
            "mensajeTelefonoPerfil"
        );


    const regexNombre =
        /^(?=.*[A-Za-zÁÉÍÓÚÜÑáéíóúüñ])[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;


    const regexCelular =
        /^3[0-9]{9}$/;


    /* ========================================================
       NOMBRES
    ======================================================== */

    function validarNombres() {

        if (!nombres) {
            return true;
        }


        const valor =
            nombres.value.trim();


        nombres.setCustomValidity("");

        nombres.classList.remove(
            "is-valid",
            "is-invalid"
        );


        if (!valor) {

            nombres.setCustomValidity(
                "Los nombres son obligatorios."
            );

            nombres.classList.add(
                "is-invalid"
            );

            return false;
        }


        if (valor.length < 2) {

            nombres.setCustomValidity(
                "Los nombres deben tener al menos 2 caracteres."
            );

            nombres.classList.add(
                "is-invalid"
            );

            return false;
        }


        if (valor.length > 150) {

            nombres.setCustomValidity(
                "Los nombres no pueden superar los 150 caracteres."
            );

            nombres.classList.add(
                "is-invalid"
            );

            return false;
        }


        if (!regexNombre.test(valor)) {

            nombres.setCustomValidity(
                "Usa solamente letras, espacios, apóstrofes o guiones."
            );

            nombres.classList.add(
                "is-invalid"
            );

            return false;
        }


        nombres.setCustomValidity("");

        nombres.classList.add(
            "is-valid"
        );


        return true;

    }


    /* ========================================================
       APELLIDOS
    ======================================================== */

    function validarApellidos() {

        if (!apellidos) {
            return true;
        }


        const valor =
            apellidos.value.trim();


        apellidos.setCustomValidity("");

        apellidos.classList.remove(
            "is-valid",
            "is-invalid"
        );


        if (!valor) {

            apellidos.setCustomValidity(
                "Los apellidos son obligatorios."
            );

            apellidos.classList.add(
                "is-invalid"
            );

            return false;
        }


        if (valor.length < 2) {

            apellidos.setCustomValidity(
                "Los apellidos deben tener al menos 2 caracteres."
            );

            apellidos.classList.add(
                "is-invalid"
            );

            return false;
        }


        if (valor.length > 150) {

            apellidos.setCustomValidity(
                "Los apellidos no pueden superar los 150 caracteres."
            );

            apellidos.classList.add(
                "is-invalid"
            );

            return false;
        }


        if (!regexNombre.test(valor)) {

            apellidos.setCustomValidity(
                "Usa solamente letras, espacios, apóstrofes o guiones."
            );

            apellidos.classList.add(
                "is-invalid"
            );

            return false;
        }


        apellidos.setCustomValidity("");

        apellidos.classList.add(
            "is-valid"
        );


        return true;

    }


    /* ========================================================
       CELULAR / TELÉFONO
    ======================================================== */

    function validarTelefono() {

        if (!telefono) {
            return true;
        }


        const valor =
            telefono.value.trim();


        telefono.setCustomValidity("");

        telefono.classList.remove(
            "is-valid",
            "is-invalid"
        );


        if (mensajeTelefono) {

            mensajeTelefono.classList.add(
                "d-none"
            );

            mensajeTelefono.classList.remove(
                "text-success",
                "text-danger"
            );

            mensajeTelefono.textContent = "";

        }


        /* ========================================================
        VACÍO - ES OPCIONAL
        ======================================================== */

        if (!valor) {

            return true;

        }


        /* ========================================================
        DEBE COMENZAR POR 3
        ======================================================== */

        if (!valor.startsWith("3")) {

            const mensaje =
                "El celular debe comenzar por 3.";


            telefono.setCustomValidity(
                mensaje
            );


            telefono.classList.add(
                "is-invalid"
            );


            mostrarMensajeTelefono(
                mensaje,
                false
            );


            return false;

        }


        /* ========================================================
        DEBE TENER 10 DÍGITOS
        ======================================================== */

        if (valor.length < 10) {

            const faltan =
                10 - valor.length;


            const mensaje =
                faltan === 1
                    ? "Falta 1 número para completar el celular."
                    : `Faltan ${faltan} números para completar el celular.`;


            telefono.setCustomValidity(
                mensaje
            );


            telefono.classList.add(
                "is-invalid"
            );


            mostrarMensajeTelefono(
                mensaje,
                false
            );


            return false;

        }


        if (valor.length > 10) {

            const mensaje =
                "El celular debe tener exactamente 10 números.";


            telefono.setCustomValidity(
                mensaje
            );


            telefono.classList.add(
                "is-invalid"
            );


            mostrarMensajeTelefono(
                mensaje,
                false
            );


            return false;

        }


        /* ========================================================
        CELULAR CORRECTO
        ======================================================== */

        telefono.setCustomValidity("");


        telefono.classList.add(
            "is-valid"
        );


        mostrarMensajeTelefono(
            "Celular válido.",
            true
        );


        return true;


        /* ========================================================
        MOSTRAR MENSAJE
        ======================================================== */

        function mostrarMensajeTelefono(
            mensaje,
            valido
        ) {

            if (!mensajeTelefono) {
                return;
            }


            mensajeTelefono.textContent =
                mensaje;


            mensajeTelefono.classList.remove(
                "d-none",
                "text-success",
                "text-danger"
            );


            mensajeTelefono.classList.add(
                valido
                    ? "text-success"
                    : "text-danger"
            );

        }

    }


    /* ========================================================
       EVENTOS
    ======================================================== */

    if (nombres) {

        nombres.addEventListener(
            "input",
            validarNombres
        );


        nombres.addEventListener(
            "blur",
            validarNombres
        );

    }


    if (apellidos) {

        apellidos.addEventListener(
            "input",
            validarApellidos
        );


        apellidos.addEventListener(
            "blur",
            validarApellidos
        );

    }


    if (telefono) {

        telefono.addEventListener(
            "input",
            function () {

                /*
                * Eliminar cualquier carácter
                * que no sea un número.
                */
                telefono.value =
                    telefono.value
                        .replace(
                            /[^0-9]/g,
                            ""
                        )
                        .slice(
                            0,
                            10
                        );


                validarTelefono();

            }
        );


        telefono.addEventListener(
            "blur",
            validarTelefono
        );

    }


    /* ========================================================
       EXPONER VALIDACIONES AL FORMULARIO
    ======================================================== */

    if (nombres) {
        nombres.validarCampoPerfil =
            validarNombres;
    }


    if (apellidos) {
        apellidos.validarCampoPerfil =
            validarApellidos;
    }


    if (telefono) {
        telefono.validarCampoPerfil =
            validarTelefono;
    }

}

/* ============================================================
   4. FORMULARIO INFORMACIÓN PERSONAL
============================================================ */

function inicializarFormularioPerfil() {

    const formulario =
        document.getElementById(
            "formActualizarPerfil"
        );


    const botonGuardar =
        document.getElementById(
            "btnGuardarPerfil"
        );


    const correo =
        document.getElementById(
            "correoPerfil"
        );

    const nombres =
        document.getElementById(
            "nombresPerfil"
        );


    const apellidos =
        document.getElementById(
            "apellidosPerfil"
        );


    const telefono =
        document.getElementById(
            "telefonoPerfil"
        );


    if (
        !formulario ||
        !botonGuardar
    ) {
        return;
    }


    formulario.addEventListener(
        "submit",
        async function (evento) {

            /* ------------------------------------------------
               DETENER ENVÍO MIENTRAS VALIDAMOS
            ------------------------------------------------ */

            evento.preventDefault();

            evento.stopPropagation();


            /* ------------------------------------------------
               VALIDAR CORREO CONTRA DJANGO
            ------------------------------------------------ */

            let correoValido =
                true;


            if (
                correo &&
                typeof correo.validarCorreoPerfil
                    === "function"
            ) {

                correoValido =
                    await correo
                        .validarCorreoPerfil();

            }


            /* ------------------------------------------------
               VALIDAR RESTO DEL FORMULARIO
            ------------------------------------------------ */

            let datosPersonalesValidos =
                true;


            [
                nombres,
                apellidos,
                telefono
            ].forEach(
                function (campo) {

                    if (
                        campo &&
                        typeof campo.validarCampoPerfil
                            === "function"
                    ) {

                        if (
                            !campo.validarCampoPerfil()
                        ) {

                            datosPersonalesValidos =
                                false;

                        }

                    }

                }
            );

            const formularioValido =
                formulario.checkValidity();


            if (
                !correoValido ||
                !datosPersonalesValidos ||
                !formularioValido
            ) {

                formulario.classList.add(
                    "was-validated"
                );


                formulario.reportValidity();


                return;

            }


            /* ------------------------------------------------
               TODO CORRECTO
            ------------------------------------------------ */

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


            /* ------------------------------------------------
               ENVIAR FORMULARIO
            ------------------------------------------------ */

            HTMLFormElement
                .prototype
                .submit
                .call(
                    formulario
                );

        }
    );

}


/* ============================================================
   5. FORMULARIO CAMBIO DE CONTRASEÑA
============================================================ */

function inicializarFormularioPassword() {

    const formulario =
        document.getElementById(
            "formCambiarPasswordPerfil"
        );


    const botonGuardar =
        document.getElementById(
            "btnCambiarPasswordPerfil"
        );


    const passwordActual =
        document.getElementById(
            "passwordActualPerfil"
        );


    const passwordNuevo =
        document.getElementById(
            "passwordNuevoPerfil"
        );


    const confirmarPassword =
        document.getElementById(
            "confirmarPasswordPerfil"
        );


    if (
        !formulario ||
        !botonGuardar ||
        !passwordActual ||
        !passwordNuevo ||
        !confirmarPassword
    ) {
        return;
    }


    formulario.addEventListener(
        "submit",
        async function (evento) {

            /* ------------------------------------------------
               DETENER ENVÍO
            ------------------------------------------------ */

            evento.preventDefault();

            evento.stopPropagation();


            /* ------------------------------------------------
               VALIDACIÓN LOCAL
            ------------------------------------------------ */

            const passwordLocalValido =
                validarPasswordPerfil();


            if (!passwordLocalValido) {

                formulario.classList.add(
                    "was-validated"
                );


                formulario.reportValidity();


                return;

            }


            /* ------------------------------------------------
               VALIDAR CONTRASEÑA ACTUAL
            ------------------------------------------------ */

            let passwordActualValido =
                true;


            if (
                typeof passwordActual
                    .validarPasswordActualPerfil
                === "function"
            ) {

                passwordActualValido =
                    await passwordActual
                        .validarPasswordActualPerfil();

            }


            if (!passwordActualValido) {

                formulario.classList.add(
                    "was-validated"
                );


                /*
                 * No usamos reportValidity aquí.
                 *
                 * El mensaje ya se muestra debajo
                 * de passwordActualPerfil.
                 */

                return;

            }


            /* ------------------------------------------------
               VALIDACIÓN REAL DE DJANGO
            ------------------------------------------------ */

            if (
                typeof passwordNuevo
                    .validarPasswordDjangoPerfil
                !== "function"
            ) {

                const contenedorMensajes =
                    document.getElementById(
                        "mensajesPasswordDjangoPerfil"
                    );


                passwordNuevo.setCustomValidity(
                    "No fue posible verificar la contraseña."
                );


                passwordNuevo.classList.add(
                    "is-invalid"
                );


                mostrarMensajesPasswordDjango(
                    contenedorMensajes,
                    [
                        (
                            "No fue posible verificar "
                            +
                            "la contraseña en este momento."
                        )
                    ],
                    false
                );


                return;

            }


            const passwordDjangoValido =
                await passwordNuevo
                    .validarPasswordDjangoPerfil();


            /* ------------------------------------------------
               SI DJANGO LA RECHAZA
            ------------------------------------------------ */

            if (!passwordDjangoValido) {

                formulario.classList.add(
                    "was-validated"
                );


                /*
                 * No usamos reportValidity aquí.
                 *
                 * El mensaje ya se muestra debajo
                 * del campo de nueva contraseña.
                 */

                return;

            }


            /* ------------------------------------------------
               VALIDACIÓN GENERAL DEL FORMULARIO
            ------------------------------------------------ */

            const formularioValido =
                formulario.checkValidity();


            if (!formularioValido) {

                formulario.classList.add(
                    "was-validated"
                );


                formulario.reportValidity();


                return;

            }


            /* ------------------------------------------------
               TODO CORRECTO
            ------------------------------------------------ */

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

                Actualizando...
            `;


            /* ------------------------------------------------
               ENVIAR DEFINITIVAMENTE
            ------------------------------------------------ */

            HTMLFormElement
                .prototype
                .submit
                .call(
                    formulario
                );

        }
    );

}

/* ============================================================
   6. AVISO DE CAMBIOS SIN GUARDAR (info personal)
============================================================ */

function inicializarAvisoCambiosPerfil() {

    const formulario =
        document.getElementById(
            "formActualizarPerfil"
        );

    const aviso =
        document.getElementById(
            "avisoCambiosPerfil"
        );

    if (!formulario || !aviso) {
        return;
    }

    const valoresIniciales = new FormData(formulario);

    function formularioCambio() {

        const valoresActuales = new FormData(formulario);
        let huboCambio = false;

        for (const [nombre, valor] of valoresActuales.entries()) {
            if (valoresIniciales.get(nombre) !== valor) {
                huboCambio = true;
                break;
            }
        }

        aviso.classList.toggle("d-none", !huboCambio);

    }

    formulario.addEventListener("input", formularioCambio);
    formulario.addEventListener("change", formularioCambio);

    formulario.addEventListener("submit", function () {
        aviso.classList.add("d-none");
    });

}

/* ============================================================
   7. SISTEMA DE PESTAÑAS (Información personal / Seguridad,
      y las sub-pestañas dentro de Seguridad)
============================================================ */

function inicializarPestanasPerfil() {

    // Cada grupo de botones [data-tab-target] controla los paneles
    // [data-tab-panel] que existen en el MISMO contenedor padre
    // inmediato de ese grupo de botones (para que el grupo principal
    // y el de Seguridad no se pisen entre sí).

    document
        .querySelectorAll(".perfil-tabs-principales, .perfil-subtabs")
        .forEach(function (grupoBotones) {

            const contenedor = grupoBotones.parentElement;

            if (!contenedor) {
                return;
            }

            const botones = grupoBotones.querySelectorAll("[data-tab-target]");

            botones.forEach(function (boton) {

                boton.addEventListener("click", function () {

                    const destino = boton.dataset.tabTarget;

                    botones.forEach(function (b) {
                        b.classList.remove("activo");
                        b.setAttribute("aria-selected", "false");
                    });

                    boton.classList.add("activo");
                    boton.setAttribute("aria-selected", "true");

                    contenedor
                        .querySelectorAll(":scope > [data-tab-panel]")
                        .forEach(function (panel) {
                            panel.classList.toggle(
                                "d-none",
                                panel.dataset.tabPanel !== destino
                            );
                        });

                });

            });

        });

    /* ========================================================
       MANTENER ABIERTO EL HISTORIAL AL PAGINAR
    ======================================================== */

    const parametrosUrl =
        new URLSearchParams(
            window.location.search
        );


    if (
        parametrosUrl.has(
            "page_accesos"
        )
    ) {


        /* ====================================================
           ABRIR PESTAÑA PRINCIPAL: SEGURIDAD
        ==================================================== */

        const botonSeguridad =
            document.querySelector(
                '.perfil-tab-btn[data-tab-target="perfil-tab-seguridad"]'
            );


        if (botonSeguridad) {

            botonSeguridad.click();

        }



        /* ====================================================
           ABRIR SUBPESTAÑA: HISTORIAL DE ACCESOS
        ==================================================== */

        const botonHistorial =
            document.querySelector(
                '.perfil-subtab-btn[data-tab-target="sub-historial"]'
            );


        if (botonHistorial) {

            botonHistorial.click();

        }



        /* ====================================================
           LLEVAR AL USUARIO AL HISTORIAL
        ==================================================== */

        const historial =
            document.getElementById(
                "historialAccesos"
            );


        if (historial) {

            window.requestAnimationFrame(
                function () {

                    historial.scrollIntoView(
                        {
                            behavior: "auto",
                            block: "start"
                        }
                    );

                }
            );

        }

    }

}

document.addEventListener("DOMContentLoaded", inicializarPestanasPerfil);