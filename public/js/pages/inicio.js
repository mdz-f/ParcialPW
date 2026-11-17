/**
 * Página de INICIO
 * - Calcula y anima las métricas del portal
 * - Muestra sectores, empleos recientes, empresas top y noticias
 */
document.addEventListener('DOMContentLoaded', async () => {
  await Store.ready;
  const empleos = Store.get('empleos').filter((e) => e.estado === 'Activa');
  const empresas = Store.get('empresas');

  // ---------- Métricas (base histórica + datos actuales) ----------
  const metricas = [
    { icono: 'bi-building', color: 'bg-soft-blue', valor: 850 + empresas.length, label: 'Empresas registradas' },
    { icono: 'bi-people', color: 'bg-soft-green', valor: 24500 + Store.get('usuarios').length, label: 'Usuarios activos' },
    { icono: 'bi-briefcase', color: 'bg-soft-orange', valor: 3200 + empleos.length, label: 'Empleos publicados' },
    { icono: 'bi-send-check', color: 'bg-soft-purple', valor: 15800 + Store.get('postulaciones').length, label: 'Solicitudes recibidas' }
  ];
  document.getElementById('metricas').innerHTML = metricas.map((m) => `
    <div class="col-6 col-lg-3">
      <div class="tl-card tl-metric tl-card-hover">
        <div class="tl-metric-icon ${m.color}"><i class="bi ${m.icono}"></i></div>
        <div><div class="tl-metric-value" data-contar="${m.valor}">0</div><div class="tl-metric-label">${m.label}</div></div>
      </div>
    </div>`).join('');

  // Animación de conteo de 0 al valor final
  document.querySelectorAll('[data-contar]').forEach((el) => {
    const fin = Number(el.dataset.contar);
    let actual = 0;
    const paso = Math.ceil(fin / 60);
    const timer = setInterval(() => {
      actual = Math.min(actual + paso, fin);
      el.textContent = actual.toLocaleString();
      if (actual === fin) clearInterval(timer);
    }, 20);
  });

  // ---------- Ubicaciones para autocompletar ----------
  const ubicaciones = [...new Set(empleos.map((e) => e.ubicacion))];
  document.getElementById('lista-ubicaciones').innerHTML = ubicaciones.map((u) => `<option value="${u}">`).join('');

  // ---------- Sectores ----------
  const iconos = { Tecnología: 'bi-laptop', Finanzas: 'bi-bank', Salud: 'bi-heart-pulse', Educación: 'bi-mortarboard', Logística: 'bi-truck', Marketing: 'bi-megaphone', Energía: 'bi-lightning-charge', Construcción: 'bi-bricks' };
  document.getElementById('sectores').innerHTML = Object.keys(iconos).map((s) => {
    const n = empleos.filter((e) => e.sector === s).length;
    return `<div class="col-6 col-md-3">
      <a href="empleos.html?sector=${encodeURIComponent(s)}" class="tl-card tl-card-hover tl-sector d-block text-reset">
        <i class="bi ${iconos[s]}"></i><h6>${s}</h6><small class="text-muted">${n} vacante${n !== 1 ? 's' : ''}</small>
      </a></div>`;
  }).join('');

  // ---------- Empleos recientes (los 5 más nuevos) ----------
  const recientes = [...empleos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5);
  document.getElementById('empleos-recientes').innerHTML = recientes.map((e) => UI.jobCard(e)).join('');

  // ---------- Top empresas por valoración ----------
  const top = empresas.map((e) => ({ ...e, ...UI.promedio(e.id) })).sort((a, b) => b.valor - a.valor).slice(0, 5);
  document.getElementById('top-empresas').innerHTML = top.map((e) => `
    <a href="valoraciones.html?empresa=${e.id}" class="d-flex align-items-center gap-3 py-2 text-reset border-bottom">
      ${UI.logo(e, 'sm')}
      <div class="flex-grow-1"><div class="fw-semibold small">${e.nombre}</div><small class="text-muted">${e.sector}</small></div>
      <div class="text-end small"><b>${e.valor.toFixed(1)}</b> <i class="bi bi-star-fill text-warning"></i></div>
    </a>`).join('');

  // ---------- Noticias ----------
  document.getElementById('noticias').innerHTML = Store.get('noticias').map((n) => `
    <div class="col-md-6 col-lg-3">
      <a href="recursos.html#noticias" class="tl-card tl-card-hover p-3 d-block h-100 text-reset">
        <span class="tl-chip gray mb-2">${n.fuente}</span>
        <h6 class="mt-2">${n.titulo}</h6>
        <p class="small text-muted mb-2">${n.resumen}</p>
        <small class="text-muted"><i class="bi bi-calendar3"></i> ${UI.haceTiempo(n.fecha)}</small>
      </a>
    </div>`).join('');
});
