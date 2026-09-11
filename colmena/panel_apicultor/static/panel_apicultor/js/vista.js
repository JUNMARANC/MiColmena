/* ==========================================================
   SELECTOR DE VISTA — TABLA / TARJETAS

   Compartido por apiarios, colmenas, mantenimientos e
   incidencias. Una sola implementación para los cuatro.

   En el panel del administrador esta misma lógica está
   copiada en cinco archivos distintos; aquí va una vez.

   CÓMO SE USA EN LA PLANTILLA

       <div class="selector-vista" data-vista="apiarios">
           <button type="button" data-vista-modo="tabla" ...>
           <button type="button" data-vista-modo="tarjetas" ...>
       </div>

       <div data-vista-panel="apiarios" data-vista-modo="tabla">...</div>
       <div data-vista-panel="apiarios" data-vista-modo="tarjetas">...</div>

   El atributo data-vista es el nombre con el que se guarda la
   preferencia, así cada módulo recuerda la suya por separado.
   ========================================================== */

(function () {

    "use strict";

    document.addEventListener("DOMContentLoaded", function () {

        var selectores = document.querySelectorAll(".selector-vista[data-vista]");

        if (selectores.length === 0) {
            return;
        }


        selectores.forEach(function (selector) {

            var nombre = selector.dataset.vista;
            var clave = "vista_" + nombre;

            var botones = selector.querySelectorAll("[data-vista-modo]");

            var paneles = document.querySelectorAll(
                '[data-vista-panel="' + nombre + '"]'
            );

            if (botones.length === 0 || paneles.length === 0) {
                return;
            }


            /* --------------------------------------------------
               LOS MODALES SE MUEVEN AL <body>

               Si un modal queda dentro del panel oculto, al
               abrirlo no se ve: su contenedor tiene display:none.

               Ojo con el selector: este proyecto no usa solo la
               clase .modal de Bootstrap. Los modales propios se
               llaman .apiario-editar-overlay, .modal-editar-apiario,
               .colmena-detalle-overlay y parecidos. Buscando solo
               ".modal" se quedaban dentro del panel oculto y el
               botón parecía no hacer nada.

               El filtro del final evita mover partes internas: si
               un elemento está dentro de otro que también coincide
               (por ejemplo .modal-body dentro de .modal), se deja
               donde está para no desarmar el modal.
            -------------------------------------------------- */

            var SELECTOR_MODAL = '.modal, [class*="-overlay"], [class*="modal-"]';

            paneles.forEach(function (panel) {

                var candidatos = Array.prototype.slice.call(
                    panel.querySelectorAll(SELECTOR_MODAL)
                );

                candidatos
                    .filter(function (elemento) {
                        // solo los que no estén dentro de otro modal
                        var padre = elemento.parentElement;
                        while (padre && padre !== panel) {
                            if (padre.matches(SELECTOR_MODAL)) {
                                return false;
                            }
                            padre = padre.parentElement;
                        }
                        return true;
                    })
                    .forEach(function (modal) {
                        document.body.appendChild(modal);
                    });

            });


            function aplicar(modo, guardar) {

                paneles.forEach(function (panel) {
                    panel.hidden = panel.dataset.vistaModo !== modo;
                });

                botones.forEach(function (boton) {
                    var activo = boton.dataset.vistaModo === modo;
                    boton.classList.toggle("activo", activo);
                    boton.setAttribute("aria-pressed", activo ? "true" : "false");
                });

                if (guardar) {
                    try {
                        localStorage.setItem(clave, modo);
                    } catch (error) {
                        // Modo privado o almacenamiento bloqueado: el
                        // selector funciona igual, solo no recuerda.
                    }
                }
            }


            /* Estado inicial: lo guardado, o lo que el HTML marque
               como activo, o tabla. */

            var guardado = null;

            try {
                guardado = localStorage.getItem(clave);
            } catch (error) {}

            var porDefecto = selector.dataset.vistaDefecto || "tabla";

            var valido = Array.prototype.some.call(botones, function (b) {
                return b.dataset.vistaModo === guardado;
            });

            aplicar(valido ? guardado : porDefecto, false);


            botones.forEach(function (boton) {
                boton.addEventListener("click", function () {
                    aplicar(boton.dataset.vistaModo, true);
                });
            });


            /* --------------------------------------------------
               EN CELULAR, SIEMPRE TARJETAS

               Una tabla de cinco columnas no cabe en 400px. Se
               puede convertir cada fila en una ficha, pero queda
               peor que la tarjeta que este panel ya tiene bien
               diseñada: repite la misma información con menos
               espacio y sin la foto.

               Así que por debajo de 760px se fuerza la vista de
               tarjetas y se oculta el selector. La preferencia
               guardada no se toca: al volver a una pantalla
               grande, reaparece como la había dejado.
            -------------------------------------------------- */

            var ANCHO_SOLO_TARJETAS = 760;

            var hayTarjetas = Array.prototype.some.call(botones, function (b) {
                return b.dataset.vistaModo === "tarjetas";
            });

            function revisarAncho() {

                if (!hayTarjetas) {
                    return;
                }

                var angosto = window.innerWidth < ANCHO_SOLO_TARJETAS;

                selector.hidden = angosto;

                if (angosto) {
                    // sin guardar: es una imposición del ancho, no
                    // una elección del usuario
                    aplicar("tarjetas", false);

                } else {
                    var preferido = null;
                    try {
                        preferido = localStorage.getItem(clave);
                    } catch (error) {}

                    aplicar(preferido || porDefecto, false);
                }
            }

            revisarAncho();

            var pendiente = false;

            window.addEventListener("resize", function () {
                if (pendiente) return;
                pendiente = true;
                window.requestAnimationFrame(function () {
                    pendiente = false;
                    revisarAncho();
                });
            }, { passive: true });

        });

    });

})();