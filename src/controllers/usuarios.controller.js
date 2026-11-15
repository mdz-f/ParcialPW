const Usuarios = require('../models/usuarios.model');

const CAMPOS_ACTUALIZABLES = [
  'nombre', 'apellidos', 'email', 'telefono', 'rol', 'titular',
  'ubicacion', 'habilidades', 'cv', 'estado'
];

function mapear(usuario) {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    apellidos: usuario.apellidos,
    email: usuario.email,
    telefono: usuario.telefono,
    rol: usuario.rol,
    titular: usuario.titular,
    ubicacion: usuario.ubicacion,
    habilidades: usuario.habilidades || [],
    cv: usuario.cv,
    estado: usuario.estado,
    registro: usuario.registro
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
  const usuarios = await Usuarios.listar();
  res.json(usuarios.map(mapear));
}

async function obtener(req, res) {
  const id = obtenerId(req.params.id);
  if (!id) return res.status(400).json({ ok: false, error: 'El id del usuario no es válido' });

  const usuario = await Usuarios.buscarPorId(id);
  if (!usuario) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
  res.json(mapear(usuario));
}

async function crear(req, res) {
  const usuario = req.body;
  if (!esObjeto(usuario)) return res.status(400).json({ ok: false, error: 'El cuerpo de la solicitud no es válido' });
  if (!String(usuario.nombre || '').trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(usuario.email || '')) ||
      typeof usuario.password !== 'string' || usuario.password.length < 8) {
    return res.status(400).json({
      ok: false,
      error: 'Nombre, correo válido y contraseña de al menos 8 caracteres son obligatorios'
    });
  }
  if (usuario.habilidades !== undefined && !Array.isArray(usuario.habilidades)) {
    return res.status(400).json({ ok: false, error: 'Las habilidades deben enviarse como una lista' });
  }

  const creado = await Usuarios.crear(usuario);
  res.status(201).json(mapear(creado));
}

async function actualizar(req, res) {
  const id = obtenerId(req.params.id);
  if (!id) return res.status(400).json({ ok: false, error: 'El id del usuario no es válido' });
  if (!esObjeto(req.body)) return res.status(400).json({ ok: false, error: 'El cuerpo de la solicitud no es válido' });

  const cambios = Object.fromEntries(
    Object.entries(req.body).filter(([campo]) => CAMPOS_ACTUALIZABLES.includes(campo))
  );
  if (!Object.keys(cambios).length) {
    return res.status(400).json({ ok: false, error: 'No se enviaron campos válidos para actualizar' });
  }
  if (cambios.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(cambios.email))) {
    return res.status(400).json({ ok: false, error: 'El correo electrónico no es válido' });
  }
  if (cambios.habilidades !== undefined && !Array.isArray(cambios.habilidades)) {
    return res.status(400).json({ ok: false, error: 'Las habilidades deben enviarse como una lista' });
  }

  const actualizado = await Usuarios.actualizar(id, cambios);
  if (!actualizado) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
  res.json(mapear(actualizado));
}

async function eliminar(req, res) {
  const id = obtenerId(req.params.id);
  if (!id) return res.status(400).json({ ok: false, error: 'El id del usuario no es válido' });
  if (!await Usuarios.eliminar(id)) {
    return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
  }
  res.json({ ok: true, id });
}

module.exports = { listar, obtener, crear, actualizar, eliminar };