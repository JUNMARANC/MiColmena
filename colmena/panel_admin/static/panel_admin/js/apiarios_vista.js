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
        retrasoEntreElementos,
        claseAnimacion
    ) {

        if (!contenedor) {
            return;
        }


        const clase = (
            claseAnimacion ||
            "anim-entrada-lista"
        );


        const hijos = (
            contenedor.querySelectorAll(
                selectorHijos
            )
        );


        hijos.forEach(
            function (hijo, indice) {

                // Reiniciar animación
                hijo.classList.remove(
                    clase
                );


                // Forzar reflow para permitir
                // volver a disparar la animación
                void hijo.offsetWidth;


                hijo.style.animationDelay = (
                    indice *
                    retrasoEntreElementos
                ) + "ms";


                hijo.classList.add(
                    clase
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
        70,
        "anim-entrada-tarjeta"
    );


    // =========================================================
    // PREFERENCIA DE MOVIMIENTO REDUCIDO
    // =========================================================

    const prefiereMenosMovimiento = (
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
    );


    // =========================================================
    // EFECTO 3D AL PASAR EL MOUSE SOBRE LAS TARJETAS
    // =========================================================

    function inicializarTiltTarjetas() {

        if (prefiereMenosMovimiento) {
            return;
        }


        const tarjetas = (
            document.querySelectorAll(
                ".tarjeta-apiario"
            )
        );


        tarjetas.forEach(
            function (tarjeta) {

                let cuadroPendiente = false;
                let ultimoEvento = null;

                tarjeta.addEventListener(
                    "mousemove",
                    function (evento) {

                        ultimoEvento = evento;

                        if (cuadroPendiente) {
                            return;
                        }

                        cuadroPendiente = true;


                        window.requestAnimationFrame(
                            function () {

                                cuadroPendiente = false;


                                const rect = (
                                    tarjeta.getBoundingClientRect()
                                );

                                const posX = (
                                    ultimoEvento.clientX - rect.left
                                );

                                const posY = (
                                    ultimoEvento.clientY - rect.top
                                );

                                const relX = (
                                    (posX / rect.width - .5) * 2
                                );

                                const relY = (
                                    (posY / rect.height - .5) * 2
                                );

                                tarjeta.style.setProperty(
                                    "--tilt-x",
                                    (relX * 6).toFixed(2) + "deg"
                                );

                                tarjeta.style.setProperty(
                                    "--tilt-y",
                                    (relY * -6).toFixed(2) + "deg"
                                );

                            }
                        );

                    }
                );


                tarjeta.addEventListener(
                    "mouseleave",
                    function () {

                        tarjeta.style.setProperty(
                            "--tilt-x",
                            "0deg"
                        );

                        tarjeta.style.setProperty(
                            "--tilt-y",
                            "0deg"
                        );

                    }
                );

            }
        );

    }

    inicializarTiltTarjetas();


    // =========================================================
    // =========================================================
    // ESTELA DE POLEN AL MOVER EL MOUSE
    // Y TOOLTIPS DE LOS BADGES DE ESTADO
    // (ambos ahora son globales: ver funciones_admin.js,
    //  que se carga en todas las páginas del panel)
    // =========================================================


    // =========================================================
    // ENTRADA ESCALONADA AL ABRIR MODALES
    // (Detalle, Editar y Agregar Apiario)
    // =========================================================

    document.addEventListener(
        "shown.bs.modal",
        function (evento) {

            const modal = evento.target;

            if (!modal || !modal.id) {
                return;
            }

            const esModalDeApiario = (
                modal.id.indexOf("modalDetalleApiario") === 0
                ||
                modal.id.indexOf("modalEditarApiario") === 0
                ||
                modal.id === "modalAgregarApiario"
            );

            if (!esModalDeApiario) {
                return;
            }


            const cuerpoModal = (
                modal.querySelector(".modal-body")
            );

            aplicarEntradaEscalonada(
                cuerpoModal,
                ".row > div",
                35,
                "anim-entrada-modal"
            );

        }
    );


    // =========================================================
    // BUSCADOR RÁPIDO (nombre / ubicación)
    // =========================================================

    function inicializarBuscadorApiarios() {

        const buscador = (
            document.getElementById(
                "buscadorApiarios"
            )
        );

        if (!buscador) {
            return;
        }


        buscador.addEventListener(
            "input",
            function () {

                const termino = (
                    buscador.value
                        .trim()
                        .toLowerCase()
                );


                // ---- Tarjetas ----

                let coincidenciasTarjetas = 0;

                document
                    .querySelectorAll(
                        "#vistaTarjetasApiarios .tarjeta-apiario"
                    )
                    .forEach(
                        function (tarjeta) {

                            const nombre = (
                                tarjeta.dataset.nombre || ""
                            );

                            const ubicacion = (
                                tarjeta.dataset.ubicacion || ""
                            );

                            const coincide = (
                                termino === ""
                                ||
                                nombre.indexOf(termino) !== -1
                                ||
                                ubicacion.indexOf(termino) !== -1
                            );

                            if (coincide) {
                                coincidenciasTarjetas++;
                            }

                            tarjeta.classList.toggle(
                                "tarjeta-oculta-busqueda",
                                !coincide
                            );

                        }
                    );


                const mensajeSinResultadosTarjetas = (
                    document.getElementById(
                        "apiariosSinResultadosBusqueda"
                    )
                );

                if (mensajeSinResultadosTarjetas) {

                    const hayTarjetas = (
                        document.querySelectorAll(
                            "#vistaTarjetasApiarios .tarjeta-apiario"
                        ).length > 0
                    );

                    mensajeSinResultadosTarjetas.style.display = (
                        hayTarjetas && coincidenciasTarjetas === 0
                            ? "block"
                            : "none"
                    );

                }


                // ---- Filas de tabla ----

                let coincidenciasFilas = 0;

                document
                    .querySelectorAll(
                        "#vistaTablaApiarios tbody tr[data-estado]"
                    )
                    .forEach(
                        function (fila) {

                            const nombre = (
                                fila.dataset.nombre || ""
                            );

                            const ubicacion = (
                                fila.dataset.ubicacion || ""
                            );

                            const coincide = (
                                termino === ""
                                ||
                                nombre.indexOf(termino) !== -1
                                ||
                                ubicacion.indexOf(termino) !== -1
                            );

                            if (coincide) {
                                coincidenciasFilas++;
                            }

                            fila.classList.toggle(
                                "fila-oculta-busqueda",
                                !coincide
                            );

                        }
                    );


                const mensajeSinResultadosTabla = (
                    document.getElementById(
                        "apiariosTablaSinResultadosBusqueda"
                    )
                );

                if (mensajeSinResultadosTabla) {

                    const hayFilas = (
                        document.querySelectorAll(
                            "#vistaTablaApiarios tbody tr[data-estado]"
                        ).length > 0
                    );

                    mensajeSinResultadosTabla.style.display = (
                        hayFilas && coincidenciasFilas === 0
                            ? "table-row"
                            : "none"
                    );

                }

            }
        );

    }

    inicializarBuscadorApiarios();


    // =========================================================
    // ORDENAR POR URGENCIA (Deficiente > Precaución > Bueno)
    // =========================================================

    function inicializarOrdenUrgencia() {

        const boton = (
            document.getElementById(
                "btnOrdenarUrgencia"
            )
        );

        if (!boton) {
            return;
        }


        const PRIORIDAD_ESTADO = {
            "Deficiente": 0,
            "Precaución": 1,
            "Bueno": 2
        };

        let ordenadoPorUrgencia = false;


        function ordenarPorUrgencia(
            contenedor,
            selectorItems
        ) {

            if (!contenedor) {
                return;
            }


            const items = (
                Array.from(
                    contenedor.querySelectorAll(
                        selectorItems
                    )
                )
            );


            // Guardar el orden original una sola vez
            items.forEach(
                function (item, indice) {

                    if (
                        item.dataset.ordenOriginal
                        ===
                        undefined
                    ) {

                        item.dataset.ordenOriginal =
                            indice;

                    }

                }
            );


            items.sort(
                function (a, b) {

                    if (ordenadoPorUrgencia) {

                        const valorA = (
                            PRIORIDAD_ESTADO[a.dataset.estado]
                        );

                        const valorB = (
                            PRIORIDAD_ESTADO[b.dataset.estado]
                        );

                        const prioridadA = (
                            valorA === undefined ? 3 : valorA
                        );

                        const prioridadB = (
                            valorB === undefined ? 3 : valorB
                        );

                        return prioridadA - prioridadB;

                    }


                    return (
                        Number(a.dataset.ordenOriginal)
                        -
                        Number(b.dataset.ordenOriginal)
                    );

                }
            );


            items.forEach(
                function (item) {

                    contenedor.appendChild(item);

                }
            );

        }


        boton.addEventListener(
            "click",
            function () {

                ordenadoPorUrgencia = (
                    !ordenadoPorUrgencia
                );


                const cuerpoTabla = (
                    document.querySelector(
                        "#vistaTablaApiarios tbody"
                    )
                );

                ordenarPorUrgencia(
                    cuerpoTabla,
                    "tr[data-estado]"
                );

                ordenarPorUrgencia(
                    vistaTarjetas,
                    ".tarjeta-apiario"
                );


                boton.classList.toggle(
                    "activo",
                    ordenadoPorUrgencia
                );


                aplicarEntradaEscalonada(
                    cuerpoTabla,
                    "tr[data-estado]",
                    30
                );

                aplicarEntradaEscalonada(
                    vistaTarjetas,
                    ".tarjeta-apiario",
                    40,
                    "anim-entrada-tarjeta"
                );

            }
        );

    }

    inicializarOrdenUrgencia();


    // =========================================================
    // RÁFAGA DE POLEN AL GUARDAR UN APIARIO
    // =========================================================

    function inicializarRafagaPolenGuardar() {

        if (prefiereMenosMovimiento) {
            return;
        }


        document
            .querySelectorAll(
                ".btn-guardar-apiario"
            )
            .forEach(
                function (boton) {

                    boton.addEventListener(
                        "click",
                        function () {

                            const rect = (
                                boton.getBoundingClientRect()
                            );

                            const centroX = (
                                rect.left + rect.width / 2
                            );

                            const centroY = (
                                rect.top + rect.height / 2
                            );

                            const CANTIDAD_PARTICULAS = 10;


                            for (
                                let i = 0;
                                i < CANTIDAD_PARTICULAS;
                                i++
                            ) {

                                const angulo = (
                                    (Math.PI * 2 * i)
                                    /
                                    CANTIDAD_PARTICULAS
                                );

                                const distancia = (
                                    40 + Math.random() * 30
                                );

                                const dx = (
                                    Math.cos(angulo) * distancia
                                );

                                const dy = (
                                    Math.sin(angulo) * distancia
                                );

                                const particula = (
                                    document.createElement("span")
                                );

                                particula.className =
                                    "particula-rafaga-polen";

                                particula.style.left =
                                    centroX + "px";

                                particula.style.top =
                                    centroY + "px";

                                particula.style.setProperty(
                                    "--dx",
                                    dx.toFixed(1) + "px"
                                );

                                particula.style.setProperty(
                                    "--dy",
                                    dy.toFixed(1) + "px"
                                );

                                document.body.appendChild(
                                    particula
                                );

                                window.setTimeout(
                                    function () {

                                        particula.remove();

                                    },
                                    700
                                );

                            }

                        }
                    );

                }
            );

    }

    inicializarRafagaPolenGuardar();


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
                        70,
                        "anim-entrada-tarjeta"
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
                70,
                "anim-entrada-tarjeta"
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