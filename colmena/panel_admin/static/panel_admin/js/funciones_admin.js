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

            Array.from(colmena.options).forEach(function (option) {
                if (!option.value) {
                    option.hidden = false;
                    return;
                }

                option.hidden = option.dataset.apiario !== idApiario;
            });
        } else {
            campoColmena.classList.add("d-none");
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

