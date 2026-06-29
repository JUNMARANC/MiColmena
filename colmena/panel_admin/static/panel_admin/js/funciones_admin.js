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

/*SIDEBAR */