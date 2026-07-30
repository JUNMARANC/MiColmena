window.onscroll = function() {
    let header = document.getElementById("header");

    if (document.documentElement.scrollTop > 80 || document.body.scrollTop > 80) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    };

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
        if (vActual) {
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

    if ((prefiereMenosMovimiento || esMovil) && slides.length > 1) {
        irA(1);
    } else {
        var vInicial = obtenerVideo(slides[indice]);
        if (vInicial) vInicial.play().catch(function () {});
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