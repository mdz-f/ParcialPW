/**
 * PERFIL DE USUARIO (tablero personal)
 * - Gestión de perfil: edita los datos del usuario y "carga" el CV
 * - Estadísticas: visitas y solicitudes con mini-gráficas (Chart.js)
 * - Panel de alertas: activar/desactivar, crear y eliminar alertas
 * - Valoraciones: calificar empresas donde ha trabajado
 * - Mis solicitudes y empleos guardados
 * Para la demo, si no hay sesión se muestra el usuario id 1 (María López).
 */
document.addEventListener('DOMContentLoaded', () => {
  const sesion = Sesion.get();
  const usuarios = Store.get('usuarios');
  const usuario = usuarios.find((u) => u.email === sesion?.email) || usuarios[0];
  const uid = usuario.id;

  // ---------- Encabezado lateral ----------
  function pintarCabecera() {
    const u = Store.find('usuarios', uid);
    document.getElementById('perfil-avatar').innerHTML = UI.avatar(`${u.nombre} ${u.apellidos}`, 88);
    document.getElementById('perfil-nombre').textContent = `${u.nombre} ${u.apellidos}`;
    document.getElementById('perfil-titular').textContent = u.titular || 'Agrega tu titular profesional';
    // Porcentaje de perfil completado según campos llenos
    const campos = [u.nombre, u.apellidos, u.email, u.telefono, u.titular, u.ubicacion, u.habilidades?.length, u.cv];
    const pct = Math.round((campos.filter(Boolean).length / campos.length) * 100);
    document.getElementById('perfil-progreso').style.width = `${pct}%`;
    document.getElementById('perfil-progreso-txt').textContent = `${pct}%`;
  }

  // ---------- Gestión de perfil ----------
  const campos = ['nombre', 'apellidos', 'email', 'telefono', 'titular', 'ubicacion'];
  campos.forEach((c) => (document.getElementById(`p-${c}`).value = usuario[c] || ''));
  document.getElementById('p-habilidades').value = (usuario.habilidades || []).join(', ');
  if (usuario.cv) document.getElementById('cv-nombre').innerHTML = `<i class="bi bi-file-earmark-check text-success"></i> ${usuario.cv}`;

  document.getElementById('form-perfil').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const cambios = {};
    campos.forEach((c) => (cambios[c] = document.getElementById(`p-${c}`).value));
    cambios.habilidades = document.getElementById('p-habilidades').value.split(',').map((x) => x.trim()).filter(Boolean);
    Store.update('usuarios', uid, cambios); // UPDATE usuarios SET ... WHERE id = uid
    UI.toast('Perfil actualizado correctamente');
    pintarCabecera();
  });

  // Carga de CV (se guarda solo el nombre del archivo en el prototipo)
  const inputCV = document.getElementById('p-cv');
  const zona = document.getElementById('dropzone-cv');
  const guardarCV = (archivo) => {
    if (!archivo) return;
    if (!/\.(pdf|docx?)$/i.test(archivo.name)) return UI.toast('Solo se permiten archivos PDF o DOCX', 'warning');
    Store.update('usuarios', uid, { cv: archivo.name });
    document.getElementById('cv-nombre').innerHTML = `<i class="bi bi-file-earmark-check text-success"></i> ${archivo.name}`;
    UI.toast('Currículum cargado');
    pintarCabecera();
  };
  inputCV.addEventListener('change', () => guardarCV(inputCV.files[0]));
  ['dragover', 'dragenter'].forEach((e) => zona.addEventListener(e, (ev) => { ev.preventDefault(); zona.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach((e) => zona.addEventListener(e, () => zona.classList.remove('drag')));
  zona.addEventListener('drop', (ev) => { ev.preventDefault(); guardarCV(ev.dataTransfer.files[0]); });

  // ---------- Estadísticas ----------
  const misPost = Store.get('postulaciones').filter((p) => p.usuarioId === uid);
  const mapaGuardados = JSON.parse(localStorage.getItem('tl_guardados_db') || '{}');
  const guardadosIds = mapaGuardados[uid] || [];
  document.getElementById('stat-solicitudes').textContent = misPost.length;
  document.getElementById('stat-entrevistas').textContent = misPost.filter((p) => p.estado === 'Entrevista').length;
  document.getElementById('stat-guardados').textContent = guardadosIds.length;

  if (window.Chart) {
    const base = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: true } }, scales: { x: { display: false }, y: { display: false } } };
    const dias = ['L', 'M', 'X', 'J', 'V', 'S', 'D', 'L', 'M', 'X', 'J', 'V'];
    new Chart(document.getElementById('grafica-visitas'), {
      type: 'line',
      data: { labels: dias, datasets: [{ data: [60, 75, 70, 95, 88, 110, 105, 130, 120, 150, 140, 170], borderColor: '#0a66c2', backgroundColor: 'rgba(10,102,194,.1)', fill: true, tension: .4, pointRadius: 0, borderWidth: 2 }] },
      options: base
    });
    new Chart(document.getElementById('grafica-solicitudes'), {
      type: 'bar',
      data: { labels: dias, datasets: [{ data: [1, 0, 2, 1, 3, 0, 1, 2, 4, 2, 3, misPost.length], backgroundColor: '#12b886', borderRadius: 3 }] },
      options: base
    });
  }

  // ---------- Panel de alertas ----------
  function pintarAlertas() {
    const alertas = Store.get('alertas').filter((a) => a.usuarioId === uid);
    document.getElementById('lista-alertas').innerHTML = alertas.length ? alertas.map((a) => `
      <div class="d-flex align-items-center gap-3 py-2 border-bottom">
        <i class="bi bi-bell${a.activa ? '-fill text-primary' : ' text-muted'} fs-5"></i>
        <div class="flex-grow-1"><div class="fw-semibold small">${a.termino} <span class="text-muted fw-normal">(${a.ubicacion})</span></div>
          <small class="text-muted">${a.frecuencia} · por ${a.canal}</small></div>
        <div class="form-check form-switch m-0"><input class="form-check-input" type="checkbox" role="switch" ${a.activa ? 'checked' : ''} onchange="toggleAlerta(${a.id}, this.checked)" title="Activar / desactivar"></div>
        <button class="btn btn-sm btn-light text-danger" onclick="eliminarAlerta(${a.id})" title="Eliminar"><i class="bi bi-trash"></i></button>
      </div>`).join('') : '<p class="text-muted small mb-0">No tienes alertas configuradas.</p>';
  }
  window.toggleAlerta = (id, activa) => { Store.update('alertas', id, { activa }); UI.toast(activa ? 'Alerta activada' : 'Alerta desactivada', 'info'); pintarAlertas(); };
  window.eliminarAlerta = (id) => { Store.remove('alertas', id); pintarAlertas(); };
  document.getElementById('form-alerta').addEventListener('submit', (ev) => {
    ev.preventDefault();
    Store.add('alertas', {
      usuarioId: uid, termino: document.getElementById('al-termino').value, ubicacion: document.getElementById('al-ubicacion').value || 'Cualquiera',
      frecuencia: document.getElementById('al-frecuencia').value, canal: document.getElementById('al-canal').value, activa: true
    });
    ev.target.reset();
    UI.toast('Alerta creada. Te avisaremos cuando haya vacantes nuevas.');
    pintarAlertas();
  });

  // ---------- Valoraciones ----------
  document.getElementById('val-empresa').innerHTML = '<option value="">Selecciona la empresa donde trabajaste</option>' +
    Store.get('empresas').map((e) => `<option value="${e.id}">${e.nombre}</option>`).join('');
  document.getElementById('val-estrellas').innerHTML = UI.starInput('val-puntuacion');
  document.getElementById('form-valoracion').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const p = document.querySelector('input[name="val-puntuacion"]:checked');
    if (!p) return UI.toast('Selecciona una calificación', 'warning');
    Store.add('resenas', {
      empresaId: Number(document.getElementById('val-empresa').value), puntuacion: Number(p.value),
      titulo: document.getElementById('val-titulo').value, comentario: document.getElementById('val-comentario').value,
      autor: `${usuario.nombre} ${usuario.apellidos}`, usuarioId: uid, fecha: new Date().toISOString(), reportada: false
    });
    ev.target.reset();
    UI.toast('¡Gracias! Tu valoración fue publicada.');
  });

  // ---------- Mis solicitudes ----------
  const empleos = Store.get('empleos');
  document.getElementById('tabla-solicitudes').innerHTML = misPost.length ? misPost.map((p) => {
    const e = empleos.find((x) => x.id === p.empleoId);
    if (!e) return '';
    return `<tr><td class="fw-semibold">${e.titulo}</td><td>${UI.empresa(e.empresaId).nombre}</td><td class="small">${UI.fecha(p.fecha)}</td>
      <td><span class="estado estado-${p.estado.replace(' ', '-')}">${p.estado}</span></td>
      <td class="text-end"><a href="empleo.html?id=${e.id}" class="btn btn-sm btn-light">Ver oferta</a></td></tr>`;
  }).join('') : '<tr><td colspan="5" class="text-center text-muted py-4">Aún no has aplicado a ninguna oferta. <a href="empleos.html">Buscar empleos</a></td></tr>';

  // ---------- Empleos guardados ----------
  const mapaGuardados2 = JSON.parse(localStorage.getItem('tl_guardados_db') || '{}');
  const guardadosIds2 = mapaGuardados2[uid] || JSON.parse(localStorage.getItem('tl_guardados') || '[]');
  const listaG = empleos.filter((e) => guardadosIds2.includes(e.id));
  document.getElementById('lista-guardados').innerHTML = listaG.length
    ? listaG.map((e) => `<div class="col-md-6">${UI.jobCard(e)}</div>`).join('')
    : '<div class="col-12 text-muted small">No has guardado empleos. Usa el ícono <i class="bi bi-bookmark"></i> en cualquier vacante.</div>';

  // Resaltar opción del menú lateral según la sección visible
  const links = document.querySelectorAll('.tl-side-menu a');
  links.forEach((a) => a.addEventListener('click', () => { links.forEach((l) => l.classList.remove('active')); a.classList.add('active'); }));

  pintarCabecera();
  pintarAlertas();
});
