document.addEventListener("DOMContentLoaded", function () {

    // ===========================================================
    // ANIMACIÓN DE ENTRADA ESCALONADA
    // ===========================================================
    //
    // Las 4 tarjetas de resumen, las 2 tarjetas de gráficas y la
    // tarjeta de actividad reciente aparecen una tras otra al
    // cargar la página, en vez de aparecer todas de golpe.

    function aplicarEntradaEscalonada(selector, retrasoEntreElementos) {
        document.querySelectorAll(selector).forEach(function (elemento, indice) {
            elemento.classList.add("anim-entrada-dashboard");
            elemento.style.animationDelay = (indice * retrasoEntreElementos) + "ms";
        });
    }

    aplicarEntradaEscalonada(".tarjeta-dashboard", 90);
    aplicarEntradaEscalonada(".dashboard-card", 120);

    // Las notificaciones de "Actividad reciente" que ya vienen
    // renderizadas desde el servidor también entran escalonadas
    aplicarEntradaEscalonada(".dashboard-activity-list .dashboard-activity-item", 100);


    // ===========================================================
    // CONTADOR ANIMADO PARA LOS NÚMEROS DE LAS TARJETAS
    // ===========================================================
    //
    // En vez de que el número aparezca de golpe, cuenta desde 0
    // (o desde el valor anterior, en las actualizaciones en vivo)
    // hasta el valor final con una curva de desaceleración.

    function animarNumero(elemento, valorFinal, duracion) {

        duracion = duracion || 900;

        const valorInicial = parseInt(elemento.textContent, 10) || 0;

        if (valorInicial === valorFinal) {
            return;
        }

        const inicio = performance.now();

        function paso(ahora) {

            const progreso = Math.min((ahora - inicio) / duracion, 1);
            const suavizado = 1 - Math.pow(1 - progreso, 3); // ease-out cúbico

            const valorActual = Math.round(
                valorInicial + (valorFinal - valorInicial) * suavizado
            );

            elemento.textContent = valorActual;

            if (progreso < 1) {
                requestAnimationFrame(paso);
            }
        }

        requestAnimationFrame(paso);
    }

    // Al cargar la página, cada tarjeta cuenta desde 0 hasta su valor real
    document.querySelectorAll("[data-stat]").forEach(function (elemento, indice) {

        const valorFinal = parseInt(elemento.textContent, 10) || 0;
        elemento.textContent = "0";

        // Pequeño retraso para que arranque justo cuando la tarjeta
        // ya terminó de aparecer con la animación de entrada
        window.setTimeout(function () {
            animarNumero(elemento, valorFinal, 900);
        }, indice * 90 + 250);
    });


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
                        pointHoverRadius: 6
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
                        pointHoverRadius: 6
                    },

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                animation: {
                    duration: 1100,
                    easing: "easeOutQuart"
                },

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
    // GRÁFICA INCIDENCIAS POR PRIORIDAD
    // ===========================

    const ctxIncidenciasPrioridad = document.getElementById("graficaIncidenciasPrioridad");

    if (ctxIncidenciasPrioridad) {

        new Chart(ctxIncidenciasPrioridad, {

            type: "doughnut",

            data: {
                labels: etiquetasPrioridadIncidencias,
                datasets: [{
                    data: valoresPrioridadIncidencias,
                    backgroundColor: ["#6FCF97", "#F2C14E", "#F2994A", "#EB5757"],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "68%",
                animation: {
                    duration: 1100,
                    easing: "easeOutQuart"
                },
                plugins: {
                    legend: {
                        display: true,
                        position: "bottom",
                        labels: {
                            usePointStyle: true,
                            boxWidth: 8,
                            padding: 14,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        backgroundColor: "#214F3B",
                        titleColor: "#FFFFFF",
                        bodyColor: "#FFFFFF",
                        padding: 12,
                        cornerRadius: 10
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

                animation: {
                    duration: 1000,
                    easing: "easeOutQuart"
                },

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
            const valorNuevo = datos[clave];

            if (elemento && elemento.textContent !== String(valorNuevo)) {

                // Cuenta suavemente desde el valor anterior hasta el nuevo,
                // en vez de reemplazar el texto de golpe
                animarNumero(elemento, valorNuevo, 700);

                elemento.classList.remove("valor-actualizado");
                // Forzar reflow para poder re-disparar la animación CSS
                void elemento.offsetWidth;
                elemento.classList.add("valor-actualizado");
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
        setInterval(actualizarDashboardEnVivo, 15000);
    }

});