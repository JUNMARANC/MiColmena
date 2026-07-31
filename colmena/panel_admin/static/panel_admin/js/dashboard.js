document.addEventListener("DOMContentLoaded", function () {

    // ===========================
    // GRÁFICA ACTIVIDAD
    // ===========================

    const ctxActividad = document.getElementById("graficaActividad");

    if (ctxActividad) {

        new Chart(ctxActividad, {

            type: "line",

            data: {

                labels: etiquetasActividad,

                datasets: [
                    {
                        label: "Mantenimientos",
                        data: valoresMantenimientosActividad,
                        borderColor: "#2F7D4F",
                        backgroundColor: "rgba(47,125,79,0.08)",
                        fill: false,
                        tension: 0.4,
                        borderWidth: 2.5,
                        pointBackgroundColor: "#2F7D4F",
                        pointBorderColor: "#FFFFFF",
                        pointBorderWidth: 2,
                        pointRadius: 3,
                        pointHoverRadius: 5
                    },
                    {
                        label: "Incidencias",
                        data: valoresIncidenciasActividad,
                        borderColor: "#C44134",
                        backgroundColor: "rgba(196,65,52,0.08)",
                        fill: false,
                        tension: 0.4,
                        borderWidth: 2.5,
                        pointBackgroundColor: "#C44134",
                        pointBorderColor: "#FFFFFF",
                        pointBorderWidth: 2,
                        pointRadius: 3,
                        pointHoverRadius: 5
                    },
                    
                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: true,
                        position: "bottom",
                        labels: {
                            usePointStyle: true,
                            boxWidth: 8,
                            padding: 16,
                            font: {
                                size: 12
                            }
                        }
                    },

                    tooltip: {

                        backgroundColor: "#214F3B",

                        titleColor: "#FFFFFF",

                        bodyColor: "#FFFFFF",

                        padding: 12,

                        cornerRadius: 10

                    }

                },

                scales: {

                    x: {

                        grid: {

                            display: false

                        }

                    },

                    y: {

                        beginAtZero: true,

                        ticks: {

                            precision: 0

                        }

                    }

                }

            }

        });

    }


    // ===========================
    // GRÁFICA MANTENIMIENTOS
    // ===========================

    const ctxMantenimientos = document.getElementById("graficaMantenimientos");

    if (ctxMantenimientos) {

        new Chart(ctxMantenimientos, {

            type: "bar",

            data: {

                labels: etiquetasMantenimientos,

                datasets: [{

                    data: valoresMantenimientos,

                    backgroundColor: "#F0B429",

                    borderRadius: 10,

                    borderSkipped: false

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        display: false

                    },

                    tooltip: {

                        backgroundColor: "#214F3B",

                        titleColor: "#FFFFFF",

                        bodyColor: "#FFFFFF",

                        padding: 12,

                        cornerRadius: 10

                    }

                },

                scales: {

                    x: {

                        grid: {

                            display: false

                        }

                    },

                    y: {

                        beginAtZero: true,

                        ticks: {

                            precision: 0

                        }

                    }

                }

            }

        });

    }


    // ===========================================================
    // ACTUALIZACIÓN EN VIVO (sin recargar la página)
    // ===========================================================
    //
    // Cada X segundos se le pregunta al servidor por los datos
    // actuales del dashboard (endpoint dashboard_datos_json).
    // Si algo cambió, se reconstruye SOLO la actividad reciente
    // y las 4 tarjetas de arriba, con una animación de entrada
    // para los elementos nuevos.
    //
    // Como el backend siempre devuelve únicamente los 3 registros
    // más recientes (ordenados por fecha), el efecto de "entra el
    // nuevo, sale el más viejo" ocurre solo porque el más viejo
    // deja de estar en esa lista de 3 — no se necesita ninguna
    // lógica adicional de "eliminar" en el frontend.

    function iconoActividad(noti) {
        return noti.titulo.indexOf("Incidencia") !== -1
            ? "dashboard-activity-incidencia"
            : "dashboard-activity-mantenimiento";
    }

    function formatearFecha(fechaIso) {
        if (!fechaIso) {
            return "";
        }

        const fecha = new Date(fechaIso + "T00:00:00");

        return fecha.toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function construirItemActividad(noti) {
        const div = document.createElement("div");
        div.className = "dashboard-activity-item";
        div.dataset.id = noti.id;

        div.innerHTML = `
            <div class="dashboard-activity-icon ${iconoActividad(noti)}">
                <i class="bi ${noti.icono}"></i>
            </div>
            <div class="dashboard-activity-content">
                <h6>${noti.titulo}</h6>
                <p>${noti.descripcion}</p>
                <span>${formatearFecha(noti.fecha)}</span>
            </div>
        `;

        return div;
    }

    function actualizarTarjetas(datos) {

        const mapa = {
            total_apicultores: document.querySelector("[data-stat='apicultores']"),
            total_apiarios: document.querySelector("[data-stat='apiarios']"),
            total_colmenas: document.querySelector("[data-stat='colmenas']"),
            total_incidencias_activas: document.querySelector("[data-stat='incidencias']"),
        };

        for (const clave in mapa) {

            const elemento = mapa[clave];

            if (elemento && elemento.textContent !== String(datos[clave])) {
                elemento.textContent = datos[clave];
            }
        }
    }

    function actualizarActividadReciente(nuevasNotificaciones) {

        const contenedor = document.querySelector(".dashboard-activity-list");

        if (!contenedor) {
            return;
        }

        const idsActuales = Array.from(
            contenedor.querySelectorAll(".dashboard-activity-item")
        ).map(function (el) {
            return el.dataset.id;
        });

        const idsNuevos = nuevasNotificaciones.map(function (n) {
            return n.id;
        });

        // Si no cambió nada, no tocamos el DOM (evita parpadeos innecesarios)
        if (JSON.stringify(idsActuales) === JSON.stringify(idsNuevos)) {
            return;
        }

        contenedor.innerHTML = "";

        if (nuevasNotificaciones.length === 0) {
            contenedor.innerHTML =
                '<div class="dashboard-empty">Todavía no hay actividad registrada.</div>';
            return;
        }

        nuevasNotificaciones.forEach(function (noti) {

            const item = construirItemActividad(noti);

            // La(s) que no estaban antes entran con una animación
            if (idsActuales.indexOf(noti.id) === -1) {
                item.classList.add("dashboard-activity-nueva");
            }

            contenedor.appendChild(item);
        });
    }

    function actualizarDashboardEnVivo() {

        fetch(URL_DATOS_DASHBOARD)
            .then(function (response) {
                return response.json();
            })
            .then(function (datos) {
                actualizarTarjetas(datos);
                actualizarActividadReciente(datos.notificaciones);
            })
            .catch(function (error) {
                console.error("No fue posible actualizar el dashboard:", error);
            });
    }

    if (typeof URL_DATOS_DASHBOARD !== "undefined") {
        // Cada 15 segundos. Súbelo a 30000-60000 si prefieres
        // menos peticiones al servidor.
        setInterval(actualizarDashboardEnVivo, 15000);
    }

});
