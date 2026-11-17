const Guardados = require('../models/guardados.model');

function obtenerId(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/**
 * GET /api/guardados/:usuarioId
 * Lista los ids de empleos guardados por el usuario
 */
async function listar(req, res) {
  const usuarioId = obtenerId(req.params.usuarioId);
  if (!usuarioId) return res.status(400).json({ ok: false, error: 'ID de usuario no válido' });

  const rows = await Guardados.listarPorUsuario(usuarioId);
  res.json({
    ok: true,
    guardados: rows.map((r) => ({ id: r.id, empleoId: r.empleo_id, fecha: r.fecha }))
  });
}

/**
 * POST /api/guardados
 * Body: { usuarioId, empleoId }
 * Guarda o quita (toggle) un empleo para el usuario
 */
async function toggle(req, res) {
  const usuarioId = obtenerId(req.body?.usuarioId);
  const empleoId = obtenerId(req.body?.empleoId);
  if (!usuarioId || !empleoId) {
    return res.status(400).json({ ok: false, error: 'usuarioId y empleoId son obligatorios' });
  }

  const yaGuardado = await Guardados.existe(usuarioId, empleoId);
  if (yaGuardado) {
    await Guardados.quitar(usuarioId, empleoId);
    return res.json({ ok: true, guardado: false });
  } else {
    await Guardados.guardar(usuarioId, empleoId);
    return res.json({ ok: true, guardado: true });
  }
}

/**
 * DELETE /api/guardados/:usuarioId/:empleoId
 * Quita un empleo guardado específico
 */
async function quitar(req, res) {
  const usuarioId = obtenerId(req.params.usuarioId);
  const empleoId = obtenerId(req.params.empleoId);
  if (!usuarioId || !empleoId) {
    return res.status(400).json({ ok: false, error: 'Parámetros no válidos' });
  }
  await Guardados.quitar(usuarioId, empleoId);
  res.json({ ok: true });
}

module.exports = { listar, toggle, quitar };
