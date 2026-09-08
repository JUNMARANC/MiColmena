/* Header que se encoge al bajar.

   Antes esto era `window.onscroll = ...`, una asignación directa:
   cualquier otro script que asigne window.onscroll lo borra sin
   avisar. Además corría en cada píxel de scroll, tocando el DOM
   decenas de veces por segundo.

   Ahora usa addEventListener (convive con los demás listeners) y
   requestAnimationFrame, que lo limita a una vez por cuadro. */

(function () {
    var header = document.getElementById("header");
    if (!header) return;

    var pendiente = false;

    function revisar() {
        pendiente = false;
        header.classList.toggle("scrolled", window.scrollY > 80);
    }

    window.addEventListener("scroll", function () {
        if (pendiente) return;
        pendiente = true;
        window.requestAnimationFrame(revisar);
    }, { passive: true });

    revisar();
})();

/* =========================================================
   SISTEMA "REVELAR AL HACER SCROLL"
   Anima elementos [data-reveal] y las tarjetas/títulos que ya
   tenían animaciones de entrada, pero disparándolas cuando
   el usuario llega a esa sección (no al cargar la página).
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {

    var prefiereMenosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var elementosRevelar = document.querySelectorAll(
        '[data-reveal], .servicios-titulo, .card-uno, .card-dos, .card-tres, .card-cuatro, ' +
        '.cartel-contacto, .apicultor-contacto, .formulario-contacto'
    );

    if (prefiereMenosMovimiento || !('IntersectionObserver' in window)) {
        elementosRevelar.forEach(function (el) { el.classList.add('en-vista'); });
        return;
    }

    var observador = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
            if (!entrada.isIntersecting) return;

            var elemento = entrada.target;
            var demora = parseInt(elemento.getAttribute('data-reveal-demora') || '0', 10);

            setTimeout(function () {
                elemento.classList.add('en-vista');
            }, demora);

            observador.unobserve(elemento);
        });
    }, { threshold: 0.15 });

    elementosRevelar.forEach(function (el) { observador.observe(el); });
});

/* =========================================================
   ABEJITA VIAJERA
   Vuela en una trayectoria ondulada ligada al progreso de
   scroll de toda la página, como si acompañara el recorrido.
   ========================================================= */
(function () {
    var abeja = document.getElementById('abejaViajera');
    if (!abeja) return;

    var prefiereMenosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefiereMenosMovimiento) return;

    var actualizando = false;

    function moverAbeja() {
        var alturaDisponible = document.documentElement.scrollHeight - window.innerHeight;
        var progreso = alturaDisponible > 0 ? (window.scrollY / alturaDisponible) : 0;

        var arriba = 16 + progreso * 66;                          // recorre verticalmente la página
        var izquierda = 4 + 3 * Math.sin(progreso * Math.PI * 6);  // pequeño vaivén horizontal
        var giro = Math.sin(progreso * Math.PI * 6) * 14;          // se inclina como si aleteara

        abeja.style.top = arriba + '%';
        abeja.style.left = izquierda + '%';
        abeja.style.transform = 'rotate(' + giro + 'deg)';
        abeja.classList.toggle('activa', window.scrollY > 40);

        actualizando = false;
    }

    window.addEventListener('scroll', function () {
        if (!actualizando) {
            window.requestAnimationFrame(moverAbeja);
            actualizando = true;
        }
    });

    moverAbeja();
})();

/* =========================================================
   PARALAJE SUAVE DEL HERO
   Desplaza levemente la imagen de fondo del hero al hacer
   scroll, solo en pantallas grandes (evita saltos en móvil).
   ========================================================= */
(function () {
    var hero = document.querySelector('.hero-inicio');
    if (!hero || window.innerWidth < 992) return;

    var prefiereMenosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefiereMenosMovimiento) return;

    var actualizando = false;

    function aplicarParalaje() {
        var desplazamiento = Math.min(window.scrollY * 0.15, 60);
        hero.style.backgroundPosition = 'center calc(50% + ' + desplazamiento + 'px)';
        actualizando = false;
    }

    window.addEventListener('scroll', function () {
        if (!actualizando) {
            window.requestAnimationFrame(aplicarParalaje);
            actualizando = true;
        }
    });
})();

/* =========================================================
   CARRUSEL MANUAL DEL HERO
   Solo avanza cuando la persona hace clic (flechas o puntos),
   sin auto-avance. El video se pausa cuando no está activo.
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {
    var carrusel = document.querySelector('.hero-carrusel');
    if (!carrusel) return;

    var slides = Array.prototype.slice.call(carrusel.querySelectorAll('.hero-slide'));
    var puntos = Array.prototype.slice.call(carrusel.querySelectorAll('.hero-punto'));
    var flechaIzq = carrusel.querySelector('.hero-flecha-izq');
    var flechaDer = carrusel.querySelector('.hero-flecha-der');

    if (!slides.length) return;

    var indice = slides.findIndex(function (s) { return s.classList.contains('activa'); });
    if (indice < 0) indice = 0;

    var tarjetaContenido = document.querySelector('.hero-texto-contenido');
    var duracionSalida = 350; // debe coincidir con el tiempo de transición en CSS

    function obtenerVideo(el) { return el.querySelector('video'); }

    function actualizarTextoHero(slideEl) {
        if (!tarjetaContenido) return;

        var prefijo = slideEl.getAttribute('data-titulo-prefijo');
        if (!prefijo) return; // ese slide no define contenido propio para la tarjeta

        tarjetaContenido.classList.add('cambiando');

        setTimeout(function () {
            var acento = slideEl.getAttribute('data-titulo-acento') || '';
            var sufijo = slideEl.getAttribute('data-titulo-sufijo') || '';
            var texto = slideEl.getAttribute('data-texto') || '';
            var ctaTexto = slideEl.getAttribute('data-cta-texto') || '';
            var ctaHref = slideEl.getAttribute('data-cta-href') || '#';

            var h1 = tarjetaContenido.querySelector('h1');
            var p = tarjetaContenido.querySelector('p');
            var boton = tarjetaContenido.querySelector('a.btn-hero');

            if (h1) h1.innerHTML = prefijo + ' <span>' + acento + '</span>' + (sufijo ? ' ' + sufijo : '');
            if (p) p.textContent = texto;
            if (boton) {
                boton.textContent = ctaTexto;
                boton.setAttribute('href', ctaHref);
            }

            tarjetaContenido.classList.remove('cambiando');
        }, duracionSalida);
    }

    function irA(nuevo) {
        var anterior = slides[indice];
        var vAnterior = obtenerVideo(anterior);
        if (vAnterior) vAnterior.pause();
        anterior.classList.remove('activa');

        indice = (nuevo + slides.length) % slides.length;

        var actual = slides[indice];
        actual.classList.add('activa');

        puntos.forEach(function (p, i) { p.classList.toggle('activo', i === indice); });

        var vActual = obtenerVideo(actual);
        if (vActual && vActual.src) {
            vActual.currentTime = 0;
            vActual.play().catch(function () {});
        }

        actualizarTextoHero(actual);
    }

    if (flechaDer) flechaDer.addEventListener('click', function () { irA(indice + 1); });
    if (flechaIzq) flechaIzq.addEventListener('click', function () { irA(indice - 1); });
    puntos.forEach(function (punto, i) {
        punto.addEventListener('click', function () { irA(i); });
    });

    var prefiereMenosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var esMovil = window.innerWidth < 768;


    /* -----------------------------------------------------
       VIDEO SOLO EN ESCRITORIO

       El <video> viene con data-src en vez de <source>. Aquí
       se le pone el src de verdad, y solo si NO es celular ni
       hay ahorro de datos activado. Así en móvil no se
       descargan los megas del video, que además ni se ve
       porque el carrusel arranca en el slide 2.
       ----------------------------------------------------- */

    function conexionLimitada() {
        var c = navigator.connection;
        if (!c) return false;
        // "Ahorro de datos" del sistema, o red 2G/3G
        return c.saveData === true || /(^|-)(2g|slow-2g|3g)$/.test(c.effectiveType || '');
    }

    var usarVideo = !esMovil && !prefiereMenosMovimiento && !conexionLimitada();

    slides.forEach(function (slide) {
        var video = slide.querySelector('video[data-src]');
        if (!video) return;

        if (usarVideo) {
            video.src = video.getAttribute('data-src');
            video.load();
        } else {
            // Se queda con el póster: la foto 1.jpg que ya está
            // optimizada. El slide sigue existiendo y sirve igual.
            video.removeAttribute('data-src');
        }
    });


    /* -----------------------------------------------------
       AUTO-AVANCE + BARRA DE PROGRESO

       El carrusel no avanzaba solo, así que la mayoría de
       visitantes solo veía el primer slide: había que notar
       las flechas y hacer clic. Ahora rota solo, con una
       barra abajo que avisa cuándo cambia.

       Se pausa al pasar el mouse, al enfocar con teclado y
       cuando la pestaña no está visible.
       ----------------------------------------------------- */

    var DURACION_SLIDE = 6500;
    var temporizador = null;

    var progreso = document.createElement('div');
    progreso.className = 'hero-progreso';
    progreso.setAttribute('aria-hidden', 'true');
    progreso.innerHTML = '<span></span>';
    progreso.style.setProperty('--hero-duracion', (DURACION_SLIDE / 1000) + 's');
    carrusel.appendChild(progreso);

    function reiniciarProgreso() {
        progreso.classList.remove('corriendo');
        void progreso.offsetWidth;   // fuerza el reinicio de la animación
        progreso.classList.add('corriendo');
    }

    function detener() {
        window.clearTimeout(temporizador);
        temporizador = null;
        progreso.classList.remove('corriendo');
    }

    function arrancar() {
        if (prefiereMenosMovimiento || slides.length < 2) return;
        detener();
        reiniciarProgreso();
        temporizador = window.setTimeout(function () {
            irA(indice + 1);
        }, DURACION_SLIDE);
    }

    // Cada cambio de slide (manual o automático) reinicia el conteo
    var irAOriginal = irA;
    irA = function (nuevoIndice) {
        irAOriginal(nuevoIndice);
        arrancar();
    };

    carrusel.addEventListener('mouseenter', detener);
    carrusel.addEventListener('mouseleave', arrancar);
    carrusel.addEventListener('focusin', detener);
    carrusel.addEventListener('focusout', arrancar);

    // No sirve de nada rotar en una pestaña que nadie está viendo
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            detener();
        } else {
            arrancar();
        }
    });


    if ((prefiereMenosMovimiento || esMovil) && slides.length > 1) {
        irA(1);
    } else {
        var vInicial = obtenerVideo(slides[indice]);
        if (vInicial && usarVideo) vInicial.play().catch(function () {});
        arrancar();
    }
});

/* =========================================================
   LOTTIE (animaciones vectoriales, ej. una abeja animada)
   Busca contenedores con [data-lottie] y carga el archivo
   .json indicado en su atributo data-lottie-src. Si el
   archivo no existe todavía, simplemente no pasa nada.
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {
    if (typeof lottie === 'undefined') return;

    document.querySelectorAll('[data-lottie]').forEach(function (contenedor) {
        var ruta = contenedor.getAttribute('data-lottie-src');
        if (!ruta) return;

        lottie.loadAnimation({
            container: contenedor,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: ruta
        });
    });
});

/* =========================================================
   FORMULARIO DE CONTACTO: contador de caracteres y estado
   de "enviando" en el botón para que no quede quieto.
   ========================================================= */
document.addEventListener('input', function (evento) {
    var textarea = evento.target;
    if (textarea.tagName !== 'TEXTAREA' || textarea.name !== 'mensaje') return;

    var contenedor = textarea.parentElement.querySelector('.contador-mensaje');
    if (!contenedor) return;

    var maximo = parseInt(textarea.getAttribute('maxlength') || '500', 10);
    var actual = textarea.value.length;

    contenedor.querySelector('.contador-actual').textContent = actual;
    contenedor.classList.toggle('contador-limite', actual >= maximo - 20);
});

document.addEventListener('submit', function (evento) {
    var formulario = evento.target;
    if (!formulario.closest('.formulario-contacto')) return;

    var boton = formulario.querySelector('button[type="submit"]');
    if (!boton || boton.disabled) return;

    boton.dataset.textoOriginal = boton.innerHTML;
    boton.innerHTML = '<i class="bi bi-arrow-repeat"></i> Enviando...';
    boton.disabled = true;
});

document.addEventListener('click', function (evento) {
    var boton = evento.target.closest('.tag-opcion');
    if (!boton) return;

    var grupo = boton.closest('.tags-contacto');
    if (!grupo) return;

    grupo.querySelectorAll('.tag-opcion').forEach(function (b) {
        b.classList.remove('seleccionado');
    });
    boton.classList.add('seleccionado');

    var formulario = boton.closest('form');
    if (formulario) {
        var oculto = formulario.querySelector('.asunto-seleccionado');
        if (oculto) oculto.value = boton.getAttribute('data-valor');
    }
});

/* =========================================================
   LOADER DE ENTRADA (panal)
   Se oculta cuando la página termina de cargar, respetando
   un tiempo mínimo para que se alcance a ver la animación.
   ========================================================= */
(function () {
    var cargador = document.getElementById('cargador-panal');
    if (!cargador) return;

    var esperaMinima = new Promise(function (resolver) { setTimeout(resolver, 600); });
    var cargaCompleta = new Promise(function (resolver) {
        if (document.readyState === 'complete') {
            resolver();
        } else {
            window.addEventListener('load', resolver);
        }
    });

    Promise.all([esperaMinima, cargaCompleta]).then(function () {
        cargador.classList.add('oculto');
    });
})();

/* =========================================================
   TARJETAS DE SERVICIOS: volteo con tap en pantallas táctiles
   (el hover ya funciona solo en escritorio)
   ========================================================= */
document.addEventListener('click', function (evento) {
    var boton = evento.target.closest('.btn-servicio');
    if (boton) return; // dejar que el botón abra su modal normalmente

    var tarjeta = evento.target.closest('.servicio-card');
    if (!tarjeta) return;

    if (tarjeta.classList.contains('volteada')) {
        tarjeta.classList.remove('volteada');
    } else {
        document.querySelectorAll('.servicio-card.volteada').forEach(function (otra) {
            otra.classList.remove('volteada');
        });
        tarjeta.classList.add('volteada');
    }
});

/* =========================================================
   INDICADOR DE SCROLL: se desvanece apenas el usuario se mueve
   ========================================================= */
(function () {
    var indicador = document.querySelector('.indicador-scroll');
    if (!indicador) return;

    window.addEventListener('scroll', function () {
        indicador.classList.toggle('oculto-scroll', window.scrollY > 60);
    });
})();