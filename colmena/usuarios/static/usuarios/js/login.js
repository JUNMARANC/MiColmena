/* ==========================================================
   LOGIN - MI COLMENA
========================================================== */

document.addEventListener("DOMContentLoaded", function () {


    /* ======================================================
       MOSTRAR / OCULTAR CONTRASEÑA DEL LOGIN
    ====================================================== */

    const btnPassword = document.getElementById("btnPassword");
    const passwordInput = document.getElementById("passwordInput");


    if (btnPassword && passwordInput) {

        btnPassword.addEventListener("click", function () {

            const icon = this.querySelector("i");

            const mostrando = (
                passwordInput.type === "text"
            );


            if (!mostrando) {

                passwordInput.type = "text";

                icon.classList.remove(
                    "bi-eye"
                );

                icon.classList.add(
                    "bi-eye-slash"
                );


                btnPassword.setAttribute(
                    "aria-label",
                    "Ocultar contraseña"
                );

                btnPassword.setAttribute(
                    "aria-pressed",
                    "true"
                );

            } else {

                passwordInput.type = "password";

                icon.classList.remove(
                    "bi-eye-slash"
                );

                icon.classList.add(
                    "bi-eye"
                );


                btnPassword.setAttribute(
                    "aria-label",
                    "Mostrar contraseña"
                );

                btnPassword.setAttribute(
                    "aria-pressed",
                    "false"
                );

            }

        });

    }



    /* ======================================================
       ESTADO "INGRESANDO..."
    ====================================================== */

    const formLogin = document.querySelector(
        ".form-login"
    );


    if (formLogin) {

        formLogin.addEventListener(
            "submit",
            function () {

                const boton = (
                    formLogin.querySelector(
                        ".btn-login"
                    )
                );


                if (
                    !boton
                    ||
                    boton.disabled
                ) {

                    return;
                }


                boton.dataset.textoOriginal =
                    boton.innerHTML;


                boton.innerHTML =
                    '<i class="bi bi-arrow-repeat"></i> Ingresando...';


                boton.disabled = true;

            }
        );

    }



    /* ======================================================
       RECUPERACIÓN DE CONTRASEÑA
    ====================================================== */

    const btnAbrirRecuperacion = (
        document.getElementById(
            "abrirModalRecuperacion"
        )
    );


    const modalSolicitarRecuperacion = (
        document.getElementById(
            "modalSolicitarRecuperacion"
        )
    );


    const modalNuevaPassword = (
        document.getElementById(
            "modalNuevaPassword"
        )
    );



    /* ======================================================
       ABRIR MODAL PARA SOLICITAR CORREO
    ====================================================== */

    if (
        btnAbrirRecuperacion
        &&
        modalSolicitarRecuperacion
    ) {

        btnAbrirRecuperacion.addEventListener(
            "click",
            function () {

                modalSolicitarRecuperacion
                    .classList
                    .add(
                        "activo"
                    );


                const correoInput = (
                    document.getElementById(
                        "correoRecuperacion"
                    )
                );


                if (correoInput) {

                    setTimeout(
                        function () {

                            correoInput.focus();

                        },
                        100
                    );

                }

            }
        );

    }



    /* ======================================================
       CERRAR MODALES CON EL BOTÓN X
    ====================================================== */

    const botonesCerrar = (
        document.querySelectorAll(
            "[data-cerrar-modal]"
        )
    );


    botonesCerrar.forEach(
        function (boton) {

            boton.addEventListener(
                "click",
                function () {

                    const idModal = (
                        this.dataset.cerrarModal
                    );


                    const modal = (
                        document.getElementById(
                            idModal
                        )
                    );


                    if (modal) {

                        modal.classList.remove(
                            "activo"
                        );

                    }

                }
            );

        }
    );



    /* ======================================================
       CERRAR MODAL AL TOCAR EL FONDO
    ====================================================== */

    const overlays = (
        document.querySelectorAll(
            ".modal-recuperacion-overlay"
        )
    );


    overlays.forEach(
        function (modal) {

            modal.addEventListener(
                "click",
                function (evento) {

                    if (
                        evento.target
                        ===
                        modal
                    ) {

                        modal.classList.remove(
                            "activo"
                        );

                    }

                }
            );

        }
    );



    /* ======================================================
       CERRAR MODALES CON ESC
    ====================================================== */

    document.addEventListener(
        "keydown",
        function (evento) {

            if (
                evento.key
                !==
                "Escape"
            ) {

                return;

            }


            document
                .querySelectorAll(
                    ".modal-recuperacion-overlay.activo"
                )
                .forEach(
                    function (modal) {

                        modal.classList.remove(
                            "activo"
                        );

                    }
                );

        }
    );



    /* ======================================================
       CÓDIGO DE RECUPERACIÓN
       SOLO 6 NÚMEROS
    ====================================================== */

    const codigoRecuperacion = (
        document.getElementById(
            "codigoRecuperacion"
        )
    );


    if (codigoRecuperacion) {

        codigoRecuperacion.addEventListener(
            "input",
            function () {

                this.value = (
                    this.value
                    .replace(
                        /[^0-9]/g,
                        ""
                    )
                    .slice(
                        0,
                        6
                    )
                );

            }
        );

    }



    /* ======================================================
       VALIDAR QUE LAS CONTRASEÑAS COINCIDAN
       ANTES DE ENVIAR
    ====================================================== */

    const formNuevaPassword = (
        document.getElementById(
            "formNuevaPassword"
        )
    );


    const passwordNueva = (
        document.getElementById(
            "passwordNueva"
        )
    );


    const passwordConfirmacion = (
        document.getElementById(
            "passwordConfirmacion"
        )
    );


    if (
        formNuevaPassword
        &&
        passwordNueva
        &&
        passwordConfirmacion
    ) {

        formNuevaPassword.addEventListener(
            "submit",
            function (evento) {

                if (
                    passwordNueva.value
                    !==
                    passwordConfirmacion.value
                ) {

                    evento.preventDefault();


                    passwordConfirmacion
                        .setCustomValidity(
                            "Las contraseñas no coinciden."
                        );


                    passwordConfirmacion
                        .reportValidity();


                    return;
                }


                passwordConfirmacion
                    .setCustomValidity(
                        ""
                    );

            }
        );


        passwordConfirmacion.addEventListener(
            "input",
            function () {

                this.setCustomValidity(
                    ""
                );

            }
        );

    }



    /* ======================================================
       ABRIR AUTOMÁTICAMENTE EL MODAL
       CUANDO SE ENTRA DESDE EL LINK DEL CORREO
    ====================================================== */

    const abrirModalNuevaPassword = (
        document.body.dataset
            .abrirModalPassword
        ===
        "true"
    );


    if (
        abrirModalNuevaPassword
        &&
        modalNuevaPassword
    ) {

        modalNuevaPassword
            .classList
            .add(
                "activo"
            );


        if (codigoRecuperacion) {

            setTimeout(
                function () {

                    codigoRecuperacion.focus();

                },
                100
            );

        }

    }

});