const Usuarios = require('../models/usuarios.model');
const { sign } = require('../middleware/auth');

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

/**
 * Autentica un usuario con email y contraseña contra PostgreSQL (Supabase)
 */
async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !String(email).trim() || !password) {
    return res.status(400).json({
      ok: false,
      error: 'Por favor, proporciona el correo electrónico y la contraseña.'
    });
  }

  const usuario = await Usuarios.buscarPorEmail(email);
  if (!usuario) {
    return res.status(401).json({
      ok: false,
      error: 'Credenciales inválidas. Verifica tu correo y contraseña.'
    });
  }

  if (usuario.estado === 'Suspendido' || usuario.estado === 'Inactivo') {
    return res.status(403).json({
      ok: false,
      error: `Tu cuenta se encuentra en estado "${usuario.estado}". Contacta al administrador.`
    });
  }

  const esValida = await Usuarios.verificarPassword(password, usuario.password_hash);
  if (!esValida) {
    return res.status(401).json({
      ok: false,
      error: 'Credenciales inválidas. Verifica tu correo y contraseña.'
    });
  }

  res.json({
    ok: true,
    mensaje: `¡Bienvenido(a), ${usuario.nombre}!`,
    token: sign({ id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }),
    usuario: mapear(usuario)
  });
}

/**
 * Registra un nuevo usuario en la base de datos verificando unicidad de correo
 */
async function registro(req, res) {
  const { nombre, apellidos, email, password, rol, telefono, titular, ubicacion } = req.body || {};

  const nombreLimpio = String(nombre || '').trim();
  if (!nombreLimpio) {
    return res.status(400).json({ ok: false, error: 'El nombre completo es obligatorio.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailLimpio = String(email || '').trim().toLowerCase();
  if (!emailLimpio || !emailRegex.test(emailLimpio)) {
    return res.status(400).json({ ok: false, error: 'Ingresa un correo electrónico válido.' });
  }

  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({
      ok: false,
      error: 'La contraseña debe tener al menos 6 caracteres.'
    });
  }

  // Validar rol admitido
  const rolValido = ['candidato', 'empresa', 'admin'].includes(rol) ? rol : 'candidato';

  // Verificar si ya existe el correo
  const existente = await Usuarios.buscarPorEmail(emailLimpio);
  if (existente) {
    return res.status(409).json({
      ok: false,
      error: 'Este correo electrónico ya está registrado. Intenta iniciar sesión.'
    });
  }

  const nuevoUsuario = await Usuarios.crear({
    nombre: nombreLimpio,
    apellidos: apellidos ? String(apellidos).trim() : '',
    email: emailLimpio,
    password,
    rol: rolValido,
    telefono: telefono ? String(telefono).trim() : '',
    titular: titular ? String(titular).trim() : (rolValido === 'empresa' ? 'Reclutador / Empresa' : 'Profesional en búsqueda activa'),
    ubicacion: ubicacion ? String(ubicacion).trim() : 'San Salvador, SV',
    habilidades: [],
    cv: null
  });

  res.status(201).json({
    ok: true,
    mensaje: '¡Registro completado exitosamente!',
    token: sign({ id: nuevoUsuario.id, nombre: nuevoUsuario.nombre, email: nuevoUsuario.email, rol: nuevoUsuario.rol }),
    usuario: mapear(nuevoUsuario)
  });
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

module.exports = {
  login,
  registro,
  listar,
  obtener,
  crear,
  actualizar,
  eliminar
};