/**
 * ============================================================
 *  ChambeaSV - Servidor Backend con PostgreSQL (Supabase)
 * ============================================================
 *  Servidor Express que entrega los archivos estáticos de /public
 *  y expone la API REST conectada a la base de datos en Supabase.
 * ============================================================
 */
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const db = require('./database/db');
const app = require('./src/app');

// Evita que si PORT quedó en 5432 o 6543 (puertos de PostgreSQL) se use para el servidor web
const rawPort = Number(process.env.APP_PORT || process.env.PORT || 3000);
const PORT = (rawPort === 5432 || rawPort === 6543) ? 3000 : rawPort;

/* ------------------------------------------------------------
   Mapeadores entre columnas PostgreSQL (snake_case)
   y propiedades del Frontend (camelCase)
   ------------------------------------------------------------ */
const Mappers = {
  empresas: (r) => ({
    id: r.id,
    usuarioId: r.usuario_id,
    nombre: r.nombre,
    sector: r.sector,
    color: r.color,
    ubicacion: r.ubicacion,
    empleados: r.empleados,
    web: r.web,
    email: r.email,
    telefono: r.telefono,
    direccion: r.direccion,
    descripcion: r.descripcion,
    verificada: r.verificada,
    propia: r.propia
  }),
  empleos: (r) => ({
    id: r.id,
    titulo: r.titulo,
    empresaId: r.empresa_id,
    ubicacion: r.ubicacion,
    modalidad: r.modalidad,
    tipo: r.tipo,
    contrato: r.contrato,
    nivel: r.nivel,
    sector: r.sector,
    salarioMin: Number(r.salario_min),
    salarioMax: Number(r.salario_max),
    fecha: r.fecha,
    estado: r.estado,
    descripcion: r.descripcion,
    responsabilidades: r.responsabilidades || [],
    requisitos: r.requisitos || [],
    beneficios: r.beneficios || [],
    contactoEmail: r.contacto_email || '',
    contactoTelefono: r.contacto_telefono || ''
  }),
  usuarios: (r) => ({
    id: r.id,
    nombre: r.nombre,
    apellidos: r.apellidos,
    email: r.email,
    telefono: r.telefono,
    rol: r.rol,
    titular: r.titular,
    ubicacion: r.ubicacion,
    habilidades: r.habilidades || [],
    cv: r.cv,
    estado: r.estado,
    registro: r.registro
  }),
  postulaciones: (r) => ({
    id: r.id,
    empleoId: r.empleo_id,
    usuarioId: r.usuario_id,
    fecha: r.fecha,
    estado: r.estado,
    carta: r.carta,
    cvAdjunto: r.cv_adjunto,
    propia: r.propia
  }),
  resenas: (r) => ({
    id: r.id,
    empresaId: r.empresa_id,
    usuarioId: r.usuario_id,
    autor: r.autor,
    puntuacion: Number(r.puntuacion),
    titulo: r.titulo,
    comentario: r.comentario,
    fecha: r.fecha,
    reportada: r.reportada
  }),
  foros: (r) => ({
    id: r.id,
    usuarioId: r.usuario_id,
    titulo: r.titulo,
    categoria: r.categoria,
    etiqueta: r.etiqueta,
    autor: r.autor,
    fecha: r.fecha,
    vistas: r.vistas,
    reportado: r.reportado,
    contenido: r.contenido,
    respuestas: Array.isArray(r.respuestas) ? r.respuestas : []
  }),
  alertas: (r) => ({
    id: r.id,
    usuarioId: r.usuario_id,
    termino: r.termino,
    ubicacion: r.ubicacion,
    frecuencia: r.frecuencia,
    canal: r.canal,
    activa: r.activa
  }),
  recursos: (r) => ({
    id: r.id,
    titulo: r.titulo,
    categoria: r.categoria,
    tipo: r.tipo,
    duracion: r.duracion,
    icono: r.icono,
    color: r.color,
    resumen: r.resumen
  }),
  noticias: (r) => ({
    id: r.id,
    titulo: r.titulo,
    fecha: r.fecha,
    fuente: r.fuente,
    resumen: r.resumen
  })
};

const TABLAS_MVC = new Set(['empleos', 'usuarios', 'postulaciones', 'guardados']);
const TABLAS_PERMITIDAS = Object.keys(Mappers).filter((tabla) => !TABLAS_MVC.has(tabla));

// Auth middleware para rutas genéricas
const { requireAuth } = require('./src/middleware/auth');

/* ------------------------------------------------------------
   1. Estado del servidor y conexión a Supabase
   ------------------------------------------------------------ */
app.get('/api/estado', async (req, res) => {
  try {
    const info = await db.verificarConexion();
    res.json({
      ok: true,
      mensaje: 'Servidor ChambeaSV conectado a Supabase PostgreSQL',
      baseDeDatos: info
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error conectando a Supabase PostgreSQL',
      error: err.message
    });
  }
});

/* ------------------------------------------------------------
   2. Sincronización inicial de todas las tablas para el Frontend
   ------------------------------------------------------------ */
app.get('/api/sync', async (req, res) => {
  try {
    const [empresas, empleos, usuarios, postulaciones, resenas, foros, alertas, recursos, noticias, guardados] =
      await Promise.all([
        db.query('SELECT * FROM empresas ORDER BY id ASC'),
        db.query('SELECT * FROM empleos ORDER BY fecha DESC, id DESC'),
        db.query('SELECT * FROM usuarios ORDER BY id ASC'),
        db.query('SELECT * FROM postulaciones ORDER BY fecha DESC, id DESC'),
        db.query('SELECT * FROM resenas ORDER BY fecha DESC, id DESC'),
        db.query('SELECT * FROM foros ORDER BY fecha DESC, id DESC'),
        db.query('SELECT * FROM alertas ORDER BY id DESC'),
        db.query('SELECT * FROM recursos ORDER BY id ASC'),
        db.query('SELECT * FROM noticias ORDER BY fecha DESC, id ASC'),
        db.query('SELECT usuario_id, empleo_id FROM empleos_guardados ORDER BY fecha DESC')
      ]);

    res.json({
      ok: true,
      datos: {
        empresas: empresas.rows.map(Mappers.empresas),
        empleos: empleos.rows.map(Mappers.empleos),
        usuarios: usuarios.rows.map(Mappers.usuarios),
        postulaciones: postulaciones.rows.map(Mappers.postulaciones),
        resenas: resenas.rows.map(Mappers.resenas),
        foros: foros.rows.map(Mappers.foros),
        alertas: alertas.rows.map(Mappers.alertas),
        recursos: recursos.rows.map(Mappers.recursos),
        noticias: noticias.rows.map(Mappers.noticias),
        guardados: guardados.rows.map((r) => ({ usuarioId: r.usuario_id, empleoId: r.empleo_id }))
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* ------------------------------------------------------------
   3. Reiniciar / Ejecutar script SQL base (database/schema.sql)
   ------------------------------------------------------------ */
app.post('/api/reset', async (req, res) => {
  try {
    const sqlPath = path.join(__dirname, 'database', 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await db.query(sql);
    res.json({ ok: true, mensaje: 'Base de datos restablecida con los datos iniciales.' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* ------------------------------------------------------------
   4. CRUD Genérico y Específico por Tabla (/api/:tabla)
   ------------------------------------------------------------ */

// LISTAR TODOS (GET /api/:tabla)
app.get('/api/:tabla', async (req, res) => {
  const { tabla } = req.params;
  if (!TABLAS_PERMITIDAS.includes(tabla)) {
    return res.status(404).json({ ok: false, error: 'Tabla no válida' });
  }
  try {
    const result = await db.query(`SELECT * FROM ${tabla} ORDER BY id DESC`);
    res.json(result.rows.map(Mappers[tabla]));
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// OBTENER UNO POR ID (GET /api/:tabla/:id)
app.get('/api/:tabla/:id', async (req, res) => {
  const { tabla, id } = req.params;
  if (!TABLAS_PERMITIDAS.includes(tabla)) {
    return res.status(404).json({ ok: false, error: 'Tabla no válida' });
  }
  try {
    const result = await db.query(`SELECT * FROM ${tabla} WHERE id = $1`, [Number(id)]);
    if (!result.rows.length) return res.status(404).json({ ok: false, error: 'Registro no encontrado' });
    res.json(Mappers[tabla](result.rows[0]));
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// INSERTAR (POST /api/:tabla) — requiere autenticación
app.post('/api/:tabla', requireAuth(['candidato', 'empresa', 'admin']), async (req, res) => {
  const { tabla } = req.params;
  if (!TABLAS_PERMITIDAS.includes(tabla)) {
    return res.status(404).json({ ok: false, error: 'Tabla no válida' });
  }
  const b = req.body || {};

  try {
    let result;
    switch (tabla) {
      case 'empresas':
        result = await db.query(
          `INSERT INTO empresas (usuario_id, nombre, sector, color, ubicacion, empleados, web, email, telefono, direccion, descripcion, verificada, propia)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           RETURNING *`,
          [
            b.usuarioId || null,
            b.nombre,
            b.sector || 'Tecnología',
            b.color || '#0a66c2',
            b.ubicacion || '',
            b.empleados || '10-50',
            b.web || '',
            b.email || '',
            b.telefono || '',
            b.direccion || '',
            b.descripcion || '',
            Boolean(b.verificada),
            b.propia !== undefined ? Boolean(b.propia) : true
          ]
        );
        break;

      case 'resenas':
        result = await db.query(
          `INSERT INTO resenas (empresa_id, usuario_id, autor, puntuacion, titulo, comentario, reportada)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [
            Number(b.empresaId || b.empresa_id),
            b.usuarioId ? Number(b.usuarioId) : null,
            b.autor || 'Usuario anónimo',
            Number(b.puntuacion || 5),
            b.titulo,
            b.comentario,
            Boolean(b.reportada)
          ]
        );
        break;

      case 'foros':
        result = await db.query(
          `INSERT INTO foros (usuario_id, titulo, categoria, etiqueta, autor, contenido, vistas, reportado, respuestas)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
           RETURNING *`,
          [
            b.usuarioId ? Number(b.usuarioId) : null,
            b.titulo,
            b.categoria || 'General',
            b.etiqueta || 'General',
            b.autor || 'Usuario',
            b.contenido,
            Number(b.vistas || 1),
            Boolean(b.reportado),
            JSON.stringify(b.respuestas || [])
          ]
        );
        break;

      case 'alertas':
        result = await db.query(
          `INSERT INTO alertas (usuario_id, termino, ubicacion, frecuencia, canal, activa)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [
            Number(b.usuarioId || b.usuario_id || 1),
            b.termino,
            b.ubicacion || 'Cualquiera',
            b.frecuencia || 'Diaria',
            b.canal || 'Correo',
            b.activa !== undefined ? Boolean(b.activa) : true
          ]
        );
        break;

      default:
        return res.status(400).json({ ok: false, error: `Inserción no configurada para ${tabla}` });
    }

    res.status(201).json(Mappers[tabla](result.rows[0]));
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ACTUALIZAR (PUT /api/:tabla/:id) — requiere autenticación
app.put('/api/:tabla/:id', requireAuth(['candidato', 'empresa', 'admin']), async (req, res) => {
  const { tabla, id } = req.params;
  const cambios = req.body || {};
  if (!TABLAS_PERMITIDAS.includes(tabla)) {
    return res.status(404).json({ ok: false, error: 'Tabla no válida' });
  }

  // Traducción de claves camelCase a columnas snake_case
  const mapaColumnas = {
    empresaId: 'empresa_id',
    usuarioId: 'usuario_id',
    empleoId: 'empleo_id',
    salarioMin: 'salario_min',
    salarioMax: 'salario_max',
    contactoEmail: 'contacto_email',
    contactoTelefono: 'contacto_telefono',
    cvAdjunto: 'cv_adjunto'
  };

  try {
    const sets = [];
    const valores = [];
    let idx = 1;

    for (const [k, val] of Object.entries(cambios)) {
      if (k === 'id') continue;
      const col = mapaColumnas[k] || k;
      if (col === 'respuestas') {
        sets.push(`${col} = $${idx++}::jsonb`);
        valores.push(JSON.stringify(val));
      } else {
        sets.push(`${col} = $${idx++}`);
        valores.push(val);
      }
    }

    if (!sets.length) {
      return res.status(400).json({ ok: false, error: 'No se enviaron campos para actualizar' });
    }

    valores.push(Number(id));
    const sql = `UPDATE ${tabla} SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`;
    const result = await db.query(sql, valores);

    if (!result.rows.length) {
      return res.status(404).json({ ok: false, error: 'Registro no encontrado' });
    }
    res.json(Mappers[tabla](result.rows[0]));
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ELIMINAR (DELETE /api/:tabla/:id) — requiere autenticación
app.delete('/api/:tabla/:id', requireAuth(['candidato', 'empresa', 'admin']), async (req, res) => {
  const { tabla, id } = req.params;
  if (!TABLAS_PERMITIDAS.includes(tabla)) {
    return res.status(404).json({ ok: false, error: 'Tabla no válida' });
  }
  try {
    await db.query(`DELETE FROM ${tabla} WHERE id = $1`, [Number(id)]);
    res.json({ ok: true, id: Number(id) });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  const status = Number.isInteger(err.status) ? err.status : 500;
  if (status >= 500) console.error('Error procesando solicitud:', err);
  res.status(status).json({ ok: false, error: err.message || 'Error interno del servidor' });
});

// Evita devolver el HTML de inicio para endpoints desconocidos de la API.
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ ok: false, error: 'Endpoint no encontrado' });
  }
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = app.listen(PORT, async () => {
  console.log(`Servidor ChambeaSV corriendo en http://localhost:${PORT}`);
  try {
    const info = await db.verificarConexion();
    console.log(`🗿 Conectado a Supabase PostgreSQL [${info.host}] (${info.tablasCreadas}/${info.totalEsperadas} tablas detectadas)`);
  } catch (err) {
    console.warn(`Aviso de conexión a Supabase: ${err.message}`);
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`El puerto web ${PORT} ya está ocupado. Cerrá la instancia anterior o configura APP_PORT en .env.`);
    process.exitCode = 1;
    return;
  }
  throw err;
});
