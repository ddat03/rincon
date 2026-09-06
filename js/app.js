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

  /* ---------- "entrada" (se dispara al abrir la bóveda) ---------- */
  var yaEntro = false;
  var alEntrarCbs = [];
  function alEntrar(fn) { if (yaEntro) fn(); else alEntrarCbs.push(fn); }
  function dispararEntrada() {
    if (yaEntro) return;
    yaEntro = true;
    alEntrarCbs.splice(0).forEach(function (f) { try { f(); } catch (e) { console.error(e); } });
  }
  var armarReanudarMusica = function () {};

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
     PORTADA — galaxia con corazón (canvas)
     Espiral de partículas girando + un corazón trazado con
     estrellas más brillantes en el centro. Liviano en celular.
     ========================================================= */
  function iniciarFondoPortada() {
    var canvas = $('.portada__canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var ancho = 0, alto = 0, cx = 0, cy = 0;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var animando = true, raf = null, t = 0;
    var estrellas = [], galaxia = [], corazon = [];
    var mouseX = 0, mouseY = 0, offX = 0, offY = 0;

    // paleta por radio normalizado (0 = núcleo, 1 = borde)
    var PALETA = ['#fff4e6', '#ffe0b0', '#f4c07f', '#e88aa6', '#c774c0', '#8f74e8', '#6f8bec'];
    function colorRadio(rn) {
      return PALETA[Math.min(PALETA.length - 1, Math.floor(rn * PALETA.length))];
    }

    function dimensionar() {
      ancho = canvas.clientWidth;
      alto = canvas.clientHeight;
      canvas.width = Math.round(ancho * dpr);
      canvas.height = Math.round(alto * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = ancho / 2;
      cy = alto * 0.42;
      sembrar();
      if (PREFIERE_MENOS_MOVIMIENTO) { dibujar(); }
    }

    function sembrar() {
      var area = ancho * alto;
      var nEst = Math.max(50, Math.min(Math.round(area / 7000), 220));
      estrellas = [];
      for (var i = 0; i < nEst; i++) {
        estrellas.push({
          x: Math.random() * ancho, y: Math.random() * alto,
          r: Math.random() * 1.4 + 0.25,
          f: Math.random() * Math.PI * 2, v: Math.random() * 0.03 + 0.008
        });
      }

      var radio = Math.min(ancho, alto) * (ancho < 560 ? 0.66 : 0.52);
      var nGal = Math.max(420, Math.min(Math.round(area / 950), 1700));
      if (PREFIERE_MENOS_MOVIMIENTO) nGal = Math.min(nGal, 700);
      var brazos = 2, giroEspiral = 2.7;
      galaxia = [];
      for (var g = 0; g < nGal; g++) {
        var enBulbo = g < nGal * 0.22;                   // núcleo denso
        var rn = enBulbo ? Math.pow(Math.random(), 1.7) * 0.28 : Math.pow(Math.random(), 0.55);
        var r = rn * radio;
        var brazo = g % brazos;
        var base = brazo * (Math.PI * 2 / brazos) + rn * giroEspiral;
        var disp = (Math.random() - 0.5) * (enBulbo ? 6.3 : (0.52 - rn * 0.32));
        galaxia.push({
          r: r, a: base + disp,
          w: (0.10 + (1 - rn) * 0.4) * 0.0016,           // rotación diferencial
          rn: rn,
          size: Math.random() < 0.10 ? (Math.random() * 1.1 + 1.6) : (Math.random() * 1 + 0.55),
          col: colorRadio(Math.min(1, rn + (Math.random() - 0.5) * 0.14)),
          tw: Math.random() * Math.PI * 2, tv: Math.random() * 0.05 + 0.02
        });
      }

      // corazón: curva paramétrica clásica
      var escala = radio * 0.043;
      corazon = [];
      var nCor = ancho < 560 ? 110 : 168;
      for (var h = 0; h < nCor; h++) {
        var th = (h / nCor) * Math.PI * 2;
        var hx = 16 * Math.pow(Math.sin(th), 3);
        var hy = 13 * Math.cos(th) - 5 * Math.cos(2 * th) - 2 * Math.cos(3 * th) - Math.cos(4 * th);
        corazon.push({
          x: hx * escala + (Math.random() - 0.5) * 3,
          y: -hy * escala + (Math.random() - 0.5) * 3,
          tw: Math.random() * Math.PI * 2, tv: Math.random() * 0.06 + 0.03,
          size: Math.random() * 1.1 + 0.9
        });
      }
    }

    function dibujar() {
      ctx.clearRect(0, 0, ancho, alto);

      // brillo del núcleo
      var glow = ctx.createRadialGradient(cx + offX, cy + offY, 0, cx + offX, cy + offY, Math.min(ancho, alto) * 0.6);
      glow.addColorStop(0, 'rgba(255, 224, 196, 0.26)');
      glow.addColorStop(0.22, 'rgba(226, 138, 166, 0.15)');
      glow.addColorStop(0.5, 'rgba(143, 116, 232, 0.08)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, ancho, alto);

      // estrellas de fondo
      for (var i = 0; i < estrellas.length; i++) {
        var s = estrellas[i];
        var b = 0.35 + Math.sin(s.f + t * s.v) * 0.35 + 0.3;
        ctx.globalAlpha = Math.max(0, Math.min(1, b)) * 0.8;
        ctx.fillStyle = '#ffe9d6';
        ctx.fillRect(s.x, s.y, s.r, s.r);
      }

      // galaxia
      var flatten = 0.58, tilt = -0.34;
      var cosT = Math.cos(tilt), sinT = Math.sin(tilt);
      ctx.globalCompositeOperation = 'lighter';
      for (var g = 0; g < galaxia.length; g++) {
        var p = galaxia[g];
        if (!PREFIERE_MENOS_MOVIMIENTO) p.a += p.w * 16;
        var px = Math.cos(p.a) * p.r;
        var py = Math.sin(p.a) * p.r * flatten;
        var rx = px * cosT - py * sinT;
        var ry = px * sinT + py * cosT;
        var tw = 0.6 + Math.sin(p.tw + t * p.tv) * 0.4;
        ctx.globalAlpha = Math.min(1, (0.5 + (1 - p.rn) * 0.5) * tw);
        ctx.fillStyle = p.col;
        ctx.fillRect(cx + offX + rx, cy + offY + ry, p.size, p.size);
      }
      ctx.globalCompositeOperation = 'source-over';

      // corazón
      ctx.globalCompositeOperation = 'lighter';
      var lat = PREFIERE_MENOS_MOVIMIENTO ? 1 : 1 + Math.sin(t * 0.03) * 0.03;
      for (var h = 0; h < corazon.length; h++) {
        var c = corazon[h];
        var br = 0.5 + Math.sin(c.tw + t * c.tv) * 0.5;
        ctx.globalAlpha = 0.35 + br * 0.6;
        ctx.fillStyle = br > 0.6 ? '#ffd9a8' : '#ff6f9d';
        var s2 = c.size * (br > 0.7 ? 1.6 : 1);
        ctx.fillRect(cx + offX + c.x * lat, cy + offY + c.y * lat - alto * 0.02, s2, s2);
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }

    function frame() {
      if (!animando) return;
      t += 1;
      offX += ((mouseX - cx) * 0.02 - offX) * 0.04;
      offY += ((mouseY - cy) * 0.02 - offY) * 0.04;
      dibujar();
      raf = requestAnimationFrame(frame);
    }

    var entrado = false;
    function arrancar() {
      if (!entrado) return;               // no animar hasta abrir la bóveda
      if (PREFIERE_MENOS_MOVIMIENTO) { dibujar(); return; }
      if (!animando) { animando = true; frame(); }
    }
    function parar() { animando = false; if (raf) cancelAnimationFrame(raf); }

    animando = false;
    dimensionar();
    alEntrar(function () { entrado = true; arrancar(); });

    var reajuste;
    window.addEventListener('resize', function () {
      clearTimeout(reajuste);
      reajuste = setTimeout(dimensionar, 200);
    });
    window.addEventListener('pointermove', function (e) {
      mouseX = e.clientX; mouseY = e.clientY;
    }, { passive: true });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) parar(); else arrancar();
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (ents) {
        ents.forEach(function (e) { if (e.isIntersecting) arrancar(); else parar(); });
      }, { threshold: 0.02 }).observe($('#portada'));
    }
  }

  /* =========================================================
     BÓVEDA de entrada — teclado de 4 dígitos
     ========================================================= */
  function iniciarBoveda(cfg) {
    var b = $('#boveda');
    if (!b) { dispararEntrada(); armarReanudarMusica(); return; }
    var conf = (cfg && cfg.boveda) || {};
    var codigo = String(conf.codigo || '0708').replace(/\D/g, '') || '0708';
    var maxPista = conf.intentosParaPista || 3;
    var display = $('#bovedaDisplay');
    var puntos = $all('span', display);
    var pista = $('#bovedaPista');
    var teclado = $('#bovedaTeclado');
    var entrado = '', intentos = 0, resuelto = false;

    var recordado = false;
    try { recordado = localStorage.getItem('nh_entrada') === '1'; } catch (e) {}
    if (recordado) { b.hidden = true; dispararEntrada(); armarReanudarMusica(); return; }

    document.body.style.overflow = 'hidden';

    function render() {
      puntos.forEach(function (p, i) { p.classList.toggle('lleno', i < entrado.length); });
    }
    function agregar(d) {
      if (resuelto || entrado.length >= 4) return;
      entrado += d;
      render();
      if (entrado.length === 4) setTimeout(verificar, 170);
    }
    function borrar() { if (!resuelto) { entrado = entrado.slice(0, -1); render(); } }
    function verificar() {
      if (entrado === codigo) { desbloquear(); return; }
      intentos += 1;
      display.classList.add('error');
      setTimeout(function () {
        display.classList.remove('error');
        entrado = ''; render();
      }, 430);
      if (intentos >= maxPista && conf.pista) {
        pista.textContent = conf.pista;
        pista.hidden = false;
      }
    }
    function desbloquear() {
      resuelto = true;
      try { localStorage.setItem('nh_entrada', '1'); } catch (e) {}
      document.body.style.overflow = '';
      b.classList.add('abriendo');
      dispararEntrada();
      var quitar = function () { b.hidden = true; };
      b.addEventListener('animationend', quitar, { once: true });
      setTimeout(quitar, 1500);
    }

    teclado.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('button') : null;
      if (!btn) return;
      if (btn.getAttribute('data-d') != null) agregar(btn.getAttribute('data-d'));
      else if (btn.getAttribute('data-accion') === 'borrar') borrar();
      else if (btn.getAttribute('data-accion') === 'ok' && entrado.length === 4) verificar();
    });
    document.addEventListener('keydown', function (e) {
      if (b.hidden || resuelto) return;
      if (/^[0-9]$/.test(e.key)) agregar(e.key);
      else if (e.key === 'Backspace') borrar();
      else if (e.key === 'Enter' && entrado.length === 4) verificar();
    });
    render();
    var primer = $('button', teclado);
    if (primer) { try { primer.focus(); } catch (e) {} }
  }

  /* =========================================================
     MÚSICA de fondo
     ========================================================= */
  function iniciarMusica(cfg) {
    var audio = $('#musica');
    var toggle = $('#musicaToggle');
    var conf = (cfg && cfg.musica) || {};
    if (!audio || !toggle || !conf.archivo) return;

    audio.src = conf.archivo;
    audio.volume = 0;
    var VOL = 0.55;
    var quiereSonar = true;
    try { if (localStorage.getItem('nh_musica') === 'off') quiereSonar = false; } catch (e) {}

    function fundir() {
      var v = audio.volume;
      var id = setInterval(function () {
        v += 0.035;
        audio.volume = Math.min(VOL, v);
        if (v >= VOL || audio.paused) clearInterval(id);
      }, 110);
    }
    function tocar() {
      var p = audio.play();
      if (p && p.then) p.then(fundir).catch(function () {});
      else fundir();
    }
    function pintar() { toggle.classList.toggle('is-muted', audio.paused); }

    toggle.addEventListener('click', function () {
      if (audio.paused) {
        quiereSonar = true; tocar();
        try { localStorage.setItem('nh_musica', 'on'); } catch (e) {}
      } else {
        audio.pause(); quiereSonar = false;
        try { localStorage.setItem('nh_musica', 'off'); } catch (e) {}
      }
      pintar();
    });

    armarReanudarMusica = function () {
      toggle.hidden = false;
      pintar();
      var unaVez = function () {
        if (quiereSonar && audio.paused) tocar();
        setTimeout(pintar, 50);
        document.removeEventListener('pointerdown', unaVez);
      };
      document.addEventListener('pointerdown', unaVez);
    };

    alEntrar(function () {
      toggle.hidden = false;
      if (quiereSonar) tocar();
      setTimeout(pintar, 60);
    });
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
  function iniciarMapa(momentos, extra) {
    var cont = $('#map');
    if (!cont) return;

    var todos = (momentos || []).concat(extra || []);
    var conLugar = todos.filter(function (m) {
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

    cargarJSON('data/config.json').then(function (cfg) {
      aplicarConfig(cfg);
      iniciarMusica(cfg);
      iniciarBoveda(cfg);
    }).catch(function (e) {
      mostrarErrorGlobal(e);
      iniciarContador('2025-01-07');
      iniciarBoveda(null);
    });

    // red de seguridad: si algo tarda demasiado, no dejar la bóveda trabada
    setTimeout(function () { if (!yaEntro && !$('#boveda')) dispararEntrada(); }, 8000);

    cargarJSON('data/carta.json').then(iniciarCarta).catch(mostrarErrorGlobal);

    Promise.all([
      cargarJSON('data/momentos.json'),
      cargarJSON('data/mapa.json').catch(function () { return []; })
    ]).then(function (res) {
      iniciarHistoria(res[0]);
      iniciarMapa(res[0], res[1]);
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
