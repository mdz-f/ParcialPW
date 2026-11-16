const { promisify } = require('util');
const { randomBytes, scrypt, timingSafeEqual } = require('crypto');
const db = require('../../database/db');

const scryptAsync = promisify(scrypt);

const COLUMNAS = {
  nombre: 'nombre',
  apellidos: 'apellidos',
  email: 'email',
  telefono: 'telefono',
  rol: 'rol',
  titular: 'titular',
  ubicacion: 'ubicacion',
  habilidades: 'habilidades',
  cv: 'cv',
  estado: 'estado'
};

async function listar() {
  const result = await db.query('SELECT * FROM usuarios ORDER BY id ASC');
  return result.rows;
}

async function buscarPorId(id) {
  const result = await db.query('SELECT * FROM usuarios WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function buscarPorEmail(email) {
  if (!email) return null;
  const result = await db.query(
    'SELECT * FROM usuarios WHERE LOWER(email) = LOWER($1)',
    [String(email).trim()]
  );
  return result.rows[0] || null;
}

async function verificarPassword(passwordPlano, passwordHash) {
  if (!passwordPlano || !passwordHash) return false;

  // Formato seguro scrypt: scrypt$salt$hashHex
  if (typeof passwordHash === 'string' && passwordHash.startsWith('scrypt$')) {
    const partes = passwordHash.split('$');
    if (partes.length !== 3) return false;
    const [, salt, hashHex] = partes;
    try {
      const derivedKey = await scryptAsync(passwordPlano, salt, 64);
      const hashBuffer = Buffer.from(hashHex, 'hex');
      if (derivedKey.length !== hashBuffer.length) return false;
      return timingSafeEqual(derivedKey, hashBuffer);
    } catch {
      return false;
    }
  }

  // Compatibilidad con contraseñas planas de datos semilla iniciales (ej. '123456')
  return passwordPlano === passwordHash;
}

async function crear(usuario) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(usuario.password, salt, 64);
  const passwordHash = `scrypt$${salt}$${derivedKey.toString('hex')}`;

  const result = await db.query(
    `INSERT INTO usuarios
      (nombre, apellidos, email, password_hash, telefono, rol, titular, ubicacion, habilidades, cv)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      usuario.nombre.trim(),
      usuario.apellidos || '',
      usuario.email.trim().toLowerCase(),
      passwordHash,
      usuario.telefono || '',
      usuario.rol || 'candidato',
      usuario.titular || '',
      usuario.ubicacion || '',
      usuario.habilidades || [],
      usuario.cv || null
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
    `UPDATE usuarios SET ${asignaciones.join(', ')} WHERE id = $${valores.length} RETURNING *`,
    valores
  );
  return result.rows[0] || null;
}

async function eliminar(id) {
  const result = await db.query('DELETE FROM usuarios WHERE id = $1', [id]);
  return result.rowCount > 0;
}

module.exports = {
  listar,
  buscarPorId,
  buscarPorEmail,
  verificarPassword,
  crear,
  actualizar,
  eliminar
};