/**
 * Página de RESULTADOS DE BÚSQUEDA
 * Lógica:
 *  1. Lee los criterios de la URL (q, ubicacion, tipo, nivel, sector, salario, modalidad)
 *  2. Genera los checkboxes de filtros con el conteo de vacantes
 *  3. Cada vez que cambia un filtro se ejecuta filtrar() y se repinta la lista
 *  (En la versión con backend esto será: GET /api/empleos?q=...&nivel=...)
 */
document.addEventListener('DOMContentLoaded', () => {
  const empleos = Store.get('empleos').filter((e) => e.estado === 'Activa');

  // Opciones de cada grupo de filtros
  const grupos = {
    nivel: ['Practicante', 'Junior', 'Semi-senior', 'Senior', 'Gerencial'],
    sector: [...new Set(Store.get('empresas').map((e) => e.sector))],
    contrato: ['Indefinido', 'Temporal', 'Por proyecto'],
    modalidad: ['Presencial', 'Remoto', 'Híbrido']
  };

  // Pinta los checkboxes con la cantidad de vacantes por opción
  Object.entries(grupos).forEach(([campo, opciones]) => {
    document.getElementById(`f-${campo}`).innerHTML = opciones.map((op, i) => {
      const n = empleos.filter((e) => e[campo] === op).length;
      return `<div class="form-check d-flex justify-content-between">
        <span><input class="form-check-input filtro" type="checkbox" value="${op}" data-campo="${campo}" id="chk-${campo}-${i}">
        <label class="form-check-label ms-1" for="chk-${campo}-${i}">${op}</label></span>
        <small class="text-muted">${n}</small></div>`;
    }).join('');
  });

  // Precargar criterios que vienen desde la URL
  document.getElementById('f-q').value = UI.param('q') || '';
  document.getElementById('f-ubicacion').value = UI.param('ubicacion') || '';
  document.getElementById('f-tipo').value = UI.param('tipo') || '';
  document.getElementById('f-salario').value = UI.param('salario') || 0;
  ['nivel', 'sector', 'contrato', 'modalidad'].forEach((campo) => {
    const v = UI.param(campo);
    if (v) document.querySelectorAll(`.filtro[data-campo="${campo}"]`).forEach((c) => { if (c.value === v) c.checked = true; });
  });

  // ---------- Función principal de filtrado ----------
  function filtrar() {
    const q = document.getElementById('f-q').value.toLowerCase().trim();
    const ubic = document.getElementById('f-ubicacion').value.toLowerCase().trim();
    const tipo = document.getElementById('f-tipo').value;
    const salario = Number(document.getElementById('f-salario').value);
    const dias = Number(document.getElementById('f-fecha').value);
    const orden = document.getElementById('f-orden').value;
    document.getElementById('salario-label').textContent = `$${salario.toLocaleString()}`;

    // Valores marcados por grupo: { nivel: ['Junior'], sector: [...] }
    const marcados = {};
    document.querySelectorAll('.filtro:checked').forEach((c) => (marcados[c.dataset.campo] ||= []).push(c.value));

    let lista = empleos.filter((e) => {
      const emp = UI.empresa(e.empresaId);
      const texto = `${e.titulo} ${emp.nombre} ${e.descripcion} ${e.sector}`.toLowerCase();
      if (q && !texto.includes(q)) return false;
      if (ubic && !e.ubicacion.toLowerCase().includes(ubic) && !e.modalidad.toLowerCase().includes(ubic)) return false;
      if (tipo && e.tipo !== tipo) return false;
      if (salario && e.salarioMax < salario) return false;
      if (dias && (Date.now() - new Date(e.fecha)) / 86400000 > dias) return false;
      // Dentro de un grupo es "OR"; entre grupos es "AND"
      return Object.entries(marcados).every(([campo, vals]) => vals.includes(e[campo]));
    });

    // Ordenamiento
    if (orden === 'reciente') lista.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    if (orden === 'salario') lista.sort((a, b) => b.salarioMax - a.salarioMax);
    if (orden === 'titulo') lista.sort((a, b) => a.titulo.localeCompare(b.titulo));

    // Pintar resultados
    document.getElementById('total-resultados').textContent = lista.length;
    const nFiltros = Object.values(marcados).flat().length + (salario ? 1 : 0) + (dias ? 1 : 0);
    document.getElementById('filtros-activos').innerHTML = nFiltros ? `<span class="tl-chip ms-2">${nFiltros} filtro(s) activo(s)</span>` : '';
    document.getElementById('resultados').innerHTML = lista.length
      ? lista.map((e) => UI.jobCard(e)).join('')
      : `<div class="tl-card tl-empty"><i class="bi bi-search"></i><h5>No encontramos empleos</h5><p>Intenta con otras palabras o quita algunos filtros.</p></div>`;
  }

  // Eventos: cualquier cambio vuelve a filtrar
  document.getElementById('form-busqueda').addEventListener('submit', (ev) => { ev.preventDefault(); filtrar(); });
  document.querySelectorAll('.filtro, #f-tipo, #f-fecha, #f-orden').forEach((el) => el.addEventListener('change', filtrar));
  document.getElementById('f-salario').addEventListener('input', filtrar);
  document.getElementById('f-q').addEventListener('input', filtrar);
  document.getElementById('btn-limpiar').addEventListener('click', (ev) => {
    ev.preventDefault();
    document.querySelectorAll('.filtro').forEach((c) => (c.checked = false));
    ['f-q', 'f-ubicacion', 'f-tipo', 'f-fecha'].forEach((id) => (document.getElementById(id).value = ''));
    document.getElementById('f-salario').value = 0;
    filtrar();
  });

  // Guardar la búsqueda actual como alerta de empleo
  document.getElementById('btn-guardar-alerta').addEventListener('click', () => {
    const termino = document.getElementById('f-q').value || 'Todos los empleos';
    Store.add('alertas', { usuarioId: 1, termino, ubicacion: document.getElementById('f-ubicacion').value || 'Cualquiera', frecuencia: 'Diaria', canal: 'Correo', activa: true });
    UI.toast(`Alerta creada: "${termino}". Recibirás notificaciones por correo.`);
  });

  filtrar();
});
