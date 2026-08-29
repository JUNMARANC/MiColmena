document.addEventListener("DOMContentLoaded", function () {

    // =========================================================
    // FIX: mover los modales fuera de los contenedores de vista
    // =========================================================
    //
    // Los modales de Detalle/Editar/Eliminar quedan, por cómo el
    // navegador corrige el HTML de la tabla, anidados dentro del
    // contenedor "#vistaTablaApiarios". Como ese contenedor se
    // oculta con display:none al cambiar a la vista de Tarjetas,
    // los modales quedaban invisibles aunque Bootstrap los abriera.
    //
    // Bootstrap recomienda que los modales sean hijos directos de
    // <body> precisamente para evitar este tipo de problema, así
    // que los reubicamos ahí apenas carga la página.

    document
        .querySelectorAll("#vistaTablaApiarios .modal, #vistaTarjetasApiarios .modal")
        .forEach(function (modal) {
            document.body.appendChild(modal);
        });

    // =========================================================
    // SELECTOR DE VISTA: TABLA / TARJETAS (módulo Apiarios)
    // =========================================================
    //
    // No vuelve a consultar el servidor: la tabla y las tarjetas
    // ya vienen renderizadas ambas desde el mismo template, solo
    // se muestra una u otra con una animación de fundido.
    // La preferencia elegida se recuerda en localStorage para que,
    // al volver a entrar al módulo, se respete la última vista usada.

    const CLAVE_LOCALSTORAGE = "vistaApiarios";

    const btnVistaTabla = document.getElementById("btnVistaTabla");
    const btnVistaTarjetas = document.getElementById("btnVistaTarjetas");

    const vistaTabla = document.getElementById("vistaTablaApiarios");
    const vistaTarjetas = document.getElementById("vistaTarjetasApiarios");

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
                elementoAMostrar.id === "vistaTarjetasApiarios" ? "grid" : "block";

            elementoAMostrar.classList.add("vista-entrando");

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
    // RECORDAR LA ÚLTIMA VISTA ELEGIDA (sin animación al cargar)
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

});document.addEventListener("DOMContentLoaded", function () {

    // =========================================================
    // FIX: mover los modales fuera de los contenedores de vista
    // =========================================================

    document
        .querySelectorAll("#vistaTablaApiarios .modal, #vistaTarjetasApiarios .modal")
        .forEach(function (modal) {
            document.body.appendChild(modal);
        });

    // =========================================================
    // ENTRADA ESCALONADA (filas de tabla / tarjetas)
    // =========================================================
    //
    // Anima los hijos directos de un contenedor uno tras otro,
    // en vez de que aparezcan todos de golpe. Se usa tanto al
    // cargar la página como cada vez que se cambia de vista.

    function aplicarEntradaEscalonada(contenedor, selectorHijos, retrasoEntreElementos) {

        if (!contenedor) {
            return;
        }

        const hijos = contenedor.querySelectorAll(selectorHijos);

        hijos.forEach(function (hijo, indice) {

            // Reinicia la animación por si ya se había aplicado antes
            hijo.classList.remove("anim-entrada-lista");
            void hijo.offsetWidth; // fuerza reflow para poder re-disparar

            hijo.style.animationDelay = (indice * retrasoEntreElementos) + "ms";
            hijo.classList.add("anim-entrada-lista");
        });
    }

    const vistaTablaEl = document.getElementById("vistaTablaApiarios");
    const vistaTarjetasEl = document.getElementById("vistaTarjetasApiarios");

    // Entrada escalonada inicial (la vista visible al cargar la página)
    aplicarEntradaEscalonada(vistaTablaEl, "tbody tr", 45);
    aplicarEntradaEscalonada(vistaTarjetasEl, ".tarjeta-apiario", 70);


    // =========================================================
    // SELECTOR DE VISTA: TABLA / TARJETAS (módulo Apiarios)
    // =========================================================

    const CLAVE_LOCALSTORAGE = "vistaApiarios";

    const btnVistaTabla = document.getElementById("btnVistaTabla");
    const btnVistaTarjetas = document.getElementById("btnVistaTarjetas");

    const vistaTabla = vistaTablaEl;
    const vistaTarjetas = vistaTarjetasEl;

    if (!btnVistaTabla || !btnVistaTarjetas || !vistaTabla || !vistaTarjetas) {
        return;
    }

    function activarBoton(botonActivo, botonInactivo) {
        botonActivo.classList.add("activo");
        botonInactivo.classList.remove("activo");
    }

    function mostrarVista(elementoAMostrar, elementoAOcultar) {

        elementoAOcultar.classList.add("vista-saliendo");

        window.setTimeout(function () {

            elementoAOcultar.style.display = "none";
            elementoAOcultar.classList.remove("vista-saliendo");

            elementoAMostrar.style.display =
                elementoAMostrar.id === "vistaTarjetasApiarios" ? "grid" : "block";

            elementoAMostrar.classList.add("vista-entrando");

            // Además del fundido general del contenedor, cada fila/tarjeta
            // entra escalonada para que se sienta más dinámico
            if (elementoAMostrar.id === "vistaTarjetasApiarios") {
                aplicarEntradaEscalonada(elementoAMostrar, ".tarjeta-apiario", 70);
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
            return;
        }

        mostrarVista(vistaTabla, vistaTarjetas);
        activarBoton(btnVistaTabla, btnVistaTarjetas);
        localStorage.setItem(CLAVE_LOCALSTORAGE, "tabla");
    }

    function irAVistaTarjetas() {
        if (vistaTarjetas.style.display !== "none" && btnVistaTarjetas.classList.contains("activo")) {
            return;
        }

        mostrarVista(vistaTarjetas, vistaTabla);
        activarBoton(btnVistaTarjetas, btnVistaTabla);
        localStorage.setItem(CLAVE_LOCALSTORAGE, "tarjetas");
    }

    btnVistaTabla.addEventListener("click", irAVistaTabla);
    btnVistaTarjetas.addEventListener("click", irAVistaTarjetas);

    // =========================================================
    // RECORDAR LA ÚLTIMA VISTA ELEGIDA (sin animación de fundido
    // del contenedor, pero sí con la entrada escalonada de hijos)
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

});

document.addEventListener("DOMContentLoaded", function () {
 
    // =========================================================
    // VALIDACIONES DE FORMULARIO - MÓDULO APIARIOS
    // =========================================================
    //
    // Refuerza en el navegador las mismas reglas que debe aplicar
    // el backend (nunca reemplaza la validación del servidor,
    // solo evita envíos inválidos y da feedback inmediato al
    // usuario). Aplica tanto al modal "Agregar" como a cada
    // modal "Editar" (todos comparten la clase .form-validar-apiario).
 
    const CANTIDAD_MAXIMA_COLMENAS = 20;
    const AÑO_MINIMO_FECHA = 1900;
 
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
 
    function validarFormularioApiario(formulario) {
 
        let esValido = true;
 
        // ---------- NOMBRE DEL APIARIO ----------
        const nombre = formulario.querySelector('[name="nombre_apiario"]');
        if (nombre) {
            limpiarValidez(nombre);
            const valor = nombre.value.trim();
 
            if (!valor) {
                marcarInvalido(nombre, "El nombre del apiario es obligatorio.");
                esValido = false;
            } else if (valor.length > 100) {
                marcarInvalido(nombre, "El nombre no puede superar los 100 caracteres.");
                esValido = false;
            }
        }
 
        // ---------- UBICACIÓN ----------
        const ubicacion = formulario.querySelector('[name="ubicacion"]');
        if (ubicacion) {
            limpiarValidez(ubicacion);
            const valor = ubicacion.value.trim();
 
            if (!valor) {
                marcarInvalido(ubicacion, "La ubicación es obligatoria.");
                esValido = false;
            } else if (valor.length > 150) {
                marcarInvalido(ubicacion, "La ubicación no puede superar los 150 caracteres.");
                esValido = false;
            }
        }
 
        // ---------- CANTIDAD DE COLMENAS ----------
        const cantidad = formulario.querySelector('[name="cantidad_colmenas"]');
        if (cantidad) {
            limpiarValidez(cantidad);
            const valorTexto = cantidad.value.trim();
            const valorNumero = Number(valorTexto);
 
            if (!valorTexto) {
                marcarInvalido(cantidad, "La cantidad de colmenas es obligatoria.");
                esValido = false;
            } else if (!Number.isInteger(valorNumero)) {
                marcarInvalido(cantidad, "La cantidad de colmenas debe ser un número entero.");
                esValido = false;
            } else if (valorNumero < 0) {
                marcarInvalido(cantidad, "La cantidad de colmenas no puede ser negativa.");
                esValido = false;
            } else if (valorNumero > CANTIDAD_MAXIMA_COLMENAS) {
                marcarInvalido(cantidad, `La cantidad de colmenas no puede superar ${CANTIDAD_MAXIMA_COLMENAS} por apiario.`);
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
 
        // ---------- APICULTOR RESPONSABLE ----------
        const apicultor = formulario.querySelector('[name="id_apicultor"]');
        if (apicultor) {
            limpiarValidez(apicultor);
 
            if (!apicultor.value) {
                marcarInvalido(apicultor, "Debes seleccionar un apicultor responsable.");
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
 
    document.querySelectorAll(".form-validar-apiario").forEach(function (formulario) {
 
        formulario.addEventListener("submit", function (evento) {
 
            const esValido = validarFormularioApiario(formulario);
 
            // checkValidity() también evalúa los setCustomValidity de arriba
            if (!esValido || !formulario.checkValidity()) {
                evento.preventDefault();
                evento.stopPropagation();
                formulario.reportValidity();
            }
        });
    });
 
});

document.addEventListener("DOMContentLoaded", function () {
 
    // =========================================================
    // VALIDACIÓN EN VIVO - NOMBRE DEL APIARIO (estilo Gmail)
    // =========================================================
    //
    // Mientras el usuario escribe, se le pregunta al backend
    // (endpoint de solo consulta) si ya existe un apiario con
    // ese nombre. Usa "debounce" (espera 400ms después de la
    // última tecla) para no disparar una petición por cada letra.
 
    const RETRASO_DEBOUNCE_MS = 200;
    const CANTIDAD_MAXIMA_COLMENAS = 20;
 
    function marcarCampo(campo, esValido, mensajeError) {
 
        campo.classList.remove("is-valid", "is-invalid");
 
        if (esValido === null) {
            // Estado neutro (vacío o "verificando..."): no mostramos ni check ni error
            return;
        }
 
        if (esValido) {
            campo.classList.add("is-valid");
            campo.setCustomValidity("");
        } else {
            campo.classList.add("is-invalid");
            campo.setCustomValidity(mensajeError || "Dato inválido.");
 
            const feedback = campo.parentElement.querySelector(".invalid-feedback");
            if (feedback) {
                feedback.textContent = mensajeError || "";
            }
        }
    }
 
    function debounce(funcion, espera) {
        let temporizador = null;
 
        return function (...args) {
            clearTimeout(temporizador);
            temporizador = setTimeout(function () {
                funcion.apply(this, args);
            }, espera);
        };
    }
 
    function verificarNombreApiario(campoNombre, idApiarioActual) {
 
        const nombre = campoNombre.value.trim();
 
        if (!nombre) {
            marcarCampo(campoNombre, null);
            campoNombre.dataset.nombreDuplicado = "0";
            return;
        }
 
        if (typeof URL_VERIFICAR_NOMBRE_APIARIO === "undefined") {
            // Si el endpoint todavía no existe (por ejemplo, mientras
            // el equipo de vistas lo termina de implementar), no
            // rompemos el formulario: simplemente no se hace el
            // chequeo en vivo y queda solo la validación de longitud.
            return;
        }
 
        let url = URL_VERIFICAR_NOMBRE_APIARIO
            + "?nombre=" + encodeURIComponent(nombre);
 
        if (idApiarioActual) {
            url += "&id_apiario=" + encodeURIComponent(idApiarioActual);
        }
 
        fetch(url)
            .then(function (respuesta) {
                return respuesta.json();
            })
            .then(function (datos) {
 
                if (datos.existe) {
                    marcarCampo(campoNombre, false, "Ya existe un apiario con ese nombre.");
                    campoNombre.dataset.nombreDuplicado = "1";
                } else {
                    marcarCampo(campoNombre, true);
                    campoNombre.dataset.nombreDuplicado = "0";
                }
            })
            .catch(function (error) {
                console.error("No fue posible verificar el nombre del apiario:", error);
                // Ante un fallo de red, no bloqueamos al usuario;
                // el backend sigue siendo la validación final al guardar.
                campoNombre.dataset.nombreDuplicado = "0";
            });
    }
 
    document.querySelectorAll('.form-validar-apiario [name="nombre_apiario"]').forEach(function (campoNombre) {
 
        const formulario = campoNombre.closest("form");
        const idApiarioActual = formulario ? formulario.dataset.idApiario : "";
 
        const verificarConRetraso = debounce(function () {
            verificarNombreApiario(campoNombre, idApiarioActual);
        }, RETRASO_DEBOUNCE_MS);
 
        campoNombre.addEventListener("input", function () {
 
            const valor = campoNombre.value.trim();
 
            if (!valor) {
                marcarCampo(campoNombre, null);
                campoNombre.dataset.nombreDuplicado = "0";
                return;
            }
 
            if (valor.length > 100) {
                marcarCampo(campoNombre, false, "El nombre no puede superar los 100 caracteres.");
                campoNombre.dataset.nombreDuplicado = "0";
                return;
            }
 
            verificarConRetraso();
        });
    });
 
 
    // =========================================================
    // VALIDACIÓN EN VIVO - CANTIDAD DE COLMENAS
    // =========================================================
    //
    // Esta sí es 100% local (no necesita backend): solo confirma
    // en el momento que el número esté entre 0 y 20.
 
    document.querySelectorAll('.form-validar-apiario [name="cantidad_colmenas"]').forEach(function (campoCantidad) {
 
        campoCantidad.addEventListener("input", function () {
 
            const valorTexto = campoCantidad.value.trim();
 
            if (!valorTexto) {
                marcarCampo(campoCantidad, null);
                return;
            }
 
            const valorNumero = Number(valorTexto);
 
            if (!Number.isInteger(valorNumero)) {
                marcarCampo(campoCantidad, false, "Debe ser un número entero.");
            } else if (valorNumero < 0) {
                marcarCampo(campoCantidad, false, "No puede ser negativo.");
            } else if (valorNumero > CANTIDAD_MAXIMA_COLMENAS) {
                marcarCampo(campoCantidad, false, `No puede superar ${CANTIDAD_MAXIMA_COLMENAS} colmenas.`);
            } else {
                marcarCampo(campoCantidad, true);
            }
        });
    });
 
 
    // =========================================================
    // BLOQUEAR EL ENVÍO SI EL NOMBRE QUEDÓ MARCADO COMO DUPLICADO
    // =========================================================
    //
    // Esto se suma (no reemplaza) a las validaciones que ya
    // existen en el bloque anterior de "VALIDACIONES DE FORMULARIO".
 
    document.querySelectorAll(".form-validar-apiario").forEach(function (formulario) {
 
        formulario.addEventListener("submit", function (evento) {
 
            const campoNombre = formulario.querySelector('[name="nombre_apiario"]');
 
            if (campoNombre && campoNombre.dataset.nombreDuplicado === "1") {
                evento.preventDefault();
                evento.stopPropagation();
                campoNombre.reportValidity();
            }
        });
    });
 
});