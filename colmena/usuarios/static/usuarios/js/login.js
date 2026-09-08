/* ==========================================================
   LOGIN - MI COLMENA
========================================================== */

document.addEventListener("DOMContentLoaded", function () {


    /* ======================================================
       MOSTRAR / OCULTAR CONTRASEÑA DEL LOGIN
    ====================================================== */

    /* Una sola función para todos los ojitos de la página: el del
       login y los dos del formulario de nueva contraseña.

       El del login se identifica por id (btnPassword / passwordInput);
       los demás con data-ver-password="idDelCampo". */

    function alternarVerPassword(boton, campo) {

        if (!boton || !campo) {
            return;
        }

        boton.addEventListener("click", function () {

            const icono = boton.querySelector("i");
            const mostrando = campo.type === "text";

            campo.type = mostrando ? "password" : "text";

            icono.classList.toggle("bi-eye", mostrando);
            icono.classList.toggle("bi-eye-slash", !mostrando);

            boton.setAttribute(
                "aria-label",
                mostrando ? "Mostrar contraseña" : "Ocultar contraseña"
            );

            boton.setAttribute(
                "aria-pressed",
                mostrando ? "false" : "true"
            );

            // Devuelve el cursor al final del texto: al cambiar el
            // type, el navegador lo manda al inicio y se escribe
            // en medio de lo ya digitado.
            const posicion = campo.value.length;
            campo.focus();
            campo.setSelectionRange(posicion, posicion);
        });
    }


    // Ojito del login
    alternarVerPassword(
        document.getElementById("btnPassword"),
        document.getElementById("passwordInput")
    );


    // Ojitos del formulario de nueva contraseña
    document
        .querySelectorAll("[data-ver-password]")
        .forEach(function (boton) {
            alternarVerPassword(
                boton,
                document.getElementById(
                    boton.getAttribute("data-ver-password")
                )
            );
        });



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


        /* Aviso en vivo de si coinciden.

           Antes solo te enterabas al pulsar "Restablecer contraseña":
           escribías las dos, mandabas, y ahí salía el error. Con el
           campo oculto por puntos es fácil equivocarse sin notarlo. */

        const avisoCoinciden = document.getElementById(
            "avisoCoincidenPasswords"
        );

        function revisarCoincidencia() {

            passwordConfirmacion.setCustomValidity("");

            if (!avisoCoinciden) {
                return;
            }

            if (passwordConfirmacion.value === "") {
                avisoCoinciden.hidden = true;
                return;
            }

            const coinciden =
                passwordNueva.value === passwordConfirmacion.value;

            avisoCoinciden.hidden = false;

            avisoCoinciden.textContent = coinciden
                ? "Las contraseñas coinciden"
                : "Las contraseñas no coinciden";

            avisoCoinciden.classList.toggle("es-valido", coinciden);
            avisoCoinciden.classList.toggle("es-invalido", !coinciden);
        }

        passwordConfirmacion.addEventListener("input", revisarCoincidencia);
        passwordNueva.addEventListener("input", revisarCoincidencia);

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