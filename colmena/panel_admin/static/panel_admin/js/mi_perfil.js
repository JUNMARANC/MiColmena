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

        inicializarFormularioPerfil();

        inicializarFormularioPassword();

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
        function (evento) {

            const passwordValido =
                validarPasswordPerfil();


            const formularioValido =
                formulario.checkValidity();


            if (
                !passwordValido ||
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

        }
    );

}