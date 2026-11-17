const db = require('../../database/db');

/**
 * Obtener todos los empleos guardados de un usuario
 */
async function listarPorUsuario(usuarioId) {
  const result = await db.query(
    'SELECT * FROM empleos_guardados WHERE usuario_id = $1 ORDER BY fecha DESC',
    [usuarioId]
  );
  return result.rows;
}

/**
 * Verificar si un empleo está guardado por un usuario
 */
async function existe(usuarioId, empleoId) {
  const result = await db.query(
    'SELECT id FROM empleos_guardados WHERE usuario_id = $1 AND empleo_id = $2',
    [usuarioId, empleoId]
  );
  return result.rows.length > 0;
}

/**
 * Guardar un empleo para un usuario (ignora duplicados)
 */
async function guardar(usuarioId, empleoId) {
  const result = await db.query(
    `INSERT INTO empleos_guardados (usuario_id, empleo_id)
     VALUES ($1, $2)
     ON CONFLICT (usuario_id, empleo_id) DO NOTHING
     RETURNING *`,
    [usuarioId, empleoId]
  );
  return result.rows[0] || null;
}

/**
 * Quitar un empleo guardado
 */
async function quitar(usuarioId, empleoId) {
  const result = await db.query(
    'DELETE FROM empleos_guardados WHERE usuario_id = $1 AND empleo_id = $2',
    [usuarioId, empleoId]
  );
  return result.rowCount > 0;
}

module.exports = { listarPorUsuario, existe, guardar, quitar };
