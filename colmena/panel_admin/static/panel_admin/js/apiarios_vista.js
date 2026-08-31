document.addEventListener("DOMContentLoaded", function () {

    // =========================================================
    // CONFIGURACIÓN GENERAL
    // =========================================================

    const CLAVE_LOCALSTORAGE = "vistaApiarios";

    const CANTIDAD_MAXIMA_COLMENAS = 20;

    const AÑO_MINIMO_FECHA = 1900;

    const RETRASO_DEBOUNCE_MS = 200;


    // =========================================================
    // FIX:
    // MOVER MODALES FUERA DE LOS CONTENEDORES DE VISTA
    // =========================================================
    //
    // Los modales de detalle y edición se generan dentro
    // del ciclo de la tabla.
    //
    // Al cambiar a vista de tarjetas, #vistaTablaApiarios
    // pasa a display:none.
    //
    // Para evitar que Bootstrap intente mostrar un modal
    // dentro de un elemento oculto, los movemos al <body>.
    //
    // El nuevo modalEliminarApiario ya se encuentra fuera
    // de los ciclos, pero esta lógica sigue siendo necesaria
    // para Detalle y Editar.
    // =========================================================

    document
        .querySelectorAll(
            "#vistaTablaApiarios .modal, " +
            "#vistaTarjetasApiarios .modal"
        )
        .forEach(function (modal) {

            document.body.appendChild(modal);

        });


    // =========================================================
    // ELEMENTOS DE LAS VISTAS
    // =========================================================

    const btnVistaTabla = (
        document.getElementById(
            "btnVistaTabla"
        )
    );

    const btnVistaTarjetas = (
        document.getElementById(
            "btnVistaTarjetas"
        )
    );

    const vistaTabla = (
        document.getElementById(
            "vistaTablaApiarios"
        )
    );

    const vistaTarjetas = (
        document.getElementById(
            "vistaTarjetasApiarios"
        )
    );


    // =========================================================
    // ENTRADA ESCALONADA
    // =========================================================

    function aplicarEntradaEscalonada(
        contenedor,
        selectorHijos,
        retrasoEntreElementos
    ) {

        if (!contenedor) {
            return;
        }


        const hijos = (
            contenedor.querySelectorAll(
                selectorHijos
            )
        );


        hijos.forEach(
            function (hijo, indice) {

                // Reiniciar animación
                hijo.classList.remove(
                    "anim-entrada-lista"
                );


                // Forzar reflow para permitir
                // volver a disparar la animación
                void hijo.offsetWidth;


                hijo.style.animationDelay = (
                    indice *
                    retrasoEntreElementos
                ) + "ms";


                hijo.classList.add(
                    "anim-entrada-lista"
                );

            }
        );

    }


    // =========================================================
    // ANIMACIÓN INICIAL
    // =========================================================

    aplicarEntradaEscalonada(
        vistaTabla,
        "tbody tr",
        45
    );

    aplicarEntradaEscalonada(
        vistaTarjetas,
        ".tarjeta-apiario",
        70
    );


    // =========================================================
    // ACTIVAR BOTÓN DEL SELECTOR
    // =========================================================

    function activarBoton(
        botonActivo,
        botonInactivo
    ) {

        if (botonActivo) {

            botonActivo.classList.add(
                "activo"
            );

        }


        if (botonInactivo) {

            botonInactivo.classList.remove(
                "activo"
            );

        }

    }


    // =========================================================
    // MOSTRAR UNA VISTA
    // =========================================================

    function mostrarVista(
        elementoAMostrar,
        elementoAOcultar
    ) {

        if (
            !elementoAMostrar
            ||
            !elementoAOcultar
        ) {

            return;

        }


        // -----------------------------------------------------
        // Salida
        // -----------------------------------------------------

        elementoAOcultar.classList.add(
            "vista-saliendo"
        );


        window.setTimeout(
            function () {

                // Ocultar anterior
                elementoAOcultar.style.display =
                    "none";


                elementoAOcultar.classList.remove(
                    "vista-saliendo"
                );


                // -------------------------------------------------
                // Mostrar nueva vista
                // -------------------------------------------------

                elementoAMostrar.style.display = (
                    elementoAMostrar.id ===
                    "vistaTarjetasApiarios"
                )
                    ? "grid"
                    : "block";


                elementoAMostrar.classList.add(
                    "vista-entrando"
                );


                // -------------------------------------------------
                // Entrada escalonada
                // -------------------------------------------------

                if (
                    elementoAMostrar.id ===
                    "vistaTarjetasApiarios"
                ) {

                    aplicarEntradaEscalonada(
                        elementoAMostrar,
                        ".tarjeta-apiario",
                        70
                    );

                } else {

                    aplicarEntradaEscalonada(
                        elementoAMostrar,
                        "tbody tr",
                        45
                    );

                }


                window.setTimeout(
                    function () {

                        elementoAMostrar
                            .classList
                            .remove(
                                "vista-entrando"
                            );

                    },
                    340
                );

            },
            180
        );

    }


    // =========================================================
    // IR A VISTA TABLA
    // =========================================================

    function irAVistaTabla() {

        if (
            !vistaTabla
            ||
            !vistaTarjetas
            ||
            !btnVistaTabla
            ||
            !btnVistaTarjetas
        ) {

            return;

        }


        if (
            vistaTabla.style.display !== "none"
            &&
            btnVistaTabla.classList.contains(
                "activo"
            )
        ) {

            return;

        }


        mostrarVista(
            vistaTabla,
            vistaTarjetas
        );


        activarBoton(
            btnVistaTabla,
            btnVistaTarjetas
        );


        localStorage.setItem(
            CLAVE_LOCALSTORAGE,
            "tabla"
        );

    }


    // =========================================================
    // IR A VISTA TARJETAS
    // =========================================================

    function irAVistaTarjetas() {

        if (
            !vistaTabla
            ||
            !vistaTarjetas
            ||
            !btnVistaTabla
            ||
            !btnVistaTarjetas
        ) {

            return;

        }


        if (
            vistaTarjetas.style.display !== "none"
            &&
            btnVistaTarjetas.classList.contains(
                "activo"
            )
        ) {

            return;

        }


        mostrarVista(
            vistaTarjetas,
            vistaTabla
        );


        activarBoton(
            btnVistaTarjetas,
            btnVistaTabla
        );


        localStorage.setItem(
            CLAVE_LOCALSTORAGE,
            "tarjetas"
        );

    }


    // =========================================================
    // EVENTOS DEL SELECTOR
    // =========================================================

    if (
        btnVistaTabla
        &&
        btnVistaTarjetas
        &&
        vistaTabla
        &&
        vistaTarjetas
    ) {

        btnVistaTabla.addEventListener(
            "click",
            irAVistaTabla
        );


        btnVistaTarjetas.addEventListener(
            "click",
            irAVistaTarjetas
        );


        // =====================================================
        // RECORDAR ÚLTIMA VISTA
        // =====================================================

        const vistaGuardada = (
            localStorage.getItem(
                CLAVE_LOCALSTORAGE
            )
        );


        if (
            vistaGuardada ===
            "tarjetas"
        ) {

            vistaTabla.style.display =
                "none";


            vistaTarjetas.style.display =
                "grid";


            activarBoton(
                btnVistaTarjetas,
                btnVistaTabla
            );


            aplicarEntradaEscalonada(
                vistaTarjetas,
                ".tarjeta-apiario",
                70
            );

        } else {

            vistaTabla.style.display =
                "block";


            vistaTarjetas.style.display =
                "none";


            activarBoton(
                btnVistaTabla,
                btnVistaTarjetas
            );


            aplicarEntradaEscalonada(
                vistaTabla,
                "tbody tr",
                45
            );

        }

    }


    // =========================================================
    // UTILIDADES DE VALIDACIÓN
    // =========================================================

    function limpiarValidez(campo) {

        if (!campo) {
            return;
        }


        campo.setCustomValidity("");

    }


    function marcarInvalido(
        campo,
        mensaje
    ) {

        if (!campo) {
            return;
        }


        campo.setCustomValidity(
            mensaje
        );

    }


    // =========================================================
    // VALIDACIÓN GENERAL DEL FORMULARIO
    // =========================================================

    function validarFormularioApiario(
        formulario
    ) {

        let esValido = true;


        // =====================================================
        // NOMBRE DEL APIARIO
        // =====================================================

        const nombre = (
            formulario.querySelector(
                '[name="nombre_apiario"]'
            )
        );


        if (nombre) {

            limpiarValidez(
                nombre
            );


            const valor = (
                nombre.value.trim()
            );


            if (!valor) {

                marcarInvalido(
                    nombre,
                    "El nombre del apiario es obligatorio."
                );

                esValido = false;


            } else if (
                valor.length > 100
            ) {

                marcarInvalido(
                    nombre,
                    "El nombre no puede superar los 100 caracteres."
                );

                esValido = false;

            }

        }


        // =====================================================
        // UBICACIÓN
        // =====================================================

        const ubicacion = (
            formulario.querySelector(
                '[name="ubicacion"]'
            )
        );


        if (ubicacion) {

            limpiarValidez(
                ubicacion
            );


            const valor = (
                ubicacion.value.trim()
            );


            if (!valor) {

                marcarInvalido(
                    ubicacion,
                    "La ubicación es obligatoria."
                );

                esValido = false;


            } else if (
                valor.length > 150
            ) {

                marcarInvalido(
                    ubicacion,
                    "La ubicación no puede superar los 150 caracteres."
                );

                esValido = false;

            }

        }


        // =====================================================
        // CANTIDAD DE COLMENAS
        // =====================================================

        const cantidad = (
            formulario.querySelector(
                '[name="cantidad_colmenas"]'
            )
        );


        if (cantidad) {

            limpiarValidez(
                cantidad
            );


            const valorTexto = (
                cantidad.value.trim()
            );


            const valorNumero = (
                Number(
                    valorTexto
                )
            );


            if (!valorTexto) {

                marcarInvalido(
                    cantidad,
                    "La cantidad de colmenas es obligatoria."
                );

                esValido = false;


            } else if (
                !Number.isInteger(
                    valorNumero
                )
            ) {

                marcarInvalido(
                    cantidad,
                    "La cantidad de colmenas debe ser un número entero."
                );

                esValido = false;


            } else if (
                valorNumero < 0
            ) {

                marcarInvalido(
                    cantidad,
                    "La cantidad de colmenas no puede ser negativa."
                );

                esValido = false;


            } else if (
                valorNumero >
                CANTIDAD_MAXIMA_COLMENAS
            ) {

                marcarInvalido(
                    cantidad,
                    `La cantidad de colmenas no puede superar ${CANTIDAD_MAXIMA_COLMENAS} por apiario.`
                );

                esValido = false;

            }

        }


        // =====================================================
        // FECHA DE REGISTRO
        // =====================================================

        const fecha = (
            formulario.querySelector(
                '[name="fecha_registro"]'
            )
        );


        if (fecha) {

            limpiarValidez(
                fecha
            );


            const valorTexto = (
                fecha.value
            );


            if (!valorTexto) {

                marcarInvalido(
                    fecha,
                    "La fecha de registro es obligatoria."
                );

                esValido = false;


            } else {

                const fechaSeleccionada = (
                    new Date(
                        valorTexto +
                        "T00:00:00"
                    )
                );


                const hoy = new Date();


                hoy.setHours(
                    0,
                    0,
                    0,
                    0
                );


                if (
                    fechaSeleccionada >
                    hoy
                ) {

                    marcarInvalido(
                        fecha,
                        "La fecha de registro no puede ser una fecha futura."
                    );

                    esValido = false;


                } else if (
                    fechaSeleccionada
                        .getFullYear()
                    <
                    AÑO_MINIMO_FECHA
                ) {

                    marcarInvalido(
                        fecha,
                        "La fecha de registro no es válida."
                    );

                    esValido = false;

                }

            }

        }


        // =====================================================
        // APICULTOR RESPONSABLE
        // =====================================================

        const apicultor = (
            formulario.querySelector(
                '[name="id_apicultor"]'
            )
        );


        if (apicultor) {

            limpiarValidez(
                apicultor
            );


            if (!apicultor.value) {

                marcarInvalido(
                    apicultor,
                    "Debes seleccionar un apicultor responsable."
                );

                esValido = false;

            }

        }


        // =====================================================
        // IMAGEN
        // =====================================================

        const imagen = (
            formulario.querySelector(
                '[name="imagen"]'
            )
        );


        if (
            imagen
            &&
            imagen.files
            &&
            imagen.files.length > 0
        ) {

            limpiarValidez(
                imagen
            );


            const archivo = (
                imagen.files[0]
            );


            const tiposPermitidos = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];


            const tamanoMaximo = (
                5 *
                1024 *
                1024
            );


            if (
                !tiposPermitidos.includes(
                    archivo.type
                )
            ) {

                marcarInvalido(
                    imagen,
                    "La imagen debe estar en formato JPG, PNG o WEBP."
                );

                esValido = false;


            } else if (
                archivo.size >
                tamanoMaximo
            ) {

                marcarInvalido(
                    imagen,
                    "La imagen no puede superar los 5 MB."
                );

                esValido = false;

            }

        }


        return esValido;

    }


    // =========================================================
    // VALIDAR FORMULARIOS AL ENVIAR
    // =========================================================

    document
        .querySelectorAll(
            ".form-validar-apiario"
        )
        .forEach(
            function (formulario) {

                formulario.addEventListener(
                    "submit",
                    function (evento) {

                        const esValido = (
                            validarFormularioApiario(
                                formulario
                            )
                        );


                        const campoNombre = (
                            formulario.querySelector(
                                '[name="nombre_apiario"]'
                            )
                        );


                        // -----------------------------------------
                        // Nombre duplicado
                        // -----------------------------------------

                        if (
                            campoNombre
                            &&
                            campoNombre.dataset
                                .nombreDuplicado ===
                                "1"
                        ) {

                            evento.preventDefault();

                            evento.stopPropagation();

                            campoNombre.reportValidity();

                            return;

                        }


                        // -----------------------------------------
                        // Validaciones generales
                        // -----------------------------------------

                        if (
                            !esValido
                            ||
                            !formulario.checkValidity()
                        ) {

                            evento.preventDefault();

                            evento.stopPropagation();

                            formulario.reportValidity();

                        }

                    }
                );

            }
        );


    // =========================================================
    // MARCAR CAMPO VISUALMENTE
    // =========================================================

    function marcarCampo(
        campo,
        esValido,
        mensajeError
    ) {

        if (!campo) {
            return;
        }


        campo.classList.remove(
            "is-valid",
            "is-invalid"
        );


        // =====================================================
        // ESTADO NEUTRO
        // =====================================================

        if (
            esValido === null
        ) {

            campo.setCustomValidity("");

            return;

        }


        // =====================================================
        // VÁLIDO
        // =====================================================

        if (esValido) {

            campo.classList.add(
                "is-valid"
            );


            campo.setCustomValidity(
                ""
            );


            return;

        }


        // =====================================================
        // INVÁLIDO
        // =====================================================

        campo.classList.add(
            "is-invalid"
        );


        campo.setCustomValidity(
            mensajeError
            ||
            "Dato inválido."
        );


        const feedback = (
            campo.parentElement
                .querySelector(
                    ".invalid-feedback"
                )
        );


        if (feedback) {

            feedback.textContent = (
                mensajeError
                ||
                ""
            );

        }

    }


    // =========================================================
    // DEBOUNCE
    // =========================================================

    function debounce(
        funcion,
        espera
    ) {

        let temporizador = null;


        return function (...args) {

            const contexto = this;


            clearTimeout(
                temporizador
            );


            temporizador = setTimeout(
                function () {

                    funcion.apply(
                        contexto,
                        args
                    );

                },
                espera
            );

        };

    }


    // =========================================================
    // VERIFICAR NOMBRE DEL APIARIO
    // =========================================================

    function verificarNombreApiario(
        campoNombre,
        idApiarioActual
    ) {

        const nombre = (
            campoNombre.value.trim()
        );


        if (!nombre) {

            marcarCampo(
                campoNombre,
                null
            );


            campoNombre.dataset.nombreDuplicado =
                "0";


            return;

        }


        // =====================================================
        // VALIDAR QUE EXISTA LA URL
        // =====================================================

        if (
            typeof URL_VERIFICAR_NOMBRE_APIARIO ===
            "undefined"
        ) {

            return;

        }


        // =====================================================
        // CREAR URL
        // =====================================================

        let url = (
            URL_VERIFICAR_NOMBRE_APIARIO
            +
            "?nombre="
            +
            encodeURIComponent(
                nombre
            )
        );


        if (idApiarioActual) {

            url += (
                "&id_apiario="
                +
                encodeURIComponent(
                    idApiarioActual
                )
            );

        }


        // =====================================================
        // CONSULTA AL BACKEND
        // =====================================================

        fetch(
            url
        )
            .then(
                function (respuesta) {

                    if (!respuesta.ok) {

                        throw new Error(
                            "Respuesta HTTP no válida."
                        );

                    }


                    return respuesta.json();

                }
            )
            .then(
                function (datos) {

                    // -----------------------------------------
                    // El usuario pudo haber cambiado el texto
                    // mientras llegaba la respuesta.
                    // -----------------------------------------

                    if (
                        campoNombre.value.trim()
                        !==
                        nombre
                    ) {

                        return;

                    }


                    if (datos.existe) {

                        marcarCampo(
                            campoNombre,
                            false,
                            "Ya existe un apiario con ese nombre."
                        );


                        campoNombre.dataset
                            .nombreDuplicado =
                            "1";


                    } else {

                        marcarCampo(
                            campoNombre,
                            true
                        );


                        campoNombre.dataset
                            .nombreDuplicado =
                            "0";

                    }

                }
            )
            .catch(
                function (error) {

                    console.error(
                        "No fue posible verificar el nombre del apiario:",
                        error
                    );


                    // El servidor sigue siendo
                    // la validación definitiva.
                    campoNombre.dataset
                        .nombreDuplicado =
                        "0";

                }
            );

    }


    // =========================================================
    // VALIDACIÓN EN VIVO - NOMBRE
    // =========================================================

    document
        .querySelectorAll(
            '.form-validar-apiario [name="nombre_apiario"]'
        )
        .forEach(
            function (campoNombre) {

                const formulario = (
                    campoNombre.closest(
                        "form"
                    )
                );


                const idApiarioActual = (
                    formulario
                    ?
                    formulario.dataset
                        .idApiario
                    :
                    ""
                );


                const verificarConRetraso = (
                    debounce(
                        function () {

                            verificarNombreApiario(
                                campoNombre,
                                idApiarioActual
                            );

                        },
                        RETRASO_DEBOUNCE_MS
                    )
                );


                campoNombre.addEventListener(
                    "input",
                    function () {

                        const valor = (
                            campoNombre.value.trim()
                        );


                        // -----------------------------------------
                        // Vacío
                        // -----------------------------------------

                        if (!valor) {

                            marcarCampo(
                                campoNombre,
                                null
                            );


                            campoNombre.dataset
                                .nombreDuplicado =
                                "0";


                            return;

                        }


                        // -----------------------------------------
                        // Más de 100 caracteres
                        // -----------------------------------------

                        if (
                            valor.length >
                            100
                        ) {

                            marcarCampo(
                                campoNombre,
                                false,
                                "El nombre no puede superar los 100 caracteres."
                            );


                            campoNombre.dataset
                                .nombreDuplicado =
                                "0";


                            return;

                        }


                        // -----------------------------------------
                        // Consultar backend
                        // -----------------------------------------

                        verificarConRetraso();

                    }
                );

            }
        );


    // =========================================================
    // VALIDACIÓN EN VIVO - CANTIDAD DE COLMENAS
    // =========================================================

    document
        .querySelectorAll(
            '.form-validar-apiario [name="cantidad_colmenas"]'
        )
        .forEach(
            function (campoCantidad) {

                campoCantidad.addEventListener(
                    "input",
                    function () {

                        const valorTexto = (
                            campoCantidad.value.trim()
                        );


                        // -----------------------------------------
                        // Vacío
                        // -----------------------------------------

                        if (!valorTexto) {

                            marcarCampo(
                                campoCantidad,
                                null
                            );

                            return;

                        }


                        const valorNumero = (
                            Number(
                                valorTexto
                            )
                        );


                        // -----------------------------------------
                        // Número entero
                        // -----------------------------------------

                        if (
                            !Number.isInteger(
                                valorNumero
                            )
                        ) {

                            marcarCampo(
                                campoCantidad,
                                false,
                                "Debe ser un número entero."
                            );


                        } else if (
                            valorNumero < 0
                        ) {

                            marcarCampo(
                                campoCantidad,
                                false,
                                "No puede ser negativo."
                            );


                        } else if (
                            valorNumero >
                            CANTIDAD_MAXIMA_COLMENAS
                        ) {

                            marcarCampo(
                                campoCantidad,
                                false,
                                `No puede superar ${CANTIDAD_MAXIMA_COLMENAS} colmenas.`
                            );


                        } else {

                            marcarCampo(
                                campoCantidad,
                                true
                            );

                        }

                    }
                );

            }
        );


    // =========================================================
    // MODAL ELIMINAR APIARIO
    // =========================================================

    const modalEliminarApiario = (
        document.getElementById(
            "modalEliminarApiario"
        )
    );


    const formEliminarApiario = (
        document.getElementById(
            "formEliminarApiario"
        )
    );


    const nombreApiarioEliminar = (
        document.getElementById(
            "nombreApiarioEliminar"
        )
    );


    const alertaEliminacionPermitida = (
        document.getElementById(
            "alertaEliminacionApiarioPermitida"
        )
    );


    const alertaEliminacionBloqueada = (
        document.getElementById(
            "alertaEliminacionApiarioBloqueada"
        )
    );


    const mensajeColmenasEliminar = (
        document.getElementById(
            "mensajeColmenasApiarioEliminar"
        )
    );


    const btnConfirmarEliminar = (
        document.getElementById(
            "btnConfirmarEliminarApiario"
        )
    );


    // =========================================================
    // ABRIR MODAL ELIMINAR
    // =========================================================

    if (modalEliminarApiario) {

        modalEliminarApiario.addEventListener(
            "show.bs.modal",
            function (evento) {

                const boton = (
                    evento.relatedTarget
                );


                if (!boton) {
                    return;
                }


                // =================================================
                // RECIBIR DATOS DEL BOTÓN
                // =================================================

                const nombre = (
                    boton.dataset.nombre
                    ||
                    "Apiario"
                );


                const url = (
                    boton.dataset.url
                    ||
                    ""
                );


                const cantidadColmenas = (
                    Number.parseInt(
                        boton.dataset.colmenas
                        ||
                        "0",
                        10
                    )
                );


                const totalColmenas = (
                    Number.isNaN(
                        cantidadColmenas
                    )
                    ?
                    0
                    :
                    cantidadColmenas
                );


                // =================================================
                // NOMBRE DEL APIARIO
                // =================================================

                if (nombreApiarioEliminar) {

                    nombreApiarioEliminar
                        .textContent =
                        nombre;

                }


                // =================================================
                // URL DEL FORMULARIO
                // =================================================

                if (formEliminarApiario) {

                    formEliminarApiario.action =
                        url;

                }


                // =================================================
                // APIARIO CON COLMENAS
                // =================================================

                if (
                    totalColmenas > 0
                ) {

                    // ---------------------------------------------
                    // Ocultar permitido
                    // ---------------------------------------------

                    if (
                        alertaEliminacionPermitida
                    ) {

                        alertaEliminacionPermitida
                            .classList
                            .add(
                                "d-none"
                            );

                    }


                    // ---------------------------------------------
                    // Mostrar bloqueado
                    // ---------------------------------------------

                    if (
                        alertaEliminacionBloqueada
                    ) {

                        alertaEliminacionBloqueada
                            .classList
                            .remove(
                                "d-none"
                            );

                    }


                    // ---------------------------------------------
                    // Mensaje
                    // ---------------------------------------------

                    if (
                        mensajeColmenasEliminar
                    ) {

                        const palabraColmena = (
                            totalColmenas === 1
                            ?
                            "colmena asociada"
                            :
                            "colmenas asociadas"
                        );


                        mensajeColmenasEliminar
                            .textContent =
                            (
                                `Este apiario tiene `
                                +
                                `${totalColmenas} `
                                +
                                `${palabraColmena}. `
                                +
                                `Debes gestionarlas antes `
                                +
                                `de eliminar el apiario.`
                            );

                    }


                    // ---------------------------------------------
                    // Deshabilitar botón
                    // ---------------------------------------------

                    if (
                        btnConfirmarEliminar
                    ) {

                        btnConfirmarEliminar.disabled =
                            true;


                        btnConfirmarEliminar
                            .classList
                            .add(
                                "disabled"
                            );


                        btnConfirmarEliminar
                            .setAttribute(
                                "aria-disabled",
                                "true"
                            );

                    }


                    return;

                }


                // =================================================
                // APIARIO SIN COLMENAS
                // =================================================

                if (
                    alertaEliminacionPermitida
                ) {

                    alertaEliminacionPermitida
                        .classList
                        .remove(
                            "d-none"
                        );

                }


                if (
                    alertaEliminacionBloqueada
                ) {

                    alertaEliminacionBloqueada
                        .classList
                        .add(
                            "d-none"
                        );

                }


                if (
                    btnConfirmarEliminar
                ) {

                    btnConfirmarEliminar.disabled =
                        false;


                    btnConfirmarEliminar
                        .classList
                        .remove(
                            "disabled"
                        );


                    btnConfirmarEliminar
                        .removeAttribute(
                            "aria-disabled"
                        );

                }

            }
        );


        // =====================================================
        // LIMPIAR MODAL AL CERRAR
        // =====================================================

        modalEliminarApiario.addEventListener(
            "hidden.bs.modal",
            function () {

                if (
                    nombreApiarioEliminar
                ) {

                    nombreApiarioEliminar
                        .textContent =
                        "Apiario";

                }


                if (
                    formEliminarApiario
                ) {

                    formEliminarApiario.action =
                        "";

                }


                if (
                    alertaEliminacionPermitida
                ) {

                    alertaEliminacionPermitida
                        .classList
                        .remove(
                            "d-none"
                        );

                }


                if (
                    alertaEliminacionBloqueada
                ) {

                    alertaEliminacionBloqueada
                        .classList
                        .add(
                            "d-none"
                        );

                }


                if (
                    btnConfirmarEliminar
                ) {

                    btnConfirmarEliminar.disabled =
                        false;


                    btnConfirmarEliminar
                        .classList
                        .remove(
                            "disabled"
                        );


                    btnConfirmarEliminar
                        .removeAttribute(
                            "aria-disabled"
                        );

                }

            }
        );

    }

});