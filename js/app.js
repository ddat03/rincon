/* =========================================================
   Nuestra Historia — lógica de la página
   HTML + CSS + JS plano. Sin dependencias salvo Leaflet (mapa).
   Todo el contenido personal vive en /data/*.json
   ========================================================= */
(function () {
  'use strict';

  var PREFIERE_MENOS_MOVIMIENTO =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- utilidades ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function cargarJSON(ruta) {
    return fetch(ruta, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('No se pudo cargar ' + ruta + ' (' + r.status + ')');
      return r.json();
    });
  }

  function valorAnidado(obj, ruta) {
    return ruta.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, obj);
  }

  function scrollA(sel) {
    var destino = $(sel);
    if (!destino) return;
    destino.scrollIntoView({ behavior: PREFIERE_MENOS_MOVIMIENTO ? 'auto' : 'smooth', block: 'start' });
  }

  /* ---------- observer de aparición al hacer scroll ---------- */
  var revelador = ('IntersectionObserver' in window)
    ? new IntersectionObserver(function (entradas, obs) {
        entradas.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })
    : null;

  function revelar(el) {
    if (!revelador) { el.classList.add('is-visible'); return; }
    revelador.observe(el);
  }

  /* =========================================================
     CONFIG + textos generales
     ========================================================= */
  function aplicarConfig(cfg) {
    $all('[data-config]').forEach(function (el) {
      var v = valorAnidado(cfg, el.getAttribute('data-config'));
      if (v != null) el.textContent = v;
    });
    $all('[data-config-text]').forEach(function (el) {
      var v = valorAnidado(cfg, el.getAttribute('data-config-text'));
      if (v != null) el.textContent = v;
    });
    if (cfg.tituloSitio) document.title = cfg.tituloSitio;
    if (cfg.nombre) {
      var t = $('.portada__nombre');
      if (t) t.setAttribute('aria-label', cfg.nombre);
    }
    iniciarContador(cfg.fechaInicio);
  }

  /* =========================================================
     CONTADOR de tiempo juntos
     ========================================================= */
  function iniciarContador(fechaISO) {
    var inicio = new Date((fechaISO || '2025-01-07') + 'T00:00:00');
    if (isNaN(inicio.getTime())) inicio = new Date('2025-01-07T00:00:00');

    var campos = {
      dias: $all('[data-cont="dias"]'),
      horas: $all('[data-cont="horas"]'),
      min: $all('[data-cont="min"]'),
      seg: $all('[data-cont="seg"]')
    };

    function pintar(sel, valor) {
      var txt = String(valor);
      campos[sel].forEach(function (el) { if (el.textContent !== txt) el.textContent = txt; });
    }

    function tick() {
      var ms = Date.now() - inicio.getTime();
      if (ms < 0) ms = 0;
      var s = Math.floor(ms / 1000);
      pintar('dias', Math.floor(s / 86400));
      pintar('horas', Math.floor((s % 86400) / 3600));
      pintar('min', Math.floor((s % 3600) / 60));
      pintar('seg', s % 60);
    }
    tick();
    setInterval(tick, 1000);
  }

  /* =========================================================
     PORTADA — fondo animado (canvas): estrellas + corazones
     ========================================================= */
  function iniciarFondoPortada() {
    var canvas = $('.portada__canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var ancho = 0, alto = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var estrellas = [], corazones = [], animando = true, raf = null;

    function dimensionar() {
      ancho = canvas.clientWidth;
      alto = canvas.clientHeight;
      canvas.width = ancho * dpr;
      canvas.height = alto * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sembrar();
    }

    function sembrar() {
      var densidad = Math.round((ancho * alto) / 9000);
      densidad = Math.max(40, Math.min(densidad, 160));
      estrellas = [];
      for (var i = 0; i < densidad; i++) {
        estrellas.push({
          x: Math.random() * ancho,
          y: Math.random() * alto,
          r: Math.random() * 1.6 + 0.3,
          brillo: Math.random(),
          vel: Math.random() * 0.0015 + 0.0004
        });
      }
      var nCor = PREFIERE_MENOS_MOVIMIENTO ? 0 : Math.max(6, Math.round(ancho / 90));
      corazones = [];
      for (var j = 0; j < nCor; j++) corazones.push(nuevoCorazon(true));
    }

    function nuevoCorazon(inicial) {
      return {
        x: Math.random() * ancho,
        y: inicial ? Math.random() * alto : alto + 20,
        tam: Math.random() * 10 + 6,
        vy: Math.random() * 0.35 + 0.15,
        deriva: (Math.random() - 0.5) * 0.4,
        alfa: Math.random() * 0.4 + 0.15,
        giro: Math.random() * Math.PI
      };
    }

    function dibujarCorazon(x, y, tam, alfa, giro) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(giro);
      ctx.scale(tam / 16, tam / 16);
      ctx.globalAlpha = alfa;
      ctx.fillStyle = Math.random() < 0.5 ? '#b5495b' : '#d4a056';
      ctx.beginPath();
      ctx.moveTo(0, 4);
      ctx.bezierCurveTo(0, 1, -3, -3, -8, -3);
      ctx.bezierCurveTo(-15, -3, -15, 6, -15, 6);
      ctx.bezierCurveTo(-15, 11, -9, 17, 0, 22);
      ctx.bezierCurveTo(9, 17, 15, 11, 15, 6);
      ctx.bezierCurveTo(15, 6, 15, -3, 8, -3);
      ctx.bezierCurveTo(3, -3, 0, 1, 0, 4);
      ctx.fill();
      ctx.restore();
    }

    var t = 0;
    function frame() {
      if (!animando) return;
      t += 1;
      ctx.clearRect(0, 0, ancho, alto);

      for (var i = 0; i < estrellas.length; i++) {
        var s = estrellas[i];
        s.brillo += s.vel * (Math.sin(t * 0.02 + i) > 0 ? 1 : -1);
        if (s.brillo < 0) s.brillo = 0; else if (s.brillo > 1) s.brillo = 1;
        ctx.globalAlpha = 0.25 + s.brillo * 0.65;
        ctx.fillStyle = '#ffe9d6';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      for (var k = 0; k < corazones.length; k++) {
        var c = corazones[k];
        c.y -= c.vy;
        c.x += c.deriva + Math.sin((c.y + t) * 0.02) * 0.3;
        c.giro += 0.005;
        dibujarCorazon(c.x, c.y, c.tam, c.alfa, c.giro);
        if (c.y < -30) corazones[k] = nuevoCorazon(false);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    function arrancar() { if (!animando) { animando = true; frame(); } }
    function parar() { animando = false; if (raf) cancelAnimationFrame(raf); }

    dimensionar();
    frame();

    var reajuste;
    window.addEventListener('resize', function () {
      clearTimeout(reajuste);
      reajuste = setTimeout(dimensionar, 200);
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) parar(); else arrancar();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (ents) {
        ents.forEach(function (e) { if (e.isIntersecting) arrancar(); else parar(); });
      }, { threshold: 0.05 }).observe($('#portada'));
    }
  }

  /* =========================================================
     LA CARTA — sobre animado
     ========================================================= */
  function iniciarCarta(carta) {
    var sobre = $('#sobre');
    var texto = $('#cartaTexto');
    if (!sobre || !texto) return;

    var enc = $('[data-carta="encabezado"]', texto);
    var cuerpo = $('[data-carta="parrafos"]', texto);
    var firma = $('[data-carta="firma"]', texto);

    if (enc && carta.encabezado) enc.textContent = carta.encabezado;
    if (cuerpo && Array.isArray(carta.parrafos)) {
      cuerpo.innerHTML = '';
      carta.parrafos.forEach(function (p) {
        var el = document.createElement('p');
        el.textContent = p;
        cuerpo.appendChild(el);
      });
    }
    if (firma && carta.firma) firma.textContent = carta.firma;

    function abrir() {
      if (sobre.classList.contains('abierto')) return;
      sobre.classList.add('abierto');
      sobre.setAttribute('aria-expanded', 'true');
      setTimeout(function () {
        texto.hidden = false;
        texto.scrollIntoView({ behavior: PREFIERE_MENOS_MOVIMIENTO ? 'auto' : 'smooth', block: 'center' });
        var btn = $('[data-cerrar-carta]', texto);
        if (btn) btn.focus();
      }, PREFIERE_MENOS_MOVIMIENTO ? 0 : 480);
    }

    function cerrar() {
      texto.hidden = true;
      sobre.classList.remove('abierto');
      sobre.setAttribute('aria-expanded', 'false');
      sobre.focus();
      sobre.scrollIntoView({ behavior: PREFIERE_MENOS_MOVIMIENTO ? 'auto' : 'smooth', block: 'center' });
    }

    sobre.addEventListener('click', abrir);
    sobre.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(); }
    });
    var btnCerrar = $('[data-cerrar-carta]', texto);
    if (btnCerrar) btnCerrar.addEventListener('click', cerrar);
  }

  /* =========================================================
     NUESTRA HISTORIA — línea de tiempo
     ========================================================= */
  function formatearFecha(iso) {
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function iniciarHistoria(momentos) {
    var cont = $('#timeline');
    if (!cont) return;
    var lista = (momentos || []).slice().sort(function (a, b) {
      return String(a.fecha).localeCompare(String(b.fecha));
    });
    cont.innerHTML = '';
    if (!lista.length) {
      cont.innerHTML = '<li class="error-datos">Todavía no hay momentos cargados.</li>';
      return;
    }
    lista.forEach(function (m) {
      var li = document.createElement('li');
      li.className = 'hito';
      var html = '';
      if (m.fecha) html += '<p class="hito__fecha">' + formatearFecha(m.fecha) + '</p>';
      if (m.titulo) html += '<h3 class="hito__titulo">' + escapar(m.titulo) + '</h3>';
      if (m.foto) {
        html += '<img class="hito__foto" src="' + encodeURI(m.foto) + '" alt="' +
          escapar(m.titulo || 'Recuerdo') + '" loading="lazy" onerror="this.remove()">';
      }
      if (m.descripcion) html += '<p class="hito__desc">' + escapar(m.descripcion) + '</p>';
      if (m.nota) html += '<p class="hito__nota">' + escapar(m.nota) + '</p>';
      li.innerHTML = html;
      li.classList.add('reveal');
      cont.appendChild(li);
      revelar(li);
    });
  }

  function escapar(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* =========================================================
     NUESTRO MAPA — Leaflet
     ========================================================= */
  function iniciarMapa(momentos) {
    var cont = $('#map');
    if (!cont) return;

    var conLugar = (momentos || []).filter(function (m) {
      return m.lugar && typeof m.lugar.lat === 'number' && typeof m.lugar.lng === 'number' &&
        !(m.lugar.lat === 0 && m.lugar.lng === 0);
    });

    if (typeof L === 'undefined') {
      cont.innerHTML = '<p class="error-datos">No se pudo cargar el mapa (sin conexión a Leaflet).</p>';
      return;
    }
    if (!conLugar.length) {
      cont.innerHTML = '<p class="cargando">Todavía no hay lugares con ubicación en <code>momentos.json</code>.</p>';
      return;
    }

    var mapa = L.map(cont, { scrollWheelZoom: false, attributionControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(mapa);

    var icono = L.divIcon({
      className: '',
      html: '<div class="pin-corazon">♥</div>',
      iconSize: [30, 30],
      iconAnchor: [15, 28],
      popupAnchor: [0, -26]
    });

    var puntos = [];
    conLugar.forEach(function (m) {
      var ll = [m.lugar.lat, m.lugar.lng];
      puntos.push(ll);
      var html = '<div class="popup-lugar">';
      if (m.foto) html += '<img src="' + encodeURI(m.foto) + '" alt="" onerror="this.remove()">';
      html += '<h4>' + escapar(m.lugar.nombre || m.titulo || 'Un lugar nuestro') + '</h4>';
      if (m.fecha) html += '<time>' + formatearFecha(m.fecha) + '</time>';
      if (m.descripcion) html += '<p>' + escapar(m.descripcion) + '</p>';
      if (m.nota) html += '<p class="nota">' + escapar(m.nota) + '</p>';
      html += '</div>';
      L.marker(ll, { icon: icono, title: m.lugar.nombre || m.titulo || '' })
        .addTo(mapa)
        .bindPopup(html, { maxWidth: 240 });
    });

    if (puntos.length === 1) {
      mapa.setView(puntos[0], 13);
    } else {
      mapa.fitBounds(L.latLngBounds(puntos).pad(0.25));
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (ents, obs) {
        ents.forEach(function (e) {
          if (e.isIntersecting) { mapa.invalidateSize(); obs.disconnect(); }
        });
      }, { threshold: 0.2 }).observe(cont);
    }
  }

  /* =========================================================
     GALERÍA + LIGHTBOX
     ========================================================= */
  var galeriaItems = [];

  function iniciarGaleria(items) {
    var grid = $('#galeriaGrid');
    if (!grid) return;
    galeriaItems = (items || []).filter(function (it) { return it && it.src; });
    grid.innerHTML = '';
    if (!galeriaItems.length) {
      grid.innerHTML = '<p class="cargando">Todavía no hay fotos en <code>galeria.json</code>.</p>';
      return;
    }

    galeriaItems.forEach(function (it, idx) {
      var fig = document.createElement('figure');
      fig.className = 'galeria__item reveal' + (it.tipo === 'video' ? ' es-video' : '');
      fig.setAttribute('role', 'button');
      fig.setAttribute('tabindex', '0');
      fig.setAttribute('aria-label', it.texto || (it.tipo === 'video' ? 'Ver video' : 'Ver foto') + ' ' + (idx + 1));

      if (it.tipo === 'video') {
        var v = document.createElement('video');
        v.muted = true; v.playsInline = true; v.preload = 'metadata';
        v.src = encodeURI(it.src) + '#t=0.5';
        fig.appendChild(v);
      } else {
        var img = document.createElement('img');
        img.loading = 'lazy';
        img.decoding = 'async';
        img.alt = it.texto || 'Foto ' + (idx + 1);
        img.src = encodeURI(it.thumb || it.src);
        img.onerror = function () { fig.remove(); };
        fig.appendChild(img);
      }

      function abrir() { abrirLightbox(idx); }
      fig.addEventListener('click', abrir);
      fig.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(); }
      });

      grid.appendChild(fig);
      // aparición escalonada
      setTimeout(function () { revelar(fig); }, Math.min(idx, 12) * 40);
    });
  }

  /* ---------- Lightbox ---------- */
  var lb, lbMedia, lbCaption, lbIndice = 0, lbAbierto = false, ultimoFoco = null;

  function construirLightbox() {
    lb = $('#lightbox');
    if (!lb) return;
    lbMedia = $('#lightboxMedia');
    lbCaption = $('#lightboxCaption');

    $('.lightbox__btn--cerrar', lb).addEventListener('click', cerrarLightbox);
    $('.lightbox__btn--prev', lb).addEventListener('click', function () { mover(-1); });
    $('.lightbox__btn--next', lb).addEventListener('click', function () { mover(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) cerrarLightbox(); });

    document.addEventListener('keydown', function (e) {
      if (!lbAbierto) return;
      if (e.key === 'Escape') cerrarLightbox();
      else if (e.key === 'ArrowLeft') mover(-1);
      else if (e.key === 'ArrowRight') mover(1);
    });

    // swipe táctil
    var x0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) mover(dx < 0 ? 1 : -1);
      x0 = null;
    }, { passive: true });
  }

  function pintarLightbox() {
    var it = galeriaItems[lbIndice];
    if (!it) return;
    lbMedia.innerHTML = '';
    var el;
    if (it.tipo === 'video') {
      el = document.createElement('video');
      el.src = encodeURI(it.src);
      el.controls = true; el.autoplay = true; el.playsInline = true; el.loop = true;
    } else {
      el = document.createElement('img');
      el.src = encodeURI(it.src);
      el.alt = it.texto || 'Foto';
    }
    lbMedia.appendChild(el);
    lbCaption.textContent = it.texto || '';
    var soloUno = galeriaItems.length < 2;
    $('.lightbox__btn--prev', lb).hidden = soloUno;
    $('.lightbox__btn--next', lb).hidden = soloUno;
  }

  function abrirLightbox(indice) {
    if (!lb) return;
    lbIndice = indice;
    lbAbierto = true;
    ultimoFoco = document.activeElement;
    lb.hidden = false;
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    pintarLightbox();
    $('.lightbox__btn--cerrar', lb).focus();
  }

  function cerrarLightbox() {
    lbAbierto = false;
    lb.hidden = true;
    lb.setAttribute('aria-hidden', 'true');
    lbMedia.innerHTML = '';
    document.body.style.overflow = '';
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  }

  function mover(paso) {
    if (galeriaItems.length < 2) return;
    lbIndice = (lbIndice + paso + galeriaItems.length) % galeriaItems.length;
    pintarLightbox();
  }

  /* =========================================================
     NAVEGACIÓN — botones data-goto + scrollspy
     ========================================================= */
  function iniciarNavegacion() {
    $all('[data-goto]').forEach(function (btn) {
      btn.addEventListener('click', function () { scrollA(btn.getAttribute('data-goto')); });
    });

    var enlaces = $all('.nav a');
    var porId = {};
    enlaces.forEach(function (a) { porId[a.getAttribute('href').slice(1)] = a; });

    if ('IntersectionObserver' in window) {
      var spy = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) {
          if (e.isIntersecting) {
            enlaces.forEach(function (a) { a.classList.remove('is-active'); });
            var activo = porId[e.target.id];
            if (activo) activo.classList.add('is-active');
          }
        });
      }, { threshold: 0.5 });
      $all('section[id]').forEach(function (s) { spy.observe(s); });
    }

    enlaces.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        scrollA(a.getAttribute('href'));
      });
    });
  }

  /* =========================================================
     ARRANQUE
     ========================================================= */
  function mostrarErrorGlobal(msg) {
    console.error(msg);
  }

  document.addEventListener('DOMContentLoaded', function () {
    iniciarNavegacion();
    iniciarFondoPortada();
    construirLightbox();
    $all('.titulo-seccion').forEach(function (t) { t.classList.add('reveal'); revelar(t); });

    cargarJSON('data/config.json').then(aplicarConfig).catch(function (e) {
      mostrarErrorGlobal(e);
      iniciarContador('2025-01-07');
    });

    cargarJSON('data/carta.json').then(iniciarCarta).catch(mostrarErrorGlobal);

    cargarJSON('data/momentos.json').then(function (m) {
      iniciarHistoria(m);
      iniciarMapa(m);
    }).catch(function (e) {
      mostrarErrorGlobal(e);
      var tl = $('#timeline');
      if (tl) tl.innerHTML = '<li class="error-datos">No se pudo cargar momentos.json</li>';
    });

    cargarJSON('data/galeria.json').then(iniciarGaleria).catch(function (e) {
      mostrarErrorGlobal(e);
      var g = $('#galeriaGrid');
      if (g) g.innerHTML = '<p class="error-datos">No se pudo cargar galeria.json</p>';
    });
  });
})();
