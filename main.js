/* ==========================================================================
   THAYED RESTAURANTE — Interacciones y animaciones
   Vanilla JS, sin dependencias externas.
   Módulos: preloader · navbar · menú móvil · hero (typewriter + parallax)
            partículas · revelado por scroll · contadores · filtros de menú
            scrollspy · barra de progreso · formulario → WhatsApp
   ========================================================================== */
(function () {
  'use strict';

  var WA = '525547839629';                       // WhatsApp del restaurante
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- 1. PRELOADER
     Barra + porcentaje que avanza mientras carga, y al terminar se abren
     cuatro cortinas verticales que descubren el hero.                        */
  var t0Carga = Date.now();
  var MIN_MS  = 2400;                            // duración mínima de la intro
  var pre    = document.getElementById('preloader');
  var barra  = document.getElementById('pl-barra');
  var pct    = document.getElementById('pl-pct');
  var avance = 0, cargado = false;

  function pintar(v) {
    if (barra) barra.style.width = v + '%';
    if (pct)   pct.textContent   = Math.floor(v) + '%';
  }

  var tick = setInterval(function () {
    // Avanza suave hasta 90% y espera al evento load para completar
    var listoYa = cargado && (Date.now() - t0Carga) > MIN_MS;
    avance += listoYa ? 5 : Math.max(0.5, (88 - avance) * 0.035);
    if (avance >= 100) { avance = 100; clearInterval(tick); abrir(); }
    pintar(avance);
  }, 30);

  function abrir() {
    setTimeout(function () {
      document.body.classList.remove('is-loading');
      document.body.classList.add('intro-off');            // dispara cortinas + hero
      setTimeout(function () { document.body.classList.add('listo'); }, 1800);
    }, 320);
  }

  window.addEventListener('load', function () { cargado = true; });
  // Red de seguridad: nunca dejar al usuario atrapado en el preloader
  setTimeout(function () { cargado = true; }, 6000);

  /* ---------------------------------------------------------------- 2. NAVBAR */
  var nav = document.getElementById('navbar');
  var progreso = document.getElementById('progreso');

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle('scrolled', y > 40);

    if (progreso) {
      var alto = document.documentElement.scrollHeight - window.innerHeight;
      progreso.style.width = (alto > 0 ? (y / alto) * 100 : 0) + '%';
    }

    var ind = document.getElementById('scroll-ind');
    if (ind) ind.style.opacity = y > 160 ? '0' : '1';

    if (heroFondo) heroFondo.style.transform = 'scale(1.12) translate3d(0,' + (y * 0.22) + 'px,0)';

    spy(y);
  }

  /* ------------------------------------------------------------ 3. MENÚ MÓVIL */
  var burger = document.getElementById('hamburguesa');
  var movil  = document.getElementById('menu-movil');

  function cerrarMovil() {
    if (!movil) return;
    movil.classList.remove('abierto');
    burger.classList.remove('abierto');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (burger && movil) {
    burger.addEventListener('click', function () {
      var abierto = movil.classList.toggle('abierto');
      burger.classList.toggle('abierto', abierto);
      burger.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      document.body.style.overflow = abierto ? 'hidden' : '';
    });
    movil.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', cerrarMovil); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarMovil(); });
  }

  /* -------------------------------------------------- 4. HERO: parallax + texto */
  var heroFondo = document.querySelector('.hero-fondo');

  // Máquina de escribir en el subtítulo del hero
  var rot = document.getElementById('rotador');
  if (rot && !reduce) {
    var frases = (rot.dataset.frases || '').split('|').filter(Boolean);
    var iF = 0, iC = 0, borrando = false;
    var salida = rot.querySelector('.texto');

    (function escribir() {
      var f = frases[iF] || '';
      iC += borrando ? -1 : 1;
      salida.textContent = f.slice(0, iC);

      var espera = borrando ? 34 : 62;
      if (!borrando && iC === f.length) { espera = 1800; borrando = true; }
      else if (borrando && iC === 0)    { borrando = false; iF = (iF + 1) % frases.length; espera = 260; }
      setTimeout(escribir, espera);
    })();
  } else if (rot) {
    rot.querySelector('.texto').textContent = (rot.dataset.frases || '').split('|')[0] || '';
  }

  /* --------------------------------------------------------- 5. PARTÍCULAS */
  function particulas(canvas) {
    if (reduce) return;
    var ctx = canvas.getContext('2d');
    var pts = [], w = 0, h = 0, raf = null, visible = false;
    var densidad = parseFloat(canvas.dataset.densidad || '1');
    var color = canvas.dataset.color || '255,215,0';

    function medir() {
      var r = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width  = Math.max(1, r.width  * dpr);
      h = canvas.height = Math.max(1, r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var total = Math.round((r.width * r.height) / 26000 * densidad);
      total = Math.max(12, Math.min(total, 90));
      pts = [];
      for (var i = 0; i < total; i++) {
        pts.push({
          x: Math.random() * r.width,
          y: Math.random() * r.height,
          r: Math.random() * 1.9 + 0.5,
          vx: (Math.random() - 0.5) * 0.24,
          vy: -(Math.random() * 0.32 + 0.06),
          a: Math.random() * 0.5 + 0.12
        });
      }
    }

    function dibujar() {
      var r = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, r.width, r.height);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.y < -10) { p.y = r.height + 10; p.x = Math.random() * r.width; }
        if (p.x < -10) p.x = r.width + 10;
        if (p.x > r.width + 10) p.x = -10;
        ctx.beginPath();
        ctx.fillStyle = 'rgba(' + color + ',' + p.a + ')';
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(' + color + ',.55)';
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(dibujar);
    }

    medir();
    window.addEventListener('resize', function () { medir(); });

    // Sólo anima cuando la sección está en pantalla (rendimiento en móvil)
    new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (e.isIntersecting && !visible) { visible = true; dibujar(); }
        else if (!e.isIntersecting && visible) { visible = false; cancelAnimationFrame(raf); }
      });
    }, { threshold: 0.02 }).observe(canvas);
  }
  document.querySelectorAll('canvas.particles').forEach(particulas);

  /* -------------------------------------------------- 6. REVELADO POR SCROLL */
  var io = new IntersectionObserver(function (ents) {
    ents.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      var d = parseFloat(el.dataset.delay || 0);
      setTimeout(function () { el.classList.add('visible'); }, d * 1000);
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal').forEach(function (el, i) {
    // Escalona automáticamente los hijos de una misma rejilla
    if (!el.dataset.delay && el.parentElement && el.parentElement.children.length > 2) {
      var idx = Array.prototype.indexOf.call(el.parentElement.children, el);
      el.dataset.delay = Math.min(idx * 0.08, 0.4);
    }
    io.observe(el);
  });

  /* ------------------------------------------------------------ 7. CONTADORES */
  var ioNum = new IntersectionObserver(function (ents) {
    ents.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      var fin = parseFloat(el.dataset.target || 0);
      var pre = el.dataset.prefix || '';
      var suf = el.dataset.suffix || '';
      var t0 = null, dur = 1900;

      function paso(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        var ease = 1 - Math.pow(1 - p, 4);                 // easeOutQuart
        el.textContent = pre + Math.floor(ease * fin) + suf;
        if (p < 1) requestAnimationFrame(paso);
        else el.textContent = pre + fin + suf;
      }
      requestAnimationFrame(paso);
      ioNum.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-num').forEach(function (n) { ioNum.observe(n); });

  /* --------------------------------------------------- 8. FILTROS DEL MENÚ */
  var filtros = document.querySelectorAll('.filtro');
  var platos  = document.querySelectorAll('.plato');

  filtros.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filtros.forEach(function (b) { b.classList.remove('activo'); });
      btn.classList.add('activo');
      var cat = btn.dataset.cat;

      platos.forEach(function (p) {
        var ok = cat === 'todo' || p.dataset.cat === cat;
        if (ok) {
          p.classList.remove('oculto');
          p.style.opacity = 0;
          requestAnimationFrame(function () {
            p.style.transition = 'opacity .45s ease';
            p.style.opacity = 1;
          });
        } else {
          p.classList.add('oculto');
        }
      });
    });
  });

  /* ------------------------------------------------------------- 9. SCROLLSPY */
  var secciones = [].slice.call(document.querySelectorAll('section[id], header[id]'));
  var enlaces   = [].slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));

  function spy(y) {
    var actual = '';
    secciones.forEach(function (s) {
      if (y >= s.offsetTop - 140) actual = s.id;
    });
    enlaces.forEach(function (a) {
      a.classList.toggle('activo', a.getAttribute('href') === '#' + actual);
    });
  }

  /* -------------------------------------------- 10. FORMULARIO → WHATSAPP */
  var form = document.getElementById('form-contacto');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (id) {
        var el = document.getElementById(id);
        return el ? el.value.trim() : '';
      };
      var nombre  = v('f-nombre');
      var tel     = v('f-tel');
      var pedido  = v('f-pedido');
      var mensaje = v('f-mensaje');

      var txt =
        '¡Hola Thayed! 👋%0A%0A' +
        '*Nombre:* ' + encodeURIComponent(nombre || 'Sin especificar') + '%0A' +
        '*Teléfono:* ' + encodeURIComponent(tel || 'Sin especificar') + '%0A' +
        '*Me interesa:* ' + encodeURIComponent(pedido || 'Información general') + '%0A' +
        (mensaje ? '*Mensaje:* ' + encodeURIComponent(mensaje) + '%0A' : '') +
        '%0AQuedo al pendiente. ¡Gracias!';

      window.open('https://wa.me/' + WA + '?text=' + txt, '_blank', 'noopener');
    });
  }

  /* ------------------------------------------- 11. SCROLL SUAVE CON OFFSET */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var destino = document.querySelector(id);
      if (!destino) return;
      e.preventDefault();
      var top = destino.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ------------------------------------------------------------- 12. ARRANQUE */
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
