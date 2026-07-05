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

