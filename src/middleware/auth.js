/**
 * ============================================================
 *  ChambeaSV - Middleware de Autenticación JWT (crypto nativo)
 * ============================================================
 *  Sin dependencias externas: usa HMAC-SHA256 de Node.js crypto.
 *
 *  Exporta:
 *    sign(payload)             → token string (válido 24h)
 *    verify(token)             → payload | null
 *    requireAuth(roles=[])     → middleware Express
 * ============================================================
 */
const crypto = require('crypto');

const SECRET = process.env.JWT_SECRET || 'chambeasv_secret_2026_seguro';
const EXPIRA_MS = 24 * 60 * 60 * 1000; // 24 horas

/* ── Helpers de Base64URL ─────────────────────────────────── */
const toB64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const fromB64url = (str) => Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

/* ── Firmar payload ───────────────────────────────────────── */
function sign(payload) {
  const header  = toB64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const claims  = toB64url(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + EXPIRA_MS }));
  const firma   = toB64url(
    crypto.createHmac('sha256', SECRET).update(`${header}.${claims}`).digest()
  );
  return `${header}.${claims}.${firma}`;
}

/* ── Verificar token ─────────────────────────────────────── */
function verify(token) {
  if (!token || typeof token !== 'string') return null;
  const partes = token.split('.');
  if (partes.length !== 3) return null;

  const [header, claims, firma] = partes;
  const firmaEsperada = toB64url(
    crypto.createHmac('sha256', SECRET).update(`${header}.${claims}`).digest()
  );

  // Comparación constante para evitar timing attacks
  const bufA = Buffer.from(firma);
  const bufB = Buffer.from(firmaEsperada);
  if (bufA.length !== bufB.length) return null;
  if (!crypto.timingSafeEqual(bufA, bufB)) return null;

  let payload;
  try {
    payload = JSON.parse(fromB64url(claims).toString());
  } catch {
    return null;
  }

  if (payload.exp && Date.now() > payload.exp) return null; // expirado

  return payload;
}

/* ── Middleware Express ───────────────────────────────────── */
/**
 * requireAuth(roles)
 *   roles: [] → cualquier usuario autenticado
 *   roles: ['admin'] → solo admin
 *   roles: ['empresa','admin'] → empresa o admin
 */
function requireAuth(roles = []) {
  return function (req, res, next) {
    // Acepta: Authorization: Bearer <token>  o  X-Token: <token>
    const authHeader = req.headers['authorization'] || '';
    const rawToken   = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : (req.headers['x-token'] || '');

    const payload = verify(rawToken);

    if (!payload) {
      return res.status(401).json({ ok: false, error: 'No autenticado. Inicia sesión para continuar.' });
    }

    if (roles.length && !roles.includes(payload.rol)) {
      return res.status(403).json({ ok: false, error: 'No tienes permisos para realizar esta acción.' });
    }

    req.usuario = payload; // disponible en controladores: req.usuario.id, req.usuario.rol
    next();
  };
}

module.exports = { sign, verify, requireAuth };
