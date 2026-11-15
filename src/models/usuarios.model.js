const { promisify } = require('util');
const { randomBytes, scrypt } = require('crypto');
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

module.exports = { listar, buscarPorId, crear, actualizar, eliminar };