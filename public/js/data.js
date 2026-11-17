/**
 * ============================================================
 *  ChambeaSV — STORE: API-first, sin localStorage para negocio
 * ============================================================
 *  Toda la persistencia pasa por los endpoints /api/...
 *  El caché es un objeto en memoria (_c) que se hidrata una
 *  sola vez desde GET /api/sync al arrancar.
 *
 *  localStorage solo se usa para:
 *    - tl_sesion  (datos de sesión)
 *    - tl_token   (JWT)
 *    - tl_notas   (preferencia UI anotaciones)
 *    - tl_checklist (checklist CV)
 *
 *  Store.ready — promise que se resuelve cuando la hidratación
 *  termina. Todas las páginas deben hacer:
 *    await Store.ready;
 *  antes de usar Store.get() / Store.find().
 * ============================================================
 */

const Store = {
  _c: {},            // caché en memoria  { tabla: [...rows], ... }
  _guardados: {},    // mapa { usuarioId: [empleoId, ...] }

  /* ── Headers con JWT ────────────────────────────────────── */
  _headers(json = true) {
    const h = {};
    if (json) h['Content-Type'] = 'application/json';
    const tk = localStorage.getItem('tl_token');
    if (tk) {
      h['Authorization'] = 'Bearer ' + tk;
    } else if (localStorage.getItem('tl_sesion')) {
      // Sesión fantasma: hay datos de sesión pero no hay token
      // Limpiar y forzar re-login
      localStorage.removeItem('tl_sesion');
      window.location.href = 'login.html';
    }
    return h;
  },

  /* ── Manejo centralizado de errores HTTP ────────────────── */
  _handleAuthError(status) {
    if (status === 401) {
      // Token inválido o expirado → limpiar sesión y redirigir
      localStorage.removeItem('tl_sesion');
      localStorage.removeItem('tl_token');
      UI.toast('Sesión expirada. Redirigiendo al inicio de sesión...', 'danger');
      setTimeout(() => { window.location.href = 'login.html'; }, 1200);
      return true;
    }
    return false;
  },

  /* ── Lectura (síncrona, desde caché en memoria) ─────────── */
  get(tabla) {
    return this._c[tabla] || [];
  },

  find(tabla, id) {
    return this.get(tabla).find((r) => r.id === Number(id));
  },

  /* ── Escritura (async, API-first → actualiza caché) ─────── */
  async add(tabla, registro) {
    const res = await fetch(`/api/${tabla}`, {
      method: 'POST',
      headers: this._headers(),
      body: JSON.stringify(registro)
    });
    if (!res.ok) {
      if (this._handleAuthError(res.status)) throw new Error('Sesión expirada');
      const data = await res.json().catch(() => ({}));
      const msg = data.error || `Error ${res.status} al crear en ${tabla}`;
      UI.toast(msg, 'danger');
      throw new Error(msg);
    }
    const creado = await res.json();
    if (!this._c[tabla]) this._c[tabla] = [];
    this._c[tabla].unshift(creado);
    return creado;
  },

  async update(tabla, id, cambios) {
    const res = await fetch(`/api/${tabla}/${id}`, {
      method: 'PUT',
      headers: this._headers(),
      body: JSON.stringify(cambios)
    });
    if (!res.ok) {
      if (this._handleAuthError(res.status)) throw new Error('Sesión expirada');
      const data = await res.json().catch(() => ({}));
      const msg = data.error || `Error ${res.status} al actualizar ${tabla}/${id}`;
      UI.toast(msg, 'danger');
      throw new Error(msg);
    }
    const actualizado = await res.json();
    if (this._c[tabla]) {
      this._c[tabla] = this._c[tabla].map((r) =>
        r.id === Number(id) ? { ...r, ...actualizado } : r
      );
    }
    return actualizado;
  },

  async remove(tabla, id) {
    const res = await fetch(`/api/${tabla}/${id}`, {
      method: 'DELETE',
      headers: this._headers()
    });
    if (!res.ok) {
      if (this._handleAuthError(res.status)) throw new Error('Sesión expirada');
      const data = await res.json().catch(() => ({}));
      const msg = data.error || `Error ${res.status} al eliminar ${tabla}/${id}`;
      UI.toast(msg, 'danger');
      throw new Error(msg);
    }
    if (this._c[tabla]) {
      this._c[tabla] = this._c[tabla].filter((r) => r.id !== Number(id));
    }
  },

  /* ── Hidratación desde la API (una sola vez) ────────────── */
  async init() {
    const res = await fetch('/api/sync');
    if (!res.ok) throw new Error(`Sync HTTP ${res.status}`);
    const json = await res.json();
    if (!json.ok || !json.datos) throw new Error('Respuesta inválida de /api/sync');

    const guardados = json.datos.guardados || [];
    delete json.datos.guardados;

    for (const [tabla, filas] of Object.entries(json.datos)) {
      this._c[tabla] = filas;
    }

    // Mapa de guardados por usuario
    this._guardados = {};
    guardados.forEach(({ usuarioId, empleoId }) => {
      if (!this._guardados[usuarioId]) this._guardados[usuarioId] = [];
      this._guardados[usuarioId].push(empleoId);
    });
  },

  /* ── Reset (re-seed BD + re-hidratar) ──────────────────── */
  async reset() {
    try {
      const res = await fetch('/api/reset', { method: 'POST', headers: this._headers() });
      if (!res.ok) console.error('Reset falló:', res.status);
    } catch (e) {
      console.error('Reset error:', e.message);
    }
    location.reload();
  },

  /* ── Limpiar caché local para datos legacy ─────────────── */
  _limpiarLegacy() {
    // Eliminar restos de localStorage de sesiones anteriores
    Object.keys(localStorage)
      .filter((k) => k.startsWith('tl_') && !['tl_sesion', 'tl_token', 'tl_notas', 'tl_checklist'].includes(k))
      .forEach((k) => localStorage.removeItem(k));
    sessionStorage.removeItem('tl_db_synced');
  }
};

// Limpiar datos legacy de localStorage al cargar
Store._limpiarLegacy();

// Hidratar: Store.ready se resuelve cuando los datos están en memoria
Store.ready = Store.init().catch((err) => {
  console.error('⚠ No se pudo conectar a la API:', err.message);
});
