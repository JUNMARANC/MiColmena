/*SIDEBAR */
const sidebarAdmin = document.getElementById("sidebarAdmin");
const btnCollapseSidebar = document.getElementById("btnCollapseSidebar");
const btnMobileSidebar = document.getElementById("btnMobileSidebar");
const overlaySidebar = document.getElementById("overlaySidebar");
 
if (btnCollapseSidebar && sidebarAdmin) {
    btnCollapseSidebar.addEventListener("click", () => {
        sidebarAdmin.classList.toggle("collapsed");
    });
}
 
if (btnMobileSidebar && sidebarAdmin && overlaySidebar) {
    btnMobileSidebar.addEventListener("click", () => {
        sidebarAdmin.classList.add("mobile-active");
        overlaySidebar.classList.add("active");
    });
 
    overlaySidebar.addEventListener("click", () => {
        sidebarAdmin.classList.remove("mobile-active");
        overlaySidebar.classList.remove("active");
    });
}
 
/*mantenimientos */
 
document.addEventListener("DOMContentLoaded", function () {
 
    const radios = document.querySelectorAll(".tipo-mantenimiento-radio");
    const campoApiario = document.getElementById("campoApiarioMantenimiento");
    const campoColmena = document.getElementById("campoColmenaMantenimiento");
 
    if (!radios.length || !campoApiario || !campoColmena) {
        return;
    }
 
    radios.forEach(function (radio) {
        radio.addEventListener("change", function () {
 
            if (this.value === "Apiario") {
                campoApiario.classList.remove("d-none");
                campoColmena.classList.add("d-none");
            }
 
            if (this.value === "Colmena") {
                campoColmena.classList.remove("d-none");
                campoApiario.classList.add("d-none");
            }
 
        });
    });
 
});
 
/*Modal agregar mantenimiento */
 
document.addEventListener("DOMContentLoaded", function () {
    const responsable = document.getElementById("responsableMantenimiento");
    const apiario = document.getElementById("apiarioMantenimiento");
    const colmena = document.getElementById("colmenaMantenimiento");
    const campoColmena = document.getElementById("campoColmenaMantenimiento");
    const radios = document.querySelectorAll(".alcance-mantenimiento-radio");
 
    if (!responsable || !apiario || !colmena || !campoColmena || !radios.length) {
        return;
    }
 
    function obtenerAlcance() {
        const seleccionado = document.querySelector(".alcance-mantenimiento-radio:checked");
        return seleccionado ? seleccionado.value : "";
    }
 
    function filtrarApiarios() {
        const idResponsable = responsable.value;
 
        apiario.value = "";
        colmena.value = "";
        campoColmena.classList.add("d-none");
 
        Array.from(apiario.options).forEach(function (option) {
            if (!option.value) {
                option.hidden = false;
                return;
            }
 
            option.hidden = option.dataset.apicultor !== idResponsable;
        });
    }
 
    function filtrarColmenas() {
        const idApiario = apiario.value;
        const alcance = obtenerAlcance();
 
        colmena.value = "";
 
        if (alcance === "Colmena" && idApiario) {
            campoColmena.classList.remove("d-none");
            colmena.required = true;
 
            Array.from(colmena.options).forEach(function (option) {
                if (!option.value) {
                    option.hidden = false;
                    return;
                }
 
                option.hidden = option.dataset.apiario !== idApiario;
            });
        } else {
            campoColmena.classList.add("d-none");
            colmena.required = false;
        }
    }
 
    responsable.addEventListener("change", filtrarApiarios);
    apiario.addEventListener("change", filtrarColmenas);
 
    radios.forEach(function (radio) {
        radio.addEventListener("change", filtrarColmenas);
    });
});
 
/*Filtro de Mantenimientos */
 
document.addEventListener("DOMContentLoaded", function () {
    const filtroApiario = document.getElementById("filtroApiario");
    const filtroColmena = document.getElementById("filtroColmena");
 
    if (!filtroApiario || !filtroColmena) {
        return;
    }
 
    function filtrarColmenasPorApiario() {
        const idApiario = filtroApiario.value;
        const colmenaSeleccionada = filtroColmena.value;
 
        Array.from(filtroColmena.options).forEach(function (option) {
            if (!option.value) {
                option.hidden = false;
                return;
            }
 
            if (!idApiario) {
                option.hidden = false;
            } else {
                option.hidden = option.dataset.apiario !== idApiario;
            }
        });
 
        const opcionActual = filtroColmena.options[filtroColmena.selectedIndex];
 
        if (opcionActual && opcionActual.hidden) {
            filtroColmena.value = "";
        }
    }
 
    filtroApiario.addEventListener("change", filtrarColmenasPorApiario);
 
    filtrarColmenasPorApiario();
});
 
/* Selector de vista Tabla/Tarjetas — Mantenimientos */
 
document.addEventListener("DOMContentLoaded", function () {
 
    // Igual que en apiarios/colmenas: los modales quedan anidados
    // dentro de la vista de tabla por cómo el navegador corrige el
    // HTML, así que se reubican como hijos directos de <body>.
    document
        .querySelectorAll("#vistaTablaMantenimientos .modal, #vistaTarjetasMantenimientos .modal")
        .forEach(function (modal) {
            document.body.appendChild(modal);
        });
 
    // NUEVO: entrada escalonada de filas/tarjetas
    function aplicarEntradaEscalonadaMantenimientos(contenedor, selectorHijos, retraso) {
        if (!contenedor) return;
 
        contenedor.querySelectorAll(selectorHijos).forEach(function (hijo, indice) {
            hijo.classList.remove("anim-entrada-lista");
            void hijo.offsetWidth;
            hijo.style.animationDelay = (indice * retraso) + "ms";
            hijo.classList.add("anim-entrada-lista");
        });
    }
 
    const CLAVE_LOCALSTORAGE = "vistaMantenimientos";
 
    const btnVistaTabla = document.getElementById("btnVistaTabla");
    const btnVistaTarjetas = document.getElementById("btnVistaTarjetas");
 
    const vistaTabla = document.getElementById("vistaTablaMantenimientos");
    const vistaTarjetas = document.getElementById("vistaTarjetasMantenimientos");
 
    if (!btnVistaTabla || !btnVistaTarjetas || !vistaTabla || !vistaTarjetas) {
        return;
    }
 
    // NUEVO: entrada escalonada al cargar la página
    aplicarEntradaEscalonadaMantenimientos(vistaTabla, "tbody tr", 45);
    aplicarEntradaEscalonadaMantenimientos(vistaTarjetas, ".tarjeta-mantenimiento", 70);
 
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
                elementoAMostrar.id === "vistaTarjetasMantenimientos" ? "grid" : "block";
 
            elementoAMostrar.classList.add("vista-entrando");
 
            // NUEVO: entrada escalonada al cambiar de vista
            if (elementoAMostrar.id === "vistaTarjetasMantenimientos") {
                aplicarEntradaEscalonadaMantenimientos(elementoAMostrar, ".tarjeta-mantenimiento", 70);
            } else {
                aplicarEntradaEscalonadaMantenimientos(elementoAMostrar, "tbody tr", 45);
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
 
/* JS DE INCIDENCIAS */
 
/* Selector de vista Tabla/Tarjetas — Incidencias */
document.addEventListener("DOMContentLoaded", function () {
 
    document
        .querySelectorAll("#vistaTablaIncidencias .modal, #vistaTarjetasIncidencias .modal")
        .forEach(function (modal) {
            document.body.appendChild(modal);
        });
 
    // NUEVO: entrada escalonada de filas/tarjetas
    function aplicarEntradaEscalonadaIncidencias(contenedor, selectorHijos, retraso) {
        if (!contenedor) return;
 
        contenedor.querySelectorAll(selectorHijos).forEach(function (hijo, indice) {
            hijo.classList.remove("anim-entrada-lista");
            void hijo.offsetWidth;
            hijo.style.animationDelay = (indice * retraso) + "ms";
            hijo.classList.add("anim-entrada-lista");
        });
    }
 
    const CLAVE_LOCALSTORAGE = "vistaIncidencias";
 
    const btnVistaTabla = document.getElementById("btnVistaTabla");
    const btnVistaTarjetas = document.getElementById("btnVistaTarjetas");
 
    const vistaTabla = document.getElementById("vistaTablaIncidencias");
    const vistaTarjetas = document.getElementById("vistaTarjetasIncidencias");
 
    if (!btnVistaTabla || !btnVistaTarjetas || !vistaTabla || !vistaTarjetas) {
        return;
    }
 
    // NUEVO: entrada escalonada al cargar la página
    aplicarEntradaEscalonadaIncidencias(vistaTabla, "tbody tr", 45);
    aplicarEntradaEscalonadaIncidencias(vistaTarjetas, ".tarjeta-incidencia", 70);
 
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
                elementoAMostrar.id === "vistaTarjetasIncidencias" ? "grid" : "block";
 
            elementoAMostrar.classList.add("vista-entrando");
 
            // NUEVO: entrada escalonada al cambiar de vista
            if (elementoAMostrar.id === "vistaTarjetasIncidencias") {
                aplicarEntradaEscalonadaIncidencias(elementoAMostrar, ".tarjeta-incidencia", 70);
            } else {
                aplicarEntradaEscalonadaIncidencias(elementoAMostrar, "tbody tr", 45);
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
 
    function mostrarCamposEntidad(selector) {
        const formulario = selector.dataset.formulario;
        const entidad = selector.value;
 
        const campoApicultor = document.querySelector(
            `.campo-apicultor-${formulario}`
        );
 
        const campoApiario = document.querySelector(
            `.campo-apiario-${formulario}`
        );
 
        const campoColmena = document.querySelector(
            `.campo-colmena-${formulario}`
        );
 
        // Cada campo condicional se marca required SOLO cuando está
        // visible; si no, se limpia required y el valor, para que no
        // quede un campo oculto bloqueando el envío del formulario.
        if (campoApicultor) {
            const mostrar = entidad === "Apicultor";
            campoApicultor.style.display = mostrar ? "block" : "none";
 
            const selectApicultor = campoApicultor.querySelector("select");
            if (selectApicultor) {
                selectApicultor.required = mostrar;
                if (!mostrar) selectApicultor.value = "";
            }
        }
 
        if (campoApiario) {
            const mostrar = entidad === "Apiario" || entidad === "Colmena";
            campoApiario.style.display = mostrar ? "block" : "none";
 
            const selectApiario = campoApiario.querySelector("select");
            if (selectApiario) {
                selectApiario.required = mostrar;
                if (!mostrar) selectApiario.value = "";
            }
        }
 
        if (campoColmena) {
            const mostrar = entidad === "Colmena";
            campoColmena.style.display = mostrar ? "block" : "none";
 
            const selectColmena = campoColmena.querySelector("select");
            if (selectColmena) {
                selectColmena.required = mostrar;
                if (!mostrar) selectColmena.value = "";
            }
        }
    }
 
    function filtrarColmenas(apiarioSelect) {
        const formulario = apiarioSelect.dataset.formulario;
        const apiarioId = apiarioSelect.value;
 
        const colmenaSelect = document.querySelector(
            `.selector-colmena-${formulario}`
        );
 
        if (!colmenaSelect) {
            return;
        }
 
        const opciones = colmenaSelect.querySelectorAll(
            "option[data-apiario]"
        );
 
        opciones.forEach(function (opcion) {
            const corresponde =
                !apiarioId ||
                opcion.dataset.apiario === apiarioId;
 
            opcion.hidden = !corresponde;
            opcion.disabled = !corresponde;
        });
 
        const opcionSeleccionada =
            colmenaSelect.options[colmenaSelect.selectedIndex];
 
        if (
            opcionSeleccionada &&
            opcionSeleccionada.dataset.apiario &&
            opcionSeleccionada.dataset.apiario !== apiarioId
        ) {
            colmenaSelect.value = "";
        }
    }
 
    document
        .querySelectorAll(".selector-entidad")
        .forEach(function (selector) {
 
            mostrarCamposEntidad(selector);
 
            selector.addEventListener("change", function () {
                mostrarCamposEntidad(this);
            });
        });
 
    document
        .querySelectorAll(".selector-apiario")
        .forEach(function (selector) {
 
            filtrarColmenas(selector);
 
            selector.addEventListener("change", function () {
                filtrarColmenas(this);
            });
        });
 
    // Filtros superiores
    const filtroEntidad = document.getElementById("filtroEntidad");
    const filtroApicultor = document.querySelector(".filtro-apicultor");
    const filtroApiario = document.querySelector(".filtro-apiario");
    const filtroColmena = document.querySelector(".filtro-colmena");
 
    function actualizarFiltrosEntidad() {
        if (!filtroEntidad) {
            return;
        }
 
        const entidad = filtroEntidad.value;
 
        if (filtroApicultor) {
            filtroApicultor.style.display =
                entidad === "Apicultor" ? "block" : "none";
        }
 
        if (filtroApiario) {
            filtroApiario.style.display =
                entidad === "Apiario" || entidad === "Colmena"
                    ? "block"
                    : "none";
        }
 
        if (filtroColmena) {
            filtroColmena.style.display =
                entidad === "Colmena" ? "block" : "none";
        }
    }
 
    if (filtroEntidad) {
        filtroEntidad.addEventListener(
            "change",
            actualizarFiltrosEntidad
        );
    }
 
    // Filtrar las colmenas del filtro superior
    const filtroApiarioSelect =
        document.getElementById("filtroApiario");
 
    const filtroColmenaSelect =
        document.getElementById("filtroColmena");
 
    function actualizarColmenasFiltro() {
        if (!filtroApiarioSelect || !filtroColmenaSelect) {
            return;
        }
 
        const apiarioId = filtroApiarioSelect.value;
 
        const opciones = filtroColmenaSelect.querySelectorAll(
            "option[data-apiario]"
        );
 
        opciones.forEach(function (opcion) {
            const corresponde =
                !apiarioId ||
                opcion.dataset.apiario === apiarioId;
 
            opcion.hidden = !corresponde;
            opcion.disabled = !corresponde;
        });
 
        const seleccionada =
            filtroColmenaSelect.options[
                filtroColmenaSelect.selectedIndex
            ];
 
        if (
            seleccionada &&
            seleccionada.dataset.apiario &&
            seleccionada.dataset.apiario !== apiarioId
        ) {
            filtroColmenaSelect.value = "";
        }
    }
 
    if (filtroApiarioSelect) {
        filtroApiarioSelect.addEventListener(
            "change",
            actualizarColmenasFiltro
        );
 
        actualizarColmenasFiltro();
    }
});
 
/* ==========================================================
   VALIDACIONES NUEVAS - MÓDULO DE MANTENIMIENTOS
   ========================================================== */
 
/* Validación de Colmena en el modal Editar Mantenimiento */
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".modal-editar-mantenimiento").forEach(function (modal) {
        const entidad = modal.querySelector(".entidad-editar");
        const apiario = modal.querySelector(".apiario-editar");
        const colmena = modal.querySelector(".colmena-editar");
        const campoColmena = colmena ? colmena.closest(".col-md-6") : null;
 
        if (!entidad || !apiario || !colmena) return;
 
        function actualizar() {
            const idApiario = apiario.value;
            const esColmena = entidad.value === "Colmena";
 
            if (campoColmena) campoColmena.classList.toggle("d-none", !esColmena);
            colmena.required = esColmena;
            if (!esColmena) colmena.value = "";
 
            Array.from(colmena.options).forEach(function (option) {
                if (!option.value) {
                    option.hidden = false;
                    return;
                }
                option.hidden = option.dataset.apiario !== idApiario;
            });
        }
 
        entidad.addEventListener("change", actualizar);
        apiario.addEventListener("change", actualizar);
        actualizar();
    });
});
 
/* Evitar textos vacíos (solo espacios) en formularios de mantenimiento */
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".form-mantenimiento").forEach(function (form) {
        form.addEventListener("submit", function (e) {
            let valido = true;
 
            form.querySelectorAll('input[type="text"][required], textarea[required]').forEach(function (campo) {
                campo.value = campo.value.trim();
                if (campo.value === "") {
                    valido = false;
                    campo.classList.add("is-invalid");
                } else {
                    campo.classList.remove("is-invalid");
                }
            });
 
            if (!valido) e.preventDefault();
        });
    });
});
 
/* Reglas de fecha para Mantenimientos: Agregar y Editar */
document.addEventListener("DOMContentLoaded", function () {
 
    // Construye "hoy" en formato YYYY-MM-DD usando componentes LOCALES,
    // sin pasar por toISOString() (eso convierte a UTC y puede desfasar
    // el día según la zona horaria del navegador).
    function hoyComoTexto() {
        const ahora = new Date();
        const año = ahora.getFullYear();
        const mes = String(ahora.getMonth() + 1).padStart(2, "0");
        const dia = String(ahora.getDate()).padStart(2, "0");
        return `${año}-${mes}-${dia}`;
    }
 
    const hoyTexto = hoyComoTexto(); // ej: "2026-08-27"
 
    // AGREGAR: la fecha nunca puede ser anterior a hoy
    const formAgregar = document.getElementById("modalAgregarMantenimiento")?.querySelector("form");
    const fechaAgregar = formAgregar?.querySelector('input[name="fecha_ejecucion"]');
 
    if (formAgregar && fechaAgregar) {
        fechaAgregar.min = hoyTexto;
 
        formAgregar.addEventListener("submit", function (e) {
            if (!fechaAgregar.value || fechaAgregar.value < hoyTexto) {
                e.preventDefault();
                fechaAgregar.classList.add("is-invalid");
                alert("La fecha programada no puede ser anterior a hoy.");
            } else {
                fechaAgregar.classList.remove("is-invalid");
            }
        });
    }
 
    // EDITAR: se compara SIEMPRE el valor actual contra el original y
    // contra hoy en el momento del submit — no se confía en que el
    // navegador respete "readonly" o "min" en el selector de fecha.
    document.querySelectorAll(".modal-editar-mantenimiento").forEach(function (modal) {
        const form = modal.querySelector("form");
        const fecha = modal.querySelector(".fecha-editar");
        if (!form || !fecha) return;
 
        const valorOriginal = fecha.value; // YYYY-MM-DD tal como llegó del servidor
        if (!valorOriginal) return;
 
        const yaVencido = valorOriginal < hoyTexto;
 
        if (yaVencido) {
            // Ya venció: se deshabilita visualmente (referencia, no es la
            // única protección) y queda marcado para la validación real.
            fecha.readOnly = true;
            fecha.classList.add("bg-light");
            fecha.title = "Esta fecha ya venció y no puede modificarse.";
        } else {
            // Aún no vence: se puede mover hacia adelante, nunca hacia atrás.
            fecha.min = hoyTexto;
        }
 
        form.addEventListener("submit", function (e) {
            let bloquear = false;
            let mensaje = "";
 
            if (yaVencido) {
                // Pase lo que pase en la UI, si ya venció el valor enviado
                // debe ser exactamente el mismo que tenía originalmente.
                if (fecha.value !== valorOriginal) {
                    bloquear = true;
                    mensaje = "Esta fecha ya venció y no puede modificarse.";
                }
            } else {
                // Aún no vence: el valor enviado no puede ser anterior a hoy.
                if (!fecha.value || fecha.value < hoyTexto) {
                    bloquear = true;
                    mensaje = "La fecha programada no puede ser anterior a hoy.";
                }
            }
 
            if (bloquear) {
                e.preventDefault();
                fecha.classList.add("is-invalid");
                alert(mensaje);
            } else {
                fecha.classList.remove("is-invalid");
            }
        });
    });
});
 
/* ==========================================================
   VALIDACIONES NUEVAS - MÓDULO DE INCIDENCIAS
   ========================================================== */
 
/* La fecha de detección nunca puede ser una fecha futura */
document.addEventListener("DOMContentLoaded", function () {
 
    function hoyComoTexto() {
        const ahora = new Date();
        const año = ahora.getFullYear();
        const mes = String(ahora.getMonth() + 1).padStart(2, "0");
        const dia = String(ahora.getDate()).padStart(2, "0");
        return `${año}-${mes}-${dia}`;
    }
 
    const hoyTexto = hoyComoTexto();
 
    document.querySelectorAll(".fecha-incidencia").forEach(function (fecha) {
        fecha.max = hoyTexto;
    });
 
    document.querySelectorAll(".form-incidencia").forEach(function (form) {
        const fecha = form.querySelector(".fecha-incidencia");
        if (!fecha) return;
 
        form.addEventListener("submit", function (e) {
            if (!fecha.value || fecha.value > hoyTexto) {
                e.preventDefault();
                fecha.classList.add("is-invalid");
                alert("La fecha de detección no puede ser una fecha futura.");
            } else {
                fecha.classList.remove("is-invalid");
            }
        });
    });
});
 
/* Evitar textos vacíos (solo espacios) en formularios de incidencia */
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".form-incidencia").forEach(function (form) {
        form.addEventListener("submit", function (e) {
            let valido = true;
 
            form.querySelectorAll('input[type="text"][required], textarea[required]').forEach(function (campo) {
                campo.value = campo.value.trim();
                if (campo.value === "") {
                    valido = false;
                    campo.classList.add("is-invalid");
                } else {
                    campo.classList.remove("is-invalid");
                }
            });
 
            if (!valido) e.preventDefault();
        });
    });
});