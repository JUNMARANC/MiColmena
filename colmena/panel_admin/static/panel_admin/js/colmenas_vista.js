document.addEventListener("DOMContentLoaded", function () {

    // =========================================================
    // FIX: mover los modales fuera de los contenedores de vista
    // =========================================================
    //
    // Los modales de Detalle/Editar/Eliminar quedan, por cómo el
    // navegador corrige el HTML de la tabla, anidados dentro del
    // contenedor "#vistaTablaColmenas". Como ese contenedor se
    // oculta con display:none al cambiar a la vista de Tarjetas,
    // los modales quedaban invisibles aunque Bootstrap los abriera.
    //
    // Bootstrap recomienda que los modales sean hijos directos de
    // <body> precisamente para evitar este tipo de problema, así
    // que los reubicamos ahí apenas carga la página.

    document
        .querySelectorAll("#vistaTablaColmenas .modal, #vistaTarjetasColmenas .modal")
        .forEach(function (modal) {
            document.body.appendChild(modal);
        });

    // Nota: los tooltips de los badges de estado y el rastro de
    // polen del cursor ahora son globales (ver funciones_admin.js,
    // que se carga en todas las páginas del panel).

    // =========================================================
    // ENTRADA ESCALONADA (filas de tabla / tarjetas)
    // =========================================================
    //
    // Anima los hijos directos de un contenedor uno tras otro,
    // en vez de que aparezcan todos de golpe. Se usa tanto al
    // cargar la página como cada vez que se cambia de vista.
    // Reutiliza la clase .anim-entrada-lista (ya definida en
    // estilos_admin.css junto con la de Apiarios).

    function aplicarEntradaEscalonada(contenedor, selectorHijos, retrasoEntreElementos, claseAnimacion) {

        if (!contenedor) {
            return;
        }

        const clase = claseAnimacion || "anim-entrada-lista";

        const hijos = contenedor.querySelectorAll(selectorHijos);

        hijos.forEach(function (hijo, indice) {

            hijo.classList.remove(clase);
            void hijo.offsetWidth; // fuerza reflow para poder re-disparar

            hijo.style.animationDelay = (indice * retrasoEntreElementos) + "ms";
            hijo.classList.add(clase);
        });
    }

    const vistaTablaEl = document.getElementById("vistaTablaColmenas");
    const vistaTarjetasEl = document.getElementById("vistaTarjetasColmenas");

    // Entrada escalonada inicial (la vista visible al cargar la página)
    aplicarEntradaEscalonada(vistaTablaEl, "tbody tr", 45);
    aplicarEntradaEscalonada(vistaTarjetasEl, ".tarjeta-colmena", 70, "anim-entrada-tarjeta");


    // =========================================================
    // SELECTOR DE VISTA: TABLA / TARJETAS (módulo Colmenas)
    // =========================================================
    //
    // No vuelve a consultar el servidor: la tabla y las tarjetas
    // ya vienen renderizadas ambas desde el mismo template, solo
    // se muestra una u otra con una animación de fundido.
    // La preferencia elegida se recuerda en localStorage para que,
    // al volver a entrar al módulo, se respete la última vista usada.

    const CLAVE_LOCALSTORAGE = "vistaColmenas";

    const btnVistaTabla = document.getElementById("btnVistaTabla");
    const btnVistaTarjetas = document.getElementById("btnVistaTarjetas");

    const vistaTabla = vistaTablaEl;
    const vistaTarjetas = vistaTarjetasEl;

    if (!btnVistaTabla || !btnVistaTarjetas || !vistaTabla || !vistaTarjetas) {
        // El módulo actual no tiene el selector de vista, no hacemos nada.
        return;
    }

    function activarBoton(botonActivo, botonInactivo) {
        botonActivo.classList.add("activo");
        botonInactivo.classList.remove("activo");
    }

    function mostrarVista(elementoAMostrar, elementoAOcultar) {

        // 1. El que está visible se desvanece hacia abajo
        elementoAOcultar.classList.add("vista-saliendo");

        window.setTimeout(function () {

            // 2. Se oculta por completo y se limpia la clase de animación
            elementoAOcultar.style.display = "none";
            elementoAOcultar.classList.remove("vista-saliendo");

            // 3. El nuevo aparece con su propia animación de entrada
            elementoAMostrar.style.display =
                elementoAMostrar.id === "vistaTarjetasColmenas" ? "grid" : "block";

            elementoAMostrar.classList.add("vista-entrando");

            // Además del fundido general del contenedor, cada fila/tarjeta
            // entra escalonada para que se sienta más dinámico
            if (elementoAMostrar.id === "vistaTarjetasColmenas") {
                aplicarEntradaEscalonada(elementoAMostrar, ".tarjeta-colmena", 70, "anim-entrada-tarjeta");
            } else {
                aplicarEntradaEscalonada(elementoAMostrar, "tbody tr", 45);
            }

            window.setTimeout(function () {
                elementoAMostrar.classList.remove("vista-entrando");
            }, 340);

        }, 180);
    }

    function irAVistaTabla() {
        if (vistaTabla.style.display !== "none" && !btnVistaTarjetas.classList.contains("activo")) {
            return; // ya está en tabla
        }

        mostrarVista(vistaTabla, vistaTarjetas);
        activarBoton(btnVistaTabla, btnVistaTarjetas);
        localStorage.setItem(CLAVE_LOCALSTORAGE, "tabla");
    }

    function irAVistaTarjetas() {
        if (vistaTarjetas.style.display !== "none" && btnVistaTarjetas.classList.contains("activo")) {
            return; // ya está en tarjetas
        }

        mostrarVista(vistaTarjetas, vistaTabla);
        activarBoton(btnVistaTarjetas, btnVistaTabla);
        localStorage.setItem(CLAVE_LOCALSTORAGE, "tarjetas");
    }

    btnVistaTabla.addEventListener("click", irAVistaTabla);
    btnVistaTarjetas.addEventListener("click", irAVistaTarjetas);

    // =========================================================
    // RECORDAR LA ÚLTIMA VISTA ELEGIDA
    // =========================================================

    const vistaGuardada = localStorage.getItem(CLAVE_LOCALSTORAGE);

    if (vistaGuardada === "tarjetas") {
        vistaTabla.style.display = "none";
        vistaTarjetas.style.display = "grid";
        activarBoton(btnVistaTarjetas, btnVistaTabla);
    } else {
        vistaTabla.style.display = "block";
        vistaTarjetas.style.display = "none";
        activarBoton(btnVistaTabla, btnVistaTarjetas);
    }

    // =========================================================
    // ENTRADA ESCALONADA DENTRO DE LOS MODALES
    // (Detalle, Editar y Agregar Colmena)
    // =========================================================

    document.addEventListener("shown.bs.modal", function (evento) {

        const modal = evento.target;

        if (!modal || !modal.id) {
            return;
        }

        const esModalDeColmena = (
            modal.id.indexOf("modalDetalleColmena") === 0
            ||
            modal.id.indexOf("modalEditarColmena") === 0
            ||
            modal.id === "modalAgregarColmena"
        );

        if (!esModalDeColmena) {
            return;
        }

        const cuerpoModal = modal.querySelector(".modal-body");

        aplicarEntradaEscalonada(cuerpoModal, ".row > div", 35, "anim-entrada-modal");

    });

    // =========================================================
    // RÁFAGA DE POLEN AL GUARDAR (botón Guardar)
    // =========================================================

    function inicializarRafagaPolenGuardar() {

        document
            .querySelectorAll(".btn-guardar-colmena")
            .forEach(function (boton) {

                boton.addEventListener("click", function () {

                    const rect = boton.getBoundingClientRect();
                    const centroX = rect.left + rect.width / 2;
                    const centroY = rect.top + rect.height / 2;
                    const CANTIDAD_PARTICULAS = 10;

                    for (let i = 0; i < CANTIDAD_PARTICULAS; i++) {

                        const angulo = (Math.PI * 2 * i) / CANTIDAD_PARTICULAS;
                        const distancia = 40 + Math.random() * 30;
                        const dx = Math.cos(angulo) * distancia;
                        const dy = Math.sin(angulo) * distancia;

                        const particula = document.createElement("span");
                        particula.className = "particula-rafaga-polen";
                        particula.style.left = centroX + "px";
                        particula.style.top = centroY + "px";
                        particula.style.setProperty("--dx", dx.toFixed(1) + "px");
                        particula.style.setProperty("--dy", dy.toFixed(1) + "px");

                        document.body.appendChild(particula);

                        window.setTimeout(function () {
                            particula.remove();
                        }, 700);

                    }

                });

            });

    }

    inicializarRafagaPolenGuardar();

});

document.addEventListener("DOMContentLoaded", function () {
 
    // =========================================================
    // VALIDACIONES DE FORMULARIO - MÓDULO COLMENAS
    // =========================================================
    //
    // Refuerza en el navegador las mismas reglas que debe aplicar
    // el backend (nunca reemplaza la validación del servidor,
    // solo evita envíos inválidos y da feedback inmediato).
    // Aplica al modal "Agregar" y a cada modal "Editar" (ambos
    // comparten la clase .form-validar-colmena).
 
    const AÑO_MINIMO_FECHA = 1900;
    const ESTADOS_VALIDOS = ["Activa", "Riesgo", "Inactiva", "Revisión"];
 
    function limpiarValidez(campo) {
        if (campo) {
            campo.setCustomValidity("");
        }
    }
 
    function marcarInvalido(campo, mensaje) {
        if (!campo) {
            return;
        }
        campo.setCustomValidity(mensaje);
    }
 
    function validarFormularioColmena(formulario) {
 
        let esValido = true;
 
        // ---------- APIARIO ----------
        const apiario = formulario.querySelector('[name="id_apiario"]');
        if (apiario) {
            limpiarValidez(apiario);
 
            if (!apiario.value) {
                marcarInvalido(apiario, "Debes seleccionar un apiario.");
                esValido = false;
            }
        }
 
        // ---------- ESTADO ----------
        const estado = formulario.querySelector('[name="estado_colmena"]');
        if (estado) {
            limpiarValidez(estado);
 
            if (!ESTADOS_VALIDOS.includes(estado.value)) {
                marcarInvalido(estado, "Selecciona un estado válido.");
                esValido = false;
            }
        }
 
        // ---------- FECHA DE REGISTRO ----------
        const fecha = formulario.querySelector('[name="fecha_registro"]');
        if (fecha) {
            limpiarValidez(fecha);
            const valorTexto = fecha.value;
 
            if (!valorTexto) {
                marcarInvalido(fecha, "La fecha de registro es obligatoria.");
                esValido = false;
            } else {
                const fechaSeleccionada = new Date(valorTexto + "T00:00:00");
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
 
                if (fechaSeleccionada > hoy) {
                    marcarInvalido(fecha, "La fecha de registro no puede ser una fecha futura.");
                    esValido = false;
                } else if (fechaSeleccionada.getFullYear() < AÑO_MINIMO_FECHA) {
                    marcarInvalido(fecha, "La fecha de registro no es válida.");
                    esValido = false;
                }
            }
        }
 
        // ---------- DESCRIPCIÓN (opcional, solo límite de longitud) ----------
        const descripcion = formulario.querySelector('[name="descripcion"]');
        if (descripcion) {
            limpiarValidez(descripcion);
 
            if (descripcion.value.trim().length > 1000) {
                marcarInvalido(descripcion, "La descripción no puede superar los 1000 caracteres.");
                esValido = false;
            }
        }
 
        // ---------- IMAGEN (solo si se seleccionó una nueva) ----------
        const imagen = formulario.querySelector('[name="imagen"]');
        if (imagen && imagen.files && imagen.files.length > 0) {
            limpiarValidez(imagen);
 
            const archivo = imagen.files[0];
            const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
            const tamanoMaximo = 5 * 1024 * 1024; // 5 MB
 
            if (!tiposPermitidos.includes(archivo.type)) {
                marcarInvalido(imagen, "La imagen debe estar en formato JPG, PNG o WEBP.");
                esValido = false;
            } else if (archivo.size > tamanoMaximo) {
                marcarInvalido(imagen, "La imagen no puede superar los 5 MB.");
                esValido = false;
            }
        }
 
        return esValido;
    }
 
    document.querySelectorAll(".form-validar-colmena").forEach(function (formulario) {
 
        formulario.addEventListener("submit", function (evento) {
 
            const esValido = validarFormularioColmena(formulario);
 
            if (!esValido || !formulario.checkValidity()) {
                evento.preventDefault();
                evento.stopPropagation();
                formulario.reportValidity();
            }
        });
    });
 
});

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // =====================================================
        // CAPACIDAD DE APIARIOS
        // =====================================================

        document
            .querySelectorAll(
                ".form-validar-colmena"
            )
            .forEach(
                function (formulario) {

                    const selectApiario = (
                        formulario.querySelector(
                            '[name="id_apiario"]'
                        )
                    );


                    if (!selectApiario) {
                        return;
                    }


                    const ayuda = (
                        formulario.querySelector(
                            ".ayuda-capacidad-apiario"
                        )
                    );


                    const apiarioOriginal = (
                        formulario.dataset
                            .apiarioOriginal
                        ||
                        ""
                    );


                    // =========================================
                    // VALIDAR CAPACIDAD
                    // =========================================

                    function validarCapacidadApiario() {

                        selectApiario
                            .setCustomValidity(
                                ""
                            );


                        const opcion = (
                            selectApiario
                                .options[
                                    selectApiario
                                        .selectedIndex
                                ]
                        );


                        // -------------------------------------
                        // SIN APIARIO
                        // -------------------------------------

                        if (
                            !selectApiario.value
                            ||
                            !opcion
                        ) {

                            if (ayuda) {

                                ayuda.textContent =
                                    "";

                                ayuda.classList.remove(
                                    "disponible",
                                    "completo"
                                );

                            }


                            return true;

                        }


                        // -------------------------------------
                        // DATOS
                        // -------------------------------------

                        const actual = (
                            Number.parseInt(
                                opcion.dataset.actual
                                ||
                                "0",
                                10
                            )
                        );


                        const maximo = (
                            Number.parseInt(
                                opcion.dataset.maximo
                                ||
                                "0",
                                10
                            )
                        );


                        const esApiarioOriginal = (
                            apiarioOriginal
                            &&
                            String(
                                selectApiario.value
                            )
                            ===
                            String(
                                apiarioOriginal
                            )
                        );


                        // -------------------------------------
                        // EDITANDO LA MISMA COLMENA
                        // -------------------------------------

                        if (esApiarioOriginal) {

                            if (ayuda) {

                                ayuda.textContent =
                                    `${actual} de ${maximo} colmenas registradas. Esta colmena ya pertenece a este apiario.`;


                                ayuda.classList.remove(
                                    "completo"
                                );


                                ayuda.classList.add(
                                    "disponible"
                                );

                            }


                            return true;

                        }


                        // -------------------------------------
                        // APIARIO COMPLETO
                        // -------------------------------------

                        if (
                            actual >= maximo
                        ) {

                            const mensaje = (
                                `Este apiario ya alcanzó `
                                +
                                `su capacidad máxima de `
                                +
                                `${maximo} colmena(s).`
                            );


                            selectApiario
                                .setCustomValidity(
                                    mensaje
                                );


                            if (ayuda) {

                                ayuda.textContent =
                                    mensaje;


                                ayuda.classList.remove(
                                    "disponible"
                                );


                                ayuda.classList.add(
                                    "completo"
                                );

                            }


                            return false;

                        }


                        // -------------------------------------
                        // CUPOS DISPONIBLES
                        // -------------------------------------

                        const disponibles = (
                            maximo
                            -
                            actual
                        );


                        if (ayuda) {

                            ayuda.textContent =
                                (
                                    `${actual} de ${maximo} `
                                    +
                                    `colmenas registradas. `
                                    +
                                    `${disponibles} cupo(s) `
                                    +
                                    `disponible(s).`
                                );


                            ayuda.classList.remove(
                                "completo"
                            );


                            ayuda.classList.add(
                                "disponible"
                            );

                        }


                        return true;

                    }


                    // =========================================
                    // CAMBIO DE APIARIO
                    // =========================================

                    selectApiario.addEventListener(
                        "change",
                        validarCapacidadApiario
                    );


                    // =========================================
                    // VALIDACIÓN INICIAL
                    // =========================================

                    validarCapacidadApiario();


                    // =========================================
                    // VALIDAR AL ENVIAR
                    // =========================================

                    formulario.addEventListener(
                        "submit",
                        function (evento) {

                            const valido = (
                                validarCapacidadApiario()
                            );


                            if (!valido) {

                                evento.preventDefault();

                                evento.stopPropagation();

                                selectApiario
                                    .reportValidity();

                            }

                        }
                    );

                }
            );

    }
);