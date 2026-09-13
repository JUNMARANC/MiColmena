document.addEventListener("DOMContentLoaded", function () {

    // =========================================================
    // =========================================================
    // PERFIL DEL APICULTOR
    // MI COLMENA
    // =========================================================
    // =========================================================


    // =========================================================
    // 1. FORMULARIO DE INFORMACIÓN PERSONAL
    // =========================================================

    const formularioPerfil =
        document.getElementById(
            "formPerfilApicultor"
        );


    const botonGuardarPerfil =
        document.getElementById(
            "btnGuardarPerfil"
        );


    // =========================================================
    // CAMPOS DEL PERFIL
    // =========================================================

    const nombres =
        document.getElementById(
            "nombresPerfil"
        );


    const apellidos =
        document.getElementById(
            "apellidosPerfil"
        );


    const correo =
        document.getElementById(
            "correoPerfil"
        );


    const telefono =
        document.getElementById(
            "telefonoPerfil"
        );


    // =========================================================
    // MENSAJES DE VALIDACIÓN
    // =========================================================

    const errorNombres =
        document.getElementById(
            "errorNombresPerfil"
        );


    const errorApellidos =
        document.getElementById(
            "errorApellidosPerfil"
        );


    const errorCorreo =
        document.getElementById(
            "errorCorreoPerfil"
        );


    const errorTelefono =
        document.getElementById(
            "errorTelefonoPerfil"
        );


    // =========================================================
    // 2. FOTOGRAFÍA DE PERFIL
    // =========================================================

    const inputFoto =
        document.getElementById(
            "fotoperfil"
        );


    const botonQuitarFoto =
        document.getElementById(
            "btnQuitarFotoPerfil"
        );


    const eliminarFoto =
        document.getElementById(
            "eliminarFotoPerfil"
        );


    // =========================================================
    // FOTO DEL FORMULARIO
    // =========================================================

    const imagenPreview =
        document.getElementById(
            "imagenPreviewPerfil"
        );


    const iconoPreview =
        document.getElementById(
            "iconoPreviewPerfil"
        );


    // =========================================================
    // FOTO DE LA TARJETA IZQUIERDA
    // =========================================================

    const imagenPrincipal =
        document.getElementById(
            "fotoPerfilPrincipal"
        );


    const iconoPrincipal =
        document.getElementById(
            "iconoPerfilPrincipal"
        );


    // =========================================================
    // 3. CONFIGURACIÓN DE IMÁGENES
    // =========================================================

    const TAMANO_MAXIMO_MB =
        5;


    const TAMANO_MAXIMO_BYTES =
        TAMANO_MAXIMO_MB
        *
        1024
        *
        1024;


    const TIPOS_VALIDOS = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    const EXTENSIONES_VALIDAS = [
        "jpg",
        "jpeg",
        "png",
        "webp"
    ];


    // =========================================================
    // 4. EXPRESIONES REGULARES
    // =========================================================

    /*
     * Nombres y apellidos:
     *
     * Permite:
     *
     * Juan
     * Juan Manuel
     * María José
     * Pérez-Gómez
     * O'Connor
     *
     * No permite:
     *
     * Juan123
     * --------
     * Juan----
     * @Juan
     */

    const REGEX_NOMBRE =
        /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñÀ-ÿ]+(?:[ '\-][A-Za-zÁÉÍÓÚÜÑáéíóúüñÀ-ÿ]+)*$/;


    /*
     * Correos permitidos:
     *
     * gmail.com
     * hotmail.com
     * outlook.com
     * yahoo.com
     */

    const REGEX_CORREO =
        /^[A-Za-z0-9._%+-]+@(gmail\.com|hotmail\.com|outlook\.com|yahoo\.com)$/i;


    /*
     * Número celular colombiano:
     *
     * - Empieza por 3
     * - Exactamente 10 números
     */

    const REGEX_TELEFONO =
        /^3[0-9]{9}$/;


    // =========================================================
    // 5. UTILIDADES DE VALIDACIÓN
    // =========================================================

    function mostrarErrorCampo(
        campo,
        elementoError,
        mensaje
    ) {

        if (!campo) {
            return;
        }


        campo.classList.remove(
            "is-valid"
        );


        campo.classList.add(
            "is-invalid"
        );


        if (elementoError) {

            elementoError.textContent =
                mensaje;


            elementoError.classList.remove(
                "d-none"
            );

        }

    }


    function limpiarErrorCampo(
        campo,
        elementoError,
        marcarValido = true
    ) {

        if (!campo) {
            return;
        }


        campo.classList.remove(
            "is-invalid"
        );


        if (marcarValido) {

            campo.classList.add(
                "is-valid"
            );

        } else {

            campo.classList.remove(
                "is-valid"
            );

        }


        if (elementoError) {

            elementoError.textContent =
                "";


            elementoError.classList.add(
                "d-none"
            );

        }

    }


    function obtenerExtension(
        nombreArchivo
    ) {

        if (
            !nombreArchivo
            ||
            !nombreArchivo.includes(".")
        ) {

            return "";

        }


        return nombreArchivo
            .toLowerCase()
            .split(".")
            .pop();

    }


    // =========================================================
    // 6. VALIDACIÓN DE FOTOGRAFÍA
    // =========================================================

    function validarFotografia(
        archivo
    ) {

        if (!archivo) {

            return {
                valido: true,
                mensaje: ""
            };

        }


        // =====================================================
        // ARCHIVO VACÍO
        // =====================================================

        if (
            archivo.size
            <=
            0
        ) {

            return {

                valido:
                    false,

                mensaje:
                    "La fotografía seleccionada está vacía."

            };

        }


        // =====================================================
        // TAMAÑO
        // =====================================================

        if (
            archivo.size
            >
            TAMANO_MAXIMO_BYTES
        ) {

            return {

                valido:
                    false,

                mensaje:
                    `La fotografía no puede superar los ${TAMANO_MAXIMO_MB} MB.`

            };

        }


        // =====================================================
        // EXTENSIÓN
        // =====================================================

        const extension =
            obtenerExtension(
                archivo.name
            );


        if (
            !EXTENSIONES_VALIDAS.includes(
                extension
            )
        ) {

            return {

                valido:
                    false,

                mensaje:
                    "Formato no permitido. Utiliza JPG, PNG o WEBP."

            };

        }


        // =====================================================
        // MIME
        // =====================================================

        if (
            archivo.type
            &&
            !TIPOS_VALIDOS.includes(
                archivo.type
            )
        ) {

            return {

                valido:
                    false,

                mensaje:
                    "El archivo seleccionado no corresponde a una imagen permitida."

            };

        }


        return {

            valido:
                true,

            mensaje:
                ""

        };

    }


    // =========================================================
    // 7. MOSTRAR FOTOGRAFÍA
    // =========================================================

    function mostrarFotografia(
        url
    ) {

        // =====================================================
        // PREVIEW DEL FORMULARIO
        // =====================================================

        if (
            imagenPreview
            &&
            iconoPreview
        ) {

            if (url) {

                imagenPreview.src =
                    url;


                imagenPreview.classList.remove(
                    "d-none"
                );


                iconoPreview.classList.add(
                    "d-none"
                );

            } else {

                imagenPreview.removeAttribute(
                    "src"
                );


                imagenPreview.classList.add(
                    "d-none"
                );


                iconoPreview.classList.remove(
                    "d-none"
                );

            }

        }


        // =====================================================
        // FOTO PRINCIPAL
        // =====================================================

        if (
            imagenPrincipal
            &&
            iconoPrincipal
        ) {

            if (url) {

                imagenPrincipal.src =
                    url;


                imagenPrincipal.classList.remove(
                    "d-none"
                );


                iconoPrincipal.classList.add(
                    "d-none"
                );

            } else {

                imagenPrincipal.removeAttribute(
                    "src"
                );


                imagenPrincipal.classList.add(
                    "d-none"
                );


                iconoPrincipal.classList.remove(
                    "d-none"
                );

            }

        }


        // =====================================================
        // BOTÓN QUITAR
        // =====================================================

        if (botonQuitarFoto) {

            botonQuitarFoto.classList.toggle(
                "d-none",
                !url
            );

        }

    }


    // =========================================================
    // 8. SELECCIONAR NUEVA FOTO
    // =========================================================

    if (inputFoto) {

        inputFoto.addEventListener(
            "change",
            function () {

                const archivo =
                    inputFoto.files
                    &&
                    inputFoto.files.length > 0

                        ? inputFoto.files[0]

                        : null;


                if (!archivo) {

                    return;

                }


                const validacion =
                    validarFotografia(
                        archivo
                    );


                if (
                    !validacion.valido
                ) {

                    window.alert(
                        validacion.mensaje
                    );


                    inputFoto.value =
                        "";


                    return;

                }


                const lector =
                    new FileReader();


                lector.addEventListener(
                    "load",
                    function (
                        evento
                    ) {

                        const resultado =
                            evento.target.result;


                        mostrarFotografia(
                            resultado
                        );


                        // =========================================
                        // SI SELECCIONÓ UNA NUEVA FOTO
                        // CANCELAMOS LA ORDEN DE ELIMINAR
                        // =========================================

                        if (eliminarFoto) {

                            eliminarFoto.value =
                                "0";

                        }

                    }
                );


                lector.addEventListener(
                    "error",
                    function () {

                        window.alert(
                            "No fue posible cargar la vista previa de la fotografía."
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

    }


    // =========================================================
    // 9. QUITAR FOTOGRAFÍA
    // =========================================================

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


                mostrarFotografia(
                    ""
                );

            }
        );

    }


    // =========================================================
    // 10. VALIDAR NOMBRES
    // =========================================================

    function validarNombres() {

        if (!nombres) {
            return true;
        }


        const valor =
            nombres.value
                .trim()
                .replace(
                    /\s+/g,
                    " "
                );


        if (!valor) {

            mostrarErrorCampo(
                nombres,
                errorNombres,
                "Los nombres son obligatorios."
            );


            return false;

        }


        if (valor.length < 2) {

            mostrarErrorCampo(
                nombres,
                errorNombres,
                "El nombre debe tener mínimo 2 caracteres."
            );


            return false;

        }


        if (valor.length > 150) {

            mostrarErrorCampo(
                nombres,
                errorNombres,
                "Los nombres no pueden superar los 150 caracteres."
            );


            return false;

        }


        if (
            !REGEX_NOMBRE.test(
                valor
            )
        ) {

            mostrarErrorCampo(
                nombres,
                errorNombres,
                (
                    "Usa únicamente letras. "
                    +
                    "No se permiten números, símbolos "
                    +
                    "ni secuencias de guiones."
                )
            );


            return false;

        }


        limpiarErrorCampo(
            nombres,
            errorNombres
        );


        return true;

    }


    // =========================================================
    // 11. VALIDAR APELLIDOS
    // =========================================================

    function validarApellidos() {

        if (!apellidos) {
            return true;
        }


        const valor =
            apellidos.value
                .trim()
                .replace(
                    /\s+/g,
                    " "
                );


        if (!valor) {

            mostrarErrorCampo(
                apellidos,
                errorApellidos,
                "Los apellidos son obligatorios."
            );


            return false;

        }


        if (valor.length < 2) {

            mostrarErrorCampo(
                apellidos,
                errorApellidos,
                "El apellido debe tener mínimo 2 caracteres."
            );


            return false;

        }


        if (valor.length > 150) {

            mostrarErrorCampo(
                apellidos,
                errorApellidos,
                "Los apellidos no pueden superar los 150 caracteres."
            );


            return false;

        }


        if (
            !REGEX_NOMBRE.test(
                valor
            )
        ) {

            mostrarErrorCampo(
                apellidos,
                errorApellidos,
                (
                    "Usa únicamente letras. "
                    +
                    "No se permiten números, símbolos "
                    +
                    "ni secuencias de guiones."
                )
            );


            return false;

        }


        limpiarErrorCampo(
            apellidos,
            errorApellidos
        );


        return true;

    }


    // =========================================================
    // 12. VALIDAR CORREO
    // =========================================================

    function validarCorreo() {

        if (!correo) {
            return true;
        }


        correo.value =
            correo.value
                .trim()
                .toLowerCase();


        if (!correo.value) {

            mostrarErrorCampo(
                correo,
                errorCorreo,
                "El correo electrónico es obligatorio."
            );


            return false;

        }


        if (
            !REGEX_CORREO.test(
                correo.value
            )
        ) {

            mostrarErrorCampo(
                correo,
                errorCorreo,
                (
                    "Utiliza un correo válido de Gmail, "
                    +
                    "Hotmail, Outlook o Yahoo."
                )
            );


            return false;

        }


        limpiarErrorCampo(
            correo,
            errorCorreo
        );


        return true;

    }


    // =========================================================
    // 13. VALIDAR TELÉFONO
    // =========================================================

    function validarTelefono() {

        if (!telefono) {
            return true;
        }


        // =====================================================
        // SOLO NÚMEROS Y MÁXIMO 10 DÍGITOS
        // =====================================================

        telefono.value =
            telefono.value
                .replace(
                    /\D/g,
                    ""
                )
                .slice(
                    0,
                    10
                );


        // =====================================================
        // EL TELÉFONO ES OPCIONAL
        // =====================================================

        if (
            telefono.value
            ===
            ""
        ) {

            limpiarErrorCampo(
                telefono,
                errorTelefono,
                false
            );


            return true;

        }


        // =====================================================
        // DEBE COMENZAR POR 3
        // =====================================================

        if (
            !telefono.value.startsWith(
                "3"
            )
        ) {

            mostrarErrorCampo(
                telefono,
                errorTelefono,
                "El número de celular debe comenzar por 3."
            );


            return false;

        }


        // =====================================================
        // EXACTAMENTE 10 DÍGITOS
        // =====================================================

        if (
            telefono.value.length
            !==
            10
        ) {

            mostrarErrorCampo(
                telefono,
                errorTelefono,
                (
                    "El número de celular debe tener "
                    +
                    "exactamente 10 dígitos."
                )
            );


            return false;

        }


        // =====================================================
        // VALIDACIÓN FINAL
        // =====================================================

        if (
            !REGEX_TELEFONO.test(
                telefono.value
            )
        ) {

            mostrarErrorCampo(
                telefono,
                errorTelefono,
                "Ingresa un número de celular válido."
            );


            return false;

        }


        limpiarErrorCampo(
            telefono,
            errorTelefono
        );


        return true;

    }


    // =========================================================
    // 14. NORMALIZAR NOMBRES Y APELLIDOS
    // =========================================================

    function normalizarTextoNombre(
        campo
    ) {

        if (!campo) {
            return;
        }


        campo.value =
            campo.value
                .trim()
                .replace(
                    /\s+/g,
                    " "
                );

    }


    // =========================================================
    // 15. EVENTOS DE VALIDACIÓN EN TIEMPO REAL
    // =========================================================

    if (nombres) {

        nombres.addEventListener(
            "input",
            validarNombres
        );


        nombres.addEventListener(
            "blur",
            function () {

                normalizarTextoNombre(
                    nombres
                );


                validarNombres();

            }
        );

    }


    if (apellidos) {

        apellidos.addEventListener(
            "input",
            validarApellidos
        );


        apellidos.addEventListener(
            "blur",
            function () {

                normalizarTextoNombre(
                    apellidos
                );


                validarApellidos();

            }
        );

    }


    if (correo) {

        correo.addEventListener(
            "input",
            validarCorreo
        );


        correo.addEventListener(
            "blur",
            validarCorreo
        );

    }


    if (telefono) {

        telefono.addEventListener(
            "input",
            validarTelefono
        );


        telefono.addEventListener(
            "blur",
            validarTelefono
        );

    }


    // =========================================================
    // 16. ENVIAR FORMULARIO DE PERFIL
    // =========================================================

    if (formularioPerfil) {

        formularioPerfil.addEventListener(
            "submit",
            function (
                evento
            ) {

                // =================================================
                // NORMALIZAR TEXTO ANTES DE VALIDAR
                // =================================================

                normalizarTextoNombre(
                    nombres
                );


                normalizarTextoNombre(
                    apellidos
                );


                // =================================================
                // VALIDAR CAMPOS
                // =================================================

                const nombresValidos =
                    validarNombres();


                const apellidosValidos =
                    validarApellidos();


                const correoValido =
                    validarCorreo();


                const telefonoValido =
                    validarTelefono();


                if (
                    !nombresValidos
                    ||
                    !apellidosValidos
                    ||
                    !correoValido
                    ||
                    !telefonoValido
                ) {

                    evento.preventDefault();


                    const primerCampoInvalido =
                        formularioPerfil.querySelector(
                            ".is-invalid"
                        );


                    if (primerCampoInvalido) {

                        primerCampoInvalido.focus();


                        primerCampoInvalido.scrollIntoView({

                            behavior:
                                "smooth",

                            block:
                                "center"

                        });

                    }


                    return;

                }


                // =================================================
                // VALIDAR FOTO UNA ÚLTIMA VEZ
                // =================================================

                if (
                    inputFoto
                    &&
                    inputFoto.files
                    &&
                    inputFoto.files.length > 0
                ) {

                    const validacionFoto =
                        validarFotografia(
                            inputFoto.files[0]
                        );


                    if (
                        !validacionFoto.valido
                    ) {

                        evento.preventDefault();


                        window.alert(
                            validacionFoto.mensaje
                        );


                        return;

                    }

                }


                // =================================================
                // EVITAR DOBLE CLICK
                // =================================================

                if (botonGuardarPerfil) {

                    botonGuardarPerfil.disabled =
                        true;


                    botonGuardarPerfil.innerHTML = `
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

    }


    // =========================================================
    // =========================================================
    // 18. SEGURIDAD - CONTRASEÑA
    // =========================================================
    // =========================================================

    const formularioPassword =
        document.getElementById(
            "formCambiarPasswordPerfil"
        );


    const passwordActual =
        document.getElementById(
            "passwordActualPerfil"
        );


    const passwordNueva =
        document.getElementById(
            "passwordNuevoPerfil"
        );


    const confirmarPassword =
        document.getElementById(
            "confirmarPasswordPerfil"
        );


    const mensajePassword =
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


    const botonCambiarPassword =
        document.getElementById(
            "btnCambiarPasswordPerfil"
        );


    // =========================================================
    // 19. MOSTRAR / OCULTAR CONTRASEÑA
    // =========================================================

    document
        .querySelectorAll(
            ".btn-password-perfil"
        )
        .forEach(
            function (
                boton
            ) {

                boton.addEventListener(
                    "click",
                    function () {

                        const idInput =
                            boton.getAttribute(
                                "data-password-target"
                            );


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
                            input.type
                            ===
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


                        boton.setAttribute(
                            "aria-label",
                            estaOculta
                                ? "Ocultar contraseña"
                                : "Mostrar contraseña"
                        );


                        boton.setAttribute(
                            "title",
                            estaOculta
                                ? "Ocultar contraseña"
                                : "Mostrar contraseña"
                        );

                    }
                );

            }
        );


    // =========================================================
    // 20. ACTUALIZAR INDICADORES DE CONTRASEÑA
    // =========================================================

    function actualizarIndicadoresPassword() {

        if (
            !passwordNueva
            ||
            !confirmarPassword
        ) {

            return;

        }


        const nueva =
            passwordNueva.value;


        const confirmacion =
            confirmarPassword.value;


        // =====================================================
        // MOSTRAR PANEL SOLO CUANDO EMPIECE A ESCRIBIR
        // =====================================================

        if (estadoPassword) {

            estadoPassword.classList.toggle(
                "d-none",
                nueva === ""
                &&
                confirmacion === ""
            );

        }


        // =====================================================
        // LONGITUD
        // =====================================================

        const longitudValida =
            nueva.length >= 8;


        actualizarReglaPassword(
            iconoLongitud,
            longitudValida
        );


        // =====================================================
        // COINCIDENCIA
        // =====================================================

        const coinciden = (
            nueva !== ""
            &&
            confirmacion !== ""
            &&
            nueva === confirmacion
        );


        actualizarReglaPassword(
            iconoCoincidencia,
            coinciden
        );


        // =====================================================
        // MENSAJE DE NO COINCIDENCIA
        // =====================================================

        if (mensajePassword) {

            const mostrarError = (
                confirmacion !== ""
                &&
                nueva !== confirmacion
            );


            mensajePassword.classList.toggle(
                "d-none",
                !mostrarError
            );

        }


        // =====================================================
        // ESTADO VISUAL CONFIRMACIÓN
        // =====================================================

        if (confirmarPassword) {

            confirmarPassword.classList.remove(
                "is-valid",
                "is-invalid"
            );


            if (
                confirmacion !== ""
            ) {

                confirmarPassword.classList.add(
                    coinciden
                        ? "is-valid"
                        : "is-invalid"
                );

            }

        }

    }


    // =========================================================
    // 21. ACTUALIZAR REGLA INDIVIDUAL
    // =========================================================

    function actualizarReglaPassword(
        icono,
        valida
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
                "valida",
                "invalida"
            );

        }


        if (valida) {

            icono.classList.add(
                "bi-check-circle-fill"
            );


            if (contenedor) {

                contenedor.classList.add(
                    "valida"
                );

            }

        } else {

            icono.classList.add(
                "bi-x-circle-fill"
            );


            if (contenedor) {

                contenedor.classList.add(
                    "invalida"
                );

            }

        }

    }


    // =========================================================
    // 22. EVENTOS DE CONTRASEÑA
    // =========================================================

    if (passwordNueva) {

        passwordNueva.addEventListener(
            "input",
            actualizarIndicadoresPassword
        );

    }


    if (confirmarPassword) {

        confirmarPassword.addEventListener(
            "input",
            actualizarIndicadoresPassword
        );

    }


    // =========================================================
    // 23. VALIDAR FORMULARIO DE CONTRASEÑA
    // =========================================================

    function validarFormularioPassword() {

        if (
            !passwordActual
            ||
            !passwordNueva
            ||
            !confirmarPassword
        ) {

            return false;

        }


        let valido =
            true;


        // =====================================================
        // LIMPIAR
        // =====================================================

        [
            passwordActual,
            passwordNueva,
            confirmarPassword
        ].forEach(
            function (
                campo
            ) {

                campo.classList.remove(
                    "is-valid",
                    "is-invalid"
                );

            }
        );


        // =====================================================
        // ACTUAL
        // =====================================================

        if (
            passwordActual.value.trim()
            ===
            ""
        ) {

            passwordActual.classList.add(
                "is-invalid"
            );


            valido =
                false;

        } else {

            passwordActual.classList.add(
                "is-valid"
            );

        }


        // =====================================================
        // NUEVA
        // =====================================================

        if (
            passwordNueva.value.length
            <
            8
        ) {

            passwordNueva.classList.add(
                "is-invalid"
            );


            valido =
                false;

        } else {

            passwordNueva.classList.add(
                "is-valid"
            );

        }


        // =====================================================
        // CONFIRMACIÓN
        // =====================================================

        if (
            confirmarPassword.value
            ===
            ""
            ||
            passwordNueva.value
            !==
            confirmarPassword.value
        ) {

            confirmarPassword.classList.add(
                "is-invalid"
            );


            valido =
                false;


            if (mensajePassword) {

                mensajePassword.classList.remove(
                    "d-none"
                );

            }

        } else {

            confirmarPassword.classList.add(
                "is-valid"
            );


            if (mensajePassword) {

                mensajePassword.classList.add(
                    "d-none"
                );

            }

        }


        actualizarIndicadoresPassword();


        return valido;

    }


    // =========================================================
    // 24. SUBMIT CONTRASEÑA
    // =========================================================

    if (formularioPassword) {

        formularioPassword.addEventListener(
            "submit",
            function (
                evento
            ) {

                if (
                    !validarFormularioPassword()
                ) {

                    evento.preventDefault();


                    const primerInvalido =
                        formularioPassword.querySelector(
                            ".is-invalid"
                        );


                    if (primerInvalido) {

                        primerInvalido.focus();

                    }


                    return;

                }


                if (botonCambiarPassword) {

                    botonCambiarPassword.disabled =
                        true;


                    botonCambiarPassword.innerHTML = `
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

            }
        );

    }


    // =========================================================
    // 25. RESTAURAR BOTONES AL VOLVER CON ATRÁS
    // =========================================================

    window.addEventListener(
        "pageshow",
        function () {

            if (botonGuardarPerfil) {

                botonGuardarPerfil.disabled =
                    false;


                botonGuardarPerfil.innerHTML = `
                    <i class="bi bi-floppy-fill me-2"></i>
                    Guardar cambios
                `;

            }


            if (botonCambiarPassword) {

                botonCambiarPassword.disabled =
                    false;


                botonCambiarPassword.innerHTML = `
                    <i class="bi bi-shield-lock-fill me-2"></i>
                    Actualizar contraseña
                `;

            }

        }
    );


    // =========================================================
    // FIN PERFIL DEL APICULTOR
    // =========================================================

});


/* ==========================================================
   ==========================================================
   PESTAÑAS DEL PERFIL

   Mismo comportamiento que el panel del administrador: cada
   grupo de botones [data-tab-target] controla los paneles
   [data-tab-panel] que son hijos DIRECTOS del contenedor del
   grupo.

   Ese detalle importa: sin el ":scope >", las pestañas
   principales también ocultarían los paneles de las
   sub-pestañas de Seguridad, porque están anidados dentro.
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {

    document
        .querySelectorAll(
            ".perfil-tabs-principales, .perfil-subtabs"
        )
        .forEach(
            function (
                grupo
            ) {

                const contenedor =
                    grupo.parentElement;


                if (!contenedor) {

                    return;

                }


                const botones =
                    grupo.querySelectorAll(
                        "[data-tab-target]"
                    );


                botones.forEach(
                    function (
                        boton
                    ) {

                        boton.addEventListener(
                            "click",
                            function () {

                                const destino =
                                    boton.dataset.tabTarget;


                                botones.forEach(
                                    function (
                                        otro
                                    ) {

                                        otro.classList.remove(
                                            "activo"
                                        );


                                        otro.setAttribute(
                                            "aria-selected",
                                            "false"
                                        );

                                    }
                                );


                                boton.classList.add(
                                    "activo"
                                );


                                boton.setAttribute(
                                    "aria-selected",
                                    "true"
                                );


                                contenedor
                                    .querySelectorAll(
                                        ":scope > [data-tab-panel]"
                                    )
                                    .forEach(
                                        function (
                                            panel
                                        ) {

                                            panel.classList.toggle(
                                                "d-none",
                                                panel.dataset.tabPanel
                                                !==
                                                destino
                                            );

                                        }
                                    );

                            }
                        );

                    }
                );

            }
        );


    // =========================================================
    // ABRIR LA PESTAÑA CORRECTA AL PAGINAR EL HISTORIAL
    //
    // El historial se pagina con:
    //
    // ?page_accesos=N
    //
    // Sin esto, al cambiar de página volvería a Información.
    // =========================================================

    const parametros =
        new URLSearchParams(
            window.location.search
        );


    if (
        parametros.has(
            "page_accesos"
        )
    ) {

        const btnSeguridad =
            document.querySelector(
                '.perfil-tab-btn[data-tab-target="perfil-tab-seguridad"]'
            );


        const btnHistorial =
            document.querySelector(
                '.perfil-subtab-btn[data-tab-target="sub-historial"]'
            );


        if (btnSeguridad) {

            btnSeguridad.click();

        }


        if (btnHistorial) {

            btnHistorial.click();

        }

    }

});