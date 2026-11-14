/**
 * ============================================================
 *  T-Search - Conexión a Base de Datos PostgreSQL (Supabase)
 * ============================================================
 *  Archivo: database/db.js
 *  Lee las credenciales desde .env y configura el Pool de
 *  conexiones con SSL habilitado para Supabase.
 * ============================================================
 */
require('dotenv').config();
const { Pool } = require('pg');

const dbConfig = {
  host: process.env.DB_HOST || process.env.host,
  port: Number(process.env.DB_PORT || process.env.port || 5432),
  database: process.env.DB_NAME || process.env.database || 'postgres',
  user: process.env.DB_USER || process.env.user || 'postgres',
  password: (process.env.DB_PASSWORD || process.env.password || '').trim(),
  ssl: {
    rejectUnauthorized: false // Requerido para conexiones remotas a Supabase
  },
  connectionTimeoutMillis: 8000,
  idleTimeoutMillis: 30000
};

const pool = new Pool(dbConfig);

pool.on('error', (err) => {
  console.error('⚠️ Error inesperado en el cliente PostgreSQL:', err.message);
});

/**
 * Verifica si la conexión a Supabase está activa y si las tablas ya fueron creadas.
 */
async function verificarConexion() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT COUNT(*)::int AS tablas
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('usuarios', 'empresas', 'empleos', 'postulaciones', 'resenas', 'foros', 'alertas', 'recursos', 'noticias')
    `);
    return {
      conectado: true,
      tablasCreadas: res.rows[0].tablas,
      totalEsperadas: 9
    };
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  verificarConexion
};

