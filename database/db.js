/**
 * ============================================================
 *  T-Search - Conexión a Base de Datos PostgreSQL (Supabase)
 * ============================================================
 *  Archivo: database/db.js
 *  Soporta tanto conexión IPv4 (Supabase Supavisor Pooler en
 *  aws-0 / aws-1) como conexión directa IPv6, detectando
 *  automáticamente el host disponible en tu red.
 * ============================================================
 */
require('dotenv').config({ quiet: true });
const { Pool } = require('pg');

const projectRef = process.env.DB_PROJECT_REF || 'aakekyrataeuysqvcbwn';
const region = process.env.DB_REGION || 'us-east-2';
const password = (process.env.DB_PASSWORD || process.env.password || '').trim();
const database = process.env.DB_NAME || process.env.database || 'postgres';
const configuredHost = process.env.DB_HOST || process.env.host || `aws-0-${region}.pooler.supabase.com`;
const configuredPort = Number(process.env.DB_PORT || 5432);
const configuredUser = process.env.DB_USER || process.env.user || `postgres.${projectRef}`;

// Candidatos de conexión en orden de prioridad (IPv4 Pooler aws-0, aws-1 y Directo IPv6)
const CANDIDATOS = [
  { host: configuredHost, port: configuredPort, user: configuredUser },
  { host: `aws-0-${region}.pooler.supabase.com`, port: 5432, user: `postgres.${projectRef}` },
  { host: `aws-1-${region}.pooler.supabase.com`, port: 5432, user: `postgres.${projectRef}` },
  { host: `aws-0-${region}.pooler.supabase.com`, port: 6543, user: `postgres.${projectRef}` },
  { host: `aws-1-${region}.pooler.supabase.com`, port: 6543, user: `postgres.${projectRef}` },
  { host: `db.${projectRef}.supabase.co`, port: 5432, user: 'postgres' }
];

function crearPool(candidato) {
  const p = new Pool({
    host: candidato.host,
    port: candidato.port,
    database,
    user: candidato.user,
    password,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 6000,
    idleTimeoutMillis: 30000
  });
  p.on('error', (err) => {
    console.error('⚠️ Error en cliente PostgreSQL:', err.message);
  });
  return p;
}

let poolActivo = crearPool(CANDIDATOS[0]);
let hostConectado = CANDIDATOS[0].host;

/**
 * Prueba los endpoints de Supabase (aws-0 pooler, aws-1 pooler, directo)
 * y deja activo el que responda en la red actual.
 */
async function verificarConexion() {
  let ultimoError = null;
  const vistos = new Set();

  for (const cand of CANDIDATOS) {
    const clave = `${cand.host}:${cand.port}:${cand.user}`;
    if (vistos.has(clave)) continue;
    vistos.add(clave);

    const poolPrueba = clave === `${CANDIDATOS[0].host}:${CANDIDATOS[0].port}:${CANDIDATOS[0].user}`
      ? poolActivo
      : crearPool(cand);

    try {
      const client = await poolPrueba.connect();
      try {
        const res = await client.query(`
          SELECT COUNT(*)::int AS tablas
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name IN ('usuarios', 'empresas', 'empleos', 'postulaciones', 'resenas', 'foros', 'alertas', 'recursos', 'noticias')
        `);
        if (poolPrueba !== poolActivo) {
          await poolActivo.end().catch(() => {});
          poolActivo = poolPrueba;
        }
        hostConectado = `${cand.host}:${cand.port}`;
        return {
          conectado: true,
          host: hostConectado,
          tablasCreadas: res.rows[0].tablas,
          totalEsperadas: 9
        };
      } finally {
        client.release();
      }
    } catch (err) {
      ultimoError = err;
      if (poolPrueba !== poolActivo) {
        await poolPrueba.end().catch(() => {});
      }
    }
  }

  throw ultimoError || new Error('No se pudo conectar a ningún endpoint de Supabase');
}

module.exports = {
  get pool() { return poolActivo; },
  query: (text, params) => poolActivo.query(text, params),
  verificarConexion
};
