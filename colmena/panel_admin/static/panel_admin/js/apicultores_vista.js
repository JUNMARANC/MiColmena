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

    const CLAVE_LOCALSTORAGE = "vistaApicultores";

    const btnVistaTabla = document.getElementById("btnVistaTablaApicultores");
    const btnVistaTarjetas = document.getElementById("btnVistaTarjetasApicultores");

    const vistaTabla = document.getElementById("vistaTablaApicultores");
    const vistaTarjetas = document.getElementById("vistaTarjetasApicultores");

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
                elementoAMostrar.id === "vistaTarjetasApicultores" ? "grid" : "block";

            elementoAMostrar.classList.add("vista-entrando");

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
