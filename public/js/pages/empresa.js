/**
 * MÓDULO EMPRESARIAL
 * Secciones (se muestran/ocultan con mostrarSeccion):
 *  - Resumen: KPIs y postulaciones recientes
 *  - Mis empresas: mantenimiento (CRUD) de empresas
 *  - Publicar empleo: formulario que inserta en "empleos"
 *  - Mis ofertas: lista de vacantes de mis empresas
 *  - Postulaciones: candidatos por oferta y cambio de estado
 *
 * Para la demo, el empleador administra "Nexo Digital" (id 1)
 * y cualquier empresa que cree desde este módulo (propia: true).
 */
const ESTADOS = ['Recibida', 'En revisión', 'Entrevista', 'Contratado', 'Rechazada'];

// Empresas que administra el usuario actual
const misEmpresas = () => {
  const s = Sesion.get();
  const uid = s ? s.id : null;
  return Store.get('empresas').filter((e) => {
    if (uid) return e.usuarioId === uid || (e.propia && e.usuarioId === null && uid === 5);
    // Modo demo sin sesión: mostrar Nexo Digital y empresas propias
    return e.id === 1 || e.propia;
  });
};
const misOfertas = () => { const ids = misEmpresas().map((e) => e.id); return Store.get('empleos').filter((e) => ids.includes(e.empresaId)); };
const postulacionesDe = (empleoId) => Store.get('postulaciones').filter((p) => p.empleoId === empleoId);

// ---------- Navegación entre secciones ----------
function mostrarSeccion(id) {
  document.querySelectorAll('.tl-admin-section').forEach((s) => s.classList.toggle('active', s.id === `sec-${id}`));
  document.querySelectorAll('#menu-empresa .list-group-item').forEach((a) => a.classList.toggle('active', a.dataset.seccion === id));
  if (document.body.classList.contains('modo-notas')) Notas.pintar();
}

// ---------- Resumen ----------
function pintarResumen() {
  const ofertas = misOfertas();
  const posts = Store.get('postulaciones').filter((p) => ofertas.some((o) => o.id === p.empleoId));
  const kpis = [
    ['bi-briefcase', 'bg-soft-blue', ofertas.filter((o) => o.estado === 'Activa').length, 'Ofertas activas'],
    ['bi-people', 'bg-soft-green', posts.length, 'Postulaciones'],
    ['bi-calendar-check', 'bg-soft-purple', posts.filter((p) => p.estado === 'Entrevista').length, 'Entrevistas'],
    ['bi-eye', 'bg-soft-orange', 1840 + ofertas.length * 37, 'Visitas a vacantes']
  ];
  document.getElementById('kpis-empresa').innerHTML = kpis.map(([i, c, v, l]) => `
    <div class="col-6 col-md-3"><div class="tl-card tl-metric"><div class="tl-metric-icon ${c}"><i class="bi ${i}"></i></div><div><div class="tl-metric-value">${v.toLocaleString()}</div><div class="tl-metric-label">${l}</div></div></div></div>`).join('');

  const usuarios = Store.get('usuarios');
  document.getElementById('recientes-empresa').innerHTML = posts.slice(0, 5).map((p) => {
    const u = usuarios.find((x) => x.id === p.usuarioId) || usuarios[0];
    const o = ofertas.find((x) => x.id === p.empleoId);
    return `<div class="d-flex align-items-center gap-3 py-2 border-bottom">
      ${UI.avatar(u.nombre + ' ' + u.apellidos, 38)}
      <div class="flex-grow-1"><b class="small">${u.nombre} ${u.apellidos}</b><div class="small text-muted">${o.titulo}</div></div>
      <span class="estado estado-${p.estado.replace(' ', '-')}">${p.estado}</span>
    </div>`;
  }).join('') || '<p class="text-muted mb-0">Aún no hay postulaciones.</p>';
}

// ---------- Mantenimiento de empresas ----------
function pintarEmpresas() {
  document.getElementById('tabla-empresas').innerHTML = misEmpresas().map((e) => `
    <tr>
      <td><div class="d-flex align-items-center gap-2">${UI.logo(e, 'sm')}<b>${e.nombre}</b></div></td>
      <td>${e.sector}</td><td>${e.ubicacion}</td><td class="small">${e.email}</td>
      <td class="text-end text-nowrap">
        <button class="btn btn-sm btn-light" onclick="abrirEmpresa(${e.id})" title="Editar"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-light text-danger" onclick="eliminarEmpresa(${e.id})" title="Eliminar"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`).join('');
  // Llenar el select del formulario de publicación
  document.getElementById('pub-empresa').innerHTML = misEmpresas().map((e) => `<option value="${e.id}">${e.nombre}</option>`).join('');
}

// Abre el modal vacío (crear) o con datos (editar)
function abrirEmpresa(id) {
  const e = id ? Store.find('empresas', id) : {};
  document.getElementById('titulo-modal-empresa').textContent = id ? 'Editar empresa' : 'Agregar empresa';
  ['id', 'nombre', 'sector', 'ubicacion', 'empleados', 'email', 'telefono', 'web', 'direccion', 'descripcion'].forEach((c) => {
    const el = document.getElementById(`emp-${c}`);
    el.value = e[c] ?? (el.tagName === 'SELECT' ? el.options[0].value : '');
  });
  document.getElementById('emp-color').value = e.color || '#0a66c2';
  bootstrap.Modal.getOrCreateInstance(document.getElementById('modal-empresa')).show();
}

async function eliminarEmpresa(id) {
  if (id === 1) return UI.toast('La empresa principal de la demo no se puede eliminar', 'warning');
  if (!confirm('¿Eliminar esta empresa?')) return;
  try {
    await Store.remove('empresas', id);
    UI.toast('Empresa eliminada', 'info');
    pintarEmpresas();
  } catch (err) { console.error('Error al eliminar empresa:', err.message); }
}

// ---------- Mis ofertas ----------
function pintarOfertas() {
  document.getElementById('tabla-ofertas').innerHTML = misOfertas().map((o) => `
    <tr>
      <td><a href="empleo.html?id=${o.id}" class="fw-semibold">${o.titulo}</a><div class="small text-muted">${UI.empresa(o.empresaId).nombre} · ${o.ubicacion}</div></td>
      <td class="small">${UI.haceTiempo(o.fecha)}</td>
      <td><a href="#" onclick="verPostulaciones(${o.id});return false;" class="tl-chip">${postulacionesDe(o.id).length} candidatos</a></td>
      <td><span class="tl-chip ${o.estado === 'Activa' ? 'green' : 'gray'}">${o.estado}</span></td>
      <td class="text-end text-nowrap">
        <button class="btn btn-sm btn-light" onclick="cambiarEstadoOferta(${o.id})" title="${o.estado === 'Activa' ? 'Pausar' : 'Activar'}"><i class="bi ${o.estado === 'Activa' ? 'bi-pause' : 'bi-play'}"></i></button>
        <button class="btn btn-sm btn-light text-danger" onclick="eliminarOferta(${o.id})" title="Eliminar"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`).join('');
}
async function cambiarEstadoOferta(id) {
  const o = Store.find('empleos', id);
  try {
    await Store.update('empleos', id, { estado: o.estado === 'Activa' ? 'Pausada' : 'Activa' });
    pintarOfertas(); pintarResumen();
  } catch (err) { console.error('Error al cambiar estado oferta:', err.message); }
}
async function eliminarOferta(id) {
  if (!confirm('¿Eliminar esta oferta?')) return;
  try {
    await Store.remove('empleos', id);
    pintarOfertas(); pintarResumen(); pintarSelectOfertas();
  } catch (err) { console.error('Error al eliminar oferta:', err.message); }
}

// ---------- Postulaciones y candidatos ----------
function pintarSelectOfertas() {
  document.getElementById('filtro-oferta').innerHTML = misOfertas().map((o) => `<option value="${o.id}">${o.titulo} (${postulacionesDe(o.id).length})</option>`).join('');
}
function verPostulaciones(empleoId) {
  mostrarSeccion('postulaciones');
  document.getElementById('filtro-oferta').value = empleoId;
  pintarCandidatos();
}
function pintarCandidatos() {
  const empleoId = Number(document.getElementById('filtro-oferta').value);
  const usuarios = Store.get('usuarios');
  const lista = postulacionesDe(empleoId);
  document.getElementById('lista-candidatos').innerHTML = lista.length ? lista.map((p) => {
    const u = usuarios.find((x) => x.id === p.usuarioId) || usuarios[0];
    return `<div class="d-flex flex-wrap align-items-center gap-3 p-3 border rounded-3 mb-2">
      ${UI.avatar(u.nombre + ' ' + u.apellidos, 46)}
      <div class="flex-grow-1"><b>${u.nombre} ${u.apellidos}</b><div class="small text-muted">${u.titular} · ${u.ubicacion}</div><small class="text-muted">Aplicó ${UI.haceTiempo(p.fecha).toLowerCase()}</small></div>
      <select class="form-select form-select-sm w-auto" onchange="cambiarEstadoPostulacion(${p.id}, this.value)">
        ${ESTADOS.map((s) => `<option ${s === p.estado ? 'selected' : ''}>${s}</option>`).join('')}
      </select>
      <button class="btn btn-sm btn-outline-primary" onclick="verCandidato(${u.id}, ${p.id})"><i class="bi bi-person-vcard"></i> Ver perfil</button>
    </div>`;
  }).join('') : '<div class="tl-empty"><i class="bi bi-inbox"></i>Esta oferta aún no tiene postulaciones.</div>';
}
async function cambiarEstadoPostulacion(id, estado) {
  try {
    await Store.update('postulaciones', id, { estado });
    UI.toast(`Estado actualizado a "${estado}". Se notificará al candidato.`);
    pintarResumen();
  } catch (err) { console.error('Error al cambiar estado postulación:', err.message); }
}
// Modal con la revisión del perfil del candidato
function verCandidato(usuarioId, postId) {
  const u = Store.find('usuarios', usuarioId);
  const p = Store.find('postulaciones', postId);
  document.getElementById('contenido-candidato').innerHTML = `
    <div class="modal-header border-0"><button type="button" class="btn-close ms-auto" data-bs-dismiss="modal"></button></div>
    <div class="modal-body text-center px-4 pt-0">
      <div class="d-flex justify-content-center mb-2">${UI.avatar(u.nombre + ' ' + u.apellidos, 80)}</div>
      <h3 class="h5 mb-0">${u.nombre} ${u.apellidos}</h3><p class="text-muted">${u.titular}</p>
      <div class="text-start">
        <p class="small mb-1"><i class="bi bi-envelope me-2"></i>${u.email}</p>
        <p class="small mb-1"><i class="bi bi-telephone me-2"></i>${u.telefono || '—'}</p>
        <p class="small"><i class="bi bi-geo-alt me-2"></i>${u.ubicacion}</p>
        <h4 class="h6 mt-3">Habilidades</h4><div>${u.habilidades.map((h) => `<span class="tl-chip me-1 mb-1">${h}</span>`).join('') || '—'}</div>
        <h4 class="h6 mt-3">Carta de presentación</h4><p class="small bg-light p-3 rounded-3">${p.carta || 'Sin carta de presentación.'}</p>
        <a href="${p.cvAdjunto || '#'}" class="btn btn-light w-100" ${p.cvAdjunto ? `target="_blank" download` : `onclick="UI.toast('El candidato no adjuntó CV','warning');return false;"`}><i class="bi bi-file-earmark-pdf text-danger"></i> ${p.cvAdjunto ? p.cvAdjunto.split('/').pop() : 'Sin CV adjunto'}</a>
      </div>
    </div>
    <div class="modal-footer border-0"><button class="btn btn-primary w-100" data-bs-dismiss="modal" onclick="cambiarEstadoPostulacion(${p.id}, 'Entrevista'); pintarCandidatos();"><i class="bi bi-calendar-plus me-1"></i>Invitar a entrevista</button></div>`;
  bootstrap.Modal.getOrCreateInstance(document.getElementById('modal-candidato')).show();
}

// ---------- Inicialización ----------
document.addEventListener('DOMContentLoaded', async () => {
  await Store.ready;
  // Aviso si no se ha iniciado sesión como empresa
  const s = Sesion.get();
  if (!s || s.rol === 'candidato') {
    document.getElementById('aviso-rol').innerHTML = `<div class="alert alert-info d-flex align-items-center gap-2"><i class="bi bi-info-circle fs-5"></i>
      <div>Estás viendo el módulo en <b>modo demostración</b>. En la versión final solo las cuentas de empresa podrán acceder (prueba con <b>empresa@nexodigital.com</b>).</div></div>`;
  }

  document.querySelectorAll('#menu-empresa .list-group-item').forEach((a) => a.addEventListener('click', () => mostrarSeccion(a.dataset.seccion)));
  document.getElementById('filtro-oferta').addEventListener('change', pintarCandidatos);

  // Guardar empresa (crear o editar)
  document.getElementById('form-empresa').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const datos = {};
    ['nombre', 'sector', 'ubicacion', 'empleados', 'email', 'telefono', 'web', 'direccion', 'descripcion', 'color'].forEach((c) => (datos[c] = document.getElementById(`emp-${c}`).value));
    const id = document.getElementById('emp-id').value;
    try {
      if (id) await Store.update('empresas', id, datos);
      else {
        const s = Sesion.get();
        await Store.add('empresas', { ...datos, verificada: false, propia: true, usuarioId: s ? s.id : null });
      }
      bootstrap.Modal.getInstance(document.getElementById('modal-empresa')).hide();
      UI.toast(id ? 'Empresa actualizada' : 'Empresa agregada');
      pintarEmpresas();
    } catch (err) { console.error('Error al guardar empresa:', err.message); }
  });

  // Publicar empleo
  const lineas = (id) => document.getElementById(id).value.split('\n').map((x) => x.trim()).filter(Boolean);
  document.getElementById('form-publicar').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const v = (id) => document.getElementById(id).value;
    if (Number(v('pub-salmin')) > Number(v('pub-salmax'))) return UI.toast('El salario mínimo no puede ser mayor al máximo', 'warning');
    try {
      const nuevo = await Store.add('empleos', {
        titulo: v('pub-titulo'), empresaId: Number(v('pub-empresa')), ubicacion: v('pub-ubicacion'), modalidad: v('pub-modalidad'),
        tipo: v('pub-tipo'), contrato: v('pub-contrato'), nivel: v('pub-nivel'), sector: v('pub-sector'),
        salarioMin: Number(v('pub-salmin')), salarioMax: Number(v('pub-salmax')), fecha: new Date().toISOString(), estado: 'Activa',
        descripcion: v('pub-descripcion'), responsabilidades: lineas('pub-responsabilidades'), requisitos: lineas('pub-requisitos'), beneficios: lineas('pub-beneficios'),
        contactoEmail: v('pub-email'), contactoTelefono: v('pub-telefono')
      });
      ev.target.reset();
      UI.toast(`¡Oferta "${nuevo.titulo}" publicada! Ya aparece en la búsqueda.`);
      pintarOfertas(); pintarResumen(); pintarSelectOfertas();
      mostrarSeccion('ofertas');
    } catch (err) { console.error('Error al publicar empleo:', err.message); }
  });

  pintarResumen(); pintarEmpresas(); pintarOfertas(); pintarSelectOfertas(); pintarCandidatos();
});
