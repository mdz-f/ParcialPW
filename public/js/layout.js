/**
 * ============================================================
 *  ChambeaSV - LAYOUT COMPARTIDO Y UTILIDADES
 * ============================================================
 *  Este archivo se carga en TODAS las páginas y se encarga de:
 *   1. Pintar el encabezado (logo ChambeaSV + inicio de sesión + registro)
 *   2. Pintar la barra de navegación principal
 *   3. Pintar el pie de página
 *   4. Manejar una sesión (sincronizada con la BD)
 *   5. Ofrecer funciones de ayuda (formato de salario, fechas,
 *      estrellas, tarjetas de empleo, notificaciones...)
 *   6. El modo "Mostrar anotaciones" que explica cada sección
 *
 *  Cada página indica su sección activa con <body data-page="...">
 * ============================================================
 */

/* ------------------------------------------------------------
   SESIÓN CONECTADA A SUPABASE
   Guarda y lee la sesión real activa en localStorage
   ------------------------------------------------------------ */
const Sesion = {
  get() { return JSON.parse(localStorage.getItem('tl_sesion') || 'null'); },
  token() { return localStorage.getItem('tl_token') || ''; },
  set(usuario) {
    const sesion = {
      id: usuario.id,
      nombre: `${usuario.nombre} ${usuario.apellidos || ''}`.trim(),
      email: usuario.email,
      rol: usuario.rol
    };
    localStorage.setItem('tl_sesion', JSON.stringify(sesion));
    return sesion;
  },
  async login(email, password) {
    const res = await fetch('/api/usuarios/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.error || 'Credenciales inválidas');
    }
    if (data.token) localStorage.setItem('tl_token', data.token);
    return this.set(data.usuario);
  },
  async registro(payload) {
    const res = await fetch('/api/usuarios/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.error || 'Error en el registro');
    }
    if (data.token) localStorage.setItem('tl_token', data.token);
    return this.set(data.usuario);
  },
  logout() {
    localStorage.removeItem('tl_sesion');
    localStorage.removeItem('tl_token');
    location.href = 'index.html';
  }
};

/* ------------------------------------------------------------
   UTILIDADES DE INTERFAZ
   ------------------------------------------------------------ */
const UI = {
  // Lee un parámetro de la URL (ej. empleo.html?id=3)
  param(nombre) { return new URLSearchParams(location.search).get(nombre); },

  empresa(id) { return Store.find('empresas', id) || { nombre: 'Empresa', color: '#868e96' }; },

  iniciales(texto = '') { return texto.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase(); },

  // Logo de empresa generado con sus iniciales y color corporativo
  logo(empresa, tam = '') {
    return `<div class="tl-company-logo ${tam}" style="background:${empresa.color}">${this.iniciales(empresa.nombre)}</div>`;
  },

  avatar(nombre, px = 40) {
    return `<div class="tl-avatar" style="width:${px}px;height:${px}px;font-size:${px * 0.38}px">${this.iniciales(nombre)}</div>`;
  },

  salario(e) { return `$${e.salarioMin.toLocaleString()} - $${e.salarioMax.toLocaleString()}`; },

  // Convierte una fecha ISO en "Hace 3 días"
  haceTiempo(iso) {
    const dias = Math.floor((Date.now() - new Date(iso)) / 86400000);
    if (dias <= 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    if (dias < 30) return `Hace ${dias} días`;
    return new Date(iso).toLocaleDateString('es');
  },

  fecha(iso) { return new Date(iso).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' }); },

  // Dibuja estrellas (llenas, media y vacías) para una puntuación 0-5
  estrellas(n) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
      if (n >= i) html += '<i class="bi bi-star-fill"></i>';
      else if (n >= i - 0.5) html += '<i class="bi bi-star-half"></i>';
      else html += '<i class="bi bi-star"></i>';
    }
    return `<span class="tl-stars">${html}</span>`;
  },

  // Promedio de valoraciones de una empresa
  promedio(empresaId) {
    const r = Store.get('resenas').filter((x) => x.empresaId === Number(empresaId));
    return { valor: r.length ? r.reduce((a, b) => a + b.puntuacion, 0) / r.length : 0, total: r.length };
  },

  // Color del chip según la modalidad del empleo
  chipModalidad(m) { return m === 'Remoto' ? 'green' : m === 'Híbrido' ? 'purple' : 'gray'; },

  // Tarjeta reutilizable de empleo (inicio, resultados, similares)
  jobCard(e) {
    const emp = this.empresa(e.empresaId);
    const sesion = Sesion.get();
    let guardado = false;
    if (sesion) {
      const mapa = JSON.parse(localStorage.getItem('tl_guardados_db') || '{}');
      guardado = (mapa[sesion.id] || []).includes(e.id);
    } else {
      const g = JSON.parse(localStorage.getItem('tl_guardados') || '[]');
      guardado = g.includes(e.id);
    }
    return `
      <article class="tl-card tl-card-hover tl-job-card fade-in" onclick="location.href='empleo.html?id=${e.id}'">
        ${this.logo(emp)}
        <div class="flex-grow-1 pe-4">
          <h5>${e.titulo}</h5>
          <div class="fw-medium mb-2" style="font-size:.92rem">${emp.nombre} ${emp.verificada ? '<i class="bi bi-patch-check-fill text-primary" title="Empresa verificada"></i>' : ''}</div>
          <div class="tl-job-meta mb-2">
            <span><i class="bi bi-geo-alt"></i>${e.ubicacion}</span>
            <span><i class="bi bi-briefcase"></i>${e.tipo}</span>
            <span><i class="bi bi-cash-stack"></i>${this.salario(e)}</span>
            <span><i class="bi bi-clock"></i>${this.haceTiempo(e.fecha)}</span>
          </div>
          <span class="tl-chip ${this.chipModalidad(e.modalidad)}">${e.modalidad}</span>
          <span class="tl-chip">${e.nivel}</span>
          <span class="tl-chip orange">${e.contrato}</span>
        </div>
        <button class="tl-save-btn ${guardado ? 'saved' : ''}" title="Guardar empleo" onclick="event.stopPropagation(); UI.toggleGuardar(${e.id}, this)">
          <i class="bi ${guardado ? 'bi-bookmark-fill' : 'bi-bookmark'}"></i>
        </button>
      </article>`;
  },

  // Guardar / quitar un empleo de "guardados"
  // Con sesión: persiste en BD (empleos_guardados). Sin sesión: solo localStorage.
  toggleGuardar(id, btn) {
    const sesion = Sesion.get();

    if (sesion) {
      // Optimista: actualizar mapa local inmediatamente
      const mapaStr = localStorage.getItem('tl_guardados_db') || '{}';
      const mapa = JSON.parse(mapaStr);
      const uid = sesion.id;
      const lista = mapa[uid] || [];
      const ya = lista.includes(id);
      mapa[uid] = ya ? lista.filter((x) => x !== id) : [...lista, id];
      localStorage.setItem('tl_guardados_db', JSON.stringify(mapa));

      btn.classList.toggle('saved', !ya);
      btn.innerHTML = `<i class="bi ${!ya ? 'bi-bookmark-fill' : 'bi-bookmark'}"></i>`;
      this.toast(!ya ? 'Empleo guardado' : 'Empleo eliminado de guardados', 'info');

      // Persistir en BD
      fetch('/api/guardados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: uid, empleoId: id })
      }).catch((err) => console.warn('Error sincronizando empleo guardado:', err.message));
    } else {
      // Sin sesión: solo localStorage (compatibilidad)
      let g = JSON.parse(localStorage.getItem('tl_guardados') || '[]');
      const ya = g.includes(id);
      g = ya ? g.filter((x) => x !== id) : [...g, id];
      localStorage.setItem('tl_guardados', JSON.stringify(g));
      btn.classList.toggle('saved', !ya);
      btn.innerHTML = `<i class="bi ${!ya ? 'bi-bookmark-fill' : 'bi-bookmark'}"></i>`;
      this.toast(!ya ? 'Empleo guardado' : 'Empleo eliminado de guardados', 'info');
    }
  },

  // Notificación flotante (Bootstrap Toast)
  toast(mensaje, tipo = 'success') {
    let cont = document.getElementById('tl-toasts');
    if (!cont) {
      cont = document.createElement('div');
      cont.id = 'tl-toasts';
      cont.className = 'toast-container position-fixed top-0 end-0 p-3';
      cont.style.zIndex = 3000;
      document.body.appendChild(cont);
    }
    const iconos = { success: 'bi-check-circle-fill text-success', info: 'bi-info-circle-fill text-primary', danger: 'bi-x-circle-fill text-danger', warning: 'bi-exclamation-triangle-fill text-warning' };
    const el = document.createElement('div');
    el.className = 'toast align-items-center border-0 shadow';
    el.innerHTML = `<div class="d-flex"><div class="toast-body d-flex align-items-center gap-2"><i class="bi ${iconos[tipo]} fs-5"></i>${mensaje}</div>
      <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
    cont.appendChild(el);
    new bootstrap.Toast(el, { delay: 2800 }).show();
    el.addEventListener('hidden.bs.toast', () => el.remove());
  },

  // Formulario de estrellas para valorar (name único por formulario)
  starInput(name) {
    return `<div class="tl-star-input">${[5, 4, 3, 2, 1].map((n) =>
      `<input type="radio" name="${name}" id="${name}-${n}" value="${n}" ${n === 5 ? 'required' : ''}><label for="${name}-${n}" title="${n} estrellas"><i class="bi bi-star-fill"></i></label>`).join('')}</div>`;
  }
};

/* ------------------------------------------------------------
   ENCABEZADO + NAVEGACIÓN
   ------------------------------------------------------------ */
function renderHeader() {
  const s = Sesion.get();
  const pagina = document.body.dataset.page;

  // Zona derecha: botones directos a login.html o menú del usuario autenticado
  const zonaUsuario = s
    ? `<div class="dropdown">
         <button class="btn btn-light d-flex align-items-center gap-2 border" data-bs-toggle="dropdown" id="btn-menu-usuario">
           ${UI.avatar(s.nombre, 30)}<span class="d-none d-md-inline fw-medium">${s.nombre}</span><i class="bi bi-chevron-down small"></i>
         </button>
         <ul class="dropdown-menu dropdown-menu-end shadow border-0">
           <li><span class="dropdown-item-text small text-muted">Rol: <b class="text-capitalize">${s.rol}</b></span></li>
           <li><a class="dropdown-item" href="perfil.html"><i class="bi bi-person me-2"></i>Mi perfil</a></li>
           ${s.rol !== 'candidato' ? '<li><a class="dropdown-item" href="empresa.html"><i class="bi bi-building me-2"></i>Módulo empresarial</a></li>' : ''}
           ${s.rol === 'admin' ? '<li><a class="dropdown-item" href="admin.html"><i class="bi bi-shield-lock me-2"></i>Panel admin</a></li>' : ''}
           <li><hr class="dropdown-divider"></li>
           <li><a class="dropdown-item text-danger" href="#" id="btn-logout"><i class="bi bi-box-arrow-right me-2"></i>Cerrar sesión</a></li>
         </ul>
       </div>`
    : `<div class="d-flex align-items-center gap-2">
         <a href="login.html" class="btn btn-outline-primary btn-sm px-3 fw-semibold" id="btn-login-nav">Entrar</a>
         <a href="login.html?mode=register" class="btn btn-primary btn-sm px-3 fw-semibold" id="btn-registro-nav">Registrarse</a>
       </div>`;

  const secciones = [
    ['inicio',       'index.html',       'bi-house',              'Inicio'],
    ['empleos',      'empleos.html',     'bi-search',             'Buscar empleos'],
    // 'empresa' solo visible para rol empresa o admin
    ...(s && (s.rol === 'empresa' || s.rol === 'admin')
      ? [['empresa', 'empresa.html', 'bi-megaphone', 'Publicar empleos']]
      : []),
    ['recursos',     'recursos.html',    'bi-journal-bookmark',   'Recursos'],
    ['valoraciones', 'valoraciones.html','bi-star',               'Valoraciones de empresas'],
    ['foros',        'foros.html',       'bi-chat-square-text',   'Foros'],
    // 'perfil' solo si hay sesión
    ...(s ? [['perfil', 'perfil.html', 'bi-person-circle', 'Mi perfil']] : []),
    // 'admin' solo para administrador
    ...(s && s.rol === 'admin'
      ? [['admin', 'admin.html', 'bi-shield-lock', 'Admin']]
      : [])
  ];

  document.getElementById('tl-header').innerHTML = `
    <header class="tl-header" data-nota="Encabezado|Logo de ChambeaSV y accesos a iniciar sesión o registrarse.">
      <div class="container d-flex align-items-center justify-content-between py-2 gap-3">
        <a href="index.html" class="navbar-brand tl-logo d-flex align-items-center gap-2 text-decoration-none" id="logo" aria-label="ChambeaSV, inicio">
          <img src="assets/chambeasv-logo.svg" alt="ChambeaSV" height="36" style="max-width:160px;object-fit:contain;">
        </a>
        <div class="d-flex align-items-center gap-2">${zonaUsuario}</div>
      </div>
      <nav class="tl-nav" data-nota="Barra de navegación|Acceso a búsqueda de trabajo, publicar empleos, recursos, valoraciones, foros, mi perfil y administración.">
        <div class="container">
          <ul class="nav">
            ${secciones.map(([id, href, icono, txt]) =>
              `<li class="nav-item"><a class="nav-link ${pagina === id ? 'active' : ''}" href="${href}" id="nav-${id}"><i class="bi ${icono}"></i>${txt}</a></li>`).join('')}
          </ul>
        </div>
      </nav>
    </header>`;

  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) btnLogout.addEventListener('click', (ev) => { ev.preventDefault(); Sesion.logout(); });
}

/* ------------------------------------------------------------
   PIE DE PÁGINA
   ------------------------------------------------------------ */
function renderFooter() {
  const f = document.getElementById('tl-footer');
  if (!f) return;
  f.innerHTML = `
    <footer class="tl-footer">
      <div class="container">
        <div class="row g-4">
          <div class="col-lg-4">
            <a href="index.html" class="tl-logo d-flex align-items-center gap-2 text-decoration-none mb-3">
              <svg class="chambea-logo-icon" width="34" height="34" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M 84 30 A 39 39 0 1 0 84 70 L 68.5 59.5 A 21.5 21.5 0 1 1 68.5 40.5 Z" fill="#0056FF"/>
                <path d="M 39.5 44 C 38 53.5 43.5 62 53.5 62.5 C 61 63 66 57.5 67 51" fill="none" stroke="#00D68F" stroke-width="7.2" stroke-linecap="round"/>
                <circle cx="53.5" cy="44.5" r="9.5" fill="#00D68F"/>
                <rect x="50" y="42" width="2.4" height="3.8" rx="1.2" fill="#0B213F"/>
                <rect x="54.6" y="42" width="2.4" height="3.8" rx="1.2" fill="#0B213F"/>
              </svg>
              <span class="fw-bold" style="color:#0B213F; font-size:1.3rem; letter-spacing:-0.03em;">Chambea<span style="color:#0056FF;">SV</span></span>
            </a>
            <p class="small">Conectamos talento salvadoreño con oportunidades. Un espacio para encontrar empleo y descubrir perfiles profesionales.</p>
            <div class="d-flex gap-3 fs-5"><i class="bi bi-facebook"></i><i class="bi bi-linkedin"></i><i class="bi bi-instagram"></i><i class="bi bi-twitter-x"></i></div>
          </div>
          <div class="col-6 col-lg-2"><h6>Candidatos</h6><a href="empleos.html">Buscar empleos</a><a href="perfil.html">Mi perfil</a><a href="perfil.html#alertas">Alertas</a><a href="recursos.html">Recursos</a></div>
          <div class="col-6 col-lg-2"><h6>Empresas</h6><a href="empresa.html">Publicar empleo</a><a href="empresa.html">Ver postulaciones</a><a href="valoraciones.html">Valoraciones</a></div>
          <div class="col-6 col-lg-2"><h6>Comunidad</h6><a href="foros.html">Foros</a><a href="recursos.html#noticias">Noticias</a><a href="recursos.html">Consejos de carrera</a></div>
          <div class="col-6 col-lg-2"><h6>Portal</h6><a href="#">Acerca de</a><a href="#">Privacidad</a><a href="#">Términos</a><a href="admin.html">Administración</a></div>
        </div>
        <hr class="border-secondary my-4">
        <div class="d-flex flex-wrap justify-content-between small gap-2">
          <span>© 2026 ChambeaSV · Portal de empleo de El Salvador</span>
          <a href="#" onclick="Store.reset(); return false;" class="m-0"><i class="bi bi-arrow-counterclockwise"></i> Restablecer datos de demostración</a>
        </div>
      </div>
    </footer>`;
}

/* ------------------------------------------------------------
   MODO ANOTACIONES
   Recorre todos los elementos con data-nota="Título|Descripción"
   y les agrega un recuadro numerado explicando su función.
   ------------------------------------------------------------ */
const Notas = {
  pintar() {
    document.querySelectorAll('.tl-nota').forEach((n) => n.remove());
    document.querySelectorAll('[data-nota]').forEach((el, i) => {
      // Solo se anotan elementos visibles
      if (!el.offsetParent && el.tagName !== 'HEADER') return;
      const [titulo, texto] = el.dataset.nota.split('|');
      const nota = document.createElement('div');
      nota.className = 'tl-nota';
      nota.innerHTML = `<span class="num">${i + 1}</span><b>${titulo}</b>${texto || ''}`;
      el.appendChild(nota);
    });
  },
  toggle() {
    const activo = document.body.classList.toggle('modo-notas');
    localStorage.setItem('tl_notas', activo ? '1' : '0');
    if (activo) this.pintar();
    document.getElementById('btn-notas').innerHTML = activo
      ? '<i class="bi bi-eye-slash"></i> Ocultar anotaciones'
      : '<i class="bi bi-chat-square-dots"></i> Mostrar anotaciones';
  },
  init() {
    const btn = document.createElement('button');
    btn.id = 'btn-notas';
    btn.className = 'tl-notas-btn';
    btn.innerHTML = '<i class="bi bi-chat-square-dots"></i> Mostrar anotaciones';
    btn.onclick = () => this.toggle();
    document.body.appendChild(btn);
    // Recordar la preferencia entre páginas
    if (localStorage.getItem('tl_notas') === '1') setTimeout(() => this.toggle(), 300);
  }
};

/* ------------------------------------------------------------
   CARGA DEL AGENTE FLOTANTE CHAMBITA AI
   ------------------------------------------------------------ */
function asegurarRecursosChatbot() {
  if (!document.querySelector('link[href*="chatbot.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/chatbot.css';
    document.head.appendChild(link);
  }
  if (!document.querySelector('script[src*="chatbot.js"]')) {
    const script = document.createElement('script');
    script.src = 'js/chatbot.js';
    script.onload = () => {
      if (window.ChambitaChatbot) {
        window.ChambitaChatbot.init();
      }
    };
    document.body.appendChild(script);
  } else if (window.ChambitaChatbot) {
    window.ChambitaChatbot.init();
  }
}

/* ------------------------------------------------------------
   INICIALIZACIÓN COMÚN
   ------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('tl-header')) { renderHeader(); }
  renderFooter();
  Notas.init();
  asegurarRecursosChatbot();
});
