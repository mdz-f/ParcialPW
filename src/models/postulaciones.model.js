const db = require('../../database/db');

const COLUMNAS = {
  empleoId: 'empleo_id',
  usuarioId: 'usuario_id',
  estado: 'estado',
  carta: 'carta',
  cvAdjunto: 'cv_adjunto',
  propia: 'propia'
};

async function listar() {
  const result = await db.query('SELECT * FROM postulaciones ORDER BY fecha DESC, id DESC');
  return result.rows;
}

async function buscarPorId(id) {
  const result = await db.query('SELECT * FROM postulaciones WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function crear(postulacion) {
  const result = await db.query(
    `INSERT INTO postulaciones (empleo_id, usuario_id, estado, carta, cv_adjunto, propia)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (empleo_id, usuario_id)
     DO UPDATE SET carta = EXCLUDED.carta, cv_adjunto = EXCLUDED.cv_adjunto, fecha = NOW()
     RETURNING *`,
    [
      Number(postulacion.empleoId),
      Number(postulacion.usuarioId),
      postulacion.estado || 'Recibida',
      postulacion.carta || '',
      postulacion.cvAdjunto || null,
      postulacion.propia !== undefined ? Boolean(postulacion.propia) : true
    ]
  );
  return result.rows[0];
}

async function actualizar(id, cambios) {
  const asignaciones = [];
  const valores = [];

  for (const [campo, valor] of Object.entries(cambios)) {
    const columna = COLUMNAS[campo];
    if (!columna) continue;
    valores.push(valor);
    asignaciones.push(`${columna} = $${valores.length}`);
  }

  if (!asignaciones.length) return null;

  valores.push(id);
  const result = await db.query(
    `UPDATE postulaciones SET ${asignaciones.join(', ')} WHERE id = $${valores.length} RETURNING *`,
    valores
  );
  return result.rows[0] || null;
}

async function eliminar(id) {
  const result = await db.query('DELETE FROM postulaciones WHERE id = $1', [id]);
  return result.rowCount > 0;
}

module.exports = { listar, buscarPorId, crear, actualizar, eliminar };