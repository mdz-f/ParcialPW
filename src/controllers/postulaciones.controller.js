const Postulaciones = require('../models/postulaciones.model');

const ESTADOS = ['Recibida', 'En revisión', 'Entrevista', 'Aceptado', 'Contratado', 'Rechazada'];
const CAMPOS_ACTUALIZABLES = ['estado', 'carta', 'cvAdjunto', 'propia'];

function mapear(postulacion) {
  return {
    id: postulacion.id,
    empleoId: postulacion.empleo_id,
    usuarioId: postulacion.usuario_id,
    fecha: postulacion.fecha,
    estado: postulacion.estado,
    carta: postulacion.carta,
    cvAdjunto: postulacion.cv_adjunto,
    propia: postulacion.propia
  };
}

function obtenerId(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function esObjeto(valor) {
  return valor && typeof valor === 'object' && !Array.isArray(valor);
}

async function listar(req, res) {
  const postulaciones = await Postulaciones.listar();
  res.json(postulaciones.map(mapear));
}

async function obtener(req, res) {
  const id = obtenerId(req.params.id);
  if (!id) return res.status(400).json({ ok: false, error: 'El id de la postulación no es válido' });

  const postulacion = await Postulaciones.buscarPorId(id);
  if (!postulacion) return res.status(404).json({ ok: false, error: 'Postulación no encontrada' });
  res.json(mapear(postulacion));
}

async function crear(req, res) {
  const postulacion = req.body;
  if (!esObjeto(postulacion)) return res.status(400).json({ ok: false, error: 'El cuerpo de la solicitud no es válido' });

  const empleoId = obtenerId(postulacion.empleoId);
  const usuarioId = obtenerId(postulacion.usuarioId || 1);
  if (!empleoId || !usuarioId) {
    return res.status(400).json({ ok: false, error: 'El empleo y el usuario deben ser válidos' });
  }
  if (postulacion.estado && !ESTADOS.includes(postulacion.estado)) {
    return res.status(400).json({ ok: false, error: 'El estado de la postulación no es válido' });
  }

  const creada = await Postulaciones.crear({ ...postulacion, empleoId, usuarioId });
  res.status(201).json(mapear(creada));
}

async function actualizar(req, res) {
  const id = obtenerId(req.params.id);
  if (!id) return res.status(400).json({ ok: false, error: 'El id de la postulación no es válido' });
  if (!esObjeto(req.body)) return res.status(400).json({ ok: false, error: 'El cuerpo de la solicitud no es válido' });

  const cambios = Object.fromEntries(
    Object.entries(req.body).filter(([campo]) => CAMPOS_ACTUALIZABLES.includes(campo))
  );
  if (!Object.keys(cambios).length) {
    return res.status(400).json({ ok: false, error: 'No se enviaron campos válidos para actualizar' });
  }
  if (cambios.estado !== undefined && !ESTADOS.includes(cambios.estado)) {
    return res.status(400).json({ ok: false, error: 'El estado de la postulación no es válido' });
  }

  const actualizada = await Postulaciones.actualizar(id, cambios);
  if (!actualizada) return res.status(404).json({ ok: false, error: 'Postulación no encontrada' });
  res.json(mapear(actualizada));
}

async function eliminar(req, res) {
  const id = obtenerId(req.params.id);
  if (!id) return res.status(400).json({ ok: false, error: 'El id de la postulación no es válido' });
  if (!await Postulaciones.eliminar(id)) {
    return res.status(404).json({ ok: false, error: 'Postulación no encontrada' });
  }
  res.json({ ok: true, id });
}

module.exports = { listar, obtener, crear, actualizar, eliminar };