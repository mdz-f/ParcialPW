/**
 * Página de DESCRIPCIÓN DEL TRABAJO
 * - Lee el id del empleo desde la URL (empleo.html?id=1)
 * - Muestra descripción, responsabilidades, requisitos y beneficios
 * - Tarjeta de contacto de la empresa + botón "Aplicar"
 * - Sección de comentarios y valoraciones de la empresa
 */
document.addEventListener('DOMContentLoaded', () => {
  const empleo = Store.find('empleos', UI.param('id') || 1);
  const cont = document.getElementById('detalle');

  if (!empleo) {
    cont.innerHTML = `<div class="tl-card tl-empty"><i class="bi bi-exclamation-circle"></i><h1 class="h5">Empleo no encontrado</h1><a href="empleos.html" class="btn btn-primary mt-2">Volver a la búsqueda</a></div>`;
    return;
  }
  document.title = `${empleo.titulo} | T-Search`;
  const emp = UI.empresa(empleo.empresaId);
  const sesion = Sesion.get();
  const yaAplico = () => Store.get('postulaciones').some((p) => p.empleoId === empleo.id && p.usuarioId === (sesion?.id || 1) && p.propia);
  const lista = (arr, icono) => `<ul class="list-unstyled mb-0">${arr.map((x) => `<li class="d-flex gap-2 mb-2"><i class="bi ${icono} text-primary"></i><span>${x}</span></li>`).join('')}</ul>`;

  // Empleos similares (mismo sector, distinto id)
  const similares = Store.get('empleos').filter((e) => e.sector === empleo.sector && e.id !== empleo.id).slice(0, 3);

  cont.innerHTML = `
    <nav aria-label="breadcrumb"><ol class="breadcrumb small"><li class="breadcrumb-item"><a href="index.html">Inicio</a></li><li class="breadcrumb-item"><a href="empleos.html">Empleos</a></li><li class="breadcrumb-item active">${empleo.titulo}</li></ol></nav>
    <div class="row g-4">
      <div class="col-lg-8">
        <!-- Encabezado del empleo -->
        <section class="tl-card p-4 mb-4" data-nota="Encabezado del empleo|Título, empresa, ubicación, salario y etiquetas de modalidad, nivel y contrato.">
          <div class="d-flex gap-3 align-items-start">
            ${UI.logo(emp, 'lg')}
            <div class="flex-grow-1">
              <h1 class="h3 mb-1">${empleo.titulo}</h1>
              <a href="valoraciones.html?empresa=${emp.id}" class="fw-semibold">${emp.nombre}</a>
              ${emp.verificada ? '<i class="bi bi-patch-check-fill text-primary ms-1" title="Verificada"></i>' : ''}
              <div class="tl-job-meta mt-2">
                <span><i class="bi bi-geo-alt"></i>${empleo.ubicacion}</span>
                <span><i class="bi bi-briefcase"></i>${empleo.tipo}</span>
                <span><i class="bi bi-cash-stack"></i>${UI.salario(empleo)} / mes</span>
                <span><i class="bi bi-clock"></i>Publicado ${UI.haceTiempo(empleo.fecha).toLowerCase()}</span>
              </div>
              <div class="mt-3">
                <span class="tl-chip ${UI.chipModalidad(empleo.modalidad)}">${empleo.modalidad}</span>
                <span class="tl-chip">${empleo.nivel}</span>
                <span class="tl-chip orange">${empleo.contrato}</span>
                <span class="tl-chip gray">${empleo.sector}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Descripción detallada -->
        <section class="tl-card p-4 mb-4" data-nota="Descripción detallada|Información del puesto: responsabilidades, requisitos y beneficios.">
          <h2 class="h5 mb-3">Descripción del puesto</h2>
          <p>${empleo.descripcion}</p>
          <h3 class="h6 mt-4 mb-3"><i class="bi bi-list-check text-primary me-1"></i>Responsabilidades</h3>${lista(empleo.responsabilidades, 'bi-dot')}
          <h3 class="h6 mt-4 mb-3"><i class="bi bi-mortarboard text-primary me-1"></i>Requisitos</h3>${lista(empleo.requisitos, 'bi-check2-circle')}
          <h3 class="h6 mt-4 mb-3"><i class="bi bi-gift text-primary me-1"></i>Beneficios</h3>
          <div class="row g-2">${empleo.beneficios.map((b) => `<div class="col-sm-6"><div class="p-2 px-3 rounded-3 bg-light small"><i class="bi bi-check-lg text-success me-1"></i>${b}</div></div>`).join('')}</div>
        </section>

        <!-- Comentarios y valoraciones de la empresa -->
        <section class="tl-card p-4" id="seccion-resenas" data-nota="Valoraciones de la empresa|Los usuarios leen opiniones y dejan su comentario con calificación de 1 a 5 estrellas."></section>
      </div>

      <!-- Columna derecha: aplicar + contacto -->
      <aside class="col-lg-4">
        <div class="tl-card p-4 mb-4" style="position:sticky;top:140px" data-nota="Aplicar al trabajo|Abre un formulario para enviar la postulación con CV y carta de presentación.">
          <div class="text-muted small">Salario mensual</div>
          <div class="h4 fw-bold text-primary">${UI.salario(empleo)}</div>
          <div class="small text-muted mb-3"><i class="bi bi-people"></i> ${Store.get('postulaciones').filter((p) => p.empleoId === empleo.id).length + 12} personas ya aplicaron</div>
          <div id="zona-aplicar"></div>
          <button class="btn btn-outline-primary w-100 mt-2" onclick="UI.toggleGuardar(${empleo.id}, this)" id="btn-guardar-empleo"><i class="bi bi-bookmark"></i> Guardar</button>
          <button class="btn btn-light w-100 mt-2" onclick="navigator.clipboard?.writeText(location.href); UI.toast('Enlace copiado','info')" id="btn-compartir"><i class="bi bi-share"></i> Compartir</button>

          <hr>
          <!-- Información de contacto de la empresa -->
          <div data-nota="Contacto de la empresa|Datos de contacto: correo, teléfono, sitio web y dirección.">
            <h3 class="tl-card-title mb-3"><i class="bi bi-building"></i>Contacto de la empresa</h3>
            <div class="d-flex align-items-center gap-2 mb-3">${UI.logo(emp, 'sm')}<div><div class="fw-semibold">${emp.nombre}</div><small class="text-muted">${emp.sector} · ${emp.empleados} empleados</small></div></div>
            <p class="small text-muted">${emp.descripcion}</p>
            <ul class="list-unstyled small mb-0">
              <li class="mb-2"><i class="bi bi-envelope me-2 text-primary"></i><a href="mailto:${emp.email}">${emp.email}</a></li>
              <li class="mb-2"><i class="bi bi-telephone me-2 text-primary"></i>${emp.telefono}</li>
              <li class="mb-2"><i class="bi bi-globe me-2 text-primary"></i>${emp.web}</li>
              <li><i class="bi bi-geo-alt me-2 text-primary"></i>${emp.direccion}</li>
            </ul>
          </div>
        </div>
      </aside>
    </div>

    ${similares.length ? `<section class="mt-5"><h2 class="tl-section-title mb-3">Empleos similares</h2><div class="row g-3">${similares.map((e) => `<div class="col-lg-4">${UI.jobCard(e)}</div>`).join('')}</div></section>` : ''}
  `;

  // ---------- Botón aplicar (cambia si ya aplicó) ----------
  function pintarBotonAplicar() {
    document.getElementById('zona-aplicar').innerHTML = yaAplico()
      ? `<button class="btn btn-success w-100 btn-lg" disabled><i class="bi bi-check-circle me-1"></i>Ya aplicaste</button>`
      : `<button class="btn btn-primary w-100 btn-lg" data-bs-toggle="modal" data-bs-target="#modal-aplicar" id="btn-aplicar"><i class="bi bi-send me-1"></i>Aplicar ahora</button>`;
  }
  pintarBotonAplicar();

  // Precargar datos del usuario en el formulario
  document.getElementById('aplicar-titulo').textContent = `Aplicar a: ${empleo.titulo}`;
  if (sesion) { document.getElementById('ap-nombre').value = sesion.nombre; document.getElementById('ap-email').value = sesion.email; }

  document.getElementById('form-aplicar').addEventListener('submit', (ev) => {
    ev.preventDefault();
    // INSERT INTO postulaciones (...)
    Store.add('postulaciones', { empleoId: empleo.id, usuarioId: sesion?.id || 1, fecha: new Date().toISOString(), estado: 'Recibida', carta: document.getElementById('ap-carta').value, propia: true });
    bootstrap.Modal.getInstance(document.getElementById('modal-aplicar')).hide();
    UI.toast('¡Postulación enviada! Puedes darle seguimiento en "Mi perfil".');
    pintarBotonAplicar();
  });

  // ---------- Reseñas de la empresa ----------
  function pintarResenas() {
    const resenas = Store.get('resenas').filter((r) => r.empresaId === emp.id);
    const { valor, total } = UI.promedio(emp.id);
    document.getElementById('seccion-resenas').innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <h2 class="h5 mb-0">Valoraciones de ${emp.nombre}</h2>
        <div class="d-flex align-items-center gap-2"><span class="h4 mb-0 fw-bold">${valor.toFixed(1)}</span>${UI.estrellas(valor)}<small class="text-muted">(${total})</small></div>
      </div>
      <div id="lista-resenas">${resenas.length ? resenas.map((r) => `
        <div class="border-top py-3">
          <div class="d-flex justify-content-between"><b>${r.titulo}</b>${UI.estrellas(r.puntuacion)}</div>
          <p class="mb-1 small">${r.comentario}</p>
          <small class="text-muted">${r.autor} · ${UI.haceTiempo(r.fecha)}</small>
        </div>`).join('') : '<p class="text-muted">Aún no hay valoraciones. ¡Sé el primero!</p>'}</div>
      <form class="border-top pt-3 mt-2" id="form-resena">
        <h3 class="h6">Deja tu valoración</h3>
        <div class="mb-2">${UI.starInput('puntuacion-detalle')}</div>
        <input class="form-control mb-2" id="resena-titulo" placeholder="Título de tu opinión" required>
        <textarea class="form-control mb-2" id="resena-comentario" rows="3" placeholder="Escribe tu experiencia trabajando en esta empresa..." required></textarea>
        <div class="d-flex justify-content-between align-items-center">
          <div class="form-check"><input class="form-check-input" type="checkbox" id="resena-anonima" checked><label class="form-check-label small" for="resena-anonima">Publicar de forma anónima</label></div>
          <button class="btn btn-primary" id="btn-enviar-resena">Publicar</button>
        </div>
      </form>`;

    document.getElementById('form-resena').addEventListener('submit', (ev) => {
      ev.preventDefault();
      const p = document.querySelector('input[name="puntuacion-detalle"]:checked');
      if (!p) return UI.toast('Selecciona una calificación', 'warning');
      Store.add('resenas', {
        empresaId: emp.id, puntuacion: Number(p.value), titulo: document.getElementById('resena-titulo').value,
        comentario: document.getElementById('resena-comentario').value,
        autor: document.getElementById('resena-anonima').checked ? 'Usuario anónimo' : (sesion?.nombre || 'Usuario'),
        fecha: new Date().toISOString(), reportada: false
      });
      UI.toast('¡Gracias por tu valoración!');
      pintarResenas();
    });
  }
  pintarResenas();
});
