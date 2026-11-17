/**
 * VALORACIONES DE EMPRESAS
 * - Lista de empresas con su promedio de estrellas (filtrable)
 * - Al seleccionar una: información, distribución de calificaciones,
 *   reseñas, formulario para valorar y botón "Reportar" (moderación)
 */
let empresaSeleccionada = Number(UI.param('empresa')) || null;

function pintarLista() {
  const q = document.getElementById('buscar-empresa').value.toLowerCase();
  const sector = document.getElementById('filtro-sector').value;
  const orden = document.getElementById('orden-empresas').value;

  let lista = Store.get('empresas')
    .map((e) => ({ ...e, ...UI.promedio(e.id) }))
    .filter((e) => e.nombre.toLowerCase().includes(q) && (!sector || e.sector === sector));
  lista.sort((a, b) => (orden === 'nombre' ? a.nombre.localeCompare(b.nombre) : b[orden] - a[orden]));

  if (!empresaSeleccionada && lista.length) empresaSeleccionada = lista[0].id;

  document.getElementById('lista-empresas').innerHTML = lista.map((e) => `
    <div class="tl-card tl-card-hover p-3 d-flex align-items-center gap-3 ${e.id === empresaSeleccionada ? 'border-primary' : ''}" style="cursor:pointer" onclick="seleccionar(${e.id})">
      ${UI.logo(e)}
      <div class="flex-grow-1"><div class="fw-semibold">${e.nombre} ${e.verificada ? '<i class="bi bi-patch-check-fill text-primary small"></i>' : ''}</div><small class="text-muted">${e.sector} · ${e.ubicacion}</small></div>
      <div class="text-end"><div class="fw-bold">${e.valor.toFixed(1)}</div>${UI.estrellas(e.valor)}<div class="small text-muted">${e.total} reseñas</div></div>
    </div>`).join('') || '<div class="tl-card tl-empty"><i class="bi bi-building"></i>Sin resultados</div>';
}

function seleccionar(id) {
  empresaSeleccionada = id;
  pintarLista();
  pintarDetalle();
}

function pintarDetalle() {
  const e = Store.find('empresas', empresaSeleccionada);
  if (!e) return;
  const resenas = Store.get('resenas').filter((r) => r.empresaId === e.id);
  const { valor, total } = UI.promedio(e.id);
  const vacantes = Store.get('empleos').filter((x) => x.empresaId === e.id && x.estado === 'Activa').length;
  // Distribución de estrellas (5 a 1)
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: resenas.filter((r) => r.puntuacion === n).length }));

  document.getElementById('detalle-empresa').innerHTML = `
    <div class="tl-card p-4 mb-3 fade-in" data-nota="Resumen de la empresa|Datos generales, promedio y distribución de calificaciones.">
      <div class="d-flex gap-3 align-items-center mb-3">
        ${UI.logo(e, 'lg')}
        <div class="flex-grow-1"><h2 class="h4 mb-0">${e.nombre}</h2><div class="text-muted small">${e.sector} · ${e.empleados} empleados · ${e.ubicacion}</div>
          <a href="empleos.html?q=${encodeURIComponent(e.nombre)}" class="small fw-semibold">${vacantes} vacantes abiertas <i class="bi bi-arrow-right"></i></a></div>
      </div>
      <p class="small text-muted">${e.descripcion}</p>
      <div class="row align-items-center g-3">
        <div class="col-sm-4 text-center"><div class="display-5 fw-bold">${valor.toFixed(1)}</div>${UI.estrellas(valor)}<div class="small text-muted">${total} reseñas</div></div>
        <div class="col-sm-8">${dist.map((d) => `
          <div class="d-flex align-items-center gap-2 small mb-1"><span style="width:14px">${d.n}</span><i class="bi bi-star-fill text-warning"></i>
            <div class="progress flex-grow-1" style="height:8px"><div class="progress-bar bg-warning" style="width:${total ? (d.c / total) * 100 : 0}%"></div></div><span class="text-muted" style="width:20px">${d.c}</span></div>`).join('')}
        </div>
      </div>
    </div>

    <div class="tl-card p-4 mb-3" data-nota="Reseñas|Opiniones de empleados. El botón de bandera envía la reseña a moderación del administrador.">
      <h3 class="h6 mb-3">Opiniones de empleados</h3>
      ${resenas.length ? resenas.map((r) => `
        <div class="border-bottom pb-3 mb-3">
          <div class="d-flex justify-content-between"><b>${r.titulo}</b>${UI.estrellas(r.puntuacion)}</div>
          <p class="small mb-1">${r.comentario}</p>
          <div class="d-flex justify-content-between"><small class="text-muted">${r.autor} · ${UI.haceTiempo(r.fecha)}</small>
            <button class="btn btn-sm btn-link text-muted p-0" onclick="reportar(${r.id})" title="Reportar contenido inapropiado"><i class="bi bi-flag${r.reportada ? '-fill text-danger' : ''}"></i></button></div>
        </div>`).join('') : '<p class="text-muted small">Aún no hay reseñas.</p>'}
    </div>

    <form class="tl-card p-4" id="form-resena" data-nota="Valorar empresa|Formulario para dejar calificación y comentario sobre la experiencia laboral.">
      <h3 class="h6">Valora tu experiencia en ${e.nombre}</h3>
      <div class="mb-2">${UI.starInput('puntuacion-val')}</div>
      <div class="row g-2 mb-2">
        <div class="col-sm-6"><input class="form-control" id="r-titulo" placeholder="Título" required></div>
        <div class="col-sm-6"><select class="form-select" id="r-relacion"><option>Empleado actual</option><option>Ex empleado</option><option>Candidato entrevistado</option></select></div>
      </div>
      <textarea class="form-control mb-2" rows="3" id="r-comentario" placeholder="¿Qué te gustó y qué mejorarías?" required></textarea>
      <div class="text-end"><button class="btn btn-primary" id="btn-publicar-resena">Publicar valoración</button></div>
    </form>`;

  document.getElementById('form-resena').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const p = document.querySelector('input[name="puntuacion-val"]:checked');
    if (!p) return UI.toast('Selecciona una calificación', 'warning');
    const sesion = Sesion.get();
    Store.add('resenas', {
      empresaId: e.id, puntuacion: Number(p.value), titulo: document.getElementById('r-titulo').value,
      comentario: document.getElementById('r-comentario').value,
      autor: document.getElementById('r-relacion').value,
      usuarioId: sesion ? sesion.id : null,
      fecha: new Date().toISOString(), reportada: false
    });
    UI.toast('¡Valoración publicada!');
    pintarLista(); pintarDetalle();
  });
  if (document.body.classList.contains('modo-notas')) Notas.pintar();
}

function reportar(id) {
  Store.update('resenas', id, { reportada: true });
  UI.toast('Reseña reportada. El equipo de moderación la revisará.', 'warning');
  pintarDetalle();
}

document.addEventListener('DOMContentLoaded', () => {
  const sectores = [...new Set(Store.get('empresas').map((e) => e.sector))];
  document.getElementById('filtro-sector').innerHTML += sectores.map((s) => `<option>${s}</option>`).join('');
  ['buscar-empresa', 'filtro-sector', 'orden-empresas'].forEach((id) => document.getElementById(id).addEventListener('input', pintarLista));
  pintarLista();
  pintarDetalle();
});
