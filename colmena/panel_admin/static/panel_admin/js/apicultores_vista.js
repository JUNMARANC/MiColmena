document.addEventListener("DOMContentLoaded", function () {
 
    // =========================================================
    // SELECTOR DE VISTA: TABLA / TARJETAS (módulo Apicultores)
    // =========================================================
    //
    // A diferencia de Apiarios, aquí los modales (Detalle/Editar/
    // Eliminar) son ÚNICOS y compartidos -no uno por fila-, y viven
    // fuera de la tabla (se incluyen aparte en apicultores.html).
    // Por eso no hace falta moverlos con JS: nunca quedan atrapados
    // dentro de un contenedor que se oculta.
    //
    // Los botones de las tarjetas llevan los mismos atributos
    // data-* que los botones de la tabla, así que apicultor.js
    // (que ya sabe leerlos para llenar los modales) funciona igual
    // sin que haya que tocarlo.
 
    // NUEVO: entrada escalonada de filas/tarjetas
    function aplicarEntradaEscalonadaApicultores(contenedor, selectorHijos, retraso, claseAnimacion) {
 
        if (!contenedor) {
            return;
        }
 
        const clase = claseAnimacion || "anim-entrada-lista";
 
        contenedor.querySelectorAll(selectorHijos).forEach(function (hijo, indice) {
            hijo.classList.remove(clase);
            void hijo.offsetWidth; // fuerza reflow para poder re-disparar
            hijo.style.animationDelay = (indice * retraso) + "ms";
            hijo.classList.add(clase);
        });
    }
 
    const CLAVE_LOCALSTORAGE = "vistaApicultores";
 
    const btnVistaTabla = document.getElementById("btnVistaTablaApicultores");
    const btnVistaTarjetas = document.getElementById("btnVistaTarjetasApicultores");
 
    const vistaTabla = document.getElementById("vistaTablaApicultores");
    const vistaTarjetas = document.getElementById("vistaTarjetasApicultores");
 
    if (!btnVistaTabla || !btnVistaTarjetas || !vistaTabla || !vistaTarjetas) {
        return;
    }
 
    // NUEVO: entrada escalonada al cargar la página
    aplicarEntradaEscalonadaApicultores(vistaTabla, "tbody tr", 45);
    aplicarEntradaEscalonadaApicultores(vistaTarjetas, ".tarjeta-apicultor-card", 70, "anim-entrada-tarjeta");
 
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
                elementoAMostrar.id === "vistaTarjetasApicultores" ? "grid" : "block";
 
            elementoAMostrar.classList.add("vista-entrando");
 
            // NUEVO: entrada escalonada al cambiar de vista
            if (elementoAMostrar.id === "vistaTarjetasApicultores") {
                aplicarEntradaEscalonadaApicultores(elementoAMostrar, ".tarjeta-apicultor-card", 70, "anim-entrada-tarjeta");
            } else {
                aplicarEntradaEscalonadaApicultores(elementoAMostrar, "tbody tr", 45);
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
 
    // =========================================================
    // ENTRADA ESCALONADA DENTRO DE LOS MODALES
    // (Agregar, Editar y Detalle Apicultor)
    // =========================================================
    //
    // Igual que en Colmenas: cada vez que se abre uno de estos
    // modales, sus bloques internos (.row > div) entran uno tras
    // otro en vez de aparecer todos de golpe. Reutiliza la clase
    // .anim-entrada-modal ya definida en estilos_admin.css.

    document.addEventListener("shown.bs.modal", function (evento) {

        const modal = evento.target;

        if (!modal || !modal.id) {
            return;
        }

        const esModalDeApicultor = (
            modal.id === "modalAgregarApicultor"
            ||
            modal.id === "modalEditarApicultor"
            ||
            modal.id === "modalDetalleApicultor"
        );

        if (!esModalDeApicultor) {
            return;
        }

        const cuerpoModal = modal.querySelector(".modal-body");

        aplicarEntradaEscalonadaApicultores(cuerpoModal, ".row > div", 35, "anim-entrada-modal");

    });

    // =========================================================
    // RÁFAGA DE POLEN AL GUARDAR (botón Guardar)
    // =========================================================
    //
    // Mismo recurso visual de Colmenas: al hacer clic en Guardar,
    // salen partículas del botón hacia afuera. Reutiliza la clase
    // .particula-rafaga-polen ya definida en estilos_admin.css.

    document
        .querySelectorAll(".btn-guardar-apicultor")
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
 
});